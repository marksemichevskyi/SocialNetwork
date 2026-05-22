const csrfToken = document.querySelector("meta[name='csrfToken']").content

async function hendleFriendAction(button) {
    const response = await fetch(button.dataset.url, {
        method: 'POST', 
        headers : {
            'X-CSRFToken' : csrfToken,
            'X-Requested-With': 'XMLHttpRequest'
        },
    })
    const data = await response.json()
    if(data.remove){
        button.closest('.user').remove()
    }
    if(data.text){
        button.closest('.user').innerHTML += `<p>${data.text}</p>`
    }
    if(data.friend_html){
        const cardFriends = document.getElementById('card-friends')
        if(cardFriends.querySelectorAll('.user').length < 6){
            cardFriends.insertAdjacentHTML('beforeend', data.friend_html)
            createActionButtonEvent()
        }
    }
}

function createActionButtonEvent(){
    const actionBtns = document.querySelectorAll('.friend-action-btn')
    actionBtns.forEach((actionBtn) => {
        if (actionBtn.dataset.hasEvent != "true") {
            actionBtn.dataset.hasEvent = "true"
            actionBtn.addEventListener('click', async function(){
                await hendleFriendAction(actionBtn)
            })
        }
    })
}  

createActionButtonEvent()