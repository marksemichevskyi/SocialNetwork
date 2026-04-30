function getCSRFToken(){
    const meta = document.querySelector("meta[name='csrf_token']")
    return meta.content
}

const navBar = document.querySelector(".navigation")

const registerErrorContainer = document.querySelector("#register_error")
const loginErrorContainer = document.querySelector("#login_error")
const confirmErrorContainer = document.querySelector("#confirm_error")

const buttonRegister = document.querySelector("#register_button")
const buttonLogin = document.querySelector("#login_button")
const buttonConfirm = document.querySelector("#confirm_button")
const buttonExit = document.querySelector("#back_to_register")


const containerRegister = document.querySelector("#register")
const containerLogin = document.querySelector("#login")
const containerConfirm = document.querySelector("#confirm")

buttonExit.addEventListener('click', ()=>{
    containerConfirm.classList.add("disable")
    containerRegister.classList.remove("disable") 
    buttonRegister.classList.add("selected_button") 
    navBar.classList.remove('disable')
})


buttonRegister.addEventListener('click', ()=>{
    containerLogin.classList.add("disable")
    containerRegister.classList.remove("disable") 
    buttonLogin.classList.remove("selected_button")
    buttonRegister.classList.add("selected_button") 
    
    
})

buttonLogin.addEventListener('click', ()=>{
    containerLogin.classList.remove("disable")
    containerRegister.classList.add("disable") 
    buttonLogin.classList.add("selected_button") 
    buttonRegister.classList.remove("selected_button")
    
})


console.log(getCSRFToken())


const formLogin = document.getElementById('form_login')
const formRegister = document.getElementById('form_register')
const formConfirm = document.querySelector("#confirm_email")


formRegister.addEventListener('submit', async function(event){
    event.preventDefault()
    const formData = new FormData(event.target)

    const response = await fetch(formRegister.action,{
        method: "POST",
        headers:{
            'X-CSRFToken': getCSRFToken(),
            'X-Requested-With': "XMLHttpRequest",
        },
        body: formData
    })
    const data = await response.json()
    if (data.success == true) {
        formRegister.reset()
        navBar.classList.add('disable')
        containerRegister.classList.add("disable")
        containerConfirm.classList.remove("disable")
        buttonRegister.classList.remove("selected_button")
    } else {
        registerErrorContainer.innerHTML = ''
        for (const key in data.errors) {
            const errors = data.errors[key];
            errors.forEach(error => {
                const errorElement = document.createElement('p')
                errorElement.textContent = error.message
                registerErrorContainer.append(errorElement)
            });
        }
    }
})

formLogin.addEventListener('submit', async function(event){
    event.preventDefault()
    const formData = new FormData(event.target)
    const response = await fetch(formLogin.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCSRFToken(),
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    const data = await response.json()
    if (data.success == true) {
        formLogin.reset()
        window.location.href = '/main/'
    } else {
        loginErrorContainer.innerHTML = ''
        for (const key in data.errors) {
            const errors = data.errors[key];
            errors.forEach(error => {
                const errorElement = document.createElement('p')
                errorElement.textContent = error.message
                loginErrorContainer.append(errorElement)
            });
        }
    }
})


formConfirm.addEventListener('submit', async function(event){
    event.preventDefault()
    const formData = new FormData(event.target)

    const response = await fetch(formConfirm.action,{
        method: "POST",
        headers:{
            'X-CSRFToken': getCSRFToken(),
            'X-Requested-With': "XMLHttpRequest",
        },
        body: formData
    })
    const data = await response.json()
    if (data.success == true) {
        formConfirm.reset()
        containerConfirm.classList.add("disable")
        containerLogin.classList.remove("disable")
        navBar.classList.remove('disable')
        buttonLogin.classList.add("selected_button") 
        buttonRegister.classList.remove("selected_button")
    } else {
        confirmErrorContainer.innerHTML = ''
        for (const key in data.errors) {
            const errors = data.errors[key];
            errors.forEach(error => {
                const errorElement = document.createElement('p')
                errorElement.textContent = error.message
                confirmErrorContainer.append(errorElement)
            });
        }
    }
})