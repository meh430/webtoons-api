import express from "express"
import cors from "cors"
import fetch from "node-fetch"
import cheerio from "cheerio"
import { PagedWebtoonPreviewItem, scrapeListingPage, scrapeWebtoonPage, Webtoon, scrapeWebtoonChapter} from "./src/scraper";

const app = express();
const port: number = +(process.env.PORT || 3000);

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    console.log(req.method + ": " + req.originalUrl);
    //console.log(req.body);
    next();
});

app.get("/", async (req, res) => {
    try {
        const html = await fetch("https://mangakomi.com/manga/the-god-of-high-school/chapter-507/");
        const resp = await html.text();
        const items: string[] = scrapeWebtoonChapter(resp);
        /*const $ = cheerio.load(resp);
        console.log($('div[class="page-listing-item"]').html());
        const elems = $('div[class="page-listing-item"]');
        elems.each((index, element) => {
            console.log(index);
            console.log($.html(elems[index]));
        });*/

        res.status(200).send(items);
    } catch (e) {
        console.log(e);
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});