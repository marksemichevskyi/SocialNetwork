const listButtons = document.querySelectorAll('.button')
const h1 = document.querySelector("h1")

listButtons.forEach(button =>{
    button.addEventListener("click", () => {
        listButtons.forEach(btn => {
            btn.classList.remove("selected")
        })
        button.classList.add("selected")
        h1.textContent = button.id
    })
})