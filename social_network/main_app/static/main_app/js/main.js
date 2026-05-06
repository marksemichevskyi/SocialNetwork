function getCSRFToken(){
    const meta = document.querySelector("meta[name='csrf_token']")
    return meta.content
}

const popUp = document.querySelector('.pop-up')
const formUsername = document.querySelector('#form_username')
const usernameErrorContainer = document.querySelector('#username_error_container')

const toCreationButton = document.querySelector("#to_creation")

const postContainer = document.querySelector(".pop-up")
const formPost = document.querySelector("#form_post")
const postErrorContainer = document.querySelector('#post_error')

const btnAddLink = document.querySelector('#add_link')
const listLinks = document.querySelector('#links_list')

btnAddLink.addEventListener('click', () => {
const newLink = document.createElement('input')
newLink.type = 'url'
newLink.name = 'link'
newLink.placeholder = 'Посилання'
listLinks.append(newLink)
})

toCreationButton.addEventListener('click', () => {
    postContainer.classList.remove("disable")
})

document.addEventListener("DOMContentLoaded", async () => {
    const checkResponse = await fetch("set_username/", {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    });

    const checkData = await checkResponse.json();

    if (checkData.needs_profile) {
        popUp.classList.remove('disable')
    }

    formUsername.addEventListener('submit', async function(event){
    event.preventDefault()
    const formData = new FormData(event.target)

    const response = await fetch(formUsername.action,{
        method: "POST",
        headers:{
            'X-CSRFToken': getCSRFToken(),
            'X-Requested-With': "XMLHttpRequest",
        },
        body: formData
    })
    const data = await response.json()
    if (data.success == true) {
        formUsername.reset()
        popUp.classList.add('disable')
    } else {
        usernameErrorContainer.innerHTML = ''
        for (const key in data.errors) {
            const errors = data.errors[key];
            errors.forEach(error => {
                const errorElement = document.createElement('p')
                errorElement.textContent = error.message
                usernameErrorContainer.append(errorElement)
            });
        }
    }
})
});


