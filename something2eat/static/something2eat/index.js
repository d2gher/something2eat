const fridge_button = document.querySelector("#fridge") 
const recommendations_button = document.querySelector("#recommendations") 

if (fridge_button) {
    fridge_button.addEventListener('click', () => load_tap('#fridge-view'));
    recommendations_button.addEventListener('click', () => load_tap('#recommendations-view'));
    recommendations_button.addEventListener('click', () => load_tap('#recommendations-view'));
    load_ingredients()
    
    const form = document.querySelector("#fridge-add-form")
    form.addEventListener("submit", function(event) {
        // Stop the default submit event action
        event.preventDefault();

        // Sent ingredient post request
        const formData = new FormData(this);
        document.querySelector("#ingredient-name").value = ""

        fetch("/ingredients", {
            method: "POST",
            body: JSON.stringify({
                ingredient: formData.get("ingredient")
            })
        })
        .then(res => res.json())
        .then(() => {
            load_ingredients()
        })
        .catch(err => console.log(err))
    })
    
}

if (!fridge_button) {
    const login_button = document.querySelector("#login-button") 
    const login_view = document.querySelector("#login-view") 
    const register_button= document.querySelector("#register-button") 
    const register_view = document.querySelector("#register-view") 

    register_button.addEventListener("click", () => {
        login_view.style.display = "none";
        register_view.style.display = "block";
    })

    login_button.addEventListener("click", () => {
        login_view.style.display = "block";
        register_view.style.display = "none";
    })
}

function load_tap(tap) {
    if (tap == "#recommendations-view") {
        document.querySelector("#fridge-view").style.display = "none";
        document.querySelector("#recipe-view").style.display = "none";
        document.querySelector(tap).style.display = "flex";
    } else {
        document.querySelector("#recommendations-view").style.display = "none";
        document.querySelector("#recipe-view").style.display = "none";
        document.querySelector(tap).style.display = "block";
    }
}

function load_ingredients() {
    const list = document.querySelector("#ingredients-list")

    fetch("/ingredients")
    .then(res => res.json())
    .then(ingredients => {
        if (ingredients.length == 0) throw "No ingredients found"
        list.innerHTML = ""
        ingredients.forEach(ingredient => {
            const element = document.createElement("div");
            
            element.innerHTML = `
            <li class="list-group-item d-flex justify-content-between align-items-center">${capitalize(ingredient.ingredient)}
            <button id="ingredient-${ingredient.id}" class="btn btn-danger">Remove</button></li> 
            `
            list.append(element);
            document.querySelector(`#ingredient-${ingredient.id}`).addEventListener('click', () => removeIngredient(ingredient.id))
        });
        load_recipes()
    }).catch(err => console.log(err))
}

function load_recipes() {
    const recipie_block = document.querySelector("#recommendations-view")
    recipie_block.innerHTML = ""

    fetch("/recipes")
    .then(res => res.json())
    .then(recipes => {
        if (recipes == undefined) throw "No recipes found"
        console.log(recipes)
        recipes.forEach(recipie => {
            const element = document.createElement("div");
            let used_ingredients = ""
            recipie.usedIngredients.forEach(item => {
                used_ingredients += `<li class="card-text">${capitalize(item.name)}</li>`
            })
            element.className = "card";
            element.style.width = "18rem"
            element.innerHTML = `
            <div class="recipie">
                <img class="card-img-top" src="${recipie.image}" alt="Card image cap">
                <div class="card-body">
                    <h5 class="card-title">${recipie.title}</h5>
                    <hr>
                    <h6 class="card-subtitle mb-2 text-muted">Used ingredients</h6>
                    <ul>${used_ingredients}</ul>
                    Likes: <span class="badge badge-primary badge-pill">${recipie.likes}</span>
                </div>
            </div>`;
            recipie_block.append(element);
            element.addEventListener("click", () => {
                load_recipie(recipie.id)
            } )
        });
    }).catch(err => console.log(err))
}

function capitalize(str) {
    const capitalized  = str.charAt(0).toUpperCase() + str.slice(1)

    return capitalized 
}

function removeIngredient(id) {
    fetch("/ingredients", {
        method: "DELETE",
        body: JSON.stringify({
            id: id
        })
    })
    .then(res => res.json())
    .then(recipes => {
        const item = document.querySelector(`#ingredient-${id}`)
        item.style.animationPlayState = "running"
        item.parentElement.style.animationPlayState = "running"
        item.parentElement.addEventListener("animationend", ()=> {
            item.parentElement.remove()
            load_recipes()
        })
    })
    .catch(err => console.log(err))
}

function load_recipie(id) {
    let element = document.querySelector("#recipe-container");
    element.innerHTML = ""
    load_tap('#recipe-view')
    fetch(`/recipes/${id}`)
    .then(res => res.json())
    .then(recipe => {
        console.log(recipe)
        element.innerHTML = `
        <div class="recipe d-flex justify-content-center">
            <img class="recipe-image" src="${recipe.image}">
            <div class="vl"></div>
            <div class="recipe-title"><h2>${recipe.title}</h2></div>
        </div>
        <hr>
        <div class="flex-column d-flex align-items-center">
            ${recipe.summary}
        </div>
        <div class="flex-column d-flex align-items-center">
            <h3>Ingredients:</h3>
            <ul class="list-group list-group-flush">${split_ingredients(recipe.extendedIngredients)}</ul>
        </div>
        <div class="flex-column d-flex align-items-center">
            <h3>Instructions:</h3>${recipe.instructions}
        </div>
        `

    })
    .catch(err => console.log(res))
}

// function split_string(str) {
//     str = str.split(`\n`);
//     let list = ""
//     str.forEach(step => {
//         list += `<li class="list-group-item">${step}</li>`
//     });
//     return list;
// }

function split_ingredients(arr) {
    let list = ""
    arr.forEach(item => {
        list += `<li class="list-group-item">${item.original}</li>`
    });
    return list;
}