function getCSRFToken() {
    const meta = document.querySelector("meta[name='csrf_token']");
    return meta ? meta.content : "";
}

// Селектори основних елементів
const toCreationButton = document.querySelector("#to_creation");
const postContainer = document.querySelector("#post_form_pop-up");
const formPost = document.querySelector("#form_post");
const postErrorContainer = document.querySelector('#post_error');
const previewText = document.querySelector('#post_text');
const postTextArea = document.querySelector('#id_content');

// Селектори медіа та посилань
const btnAddLink = document.querySelector('#add_link');
const imageButton = document.querySelector('#form_post input[type="file"]');
const listLinks = document.querySelector('#links_list');
const btnAddImage = document.querySelector('#image_button');
const imageInput = document.getElementById('image-input');
const preview = document.getElementById('preview');

// Масив для зберігання стиснених файлів (використовуємо let, бо будемо фільтрувати)
let compressedFiles = [];

// --- ЛОГІКА ПОСИЛАНЬ ---
btnAddLink.addEventListener('click', () => {
    const linkWrapper = document.createElement('div');
    linkWrapper.style.display = 'flex';
    linkWrapper.style.gap = '5px';
    linkWrapper.style.marginBottom = '5px';

    const newLink = document.createElement('input');
    newLink.type = 'url';
    newLink.name = 'links';
    newLink.placeholder = 'Посилання';
    
    const removeLinkBtn = document.createElement('button');
    removeLinkBtn.type = 'button';
    removeLinkBtn.textContent = '×';
    removeLinkBtn.onclick = () => linkWrapper.remove();

    linkWrapper.append(newLink, removeLinkBtn);
    listLinks.append(linkWrapper);
});

// --- ЛОГІКА ЗОБРАЖЕНЬ ---
btnAddImage.addEventListener('click', () => {
    if (imageInput) {
        imageInput.click();
    } else {
        console.error("Помилка: imageInput не знайдено!");
    }
});

imageInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
        await processFile(file);
    }

    imageInput.value = ''; // Скидаємо, щоб можна було вибрати той самий файл знову
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

            // Створюємо унікальний ідентифікатор для цього конкретного файлу
            const uniqueId = Date.now() + Math.random();

            // Створюємо елементи прев'ю
            const previewDiv = document.createElement('div');
            previewDiv.classList.add('preview_div');
            previewDiv.dataset.id = uniqueId;

            const previewImg = document.createElement('img');
            previewImg.src = canvas.toDataURL('image/jpeg', 0.7);
            previewImg.style.width = "11vw"; 
            previewImg.style.height = "25vh";
            previewImg.style.objectFit = 'cover';
            previewImg.style.borderRadius = '10%';

            const previewBtn = document.createElement('button');
            previewBtn.classList.add('delete_button');
            previewBtn.type = "button";

            const btnImage = document.createElement('img');
            btnImage.src = '../static/images/delete_button_icon.png';
            btnImage.classList.add('delete_button_image');

            previewBtn.appendChild(btnImage);
            previewDiv.append(previewImg, previewBtn);
            preview.appendChild(previewDiv);

            // Стискаємо та додаємо в масив
            const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.7));
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
            
            // Прив'язуємо ID до об'єкта файлу
            compressedFile.uniqueId = uniqueId; 
            compressedFiles.push(compressedFile);

            // ВАЖЛИВО: вішаємо видалення тільки на цю нову кнопку
            previewBtn.addEventListener('click', () => {
                // Видаляємо з масиву
                compressedFiles = compressedFiles.filter(f => f.uniqueId !== uniqueId);
                // Видаляємо з екрана
                previewDiv.remove();
                console.log("Файлів залишилось:", compressedFiles.length);
            });

            resolve();
        };

        reader.readAsDataURL(file);
    });
}

// --- ВІДПРАВКА ФОРМИ ---
toCreationButton.addEventListener('click', () => {
    postContainer.classList.remove("disable");
    postTextArea.value = previewText.value;
});

formPost.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const formData = new FormData(formPost);
    formData.delete('images'); // Видаляємо старі дані з інпуту

    // Додаємо наші стиснені та відфільтровані файли
    compressedFiles.forEach(file => {
        if (file) {
            formData.append('images', file);
        }
    });

    const response = await fetch(formPost.action, {
        method: "POST",
        headers: {
            'X-CSRFToken': getCSRFToken(),
            'X-Requested-With': "XMLHttpRequest",
        },
        body: formData
    });

    const data = await response.json();

    if (data.success) {
        formPost.reset();
        compressedFiles = [];
        preview.innerHTML = '';
        listLinks.innerHTML = '';
        postTextArea.value = '';
        postErrorContainer.innerHTML = '';
        postContainer.classList.add("disable");
    } else {
        renderErrors(data.errors);
    }
});

function renderErrors(errors) {
    postErrorContainer.innerHTML = '';
    for (const key in errors) {
        const errorArray = errors[key];
        errorArray.forEach(error => {
            const errorElement = document.createElement('p');
            errorElement.style.color = 'red';
            errorElement.textContent = typeof error === 'string' ? error : error.message;
            postErrorContainer.append(errorElement);
        });
    }
}

// --- РОБОТА З ТЕГАМИ ---
const tagPopup = document.querySelector(".tag_pop_up");
const openTagBtn = document.querySelector("#open_tag_form");
const closeTag = document.querySelector(".tag_close");
const cancelTag = document.querySelector(".tag_button_close");
const tagsContainer = document.querySelector('.tags_container');

const openTagPopup = () => tagPopup.classList.remove("disable");
const closeTagPopup = () => tagPopup.classList.add("disable");

openTagBtn.addEventListener("click", openTagPopup);
closeTag.addEventListener("click", closeTagPopup);
cancelTag.addEventListener("click", closeTagPopup);


const textAreaContent = document.querySelector('.textarea_content')
const customTextarea = document.querySelector('.textarea_content textarea')
customTextarea.addEventListener('input', () =>{
    customTextarea.style.height = 'auto'
    customTextarea.style.height = customTextarea.scrollHeight + 'px'
})

if (textAreaContent) {
    textAreaContent.innerHTML += '<textarea name="tag_textarea" class="tag_textarea" readonly></textarea>'
    const tagTextArea = document.querySelector('.tag_textarea')
    
    if (tagsContainer) {
        tagsContainer.addEventListener('change', (event) => {
            if (event.target.type === 'checkbox') {
                const input = event.target;
                const tag = input.nextElementSibling.textContent.trim();
                const parentLabel = input.parentElement;
                
                let tags = tagTextArea.value.split(' ').filter(item => item !== '');
                
                if (input.checked) {
                    if (!tags.includes(tag)) tags.push(tag);
                    parentLabel.classList.add('selected_tag');
                } else {
                    tags = tags.filter(item => item !== tag);
                    parentLabel.classList.remove('selected_tag');
                }
                
                tagTextArea.value = tags.join(' ');
            }
        });
    }
}

// Збереження контенту при завантаженні (якщо було в localStorage)
window.addEventListener('DOMContentLoaded', () => {
    const savedContent = localStorage.getItem('saved_post_content');
    if (savedContent && postTextArea) {
        postTextArea.value = savedContent;
        localStorage.removeItem('saved_post_content');
    }
});

// Додавання нового тега
const tagForm = document.querySelector('.tag_pop_up form');
if (tagForm) {
    tagForm.addEventListener('submit', async function(event) {
        event.preventDefault(); 

        const formData = new FormData(tagForm);
        const response = await fetch(tagForm.action, {
            method: "POST",
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'X-Requested-With': "XMLHttpRequest",
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            const tagWrapper = document.createElement('label');
            tagWrapper.className = 'tag_item';
            tagWrapper.innerHTML = `
                <input type="checkbox" name="tags" value="${data.tag_id}">
                <span>${data.tag_name}</span>
            `;

            const plusButton = document.getElementById('open_tag_form');
            if (tagsContainer && plusButton) {
                tagsContainer.insertBefore(tagWrapper, plusButton);
            }

            closeTagPopup();
            tagForm.reset();
        }
    });
}

const btnFormClose = document.querySelector('#post_form_close')
btnFormClose.addEventListener('click', ()=> {
    postContainer.classList.add('disable')
})

const usernameCheck = document.querySelector("#username_pop-up")
const formUsername = document.querySelector("#form_username")
const usernameErrorContainer = document.querySelector("#username_error_container")
document.addEventListener("DOMContentLoaded", async () => {
    const checkResponse = await fetch("set_username/", {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    });

    const checkData = await checkResponse.json();

    if (checkData.needs_profile) {
        usernameCheck.classList.remove('disable')
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
        usernameCheck.classList.add('disable')
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

document.querySelectorAll('.recent_action').forEach(element => {
    element.addEventListener('click', () => {
        const chatId = element.dataset.chatId;
        if (chatId) {
            // Перенаправляємо на сторінку чатів із query-параметром ?open_id=...
            window.location.href = `/chat/?open_id=${chatId}`;
        }
    });
});
