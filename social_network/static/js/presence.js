
const url = `ws://${window.location.host}/presence/`;
const presenceSocket = new WebSocket(url);

presenceSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const userMarkers = document.querySelectorAll(".online_marker");
    
    // 1. Первинна отрика всього списку онлайн-користувачів
    if (data.type === 'get_online') {
        userMarkers.forEach(marker => {
            const userId = marker.dataset.id;
            // Оскільки data.online_users тепер чистий масив, використовуємо .includes()
            // Приводимо до Number, бо в dataset id завжди є рядком
            if (userId && data.online_users.includes(Number(userId))) {
                marker.classList.add('active_marker');
            } else {
                marker.classList.remove('active_marker');
            }
        });
    } 
    
    // 2. Сповіщення про зміну статусу ОДНОГО користувача (увійшов/вийшов)
    else if (data.type === 'presence_update') { 
        userMarkers.forEach(marker => {
            if (String(marker.dataset.id) === String(data.user_id)) {
                if (data.status) {
                    marker.classList.add('active_marker');
                } else {
                    marker.classList.remove('active_marker');
                }
            }
        }); 
        if (typeof updateGroupUsers === 'function') {
            updateGroupUsers(data.user_id, data.status);
        }
    }
    
    // 3. Сповіщення про нове повідомлення для лічильника в сайдбарі
    else if (data.type === 'sidebar_notification') {
        console.log("Отримано повідомлення для лічильника:", data);

        const currentOpenedChatId = typeof chatId !== 'undefined' ? String(chatId) : null;
        const incomingChatId = String(data.chat_id);

        document.querySelectorAll('.created_chat').forEach(btn => {
            const buttonChatId = String(btn.dataset.id);
            if (buttonChatId === incomingChatId && buttonChatId !== currentOpenedChatId) {
                
                const unread = btn.querySelector('.unread');
                if (unread) {
                    unread.textContent = Number(unread.textContent) + 1;
                } else {
                    const newUnread = document.createElement('h6');
                    newUnread.classList.add('unread');
                    newUnread.textContent = '1';
                    btn.append(newUnread);
                }
            }
        });
    }
};