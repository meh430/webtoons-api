import cheerio from "cheerio";
import url from "url";

export interface WebtoonPreviewItem {
    name: string;
    internalName: string;
    coverImage: string;
}

export interface PageInfo {
    currentPage: number;
    lastPage: number;
}

export interface Chapter {
    chapterNumber: string;
    uploadDate: string;
    internalChapterReference: string;
}

export interface PagedWebtoonPreviewItem extends PageInfo {
    category?: string;
    items: WebtoonPreviewItem[];
}

export interface Webtoon extends WebtoonPreviewItem {
    summary: string;
    rating: string;
    author: string;
    artist: string;
    numChapters: number;
}

export interface WebtoonChapters {
    webtoon: Webtoon;
    chapters: Chapter[]
}

// Meant to scrape a list of comics, from search results or from browsing
export function scrapeListingPage(listingHtml: string): PagedWebtoonPreviewItem {
    const $ = cheerio.load(listingHtml);
    const listItems = $("div[class='row row-eq-height'] > div[class='col-12 col-md-6 badge-pos-1']");
    let items: WebtoonPreviewItem[] = [];
    listItems.each((index, element) => {
        items.push(scrapePreviewItem($.html(listItems[index])));
    });
    const pageInfo: PageInfo = parsePageNumbers($("span[class='pages']").text().trim());
    return { items: items, currentPage: pageInfo.currentPage, lastPage: pageInfo.lastPage };
}

// Meant to scrape each individual comic preview item from a list of comics
function scrapePreviewItem(itemHtml: string): WebtoonPreviewItem {
    const $ = cheerio.load(itemHtml);
    const coverImage = $("a > img").attr()["data-src"].trim();
    const titleElement = $("h3 > a");
    const internalName = new url.URL(titleElement.attr().href).pathname;
    return { name: titleElement.text().trim(), internalName: internalName.split("/")[2], coverImage: coverImage };
}

// Meant to get info about pagination
function parsePageNumbers(pageNumHtml: string): PageInfo {
    const pageSpan: string[] = pageNumHtml.split(" ");
    return { currentPage: Number(pageSpan[1]), lastPage: Number(pageSpan[3]) };
}

// Meant to get detailed information about a comic
export function scrapeWebtoonPage(webtoonHtml: string, internalName: string): WebtoonChapters {
    const $ = cheerio.load(webtoonHtml);
    const name: string = $("div[class='post-title'] > h1").text().trim();
    const coverImage: string = $("div[class='summary_image'] > a > img").attr()["data-src"].trim();
    const rating: string = $("div[class='post-total-rating allow_vote'] > span").text().trim();
    const author: string = $("div[class='summary-content'] > div[class='author-content'] > a").text().trim();
    const artist: string = $("div[class='summary-content'] > div[class='artist-content'] > a").text().trim();
    const summary: string = $("div[class='description-summary'] > div[class='summary__content show-more']")
        .text()
        .trim();
    const chapterListItems = $("ul[class='main version-chap'] > li[class='wp-manga-chapter  ']");
    const chapters: Chapter[] = [];
    chapterListItems.each((index, element) => {
        const currentChapter: Chapter = scrapeChapterListItem($.html(chapterListItems[index]));
        chapters.push(currentChapter);
    });

    return {
        webtoon: {
            name: name,
            internalName: internalName,
            coverImage: coverImage,
            summary: summary,
            rating: rating,
            author: author,
            artist: artist,
            numChapters: chapters.length,
        },
        chapters: chapters
    };
}

// Meant to scrape each chapter list item
function scrapeChapterListItem(chapterListItemHtml: string): Chapter {
    const $ = cheerio.load(chapterListItemHtml);
    const chapterNumber: string = $("a").text().trim();
    const internalChapterReference: string[] = $("a").attr().href.trim().split("/");
    const uploadDate: string = $("span[class='chapter-release-date'] > i").text().trim();
    return {
        chapterNumber: chapterNumber,
        internalChapterReference: internalChapterReference[internalChapterReference.length - 2],
        uploadDate: uploadDate,
    };
}

// Meant to scrape the pages in a comic chapter
export function scrapeWebtoonChapter(chapterPageHtml: string): string[] {
    const $ = cheerio.load(chapterPageHtml);
    const pageImages = $("div[class='reading-content'] > div[class='page-break no-gaps'] > img");
    const pageImageUrls: string[] = [];
    pageImages.each((index, element) => {
        pageImageUrls.push($($.html(pageImages[index])).attr()["data-src"].trim());
    });
    return pageImageUrls;
}
