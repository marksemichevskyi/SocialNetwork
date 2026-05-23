const sectionButtons = document.querySelectorAll("[data-section-link]")
const allSections = document.querySelector('#all-sections')

const currentSection = document.querySelector('#current-section')
const showAllSections = document.querySelector('#show-all-sections')
const currentSectionTitle = document.querySelector('#current-section-title')
const currentSectionList = document.querySelector('#current-section-list')
const currentSectionLoadLine = document.querySelector('#current-section-load-line')
const visitFriendPage = document.querySelectorAll(".friend_info")

const listButtons = document.querySelectorAll('.button')

async function visitPage(page) {
    window.location.href = page

}

visitFriendPage.forEach(button =>{
    button.addEventListener("click", () => {
        visitPage(page = button.dataset.url)
    })
})

listButtons.forEach(button =>{
    button.addEventListener("click", () => {
        listButtons.forEach(btn => {
            btn.classList.remove("selected")
        })
        button.classList.add("selected")
        
    })
})

const titles = {
    requests: 'Запити',
    recommendations: "Рекомендації",
    friends: "Всі друзі"
}

let currentSectionName = ''
let currentPage = 1
let hasNext = false
let isLoading = false

async function loadSection(section, page) {
    isLoading = true
    const response = await fetch(`/friends/${section}/?page=${page}`, {headers: {
        'X-Requested-With': 'XMLHttpRequest'
    }})
    const data = await response.json()
    hasNext = data.has_next
    if (hasNext == false){
        friendsObserver.disconnect()
    }
    currentSectionList.insertAdjacentHTML('beforeend', data.html)
    // currentSectionLoadLine.insertAdjacentHTML('beforebegin', data.html)
    createActionButtonEvent()
    isLoading = false
}

async function openSection(section){
    currentSectionName = section
    allSections.style.display = 'none'
    currentSection.style.display = 'flex'
    currentSectionTitle.textContent = titles[section]
    currentPage = 1
    currentSectionList.innerHTML = ""
    friendsObserver.observe(currentSectionLoadLine)
    await loadSection(section, currentPage)
}

showAllSections.addEventListener('click', ()=>{
    allSections.style.display = 'flex'
    currentSection.style.display = 'none'
})

const friendsObserver = new IntersectionObserver(async (entries)=>{
    if (entries[0].isIntersecting && isLoading == false && hasNext == true){
        currentPage += 1
        await loadSection(currentSectionName, currentPage)
    }
}, {
    rootMargin: "80px"
})

sectionButtons.forEach((sectionButton) => {
    sectionButton.addEventListener('click', async function(){
        await openSection(sectionButton.dataset.sectionLink)
        listButtons.forEach((listButton) =>{
            if (listButton.dataset.sectionLink === sectionButton.dataset.sectionLink ){
                listButtons.forEach(btn => {
                    btn.classList.remove("selected")
                })
                listButton.classList.add("selected")
            }
        }) 
    })
})

