from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User

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
