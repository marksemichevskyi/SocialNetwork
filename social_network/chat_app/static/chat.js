const chatBtns = document.querySelectorAll(".chat")
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