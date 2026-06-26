let chatBtns

function getChats(){
    chatBtns = null
    chatBtns = document.querySelectorAll(".created_chat")
    console.log(chatBtns)
}

getChats()

const chat = document.querySelector("#chat")
const notSelectContainer = document.querySelector("#not-select")
let chatSocket;
let activeChatId = null
const friendDivs = document.querySelectorAll(".single_contact")
const csrfToken = document.querySelector("meta[name='csrfToken']").content
const messages = document.querySelector('#messages')
const loadLine = document.querySelector("#load-message-line")
let pageNumber = 1
let observer = null
let chatId = null
let settingsModalOpen = false
let listOnlineGroupUsers = null
let listGroupUsers = null

let isGroupAdmin = false
let isGroup = false

const currentUserId = document.querySelector("meta[name='current_user']").content
const createGroupBtn = document.querySelector(".add_group_button")
const addGropPopUp = document.querySelector("#add_group_pop-up")
const groupClosebtn = document.querySelector("#create_group_close")
const grouptFirst = document.querySelector(".group_first")
const grouptSecond = document.querySelector(".group_second")
const closeBtn= document.querySelector("#close_form")
const goBackBtn = document.querySelector("#go_back")

const createGroup = document.querySelector("#create_button")
const groupName = document.querySelector("#group_name")
const groupChats = document.querySelector('.last_group_messages')

const chatName = document.querySelector(".chat_name")
const msgImageInput = document.querySelector("#message-files")

const imgBtnInput = document.querySelector("#add_image_btn")

const senderAvatar = document.querySelector(".sender_avatar").dataset.img
const messageStatus = document.querySelector(".message_status_image").dataset.img

const errorMsg = document.querySelector('.group_error_msg') 

const chatOptionsButton = document.querySelector("#options")

const adminGroupSettings = document.querySelector(".admin_group_settings")
const groupSettings = document.querySelector(".group_settings")

const redactGroupBtn = document.querySelector(".redact_group")

//--------------------------------------------------------------------------------------------------------------------------------
redactGroupBtn.addEventListener("click", ()=>{
    openEditGroupModal()
})

chatOptionsButton.addEventListener("click", ()=>{
    if(isGroup){
        if(!document.querySelector('.user_settings')){
            if (isGroupAdmin){
                adminGroupSettings.classList.add('user_settings')
                groupSettings.classList.remove('user_settings')
            }
            else{
                adminGroupSettings.classList.remove('user_settings')
                groupSettings.classList.add('user_settings')
            }
        }else{
            adminGroupSettings.classList.remove('user_settings')
            groupSettings.classList.remove('user_settings') 
        }
    }


})


imgBtnInput.addEventListener("click", ()=> {
    if (msgImageInput) {
        msgImageInput.click();
    } else {
        console.error("Помилка: imageInput не знайдено!");
    }
})


goBackBtn.addEventListener("click" , ()=> {
    
    grouptFirst.classList.remove('disable')
    grouptSecond.classList.add("disable")
})

closeBtn.addEventListener("click" , ()=> {
    addGropPopUp.classList.add('disable')
    grouptFirst.classList.remove('disable')
    grouptSecond.classList.add("disable")
})

createGroupBtn.addEventListener("click" , ()=> {
    addGropPopUp.classList.remove('disable')
})

groupClosebtn.addEventListener("click" , ()=> {
    addGropPopUp.classList.add('disable')
    grouptFirst.classList.remove('disable')
    grouptSecond.classList.add("disable")
})

function updateEditMembersCount() {
    // Рахуємо тільки ті чекбокси, які зараз відмічені
    const checkedCount = document.querySelectorAll(".edit_friend_checkbox:checked").length;
    editMembersCountText.innerHTML = `Вибрано: ${checkedCount}`;
}


//------------------------------------------------------------------------------------------------------------------------------------------------


function initPaginationObserver() {
    if (observer) {
        observer.disconnect();
    }

    observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting && chatId) {
            const currentScrollHeight = messages.scrollHeight;
            const currentChatId = chatId; // Фіксуємо поточний ID перед запитом
            
            pageNumber++; 
            
            const hasMore = await loadMessages(chatId);
            
            // Якщо користувач уже змінив чат, поки йшов fetch — ігноруємо результат
            if (chatId !== currentChatId) return;

            if (hasMore) {
                createDateMessage();
                // ВИПРАВЛЕНО: додаємо різницю висоти до поточного скролу
                messages.scrollTop += (messages.scrollHeight - currentScrollHeight);
            } else {
                observer.disconnect();
            }
        }
    }, {
        root: messages, 
        threshold: 0.1
    });

    if (loadLine) {
        observer.observe(loadLine);
    }
}



//---------------------------------------------------------CREATE GROUP------------------------------------------------------------------------
const selectedMembers = document.querySelectorAll(".search_single_contact input[type='checkbox']")
const membersCountText = document.querySelector(".group_first p")

let membersCount = 0
let membersData = []

selectedMembers.forEach(member => {
    member.addEventListener("change", (event) => {
        const contactCard = member.closest('.search_single_contact')
        const userName = contactCard.querySelector('h3').textContent.trim()
        const userId = contactCard.dataset.id

        if (event.target.checked) {
            membersCount += 1
            membersData.push({
                'user_name': userName,
                'user_id': userId
            })
            console.log(membersData)
        } else {
            membersCount -= 1
            membersData = membersData.filter(item => item.user_id !== userId)
        }
        
        membersCountText.innerHTML = `Вибрано: ${membersCount}`
    });
});

const continueBtn = document.querySelector("#continue_button")
const groupMembers = document.querySelector(".selected_members")

continueBtn.addEventListener("click", () => {
    grouptFirst.classList.add('disable')
    grouptSecond.classList.remove("disable")
    errorMsg.innerHTML = ''
    groupMembers.innerHTML = ""
    membersData.forEach(member => {
        groupMembers.innerHTML += `
        <div class='selected_single_contact'>
            <button class = 'remove_selected_user' id = '${member.user_id}' type="button"><img src='/static/images/bin_icon.png'></button>
            <div class='single_contact'>
                <img src='/static/images/avatar_test.png'>
                <h3>${member.user_name}</h3>
            </div>
        </div>`
    })

    const removeSelectedButtons = document.querySelectorAll('.remove_selected_user')
    removeSelectedButtons.forEach(button => {
        button.addEventListener('click', () => {
            const parent = button.parentElement
            parent.remove()
            membersData = membersData.filter(item => item.user_id !== button.id)
        })
    })

})





const groupSection = document.querySelector(".members") 

createGroup.addEventListener('click', async () => {
    
    errorMsg.innerHTML = ''
    // 2. Перевірка: якщо учасників менше 2, зупиняємо процес
    if (membersData.length < 2) {
        errorMsg.style.color = "red"
        errorMsg.textContent = "Додайте мінімум 2 учасника"
        return
    }


    const data = {
        'name': groupName.value,
        'friends': []
    }
    
    membersData.forEach(selectedUser => {
        data.friends.push(selectedUser.user_id)
    })

    const response = await fetch(
        '/chat/create/group/',
        {
            headers: {
                'X-CSRFToken' : csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            method: 'POST',
            body: JSON.stringify(data)
        }
    )
    const responseData = await response.json()
    addGropPopUp.style.display = 'none'

    const newChat = document.createElement("button")
    newChat.dataset.id = responseData.chat_id
    newChat.classList.add("created_chat")
    newChat.classList.add("created_group")
    newChat.innerHTML = `
    <img src = "${senderAvatar}">
    <span class = 'group_message'>
    <h3>${responseData.name}</h3>
    <h4 class="latest_message">                            
        Повідомлень нема
        </h4>
    </span>
    <h5 class="message_date format-chat-date"></h5>
    `
    groupChats.appendChild(newChat)

    getChats()
    
    openChat(responseData.chat_id)
    newChat.addEventListener("click", ()=>{
        openChat(responseData.chat_id)
    })
})

//--------------------------------------------------------------------------------------------------------------------------






//--------------------------------------------------------USERS ONLINE------------------------------------------------
function updateGroupUsers(id, status){
    if (listGroupUsers != null){
        if (listGroupUsers.includes(id)){
            if (status == false && listOnlineGroupUsers.includes(id)){
                listOnlineGroupUsers.splice(listOnlineGroupUsers.indexOf(id), 1)
            }
            else if (!listOnlineGroupUsers.includes(id)){
                listOnlineGroupUsers.push(id)
            }
            groupHeader.textContent = `${listGroupUsers.length} учасники, ${listOnlineGroupUsers.length} в мережі`
        } 
    }
}

async function getGroupUsers(id){
    const groupHeader = document.querySelector("#groupHeader")
    groupHeader.innerHTML = ''
    
    listOnlineGroupUsers = null
    listGroupUsers = null
    
    const response = await fetch(`/chat/${id}/getGroupUsers/`)
    const data = await response.json()
    if (data.success){
        listGroupUsers = data.users_id
        listOnlineGroupUsers = data.online_users_id
        isGroup = true
        if(data.group_admin == data.current_user){
            isGroupAdmin= true
        }else{
            isGroupAdmin = false
        }
        groupHeader.innerHTML = `
            ${data.users_id.length} учасники, ${data.online_users_id.length} в мережі
        `
    }else{
        isGroup = false
    }
}


//-----------------------------------------------------------------------------------------------------------------------------





//------------------------------------------------MANAGE MESSAGES--------------------------------------------------------------

async function loadMessages(chatIdToLoad){
    const response = await fetch(
        `/chat/${chatIdToLoad}/getMessages/?page=${pageNumber}`,
        {headers: {'X-Requested-With': 'XMLHttpRequest'}}
    )
    const data = await response.json()

    if (chatIdToLoad !== chatId) return false; 
    
    if (data.success && data.messages.length > 0){
        if (pageNumber === 1) {
            const latestMessage = data.messages[0];
            getLastMessage(chatIdToLoad, latestMessage.text, latestMessage.datetime, latestMessage.message_id);
            
        }

        data.messages.forEach((message)=>{
            createMessage(
                message.sender_pseudonym, 
                message.sender_id, 
                message.text, 
                message.datetime, 
                false, 
                message.current_user,
                message.date,
                message.images,
            );
        });
        return true; 
    }
    return false; 
}

function createMessage(sender_pseudonym, sender_id, text, dateTime, isNew = true, current_user, date, images){
    const dateObj = new Date(dateTime);
    
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    const newMessage = document.createElement('div')
    newMessage.classList.add('message')

    
    // 1. Формуємо скелет повідомлення залежно від відправника
    if (String(sender_id) === String(current_user)){
        newMessage.classList.add('current_user_message')
        newMessage.innerHTML = `
        <div class="message_div">
            <div class="message_content">
                ${text && text.trim().length > 0 ? `<h3>${text}</h3>` : ''}
            </div>
            <div class ="message_info">
                <h6>${formattedTime}</h6>
                <img class = "message_status" src = "${messageStatus}">
            </div>
        </div> `
    } else {
        newMessage.innerHTML = `
        <img class = "sender" src = "${senderAvatar}">
        <div class="message_div">
            <div class="message_content">
                <h4>${sender_pseudonym}</h4>
                ${text && text.trim().length > 0 ? `<h3>${text}</h3>` : ''}   
            </div>
            <div class ="message_info">
                <h6>${formattedTime}</h6> 
                <img class = "message_status" src = "${messageStatus}">
            </div>
        </div>`
    }


    if (images && images.length > 0){
        const imagesContainer = document.createElement("div")
        imagesContainer.classList.add("message_images_container")

        images.forEach(imageUrl =>{
            const newImage = document.createElement("img") 
            newImage.src = imageUrl
            newImage.classList.add("chat_attached_image") 
            
            // КРИТИЧНО: Перераховуємо скрол, коли файл картинки фізично завантажився
            newImage.addEventListener('load', scrollOnImageLoad);
            
            imagesContainer.append(newImage)
        })

        newMessage.querySelector('.message_content').appendChild(imagesContainer)
    }
    newMessage.dataset.date = date
    if(isNew){
        messages.appendChild(newMessage)
        scrollToBottom(true)
    } else {
        loadLine.insertAdjacentElement('afterend', newMessage)
    }
}




function getLastMessage(chat_id, messageText, messageDate, messageId) {
    const chatBtn = document.querySelector(`.created_chat[data-id="${chat_id}"]`)
    
    if (!messageText || !messageText.trim().length > 0){
        messageText = 'Фото'
    }
        


    if (chatBtn) {
        const textElement = chatBtn.querySelector('.latest_message')
        if (textElement) {
            textElement.textContent = messageText
        }

        const dateElement = chatBtn.querySelector('.message_date')
        if (dateElement && messageDate) {
            dateElement.textContent = formatChatBadgeDate(messageDate)
            dateElement.dataset.rawDate = messageDate;
        }
    }
    
}



function renderCountUnreadedMessages(){
    let globalCount = 0; // Оголошуємо один раз ПОЗА циклом, щоб сумувати і чати, і групи

    for (const containerName of ["chat_messages", "group_messages"]){
        const unreadeds = document.querySelectorAll(`.${containerName} .unread`);
        let localCount = 0; // Лічильник суто для поточного контейнера

        unreadeds.forEach(unreaded => {
            const count = Number(unreaded.textContent);
            localCount += count;
            globalCount += count; // Додаємо до загальної суми для хедера
        });

        // Оновлюємо індикатор конкретного списку (особисті або групи)
        const mainIndicator = document.querySelector(`.${containerName} .main_indicator`);
        if (mainIndicator) {
            if (localCount > 0){
                mainIndicator.style.display = 'grid';
                mainIndicator.textContent = localCount;
                mainIndicator.classList.add("main_unread");
            } else {
                mainIndicator.style.display = 'none';
            }
        }
    }

    // ОНОВЛЕННЯ ХЕДЕРА: Робиться один раз, коли цикл повністю завершився
    const headerIndicator = document.querySelector('.page_buttons .main_unread');
    if (headerIndicator) {
        if (globalCount > 0) {
            headerIndicator.style.display = 'grid';
            headerIndicator.textContent = globalCount;
        } else {
            headerIndicator.style.display = 'none';
        }
    }
}
renderCountUnreadedMessages()
//------------------------------------------------------------------------------------------------------------------------------


//----------------------------------------------------EDIT GROUP-----------------------------------------------------------------
let editMembersData = []
const editMembersCountText = document.querySelector(".edit_group_second p")

const editGroupPopUp = document.querySelector("#edit_group_pop-up")
const editGroupFirst = document.querySelector(".edit_group_first")
const editGroupSecond = document.querySelector(".edit_group_second")
function openEditGroupModal() {
    if (!chatId || !isGroupAdmin) return

    editMembersData = []

    const currentChatBtn = document.querySelector(`.created_chat[data-id="${chatId}"]`)
    const currentName = currentChatBtn ? currentChatBtn.querySelector('h3').textContent.trim() : ""
    document.querySelector("#edit_group_name").value = currentName
    const allFriendCards = document.querySelectorAll(".single_contact")
    
    allFriendCards.forEach(card => {
        const uId = String(card.dataset.id);

        if (listGroupUsers && listGroupUsers.map(String).includes(uId) && uId !== String(currentUserId)) {
            editMembersData.push({
                'user_id': uId,
                'user_name': card.querySelector('h3').textContent.trim()
            });
        }
    });

    renderEditMembersList()

    editGroupPopUp.classList.remove("disable")
    editGroupFirst.classList.remove("disable")
    editGroupSecond.classList.add("disable")
}

function renderEditMembersList() {
    const container = document.querySelector(".edit_selected_members")
    container.innerHTML = ""

    editMembersData.forEach(member => {
        container.innerHTML += `
        <div class='selected_single_contact' data-id="${member.user_id}">
            <button class='remove_edit_user' type="button">
                <img src='/static/images/bin_icon.png'>
            </button>
            <div class='single_contact'>
                <img src='/static/images/avatar_test.png'>
                <h3>${member.user_name}</h3>
            </div>
        </div>`
    })

    container.querySelectorAll('.remove_edit_user').forEach(button => {
        button.addEventListener('click', () => {
            const parent = button.closest('.selected_single_contact');
            const uId = parent.dataset.id
            editMembersData = editMembersData.filter(item => item.user_id !== uId)
            parent.remove()
        })
    })
}
const addMembersBtn = document.querySelector(".add_members_to_group")
    addMembersBtn.addEventListener("click", () => {
    editGroupFirst.classList.add("disable")
    editGroupSecond.classList.remove("disable")
    const checkboxes = document.querySelectorAll(".edit_friend_checkbox")
    
    checkboxes.forEach(cb => {
        const card = cb.closest('.search_single_contact');
        const uId = String(card.dataset.id).trim(); // Захист від пробілів
        
        cb.checked = editMembersData.some(item => String(item.user_id).trim() === uId)

        // Вішаємо слухач подій (якщо ще не повішений), щоб лічильник реагував на кліки
        cb.removeEventListener("change", updateEditMembersCount); // Запобігає дублюванню подій
        cb.addEventListener("change", updateEditMembersCount);
    });

    // Оновлюємо кількість одразу при переході на вікно
    updateEditMembersCount();
});


document.querySelector("#edit_window_second_save").addEventListener("click", () => {
    editMembersData = [];
    
    const checkboxes = document.querySelectorAll(".edit_friend_checkbox");
    checkboxes.forEach(cb => {
        if (cb.checked) {
            const card = cb.closest('.search_single_contact');
            editMembersData.push({
                'user_id': String(card.dataset.id).trim(),
                'user_name': card.querySelector('h3').textContent.trim()
            });
        }
    });

    renderEditMembersList();
    editGroupSecond.classList.add("disable");
    editGroupFirst.classList.remove("disable");
});

const EditGroupCancelBtn = document.querySelector("#edit_window_second_cancel")
EditGroupCancelBtn.addEventListener("click", () => {
    editGroupSecond.classList.add("disable")
    editGroupFirst.classList.remove("disable")
})
document.querySelector("#edit_group_final_submit").addEventListener("click", async () => {
    const errorBlock = document.querySelector('.edit_group_error_msg')
    errorBlock.innerHTML = ''

    if (editMembersData.length < 2) {
        errorBlock.style.color = "red"
        errorBlock.textContent = "Додайте мінімум 2 учасника"
        return;
    }

    const payload = {
        'chat_id': chatId, 
        'name': document.querySelector("#edit_group_name").value,
        'friends': editMembersData.map(item => item.user_id)
    };

    const response = await fetch('/chat/group/edit/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (responseData.success) {
        document.querySelector("#edit_group_pop-up").classList.add("disable")
        const chatBtn = document.querySelector(`.created_chat[data-id="${responseData.chat_id}"]`);
        if (chatBtn) {
            chatBtn.querySelector('h3').textContent = responseData.name;
        }
        

        document.querySelector(".chat_name h1").textContent = responseData.name;
        
        getGroupUsers(chatId);
    } else {
        errorBlock.style.color = "red";
        errorBlock.textContent = responseData.error || "Помилка при збереженні";
    }
})
document.querySelector("#edit_group_cancel").addEventListener("click", () => {
    document.querySelector("#edit_group_pop-up").classList.add("disable");
})

//-------------------------------------------------------------------------------------------------------------------------------


//----------------------------------------------------OPEN CHAT-----------------------------------------------------------------
async function openChat(id) {
    // 1. ЗАХИСТ ВІД ДУБЛЮВАННЯ СОКЕТІВ (Робимо негайно на початку)
    if (chatSocket) {
        chatSocket.close();
        chatSocket = null;
    }

    if (observer) {
        observer.disconnect();
        observer = null;
    }

    chatId = id; // Фіксуємо поточний ID чату
    pageNumber = 1;

    // 2. ІНІЦІАЛІЗАЦІЯ ВЕБ-СОКЕТА НА ПОЧАТКУ
    let url = `ws://${window.location.host}/chat/${chatId}`;
    chatSocket = new WebSocket(url);
    
    chatSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.message) {
            const currentLocalDate = new Date().toISOString().split('T')[0];
            createMessage(
                data.message.sender_pseudonym, 
                data.message.sender_id, 
                data.message.text, 
                data.message.datetime, 
                true,
                currentUserId,
                currentLocalDate,
                data.message.images,
            );
            getLastMessage(chatId, data.message.text, data.message.datetime, data.message.message_id);
            renderCountUnreadedMessages();
            createDateMessage(); 
            scrollToBottom(true);
        }
    };

    // 3. ВІЗУАЛЬНЕ ОЧИЩЕННЯ
    chatName.innerHTML = "";
    chatBtns.forEach(chatBtn => {
        if(chatBtn.getAttribute('data-id') == id){
            chatBtns.forEach(notBtn => notBtn.classList.remove('selected_contact'));
            chatBtn.classList.add('selected_contact');
        }
    });
    
    const selectedContact = document.querySelector('.selected_contact');
    const selectedContactName = selectedContact ? selectedContact.querySelector('h3').textContent : "Чат";
    
    notSelectContainer.style.display = "none";
    chat.style.display = "flex";
    chatName.innerHTML = `<h1>${selectedContactName}</h1><h3 id='groupHeader'></h3>`;

    messages.querySelectorAll(".message").forEach((msg) => msg.remove());
    messages.querySelectorAll(".message-date").forEach((date) => date.remove());

    // 4. ЗАВАНТАЖЕННЯ ДАНИХ (Асинхронні виклики зміщені вниз)
    await loadMessages(chatId); 

    // Перевірка: якщо поки йшов запит, користувач вже тицьнув на інший чат — зупиняємось
    if (chatId !== id) return;

    getGroupUsers(id);
    createDateMessage(); 
    
    adminGroupSettings.classList.remove('user_settings');
    groupSettings.classList.remove('user_settings');

    setTimeout(() => {
        if (chatId !== id) return; 
        scrollToBottom(false);
        initPaginationObserver(); // Обсервер вмикаємо строго ПІСЛЯ завантаження історії
    }, 50);

    const indicators = document.querySelectorAll(".indicator");
    indicators.forEach(indicator => {
        if(indicator.dataset.id == chatId){
            indicator.classList.remove("unread");
        }
    });

    renderCountUnreadedMessages();
}

chatBtns.forEach(btn => {
    btn.addEventListener('click', ()=>{
        const chatId = btn.getAttribute('data-id') 
        if (chatId) {
            // chatBtns.forEach(notBtn => {
                //     notBtn.classList.remove('selected_contact')
                // }) 
                // btn.classList.add('selected_contact')
                openChat(chatId)
            } else {
                console.error("Помилка: data-id відсутній у кнопки чату", btn)
            }
        })
    })
    
//------------------------------------------------------------------------------------------------------------------------------



//------------------------------------------------------------SEND MESSAGE--------------------------------------------------------
const sendMsg = document.querySelector("#send-msg");
const msgInput = document.querySelector("#msg-input");

// Функція для безпечної відправки даних у сокет
function safeSocketSend(payload) {
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
        chatSocket.send(JSON.stringify(payload));
        return true;
    } else if (chatSocket && chatSocket.readyState === WebSocket.CONNECTING) {
        console.warn("Попередження: Сокет у стані підключення. Зачекайте секунду...");
        alert("З'єднання з чатом ще встановлюється. Спробуйте знову через мить.");
    } else {
        console.error("Помилка: WebSocket закритий або не існує. Стан:", chatSocket ? chatSocket.readyState : "null");
        alert("Помилка з'єднання. Спробуйте перезавантажити сторінку або перевідкрити чат.");
    }
    return false;
}

// Функція збору даних форми та відправки
async function handleMessageSubmit() {
    const text = msgInput.value.trim();
    const files = typeof msgImageInput !== 'undefined' ? msgImageInput.files : [];

    if (text === "" && (!files || files.length === 0)) return;

    let base64Images = [];

    if (files && files.length > 0) {
        const filePromises = Array.from(files).map(async (file) => {
            const base64Str = await fileToBase64(file);
            return {
                name: file.name,
                data: base64Str
            };
        });
        base64Images = await Promise.all(filePromises);
    }

    // Намагаємось надіслати через безпечну функцію
    const isSent = safeSocketSend({
        "msg": text,
        "images": base64Images
    });

    if (isSent) {
        // Очищаємо поля лише якщо сокет успішно прийняв дані
        msgInput.value = '';
        if (typeof msgImageInput !== 'undefined') msgImageInput.value = null;
    }
}

// 1. Обробка натискання Enter (тепер викликає спільну логіку з картинками)
msgInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleMessageSubmit();
    }
});

// 2. Обробка кліку на кнопку відправки
sendMsg.addEventListener("click", async () => {
    await handleMessageSubmit();
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// 3. Створення чатів при кліку на друзів
friendDivs.forEach(div => {
    div.addEventListener('click', async () => {
        try {
            const response = await fetch('/chat/create/', {
                method: "POST",
                headers: {
                    'X-CSRFToken': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    friend_id: div.dataset.id
                })
            });
            
            const data = await response.json();
            
            if (data.is_new) {
                console.log("Створено новий чат:", data);
                const newChat = document.createElement("button");
                newChat.dataset.id = data.chat_id;
                newChat.classList.add("created_chat");
                newChat.innerHTML = `
                    <img src="${senderAvatar}">
                    <span class='friend_message'>
                        <h3>${data.friend_pseudonym}</h3>
                        <h4 class="latest_message">Повідомлень нема</h4>
                    </span>
                    <h5 class="message_date format-chat-date"></h5>
                `;
                document.querySelector('.last_chat_messages').append(newChat);
                getChats();
                
                newChat.addEventListener('click', () => {
                    openChat(data.chat_id);
                });
            }
            
            // Відкриваємо чат (тут створюється websocket з'єднання всередині openChat)
            openChat(data.chat_id);
            
        } catch (err) {
            console.error("Помилка створення/відкриття чату:", err);
        }
    });
});
//-----------------------------------------------------------------------------------------------------------------------------------------




//-----------------------------------------------------------------FORMAT MESSAGE---------------------------------------------------------

function createDateMessage(){
    // ВИПРАВЛЕНО: шукаємо елементи виключно всередині блоку messages
    const messageDates = messages.querySelectorAll('.message-date')
    messageDates.forEach(date => date.remove())
    
    const messageList = messages.querySelectorAll('.message')
    let previousMessageDate = null
    const todayStr = new Date().toISOString().split('T')[0];
    
    const dateFormatter = new Intl.DateTimeFormat('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    messageList.forEach(message => {
        const msgDate = message.dataset.date;
        
        if (msgDate && msgDate !== previousMessageDate) {
            const dateTitle = document.createElement('h2')
            dateTitle.classList.add('message-date')
            
            if (msgDate === todayStr) {
                dateTitle.textContent = "Сьогодні"
            } else {
                const dateObj = new Date(msgDate);
                dateTitle.textContent = dateFormatter.format(dateObj).replace(/\s?р\.?$/, '');
            }
            
            messages.insertBefore(dateTitle, message)
        }
        previousMessageDate = msgDate
    })
}


function formatChatBadgeDate(isoString) {
    if (!isoString) return "";
    
    const dateObj = new Date(isoString);
    const now = new Date();
    
    const isToday = dateObj.getDate() === now.getDate() &&
                    dateObj.getMonth() === now.getMonth() &&
                    dateObj.getFullYear() === now.getFullYear()
                    
    if (isToday) {
        const hours = String(dateObj.getHours()).padStart(2, '0')
        const minutes = String(dateObj.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
    } else {
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0')
        const year = dateObj.getFullYear()
        return `${day}.${month}.${year}`
    }
}

document.querySelectorAll('.format-chat-date').forEach(el => {
    const rawDate = el.dataset.rawDate
    el.textContent = formatChatBadgeDate(rawDate)
})



function scrollToBottom(smooth = false) {
    if (smooth) {
        messages.scrollTo({
            top: messages.scrollHeight,
            behavior: 'smooth'
        });
    } else {
        messages.scrollTop = messages.scrollHeight;
    }
}

// Коригування скролу під час динамічного завантаження картинок
function scrollOnImageLoad() {
    const threshold = 200; // зона чутливості в пікселях
    const isNearBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight < threshold;
    if (isNearBottom) {
        messages.scrollTop = messages.scrollHeight;
    }
}


//-------------------------------------------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const openChatId = urlParams.get('open_id');

    if (openChatId) {
        // ЗАХИСТ 1: Перетворюємо ID на число, якщо твій бекенд/JS працює з інтами
        // Якщо твої ID — це UUID (рядки), залиш просто openChatId
        const parsedId = isNaN(openChatId) ? openChatId : Number(openChatId);

        // ЗАХИСТ 2: Даємо крихітну затримку (таймаут), щоб твої масиви типу chatBtns 
        // та інші глобальні змінні сторінки точно встигли наповнитися елементами
        setTimeout(() => {
            console.log("Спроба автоматично відкрити чат з ID:", parsedId);
            
            // Перевіряємо, чи взагалі існує кнопка такого чату на сторінці
            const targetBtn = document.querySelector(`[data-id="${parsedId}"]`);
            
            if (targetBtn) {
                openChat(parsedId);
            } else {
                console.warn(`Чат з ID ${parsedId} не знайдено серед доступних кнопок чату.`);
            }

            // Очищаємо URL від параметра, щоб не смикати чат при F5
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        }, 100); // 100 мілісекунд затримки зазвичай достатньо
    }
});
