from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from .matchmaking import calculate_compatibility
from .models import Customer

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

def api_customers(request):
    customers = Customer.objects.all()
    data = []
    
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
    
    for c in customers:
        data.append({
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
        })
    return JsonResponse(data, safe=False)


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
            'compat': compatibility['score'],
            'high': compatibility['score'] >= 85,
            'explanation': compatibility['explanation'],
            'facts': [
                ['Occupation', candidate.designation or '—'],
                ['Height', candidate.height or '—'],
                ['Religion', candidate.religion or '—'],
                ['Edu', candidate.education or '—'],
            ],
        })

    suggestions.sort(key=lambda match: match['compat'], reverse=True)
    return JsonResponse(suggestions[:4], safe=False)
