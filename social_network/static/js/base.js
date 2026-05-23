const buttons = document.querySelectorAll('.page_text_button');
const currentPath = window.location.pathname;

// 1. Отримуємо масив сегментів шляху (очищений від порожніх рядків)
// Для "/friends/friend_page/4/" -> ["friends", "friend_page", "4"]
const pathSegments = currentPath.split('/').filter(Boolean);

// 2. Беремо саме перший головний сегмент як рядок (наприклад, "friends")
const currentApp = pathSegments.length > 0 ? pathSegments[0] : '';

// Очищаємо підсвічування з усіх кнопок
buttons.forEach(btn => btn.classList.remove("selected_button"));

buttons.forEach(button => {
    const buttonHref = button.getAttribute('href');
    
    // Отримуємо перший сегмент href кнопки
    // Для "/friends/" -> ["friends"] -> беремо індекс [0], тобто рядок "friends"
    const buttonSegments = buttonHref.split('/').filter(Boolean);
    const buttonSection = buttonSegments.length > 0 ? buttonSegments[0] : '';

    // 3. Тепер порівнюємо чисті рядки між собою ("friends" === "friends")
    // Також залишаємо перевірку точного збігу для Головної сторінки
    if ((buttonSection && buttonSection === currentApp) || buttonHref === currentPath) {
        button.classList.add('selected_button');
    }
});
