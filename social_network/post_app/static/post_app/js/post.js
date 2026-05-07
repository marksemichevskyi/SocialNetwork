function getCSRFToken(){
    const meta = document.querySelector("meta[name='csrf_token']")
    return meta.content
}

const toCreationButton = document.querySelector("#to_creation")

const postContainer = document.querySelector(".pop-up")
const formPost = document.querySelector("#form_post")
const postErrorContainer = document.querySelector('#post_error')


const btnAddLink = document.querySelector('#add_link')
const imageInput = document.querySelector('#form_post input[type = "file"]')
const listLinks = document.querySelector('#links_list')


const btnAddImage = document.querySelector('#image_button')


btnAddImage.addEventListener('click', ()=> {
    imageInput.click()
})





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



formPost.addEventListener('submit', async function(event){
    console.log('it works')
    event.preventDefault()
    const formData = new FormData(event.target)
    const response = await fetch(formPost.action,{
        method: "POST",
        headers:{
            'X-CSRFToken': getCSRFToken(),
            'X-Requested-With': "XMLHttpRequest",
        },
        body: formData
    })
    const data = await response.json()
    if (data.success == true) {
        formPost.reset()
    } else {
        postErrorContainer.innerHTML = ''
        for (const key in data.errors) {
            const errors = data.errors[key];
            errors.forEach(error => {
                const errorElement = document.createElement('p')
                errorElement.textContent = error.message
                postErrorContainer.append(errorElement)
            });
        }
    }
})