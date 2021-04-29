import express from "express";
import fetch from "node-fetch";
import { asyncError } from "./errorHandler";
import { PagedWebtoonPreviewItem, scrapeListingPage, scrapeWebtoonChapter, scrapeWebtoonPage } from "./scraper";
import * as dotenv from 'dotenv';
dotenv.config();
const baseEndpoint = process.env.BASE_ENDPOINT;

enum Categories {
    latest = "latest",
    views = "views",
    rating = "rating",
    alphabet = "alphabet"
}

async function getHtml(endpoint: string): Promise<string> {
    const response = await fetch(endpoint);
    const responseHtml = await response.text();
    return responseHtml;
}

export default function initRoutes(app: express.Application) {
    app.get(
        "/available-categories",
        asyncError(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(200).send(Object.values(Categories));
        })
    );

    app.get(
        "/webtoons/:page/:category",
        asyncError(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const page = req.params.page;
            const category = req.params.category;
            const webtoonBaseEndpoint = `${baseEndpoint}/manga-genre/manhwa/page/${page}/?m_orderby=${category}`;
            res.status(200).send(scrapeListingPage(await getHtml(webtoonBaseEndpoint)));
        })
    );

    app.get(
        "/search",
        asyncError(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const query = req.query.q;

            const webtoonSearchEndpoint: string = `${baseEndpoint}/manga-genre/manhwa/?s=${query}`;
            let searchResults = scrapeListingPage(await getHtml(webtoonSearchEndpoint));
            searchResults.currentPage = 1;
            searchResults.lastPage = 1;
            res.status(200).send(searchResults);
        })
    );

    app.get(
        "/webtoon/:internalName",
        asyncError(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const internalName = req.params.internalName;

            const webtoonEndpoint = `${baseEndpoint}/manga/${internalName}`;

            res.status(200).send(scrapeWebtoonPage(await getHtml(webtoonEndpoint), internalName));
        })
    );

    app.get(
        "/webtoon-chapter/:internalName/:chapterName",
        asyncError(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const internalName = req.params.internalName;
            const chapterName = req.params.chapterName;

            const webtoonChapterEndpoint = `${baseEndpoint}/manga/${internalName}/${chapterName}`;

            res.status(200).send(scrapeWebtoonChapter(await getHtml(webtoonChapterEndpoint)));
        })
    );

    app.get(
        "/discover",
        asyncError(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const categories: string[] = Object.values(Categories)
            const pageHtmls = categories.map(category => {
                const webtoonBaseEndpoint = `${baseEndpoint}/manga-genre/manhwa/page/1/?m_orderby=${category}`;
                return getHtml(webtoonBaseEndpoint)
            })
            const discoverItems: PagedWebtoonPreviewItem[] = (await Promise.all(pageHtmls)).map(html => scrapeListingPage(html))

            for (let i = 0; i < categories.length; i++) {
                discoverItems[i].category = categories[i]
            }

            res.status(200).send(discoverItems);
        })
    );
}
