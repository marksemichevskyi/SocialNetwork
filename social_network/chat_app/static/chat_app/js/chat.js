const chatBtns = document.querySelectorAll(".created_chat")
const chat = document.querySelector("#chat")
const notSelectContainer = document.querySelector("#not-select")
let chatSocket;

chatBtns.forEach(btn => {
    btn.addEventListener('click', ()=>{
        notSelectContainer.style.display = "none"
        chat.style.display = "flex"
        if (chatSocket){
            chatSocket.close()
        }
        let chatId = btn.dataset.id
        let url = `ws://${window.location.host}/chat/${chatId}/`;
        chatSocket = new WebSocket(url)
        chatSocket.onmessage = (event)=>{
            const data = JSON.parse(event.data)
            console.log(data);
            
        }
    })
})

const sendMsg = document.querySelector("#send-msg")
const msgInput = document.querySelector("#msg-input")

sendMsg.addEventListener("click", ()=>{
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
        chatSocket.send(
            JSON.stringify({
                "msg": msgInput.value
            })
        )
        msgInput.value = ''
    } else {
        console.error("З'єднання WebSocket ще не встановлено або закрите.");
    }
})

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


