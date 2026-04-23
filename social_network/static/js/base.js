const buttons = document.querySelectorAll('.page_text_button')
const currentPath = window.location.pathname

buttons.forEach(button =>{
        if(button.getAttribute('href') == currentPath){
            buttons.forEach(btn => {
            btn.classList.remove("selected_button")
        })
            button.classList.add('selected_button')
        }
})