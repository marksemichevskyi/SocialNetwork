const listNavButtons = document.querySelectorAll('.nav_button')
const listForms = document.querySelectorAll('.form')

listNavButtons.forEach(button =>{
    button.addEventListener("click", () => {
        listNavButtons.forEach(btn => {
            btn.classList.remove("selected_button")
        })
        button.classList.add("selected_button")
        
        listForms.forEach(form => {
            form.classList.add("disable")
            if(button.id == form.id){
                form.classList.remove("disable")
            }
        })
    })
})

