from django.shortcuts import render, HttpResponseRedirect, HttpResponse
from django.contrib.auth import login, logout, authenticate
from django.db import IntegrityError
from django.urls import reverse

from .models import User

# Create your views here.

def index_view(request):
    return render(request, "index.html")

def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        # Attempt to login user
        user = authenticate(request, username=username, password= password)

        # Check if the authentication was a failure 
        if user is None:
            return render(request, "login.html", {"message": "Invalid username and/or password."})
        # Login and redirect to index
        login(request, user)
        return HttpResponseRedirect(reverse("index"))

    return render(request, "login.html")

def logout_view(request):
    logout(request)
    return render(request, "index.html")

def register_view(request):
    if request.method == "POST":
        # Get new account details 
        username = request.POST["username"]
        email = request.POST["email"]
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]

        # Insure passwords match
        if password != confirmation: 
            return render(request, "register.html", {"message": "Passwords don't match"})
        # Make sure the password is long enough
        min_length  = 6
        if len(password) < min_length:
           return render(request, "register.html", {"message": "Password must be 6 letters or longer"})   

        # Attempt to register user 
        try: 
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError as e: 
           return render(request, "register.html", {"message": e.__cause__})
        login(request, user)
        return HttpResponseRedirect(reverse("index"))      

    return render(request, 'register.html')
