{
const csrfToken = document.querySelector("meta[name='csrfToken']").content

async function hendleFriendAction(button) {
    const url = button.dataset.url; 
    const response = await fetch(url, {
        method: 'POST', 
        headers : {
            'X-CSRFToken' : csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'action': button.dataset.action 
        })
    })
    
    const data = await response.json()
    console.log("Відповідь сервера:", data);

    let userCard = button.closest('.user') || button.closest('.card') || button.parentElement.parentElement;

    if (data.remove || data.text === 'Запит не знайдено або вже прийнято') {

        if (window.location.pathname.includes('friend_page')) {
            console.log("Дія у профілі друга: оновлюємо стан кнопки");
            button.textContent = "У друзях";
            button.disabled = true;
            button.className = "style_button accepted_friend_button";
        } else {
            if (userCard) {
                userCard.remove();
                console.log("Картку успішно видалено з поточного списку");
            } else {
                button.textContent = "Виконано";
                button.disabled = true;
            }
        }
    }
    
    if (data.text) {
        if (userCard && userCard.parentNode) {
            userCard.innerHTML += `<p>${data.text}</p>`
        } else {
            button.insertAdjacentHTML('afterend', `<span class="action-status">${data.text}</span>`)
            button.remove()
        }
    }
    
    if (data.friend_html) {
        // Шукаємо блок друзів (він працює на головній сторінці)
        const cardFriends = document.getElementById('card-friends')
        if (cardFriends) {
            const emptyText = cardFriends.querySelector('.no-users-text')
            if (emptyText) emptyText.remove()

            if (cardFriends.querySelectorAll('.user, .card').length < 6) {
                cardFriends.insertAdjacentHTML('beforeend', data.friend_html)
            }
        }
    }
}

document.addEventListener('click', async function(event) {
    const button = event.target.closest('.friend-action-btn');
    
    if (button) {
        event.preventDefault();
        await hendleFriendAction(button);
    }
});

}