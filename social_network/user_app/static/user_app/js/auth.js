const listNavButtons = document.querySelectorAll('.nav_button')

listNavButtons.forEach(button =>{
    button.addEventListener("click", () => {
        listNavButtons.forEach(btn => {
            btn.classList.remove("selected_button")
        })
        button.classList.add("selected_button")
    console.log(button)
    })
})