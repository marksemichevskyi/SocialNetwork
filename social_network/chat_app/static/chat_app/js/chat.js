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

let listOnlineGroupUsers = null
let listGroupUsers = null

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

const input = document.querySelector("#message-files")
const imgBtnInput = document.querySelector("#add_image_btn")

const senderAvatar = document.querySelector(".sender_avatar").dataset.img
const messageStatus = document.querySelector(".message_status_image").dataset.img

const errorMsg = document.querySelector('.group_error_msg') 


imgBtnInput.addEventListener("click", ()=> {
    if (input) {
        input.click();
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

        groupHeader.innerHTML = `
            ${data.users_id.length} учасники, ${data.online_users_id.length} в мережі
        `
    }
}






async function loadMessages(chatId){
    const response = await fetch(
        `/chat/${chatId}/getMessages/?page=${pageNumber}`,
        {headers: {'X-Requested-With': 'XMLHttpRequest'}}
    )
    const data = await response.json()
    console.log("Дані з бекенду:", data.messages)
    if (data.success && data.messages.length > 0){
        const latestMessage = data.messages[0];
        getLastMessage(chatId, latestMessage.text, latestMessage.datetime, latestMessage.message_id);

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
    }
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

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
async function openChat(id) { // 1. Додали async сюди

    chatName.innerHTML = ""
    chatBtns.forEach(chatBtn => {
        if(chatBtn.getAttribute('data-id') == id){
            chatBtns.forEach(notBtn => {
                notBtn.classList.remove('selected_contact')
            }) 
            chatBtn.classList.add('selected_contact')
        }
    });
    
    const selectedContact = document.querySelector('.selected_contact')
    const selectedContactName = selectedContact.querySelector('h3').textContent
    
    notSelectContainer.style.display = "none"
    chat.style.display = "flex"
    chatName.innerHTML = `
        <h1>${selectedContactName}</h1>
        <h3 id = 'groupHeader'></h3>`

    messages.querySelectorAll(".message").forEach((msg) => {
        msg.remove()
    })

    messages.querySelectorAll(".message-date").forEach((date) => {
        date.remove()
    })

    pageNumber = 1
    chatId = id

    await loadMessages(chatId) 

    getGroupUsers(id)

    createDateMessage() 

    if (chatSocket){
        chatSocket.close()
    }
    
    let url = `ws://${window.location.host}/chat/${chatId}`;
    chatSocket = new WebSocket(url)
    
    chatSocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
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
            )
            
            getLastMessage(chatId, data.message.text, data.message.datetime, data.message.message_id)
            createDateMessage() 
            scrollToBottom(true)
        }
    }  
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

const sendMsg = document.querySelector("#send-msg")
const msgInput = document.querySelector("#msg-input")



msgInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault()

        chatSocket.send(
            JSON.stringify({
                msg: msgInput.value
            })
        );

        msgInput.value = ''
    }
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
    });
}

sendMsg.addEventListener("click", async () => {
    const text = msgInput.value.trim()
    const files = msgImageInput.files

    if (text === "" && files.length === 0) return

    let base64Images = []

    if (files.length > 0) {
        const filePromises = Array.from(files).map(async (file) => {
            const base64Str = await fileToBase64(file)
            return {
                name: file.name,
                data: base64Str
            }
        })
        base64Images = await Promise.all(filePromises)
    }

    chatSocket.send(
        JSON.stringify({
            "msg": text,
            "images": base64Images
        })
    )

    msgInput.value = ''
    msgImageInput.value = ''
})

friendDivs.forEach(div => {
    div.addEventListener('click', async ()=>{
        const response = await fetch('/chat/create/', {
            method: "POST",
            headers: {
                'X-CSRFToken' : csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            }, 
            body: JSON.stringify({
                friend_id: div.dataset.id
            })
        })
        const data = await response.json()
        if (data.is_new){
            console.log(data)
            const newChat = document.createElement("button")
            newChat.dataset.id = data.chat_id
            newChat.classList.add("created_chat")
            newChat.innerHTML = `
                <img src = "${senderAvatar}">
                <span class = 'friend_message'>
                <h3>${data.friend_pseudonym}</h3>
                <h4 class="latest_message">                            
                    Повідомлень нема
                    </h4>
                </span>
                <h5 class="message_date format-chat-date"></h5>
                `
            newChat.dataset.id = data.chat_id
            document.querySelector('.last_chat_messages').append(newChat)
            getChats()
            newChat.addEventListener('click', ()=>{
                openChat(data.chat_id)
            })
        }
        openChat(data.chat_id)
    })
})

function createDateMessage(){
    const messageDates = document.querySelectorAll('.message-date')
    messageDates.forEach(date => date.remove())
    
    const messageList = document.querySelectorAll('.message')
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
    const allMessages = messages.querySelectorAll('.message')
    if (allMessages.length > 0) {
        const lastMessage = allMessages[allMessages.length - 1]
        lastMessage.scrollIntoView({ 
            behavior: smooth ? 'smooth' : 'auto', 
            block: 'end' 
        })
    }
}




// Переконайтеся, що цей селектор знаходить правильний контейнер
const groupSection = document.querySelector(".members") 

createGroup.addEventListener('click', async () => {
    
    errorMsg.innerHTML = ''
    // 2. Перевірка: якщо учасників менше 2, зупиняємо процес
    if (membersData.length < 2) {
        errorMsg.style.color = "red" // Опціонально для візуального акценту
        errorMsg.textContent = "Додайте мінімум 2 учасника"
        return // Зупиняємо виконання функції, fetch-запит не відправлятиметься
    }

    // 3. Якщо перевірка пройдена — відправляємо дані на бекенд
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