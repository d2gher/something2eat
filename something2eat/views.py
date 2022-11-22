from django.shortcuts import render, HttpResponseRedirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.urls import reverse
from django.core.cache import cache
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests
import json
import os

from .models import User, Ingredient

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

@login_required
@csrf_exempt
def ingredients_view(request):
    try:
        user = User.objects.get(username=request.user.username)
    except:
        return

    if request.method == "POST":
        try:
            ingredient_name = json.loads(request.body).get('ingredient').strip()

            # If name is empty
            if not ingredient_name:
                return JsonResponse({"error": "Ingredient name can't be empty"}, status=404)

            try:
                ingredient = Ingredient.objects.get(user=user, ingredient=ingredient_name)
                return JsonResponse({"error": "Item already added to your fridge"}, status=404)
            except:
                ingredient = Ingredient(user=user, ingredient=ingredient_name)
                ingredient.save()
                cache.delete("ingredients-%s" % user.id)    
                cache.delete("recipies-%s" % user.id)    
                return JsonResponse({"Success": "Item saved"}, status=200)

        except IntegrityError as e: 
           return JsonResponse({"error": e.__cause__}, status=404)

    if request.method == "GET":
        ingredients = cache.get("ingredients-%s" % user.id)

        if ingredients is None:
            try:
                ingredients = Ingredient.objects.filter(user=user)
                cache.set("ingredients-%s" % user.id, ingredients)
            except IntegrityError as e: 
                return JsonResponse({"error": e.__cause__}, status=404)
        try:        
            return JsonResponse([ingredient.serialize() for ingredient in ingredients], safe=False)        
        except:
            return JsonResponse({"Error": "No recipies found."}, status=404)

    if request.method == "DELETE":
        ingredient_id = json.loads(request.body).get("id")
        try:
            Ingredient.objects.filter(id=ingredient_id).delete()
            cache.delete("ingredients-%s" % user.id)  
            cache.delete("recipies-%s" % user.id)  
            return JsonResponse({"Success": "Ingredient was removed."}, status=200)
        except:
            return JsonResponse({"Error": "Couldn't find ingredient"}, status=404)        

@login_required
def recipies_view(request):
    
    try:
        user = User.objects.get(username=request.user.username)
    except:
        return JsonResponse({"error": "couldn't find user"}, status=404) 

    recipies = cache.get("recipies-%s" % user.id)

    if recipies is None: 
        try:
            ingredients = cache.get("ingredients-%s" % user.id)

            if ingredients is None:
                try:
                    ingredients = Ingredient.objects.filter(user=user)
                    cache.set("ingredients-%s" % user.id, ingredients)
                except IntegrityError as e: 
                    return JsonResponse({"error": e.__cause__}, status=404)
                    
            ingredients = JsonResponse([ingredient.serialize() for ingredient in ingredients], safe=False)
            list = []
            
            for ingredient in ingredients:
                ingredient = json.loads(ingredient)
                for item in ingredient:
                    list.append(item.get("ingredient"))

            if not list:
                return JsonResponse({"error": "empty ingredients"}, status=404)  
            list.sort()

            CSV_ingredients = ""
            for item in list:
                CSV_ingredients += f'{item},'

            recipies = requests.get(f'https://api.spoonacular.com/recipes/findByIngredients?ingredients={CSV_ingredients}&ranking=2&apiKey={os.environ["API_KEY"]}&ignorePantry=true')    
            recipies = recipies.json()
            cache.set("recipies-%s" % user.id, recipies)
        except:
            return JsonResponse({"error": "couldn't reach the API"}, status=404)    
    
    return JsonResponse(recipies, safe=False)  

@login_required
def recipie_view(request, id):
    recipie = cache.get("recipie-%s" % id)

    if recipie is None: 
        try: 
            print(f'https://api.spoonacular.com/recipes/{id}/information&apiKey={os.environ["API_KEY"]}')
            recipie = requests.get(f'https://api.spoonacular.com/recipes/{id}/information?apiKey={os.environ["API_KEY"]}')
            recipie = recipie.json()  
            cache.set("recipie-%s" % id, recipie) 
        except:
            return JsonResponse({"error": "couldn't find recipe"}, status=404) 
         
    return JsonResponse(recipie, safe=False)