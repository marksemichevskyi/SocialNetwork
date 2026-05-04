function getCSRFToken(){
    const meta = document.querySelector("meta[name='csrf_token']")
    return meta.content
}

const formPost = document.querySelector("#form_post")
const postErrorCOntainer = document.querySelector('#post_error')

formPost.addEventListener('submit', async function(event){
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