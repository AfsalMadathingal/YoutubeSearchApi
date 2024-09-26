const express = require("express");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();
const puppeteer = require("puppeteer");
const port = process.env.PORT || 3056;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/ping", (req, res) => {
  res.status(200).json(true);
});


app.get("/search/:query", async (req, res) => {


  const query = req.params.query;


  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(
      `https://www.youtube.com/results?search_query=news${query}`
    );

    const videoLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll("ytd-video-renderer").forEach((element) => {
        const video = {};
        video.link = element.querySelector("#thumbnail").href;
        video.title = element.querySelector("#video-title").textContent;
        video.views = element.querySelector(
          ".inline-metadata-item"
        ).textContent;

        const thumbnailUrlTag = element.querySelector(
          'link[itemprop="thumbnailUrl"][href*="maxresdefault.jpg"]'
        );
        video.thumbnail = thumbnailUrlTag ? thumbnailUrlTag.href : "";

        links.push(video);
      });
      return links;
    });

    for (const video of videoLinks) {
      await page.goto(video.link);
      const thumbnailUrl = await page.evaluate(() => {
        const thumbnailUrlTag = document.querySelector(
          'link[itemprop="thumbnailUrl"][href*="maxresdefault.jpg"]'
        );
        return thumbnailUrlTag ? thumbnailUrlTag.href : "";
      });
      video.thumbnail = thumbnailUrl;
    }

    console.log(videoLinks[0]);

    res.status(200).json(videoLinks);

    await browser.close();
  })();
});

app.listen(port, () => {
  console.log(`api app listening at http://localhost:${port}`);
});