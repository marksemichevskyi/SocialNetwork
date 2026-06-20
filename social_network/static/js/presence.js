
const url = `ws://${window.location.host}/presence/`
const presenceSocket = new WebSocket(url)

presenceSocket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    const userMarkers = document.querySelectorAll(".online_marker")

    if (data.type === 'get_online') {
        userMarkers.forEach(marker => {
            const userId = marker.dataset.id

            if (userId && data.online_users.includes(Number(userId))) {
                marker.classList.add('active_marker')
            } else {
                marker.classList.remove('active_marker')
            }
        })
    } 

    else if (data.type === 'presence_update') { 
        userMarkers.forEach(marker => {
            if (String(marker.dataset.id) === String(data.user_id)) {
                if (data.status) {
                    marker.classList.add('active_marker')
                } else {
                    marker.classList.remove('active_marker')
                }
            }
        }); 
        if (typeof updateGroupUsers === 'function') {
            updateGroupUsers(data.user_id, data.status)
        }
    }

    else if (data.type === 'sidebar_notification') {
        const currentOpenedChatId = typeof chatId !== 'undefined' ? String(chatId) : null;
        const incomingChatId = String(data.chat_id);
        const latestMessage = data.message_data;

        document.querySelectorAll('.created_chat').forEach(btn => {
            const buttonChatId = String(btn.dataset.id)

            if (buttonChatId === incomingChatId) {
                
                if (typeof getLastMessage === 'function' && latestMessage && latestMessage.text) {
                    getLastMessage(
                        incomingChatId,
                        latestMessage.text, 
                        latestMessage.datetime, 
                        latestMessage.id
                    );
                }
                
                
                if (buttonChatId !== currentOpenedChatId) {
                    const indicator = btn.querySelector('.indicator');
                    if (indicator) {
                        indicator.classList.add("unread");
                        indicator.classList.remove("hidden");
                        
                        let currentCount = parseInt(indicator.textContent.trim(), 10);
                        if (isNaN(currentCount)) currentCount = 0;
                        indicator.textContent = currentCount + 1;
                    }
                }
                if (typeof renderCountUnreadedMessages === 'function'){
                    renderCountUnreadedMessages()
                }
                
            }
        });
    }
};