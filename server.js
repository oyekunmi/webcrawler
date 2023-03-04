//javascript function crawl webpage for images and continue until depth is reached

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');

const queue = [];

const startUrl = process.argv[2];
const maxDepth = process.argv[3];

console.log(process.argv);

const visited = new Set();

const output = {
    results: []
};

const crawl = (url, depth) => {
    visited.add(url);

    if (depth <= maxDepth) {
        queue.push({
            url: url,
            depth: depth
        });
    }
}

const crawlPage = async (url, depth) => {

    let pageHTML = null;
    try {
        pageHTML = await axios.get(url)
    } catch (err) {
        console.log("error while getting page");
        return;
    }

    const $ = cheerio.load(pageHTML.data);
    const links = $('a');
    const images = $('img');

    $(images).each(function (_i, image) {

        const imageUrl = $(image).attr('src');

        console.log("crawlPage", imageUrl, url, depth);


        const result = {
            imageUrl: imageUrl,
            sourceUrl: url,
            depth: depth,
        }

        output.results.push(result);
    });

    $(links).each(function (i, link) {
        const href = $(link).attr('href');

        if (href && !visited.has(href))
            crawl(href, depth + 1);
    });

}

const crawlQueue = async () => {
    while (queue.length > 0) {
        const item = queue.shift();
        await sleep(2000);
        await crawlPage(item.url, item.depth);
    }

}

crawl(startUrl, 0); //initial crawl from the root page

//keep processing the queue until it is empty and then log the results
crawlQueue().then(() => {
    fs.writeFileSync('results.json', JSON.stringify(output));
});


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}