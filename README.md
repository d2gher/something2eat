# Something to Eat

Something to Eat is a web application where you can find easy and simple meals to make with ingredients you already have. It uses the [Spoonacula API](https://spoonacular.com/food-api/docs) to find recipes by ingredients uniquely for each user. It is my final project for CS50Web.

## Project structure and files

This project is a one-page Django application, the main page is the index.html and it is made by extending the layout.html file, both are in the templates folder. The page dynamically reshapes to suit where the user is supposed to be, whether he is logged in or not or if they are registering a new account. When the user logs in they are greeted with a page split into 2 halves; The "My fridge" tap, from which the user can add ingredients they have, and the other is the "Recommendations" tap, which is generated based on the ingredients the user add in the previous tap, it shows a list of recipes that suit the user and if they clicked on any of them it would load more details about the recipe, like a list of the full ingredients and a step-by-step guide to have to prepare it. That is most of the frontend that went into this.

The backend. This project has two models, one for users, and one for ingredients with a reference to the user model, both are stored in a sqlite3 database. The project also has 7 views. 4 of these are fairly basic [index, login, logout, register], and the other 3 are: 

#### ingredients View

- /ingredients [POST] Adds new ingredients liked to the logged-in user
- /ingredients [GET] Returns a list of the ingredients the logged-in user has
- /ingredients/id [DELETE] Deletes an ingredient from the database

#### Recipes View

- /recipies[GET] Makes a call to the  [Spoonacula API](https://spoonacular.com/food-api/docs) with the logged-in user's ingredients and sends the results back to the frontend in JSON form

#### Recipe view

- /recipe/id[GET] Makes a call to the  [Spoonacula API](https://spoonacular.com/food-api/docs) with an id of a recipe and sends the results back to the frontend in JSON form


## Distinctiveness and Complexity

I believe this app is distinct in that it provides a beneficial service that is not really out there in a good form, there are lots of recipes websites out there, but I haven't found one that gives me something I can make with what I already have. Complexity-wise, the app is as complex as the apps in the course, with the added complexity of calling an external API and using caching to avoid calling the API too many times and slowing down the app.

## How to run

Move your terminal to the project's directory and run the command "python manage.py runserver". The app should statrt at: http://127.0.0.1:8000/

