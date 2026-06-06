import json

from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from .matchmaking import calculate_compatibility
from .models import Customer, Meeting

def login_view(request):
    if request.method == "POST":
        if request.POST.get("form_type") == "signup":
            name = request.POST.get("name", "").strip()
            email = request.POST.get("email", "").strip()
            password = request.POST.get("password", "")

            if User.objects.filter(username=email).exists():
                messages.error(request, "An account with this email already exists. Please sign in.")
                return redirect("login")

            first_name, _, last_name = name.partition(" ")
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )
            login(request, user)
            return redirect("index")

        username = request.POST.get("username")
        password = request.POST.get("password")

        # Dummy login for assignment
        if username == "admin" and password == "admin123":
            return redirect("index")

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            if not request.POST.get("remember"):
                request.session.set_expiry(0)
            return redirect("index")

        messages.error(request, "Invalid username or password.")

    return render(request, "login.html")


def index(request):
    return render(request, "index.html")


def customer_to_dict(c):
    status_map = {
        'New Lead': 'pending',
        'Profile Review': 'pending',
        'Active Search': 'active',
        'Matches Sent': 'active',
        'Meeting Scheduled': 'active',
        'Engagement In Progress': 'matched',
        'On Hold': 'inactive',
        'Closed': 'inactive'
    }

    return {
        'id': c.customer_id,
        'firstName': c.first_name,
        'lastName': c.last_name,
        'name': f"{c.first_name} {c.last_name}",
        'gender': c.gender,
        'age': c.age,
        'city': c.city,
        'state': c.state,
        'religion': c.religion,
        'caste': c.caste,
        'height': c.height,
        'education': c.education,
        'company': c.company,
        'designation': c.designation,
        'income': c.income,
        'maritalStatus': c.marital_status,
        'languages': [lang.strip() for lang in c.languages.split(',')] if c.languages else [],
        'wantsKids': c.wants_kids,
        'openToRelocate': c.open_to_relocate,
        'openToPets': c.open_to_pets,
        'statusTag': c.status_tag,
        'status': status_map.get(c.status_tag, 'active'),
        'updated': c.updated_at.strftime('%b %d, %Y'),
        'email': c.email
    }


def next_customer_id():
    last_customer = Customer.objects.exclude(customer_id__isnull=True).order_by('-id').first()
    if not last_customer or not last_customer.customer_id:
        return 'C001'

    digits = ''.join(ch for ch in last_customer.customer_id if ch.isdigit())
    next_number = int(digits or last_customer.id or 0) + 1
    return f'C{next_number:03d}'


def meeting_to_dict(meeting):
    local_time = timezone.localtime(meeting.scheduled_time)
    return {
        'id': meeting.id,
        'day': local_time.strftime('%d'),
        'mon': local_time.strftime('%b'),
        'names': f"{meeting.customer.name} x {meeting.candidate.name}",
        'time': local_time.strftime('%I:%M %p').lstrip('0'),
        'status': meeting.status.lower(),
        'meetingType': meeting.meeting_type,
        'scheduledTime': local_time.isoformat(),
        'customerId': meeting.customer.customer_id,
        'candidateId': meeting.candidate.customer_id,
        'type': '#22C55E' if meeting.status == 'Scheduled' else '#D4AF37',
    }


def api_customers(request):
    if request.method == 'POST':
        try:
            payload = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON payload.'}, status=400)

        required_fields = ['firstName', 'lastName', 'gender', 'age', 'city', 'email']
        missing = [field for field in required_fields if not str(payload.get(field, '')).strip()]
        if missing:
            return JsonResponse({'error': f"Missing required fields: {', '.join(missing)}."}, status=400)

        email = payload.get('email', '').strip()
        if Customer.objects.filter(email=email).exists():
            return JsonResponse({'error': 'A client with this email already exists.'}, status=400)

        customer = Customer.objects.create(
            customer_id=next_customer_id(),
            first_name=payload.get('firstName', '').strip(),
            last_name=payload.get('lastName', '').strip(),
            gender=payload.get('gender', '').strip(),
            age=int(payload.get('age')),
            city=payload.get('city', '').strip(),
            state=payload.get('state', '').strip(),
            religion=payload.get('religion', '').strip(),
            caste=payload.get('caste', '').strip(),
            height=payload.get('height', '').strip(),
            education=payload.get('education', '').strip(),
            company=payload.get('company', '').strip(),
            designation=payload.get('designation', '').strip(),
            income=payload.get('income', '').strip(),
            marital_status=payload.get('maritalStatus', 'Never Married').strip() or 'Never Married',
            languages=payload.get('languages', '').strip(),
            wants_kids=payload.get('wantsKids', 'Maybe'),
            open_to_relocate=payload.get('openToRelocate', 'Maybe'),
            open_to_pets=payload.get('openToPets', 'Maybe'),
            status_tag=payload.get('statusTag', 'New Lead'),
            email=email,
        )
        return JsonResponse(customer_to_dict(customer), status=201)

    customers = Customer.objects.all()
    
    # Map database status_tag to UI CSS status badge values
    status_map = {
        'New Lead': 'pending',
        'Profile Review': 'pending',
        'Active Search': 'active',
        'Matches Sent': 'active',
        'Meeting Scheduled': 'active',
        'Engagement In Progress': 'matched',
        'On Hold': 'inactive',
        'Closed': 'inactive'
    }

    gender = request.GET.get('gender')
    city = request.GET.get('city')
    religion = request.GET.get('religion')
    marital_status = request.GET.get('marital_status')
    status = request.GET.get('status')
    sort_age = request.GET.get('sort_age')

    if gender:
        customers = customers.filter(gender=gender)
    if city:
        customers = customers.filter(city=city)
    if religion:
        customers = customers.filter(religion=religion)
    if marital_status:
        customers = customers.filter(marital_status=marital_status)
    if status:
        matching_status_tags = [
            status_tag for status_tag, ui_status in status_map.items()
            if ui_status == status
        ]
        customers = customers.filter(status_tag__in=matching_status_tags)

    if sort_age == 'asc':
        customers = customers.order_by('age', 'first_name', 'last_name')
    elif sort_age == 'desc':
        customers = customers.order_by('-age', 'first_name', 'last_name')
    else:
        customers = customers.order_by('first_name', 'last_name')
    
    data = [customer_to_dict(c) for c in customers]
    return JsonResponse(data, safe=False)


def api_meetings(request):
    if request.method == 'POST':
        try:
            payload = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON payload.'}, status=400)

        customer_id = payload.get('customerId')
        candidate_id = payload.get('candidateId')
        scheduled_raw = payload.get('scheduledTime')

        if not customer_id or not candidate_id or not scheduled_raw:
            return JsonResponse({'error': 'Client, candidate, and scheduled time are required.'}, status=400)
        if customer_id == candidate_id:
            return JsonResponse({'error': 'Choose two different clients for a meeting.'}, status=400)

        scheduled_time = parse_datetime(scheduled_raw)
        if scheduled_time is None:
            return JsonResponse({'error': 'Enter a valid meeting date and time.'}, status=400)
        if timezone.is_naive(scheduled_time):
            scheduled_time = timezone.make_aware(scheduled_time, timezone.get_current_timezone())

        customer = get_object_or_404(Customer, customer_id=customer_id)
        candidate = get_object_or_404(Customer, customer_id=candidate_id)
        meeting = Meeting.objects.create(
            customer=customer,
            candidate=candidate,
            scheduled_time=scheduled_time,
            meeting_type=payload.get('meetingType', 'Introduction Meeting') or 'Introduction Meeting',
            status=payload.get('status', 'Scheduled') or 'Scheduled',
        )

        for person in (customer, candidate):
            if person.status_tag in ['New Lead', 'Profile Review', 'Active Search', 'Matches Sent']:
                person.status_tag = 'Meeting Scheduled'
                person.save(update_fields=['status_tag', 'updated_at'])

        return JsonResponse(meeting_to_dict(meeting), status=201)

    meetings = Meeting.objects.select_related('customer', 'candidate').order_by('scheduled_time')
    return JsonResponse([meeting_to_dict(meeting) for meeting in meetings], safe=False)


def api_customer_matches(request, customer_id):
    customer = get_object_or_404(Customer, customer_id=customer_id)
    candidates = Customer.objects.exclude(pk=customer.pk)

    if customer.gender:
        candidates = candidates.exclude(gender=customer.gender)

    suggestions = []
    for candidate in candidates:
        compatibility = calculate_compatibility(customer, candidate)
        suggestions.append({
            'id': candidate.customer_id,
            'name': candidate.name,
            'sub': f"{candidate.age} yrs · {candidate.city}",
            'compat': compatibility.get('score', 0),
            'high': compatibility.get('score', 0) >= 85,
            'compatibility_score': compatibility.get('score', 0),
            'compatibility_breakdown': compatibility.get('breakdown', {}),
            'explanation': compatibility.get('explanation', []),
            'facts': [
                ['Occupation', candidate.designation or '—'],
                ['Height', candidate.height or '—'],
                ['Religion', candidate.religion or '—'],
                ['Edu', candidate.education or '—'],
            ],
        })

    suggestions.sort(key=lambda match: match['compat'], reverse=True)
    return JsonResponse(suggestions[:4], safe=False)

