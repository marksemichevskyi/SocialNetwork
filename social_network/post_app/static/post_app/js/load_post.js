const loadPostLine = document.querySelector('#load-post-line')
const postList = document.querySelector('#post-list')
let page = 1


const observer = new IntersectionObserver(async (entries)=>{
    if (entries[0].isIntersecting){
        page ++
        const response = await fetch(`/post/render_post/?page=${page}`, {
            headers: {"X-Requested-With": "XMLHttpRequest"}
        })
        const data = await response.json()
        if (data.success){
            loadPostLine.insertAdjacentHTML('beforebegin', data.html)
        }else{
            observer.disconnect()
        }
    }
}, {
    rootMargin: "200px"
})


observer.observe(loadPostLine)



// observer = new IntersectionObserver((entries)=>{КОД}, {rootMargin: "200px"})
// - створює об’єкт, що буде виконувати код кожен раз коли вказаний елемент видно на екрані


// observer.observe(елемент) - вказує за яким елементом стежить observer


// entries[0].isIntersecting - в середині функції, перевіряє чи видно елемент