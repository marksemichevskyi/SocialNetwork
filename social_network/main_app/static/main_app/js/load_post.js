{
    let loadPostLine = document.querySelector('#load-post-line');
    let postList = document.querySelector('#post-list');
    let page = 1;

    if (loadPostLine) {
        const observer = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting) {
                page++;
                
                const currentPath = window.location.pathname;
                let url = '';
                url = `/main/render_post/?page=${page}`;
                
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