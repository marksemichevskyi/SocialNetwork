{
async function hendleFriendAction(button) {
    const metaTag = document.querySelector("meta[name='csrfToken']");
    const csrfToken = metaTag ? metaTag.content : '';

    if (!csrfToken) {
        console.error("CSRF-токен не знайдено на сторінці!");
    }

    const url = button.dataset.url; 
    const action = button.dataset.action; 
    
    const response = await fetch(url, {
        method: 'POST', 
        headers : {
            'X-CSRFToken' : csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'action': action 
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Помилка сервера (${response.status}):`, errorText);
        return;
    }
    
    const data = await response.json();

    let userCard = button.closest('.user') || button.closest('.card') || button.parentElement.parentElement;
    let buttonFrame = button.closest('.frame_buttons'); 

    if (data.remove || data.text === 'Запит не знайдено або вже прийнято') {
        if (window.location.pathname.includes('friend_page')) {
            if (action === 'accept') {
                button.textContent = "У друзях";
                button.className = "style_button accepted_friend_button";
            } 
            else if (action === 'delete' || action === 'ignore') {
                button.textContent = "Відхилено";
                button.className = "reject_button rejected_friend_button";
            }
            
            button.disabled = true;

            if (buttonFrame) {
                const siblingButtons = buttonFrame.querySelectorAll('.friend-action-btn');
                siblingButtons.forEach(sib => {
                    if (sib !== button) {
                        sib.remove();
                    }
                });
            }
        } 
        else {
            if (userCard) {
                userCard.remove(); 
            } else {
                button.textContent = "Виконано";
                button.disabled = true;
            }
        }
    }
    
    if (data.text) {
        if (!window.location.pathname.includes('friend_page')) {
            if (userCard && userCard.parentNode) {
                userCard.innerHTML += `<p>${data.text}</p>`;
            } else {
                button.insertAdjacentHTML('afterend', `<span class="action-status">${data.text}</span>`);
                button.remove();
            }
        }
    }
    
    if (data.friend_html) {
        const cardFriends = document.getElementById('card-friends');
        if (cardFriends) {
            const emptyText = cardFriends.querySelector('.no-users-text');
            if (emptyText) emptyText.remove();

            if (cardFriends.querySelectorAll('.user, .card').length < 6) {
                cardFriends.insertAdjacentHTML('beforeend', data.friend_html);
            }
        }
    }
}


document.addEventListener('click', async function(event) {
    const button = event.target.closest('.friend-action-btn');
    
    if (!button) return;

    const action = button.dataset.action;
    const isFriendPage = window.location.pathname.includes('friend_page');

    if ((action === 'add' || action === 'accept') && !isFriendPage) {
        const profileUrl = button.dataset.profileUrl;
        if (profileUrl) {
            window.location.href = profileUrl;
            return;
        } else {
            console.error("Атрибут data-profile-url не задано для кнопки!");
        }
    }

    event.preventDefault();
    await hendleFriendAction(button);
});
}
