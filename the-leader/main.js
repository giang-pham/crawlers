
const Apify = require('apify');

Apify.main(async () => {
    // Create a RequestQueue
    const requestQueue = await Apify.openRequestQueue();
    // Define the starting URL
    await requestQueue.addRequest({
        url: 'https://theleader.vn/g%E1%BB%8Di+v%E1%BB%91n.html',
        userData: {
            label: 'START'
        }
    });

    let newsList = new Map();
    // Function called for each URL
    const handlePageFunction = async ({ request, $ }) => {
        console.log(request.url);
        if (request.userData.label == 'DETAIL') {
            const id = request.url.match(/[^-]+(?=\.htm)/g)[0]
            let content = $('.news-detail-body').html()
            newsList.get(id).content = content
        }

        if (request.userData.label == 'START') {

            const newsBlock = $('.block-list-news-item');

            newsBlock.each(function () {
                let that = $(this)
                let link = that.find('h2 a').prop('href')
                let title = that.find('h2').text()
                let desc = that.find('.sapo').text()
                const id = link.match(/[^-]+(?=\.htm)/g)[0]
                newsList.set(id, {
                    link,
                    title,
                    desc
                })

                requestQueue.addRequest({
                    url: 'https://theleader.vn' + link,
                    userData: {
                        label: 'DETAIL',
                    }
                });
            })
        }

    };
    // Create a CheerioCrawler
    const crawler = new Apify.CheerioCrawler({
        requestQueue,
        handlePageFunction,
    });
    // Run the crawler
    await crawler.run();
    console.log(newsList)
});
