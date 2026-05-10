function getCSRFToken(){
    const meta = document.querySelector("meta[name='csrf_token']")
    return meta.content
}

const toCreationButton = document.querySelector("#to_creation")

const postContainer = document.querySelector(".pop-up")

const formPost = document.querySelector("#form_post")
const postErrorContainer = document.querySelector('#post_error')


const btnAddLink = document.querySelector('#add_link')
const imageButton = document.querySelector('#form_post input[type = "file"]')
const listLinks = document.querySelector('#links_list')


const btnAddImage = document.querySelector('#image_button')


btnAddImage.addEventListener('click', () => {
    if (imageButton) {
        imageButton.click();
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



formPost.addEventListener('submit', async function(event) {
    event.preventDefault()
    
    const formData = new FormData(formPost)
    formData.delete('images')

    compressedFiles.forEach(file => {
        if (file) {
            formData.append('images[]', file);
        }
    })

    const response = await fetch(formPost.action, {
        method: "POST",
        headers: {
            'X-CSRFToken': getCSRFToken(),
            'X-Requested-With': "XMLHttpRequest",
        },
        body: formData
    });
    const data = await response.json()
    if (data.success == true) {
        formPost.reset()
        compressedFiles = []
        preview.innerHTML = ''
        
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
    postErrorContainer.innerHTML = ''
    for (const key in errors) {
        errors[key].forEach(error => {
            const errorElement = document.createElement('p');
            errorElement.style.color = 'red';
            errorElement.textContent = typeof error === 'string' ? error : error.message;
            postErrorContainer.append(errorElement);
        })
    }
}

const imageInput = document.getElementById('image-input');
const preview = document.getElementById('preview');
let compressedFile = null;
let compressedFiles = []

imageInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files); // Отримуємо всі файли
    if (files.length === 0) return;

    for (const file of files) {
        await processFile(file);
    }

    imageInput.value = ''; 
});

async function processFile(file) {
    return new Promise((resolve) => {
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

            // Створюємо окремий елемент для прев'ю
            const previewImg = document.createElement('img');
            previewImg.src = canvas.toDataURL('image/jpeg', 0.7);

            previewImg.style.width = "11vw"; 
            previewImg.style.height = "25vh";
            previewImg.style.objectFit = 'cover';
            previewImg.style.borderRadius = '10%';

            preview.appendChild(previewImg);

            // Стискаємо та додаємо в масив
            const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.7));
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
            
            compressedFiles.push(compressedFile);
            resolve();
        };

        reader.readAsDataURL(file);
    });
}





const textArea = document.querySelector('#id_content')
const tagPopup = document.querySelector(".tag_pop_up");
const openTagBtn = document.querySelector("#open_tag_form");
const closeTag = document.querySelector(".tag_close");
const cancelTag = document.querySelector(".tag_button_close");

function openTagPopup() {
    tagPopup.classList.remove("disable");
}

function closeTagPopup() {
    tagPopup.classList.add("disable");
}


openTagBtn.addEventListener("click", openTagPopup);


closeTag.addEventListener("click", closeTagPopup);
cancelTag.addEventListener("click", closeTagPopup);
openTagBtn.addEventListener("click", openTagPopup);




// function getSelectedTags() {
//     const activeCheckboxes = document.querySelectorAll('#form_post input[type="checkbox"]:checked');
//     const selectedTags = [];
    
//     activeCheckboxes.forEach((checkbox) => {
//         const label = checkbox.nextElementSibling;
//         selectedTags.push(label.textContent);
//     });

//     console.log("Вибрані теги:", selectedTags);
//     return selectedTags;
// }

document.querySelectorAll('#form_post input[type="checkbox"]').forEach(input => {

    input.addEventListener('change', () => {
        let tag = input.nextElementSibling.textContent.trim();
        let tags = textArea.value
            .split(' ')
            .filter(item => item !== '');

        if (input.checked) {
            tags.push(tag);
            input.parentElement.classList.add('selected_tag')

        } else {
            tags = tags.filter(item => item !== tag);
            input.parentElement.classList.remove('selected_tag')

        }
            textArea.value = tags.join(' ');

    });

});

