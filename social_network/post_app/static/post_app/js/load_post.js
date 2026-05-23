{
    let loadPostLine = document.querySelector('#load-post-line');
    let postList = document.querySelector('#post-list');
    let page = 1;

    if (loadPostLine) {
        const observer = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting) {
                page++;
                
                // 1. Визначаємо поточний шлях у браузері
                const currentPath = window.location.pathname;
                let url = '';

                // 2. Якщо ми на сторінці друга, робимо AJAX-запит на ту саму сторінку друга
                if (currentPath.includes('/friend_page/')) {
                    url = `${currentPath}?page=${page}`;
                } else {
                    // Якщо ми на домашній сторінці постів — використовуємо ваш стандартний маршрут
                    url = `/post/render_post/?page=${page}`;
                }
                
                // 3. Відправляємо динамічно сформований URL
                const response = await fetch(url, {
                    headers: {"X-Requested-With": "XMLHttpRequest"}
                });
                const data = await response.json();

                if (data.success) {
                    loadPostLine.insertAdjacentHTML('beforebegin', data.html);
                } else {
                    observer.disconnect();
                }
            }
        }, { rootMargin: "200px" });

        observer.observe(loadPostLine);
    }
}
// observer = new IntersectionObserver((entries)=>{КОД}, {rootMargin: "200px"})
// - створює об’єкт, що буде виконувати код кожен раз коли вказаний елемент видно на екрані


// observer.observe(елемент) - вказує за яким елементом стежить observer


// entries[0].isIntersecting - в середині функції, перевіряє чи видно елемент