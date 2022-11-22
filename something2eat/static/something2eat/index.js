const fridge_button = document.querySelector("#fridge") 
const recommendations_button = document.querySelector("#recommendations") 

if (fridge_button) {
    fridge_button.addEventListener('click', () => load_tap('#fridge-view'));
    recommendations_button.addEventListener('click', () => load_tap('#recommendations-view'));
    load_ingredients()
    load_recipies()
    
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

function load_tap(tap) {
    if (tap == "#recommendations-view") {
        document.querySelector("#fridge-view").style.display = "none";
        document.querySelector(tap).style.display = "flex";
    } else {
        document.querySelector("#recommendations-view").style.display = "none";
        document.querySelector(tap).style.display = "block";
    }
}

function load_ingredients() {
    const list = document.querySelector("#ingredients-list")
    list.innerHTML = ""
    fetch("/ingredients")
    .then(res => res.json())
    .then(ingredients => {
        ingredients.forEach(ingredient => {
            
            const element = document.createElement("div");
            // element.className = "list-group-item"
            element.innerHTML = `
            <li class="list-group-item d-flex justify-content-between align-items-center">${capitalize(ingredient.ingredient)}
            <button id="ingredient-${ingredient.id}" class="btn btn-danger">Remove</button></li> 
            `
            list.append(element);
            document.querySelector(`#ingredient-${ingredient.id}`).addEventListener('click', () => removeIngredient(ingredient.id))
            load_recipies()
        });
    })
}

function load_recipies() {
    const recipie_block = document.querySelector("#recommendations-view")
    recipie_block.innerHTML = ""

    fetch("/recipies")
    .then(res => res.json())
    .then(recipies => {
        console.log(recipies)
        recipies.forEach(recipie => {
            const element = document.createElement("div");
            element.className = "card";
            element.style.width = "18rem"
            element.innerHTML = `
            <img class="card-img-top" src="${recipie.image}" alt="Card image cap">
            <div class="card-body">
                <h5 class="card-title">${recipie.title}</h5>
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="recpies/${recipie.id}" class="btn btn-primary">More details</a>
            </div>`;
            recipie_block.append(element);
        });
    })
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
    .then(recipies => {
        const item = document.querySelector(`#ingredient-${id}`)
        item.style.animationPlayState = "running"
        item.parentElement.style.animationPlayState = "running"
        item.parentElement.addEventListener("animationend", ()=> {
            item.parentElement.remove()
            load_recipies()
        })
    })
    .catch(err => console.log(err))
}
