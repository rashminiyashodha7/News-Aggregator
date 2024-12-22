const API_KEY = '***************';
//Add Your API KEY

let currentPage = 1;
let currentCategory = null;
let currentKeyword = null;
let isLoading = false;
let lastArticleCount = 0;

function fetchNews(isSearching) {
    if (isLoading) return;

    isLoading = true;
    let url;

    if (isSearching) {
        const keyword = document.getElementById('searchKeyword').value.trim();
        if (!keyword) {
            alert("Please enter a keyword to search.");
            isLoading = false;
            return;
        }
        url = `https://newsapi.org/v2/everything?q=${keyword}&apiKey=${API_KEY}&page=${currentPage}`;
    } else {
        const category = currentCategory || document.getElementById('category').value || 'general';
        url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}&page=${currentPage}`;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const newsContainer = document.getElementById('newsContainer');

            if (currentPage === 1) {
                newsContainer.innerHTML = '';
            }

            const articlesWithImage = data.articles.filter(article => article.urlToImage);

            if (articlesWithImage.length === 0 || articlesWithImage.length === lastArticleCount) {
                displayNoMoreNews();
                isLoading = false;
                return;
            }
            lastArticleCount = articlesWithImage.length;

            articlesWithImage.forEach(article => {
                const newsItem = `
                    <div class="newsItem">
                        <div class="newsImage">
                            <img src="${article.urlToImage}" alt="${article.title}">
                        </div>
                        <div class="newsContent">
                            <div class="info">
                                <h5>${article.source.name || 'Unknown Source'}</h5>
                                <span>|</span>
                                <h5>${new Date(article.publishedAt).toLocaleDateString()}</h5>
                            </div>
                            <h2>${article.title}</h2>
                            <p>${article.description || 'No description available.'}</p>
                            <a href="${article.url}" target="_blank">Read More</a>
                        </div>
                    </div>
                `;
                newsContainer.innerHTML += newsItem;
            });

            if (articlesWithImage.length > 0) {
                currentPage++;
            }
            isLoading = false;
        })
        .catch(error => {
            console.error("There was an error fetching the news:", error);
            const newsContainer = document.getElementById('newsContainer');
            newsContainer.innerHTML = `<p>Error fetching news. Please try again later.</p>`;
            isLoading = false;
        });
}

function displayNoMoreNews() {
    const newsContainer = document.getElementById('newsContainer');
    newsContainer.innerHTML += '<p>No more news to load.</p>';
}

window.onscroll = function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
        if (currentKeyword) {
            fetchNews(true);
        } else {
            fetchNews(false);
        }
    }
};

document.getElementById('searchKeyword').addEventListener('input', function () {
    currentPage = 1;
    currentCategory = null;
    currentKeyword = this.value.trim();
});

document.getElementById('fetchCategory').addEventListener('click', function () {
    currentPage = 1;
    currentKeyword = null;
    currentCategory = document.getElementById('category').value;
    fetchNews(false);
});
