const express= require('express');
const app= express();
const axios= require('axios');
const cheerio= require('cheerio');
require('dotenv').config()
const port= process.env.PORT || 3056;


app.get('/', async (req, res) => {
   
  
    const response = await axios.get('https://www.youtube.com/results?search_query=news');

    const $ = await cheerio.load(response.data);

   console.log($('ytd-video-renderer'));
// Array to store extracted data
const videos = [];

// Iterate over each ytd-video-renderer element
$('ytd-video-renderer').each((index, element) => {
    const video = {};

    console.log(element);
    // Extract video link
    video.link = $(element).find('#thumbnail').attr('href');

    // Extract video title
    video.title = $(element).find('#video-title').text();

    // Extract view count
    video.views = $(element).find('.inline-metadata-item').first().text();

    // Extract thumbnail image link
    video.thumbnail = $(element).find('img').attr('src');

    // Push extracted data to videos array
    videos.push(video);
});


    res.status(200).send(videos);


  });


  app.get('/ping', (req, res) => {

    res.status(200).json(true)
    
  })


const puppeteer = require('puppeteer');


app.get('/p', async (req, res) => {
    
    (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
       
        await page.goto('https://www.youtube.com/results?search_query=news');
        
        const videoLinks = await page.evaluate(() => {
            const links = [];
            document.querySelectorAll('ytd-video-renderer').forEach(element => {
                const video = {};
                video.link = element.querySelector('#thumbnail').href;
                video.title = element.querySelector('#video-title').textContent;
                video.views = element.querySelector('.inline-metadata-item').textContent;
                
                const thumbnailUrlTag = element.querySelector('link[itemprop="thumbnailUrl"][href*="maxresdefault.jpg"]');
                video.thumbnail = thumbnailUrlTag ? thumbnailUrlTag.href : '';
                
                links.push(video);
            });
            return links;
        });

        for (const video of videoLinks) {
            await page.goto(video.link);
            const thumbnailUrl = await page.evaluate(() => {
                const thumbnailUrlTag = document.querySelector('link[itemprop="thumbnailUrl"][href*="maxresdefault.jpg"]');
                return thumbnailUrlTag ? thumbnailUrlTag.href : '';
            });
            video.thumbnail = thumbnailUrl;
        }

        console.log(videoLinks);
        res.send(videoLinks);

        await browser.close();
    })();
});














app.listen(port, () => {
    console.log(`api app listening at http://localhost:${port}`)
})