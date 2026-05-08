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


btnAddImage.addEventListener('click', () => {
    if (imageInput) {
        imageInput.click();
    } else {
        console.error("Помилка: imageInput не знайдено в DOM!");
    }
});





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

function renderErrors(errors) {
    postContainer.innerHTML = '';
    for (const key in errors) {
        errors[key].forEach(error => {
            const errorElement = document.createElement('p');
            errorElement.style.color = 'red';
            errorElement.textContent = typeof error === 'string' ? error : error.message;
            postErrorContainer.append(errorElement);
        })
    }
}

const input = document.getElementById('image-input');
const preview = document.getElementById('preview');

let compressedFile = null;

input.addEventListener('change', async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
        img.src = event.target.result;
    };

    img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const MAX_WIDTH = 800;

        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // Превью
        preview.src = canvas.toDataURL('image/jpeg', 0.7);
        preview.style.display = 'block';

        // Сжатый файл
        const blob = await new Promise(resolve =>
            canvas.toBlob(resolve, 'image/jpeg', 0.7)
        );

        compressedFile = new File(
            [blob],
            file.name,
            { type: 'image/jpeg' }
        );
    };

    reader.readAsDataURL(file);
});

document.getElementById('form').addEventListener('submit', (e) => {
    if (!compressedFile) return;

    e.preventDefault();

    const dt = new DataTransfer();
    dt.items.add(compressedFile);

    input.files = dt.files;

    e.target.submit();
});