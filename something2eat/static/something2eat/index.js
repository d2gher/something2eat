const fridge_button = document.querySelector("#fridge") 
const recommendations_button = document.querySelector("#recommendations") 

if (fridge_button) {
    fridge_button.addEventListener('click', () => load_tap('#fridge-view'));
    recommendations_button.addEventListener('click', () => load_tap('#recommendations-view'));
    load_ingredients()

    const form = document.querySelector("#fridge-add-form")
    form.addEventListener("submit", function(event) {
        // Stop the default submit event action
        event.preventDefault();

        document.querySelector("#ingredient-name").value = ""
        // Sent ingredient post request
        const formData = new FormData(this);
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
    document.querySelector("#fridge-view").style.display = "none";
    document.querySelector("#recommendations-view").style.display = "none";

    document.querySelector(tap).style.display = "block";
}

function load_ingredients() {
    const list = document.querySelector("#ingredients-list")
    list.innerHTML = ""
    fetch("/ingredients")
    .then(res => res.json())
    .then(ingredients => {
        console.log(ingredients)
        ingredients.forEach(ingredient => {
            const element = document.createElement("li");
            element.className = "list-group-item"

            element.innerHTML = ingredient.ingredient;
            list.append(element);
        });
    })
}