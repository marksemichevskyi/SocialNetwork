const buttons = document.querySelectorAll('.page_text_button')
const currentPath = window.location.pathname;

const pathSegments = currentPath.split('/').filter(Boolean)

const currentApp = pathSegments.length > 0 ? pathSegments[0] : ''

buttons.forEach(btn => btn.classList.remove("selected_button"))

buttons.forEach(button => {
    const buttonHref = button.getAttribute('href')

    const buttonSegments = buttonHref.split('/').filter(Boolean)
    const buttonSection = buttonSegments.length > 0 ? buttonSegments[0] : ''

    if ((buttonSection && buttonSection === currentApp) || buttonHref === currentPath) {
        button.classList.add('selected_button')
    }
});
