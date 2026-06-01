const chatBtns = document.querySelectorAll(".created_chat")
const chat = document.querySelector("#chat")
const notSelectContainer = document.querySelector("#not-select")
let chatSocket;
const friendDivs = document.querySelectorAll(".single_contact")
const csrfToken = document.querySelector("meta[name='csrfToken']").content
const messages = document.querySelector('#messages')
const loadLine = document.querySelector("#load-message-line")
let pageNumber = 1


const createGroupBtn = document.querySelector(".add_group_button")
const addGropPopUp = document.querySelector("#add_group_pop-up")
const groupClosebtn = document.querySelector("#create_group_close")
const grouptFirst = document.querySelector(".group_first")
const grouptSecond = document.querySelector(".group_second")
const closeBtn= document.querySelector("#close_form")
const goBackBtn = document.querySelector("#go_back")

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

        if (event.target.checked) {
            membersCount += 1
            membersData.push(userName)
        } else {
            membersCount -= 1
            membersData = membersData.filter(item => item !== userName)
        }
        
        membersCountText.innerHTML = `Вибрано: ${membersCount}`
    });
});

const continueBtn = document.querySelector("#continue_button")
const groupMembers = document.querySelector(".selected_members")

continueBtn.addEventListener("click", () => {
    grouptFirst.classList.add('disable')
    grouptSecond.classList.remove("disable")
    
    groupMembers.innerHTML = ""
    membersData.forEach(name => {
        groupMembers.innerHTML += `
        <div class='search_single_contact'>
            <button type="button">#</button>
            <div class='single_contact'>
                <img src='/static/images/avatar_test.png'>
                <h3>${name}</h3>
            </div>
        </div>`
    })
})




async function loadMessages(chatId){
    const response = await fetch(
        `/chat/${chatId}/getMessages/?page=${pageNumber}`,
        {headers: {'X-Requested-With': 'XMLHttpRequest'}}
    )
    const data = await response.json()
    console.log(data);
    
    if (data.success){
        data.messages.forEach((message)=>{
            createMessage(message.sender, message.text, message.datetime, false, current_user = message.current_user)
        })
    }
}

function createMessage(sender, text, dateTime, isNew = true, current_user){
    const dateObj = new Date(dateTime);
    const formattedTime = dateObj.toLocaleTimeString([], {
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
    });

    const newMessage = document.createElement('div')
    newMessage.classList.add('message')
    const senderAvatar = document.querySelector(".sender_avatar").dataset.img
    const messageStatus = document.querySelector(".message_status_image").dataset.img
    if(sender === current_user){
        newMessage.classList.add('current_user_message')
        newMessage.innerHTML = `<div class="message_div">
        <div class="message_content">
            <h3>${text}</h3>   
        </div>
            <div class ="message_info">
                <h6>${formattedTime}</h6>
                <img class = "message_status" src = "${messageStatus}">
            </div>
        </div> `
    }else{
        newMessage.innerHTML = `
        <img class = "sender" src = "${senderAvatar}">
        <div class="message_div">
        <div class="message_content">
            <h4>${sender}</h4>
            <h3>${text}</h3>   
        </div>
            <div class ="message_info">
                <h6>${formattedTime}</h6> 
                <img class = "message_status" src = "${messageStatus}">
            </div>
        </div>`
    }
    
    if(isNew){
        messages.appendChild(newMessage)
    }
    else{
        messages.insertBefore(newMessage, loadLine.nextElementSibling)
    }
}

function openChat(chatId){
    notSelectContainer.style.display = "none"
    chat.style.display = "flex"
    messages.querySelectorAll(".message").forEach((msg) =>{
        msg.remove()
    })
    pageNumber = 1
    loadMessages(chatId)
    if (chatSocket){
        chatSocket.close()
    }
    let url = `ws://${window.location.host}/chat/${chatId}`;
    chatSocket = new WebSocket(url)
    chatSocket.onmessage = (event)=>{
        const data = JSON.parse(event.data)
        console.log(data.message);
        
        if (data.message){
            createMessage(data.message.sender, data.message.text, data.message.datetime)
        }
    }
}

chatBtns.forEach(btn => {
    btn.addEventListener('click', ()=>{
        const chatId = btn.getAttribute('data-id') 
        if (chatId) {
            chatBtns.forEach(notBtn => {
                notBtn.classList.remove('selected_contact')
            }) 
            btn.classList.add('selected_contact')
            openChat(chatId)
        } else {
            console.error("Помилка: data-id відсутній у кнопки чату", btn)
        }
    })
})

const sendMsg = document.querySelector("#send-msg")
const msgInput = document.querySelector("#msg-input")

sendMsg.addEventListener("click", ()=>{
    chatSocket.send(
        JSON.stringify({
            "msg": msgInput.value
        })
    )
    msgInput.value = ''
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
            const newChat = document.createElement('div')
            newChat.classList.add('chat')
            newChat.innerHTML = `<h3>${data.friend_pseudonym}</h3>`
            newChat.dataset.id = data.chat_id
            newChat.addEventListener('click', ()=>{
                openChat(data.chat_id)
            })
            document.querySelector('#indiv-chats').append(newChat)
        }
        openChat(data.chat_id)
    })
})
