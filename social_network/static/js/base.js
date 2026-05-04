const buttons = document.querySelectorAll('.page_text_button')
const currentPath = window.location.pathname
const exitButton = document.querySelector('.exit_button')

buttons.forEach(button =>{
        if(button.getAttribute('href') == currentPath){
            buttons.forEach(btn => {
            btn.classList.remove("selected_button")
        })
            button.classList.add('selected_button')
        }
})

// exitButton.addEventListener('click', ()=> {
//     sessionStorage.clear()
//     localStorage.clear()
//     window.location.href = '../user/auth/'
    
// })