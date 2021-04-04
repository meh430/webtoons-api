import cheerio from "cheerio"
import url from 'url'

export interface WebtoonPreviewItem {
    name: string;
    internalName: string;
    coverImage: string;
}

export interface PageInfo {
    currentPage: number;
    lastPage: number;
}

export interface PagedWebtoonPreviewItem extends PageInfo {
    items: WebtoonPreviewItem[];
}


export function scrapeListingPage(listingHtml: string): PagedWebtoonPreviewItem {
    const $ = cheerio.load(listingHtml);
    const listItems = $("div[class='row row-eq-height'] > div[class='col-12 col-md-6 badge-pos-1']");
    let items: WebtoonPreviewItem[] = [];
    listItems.each((index, element) => {
        items.push(scrapePreviewItem($.html(listItems[index])));
    });
    const pageInfo: PageInfo = parsePageNumbers($("span[class='pages']").text());
    return { items: items, currentPage: pageInfo.currentPage, lastPage: pageInfo.lastPage};
}

export function scrapePreviewItem(itemHtml: string): WebtoonPreviewItem {
    const $ = cheerio.load(itemHtml);
    const imageUrl = $("a > img").attr()['data-src'];
    const titleElement = $("h3 > a");
    const internalName = new url.URL(titleElement.attr().href).pathname;
    console.log(internalName);
    console.log(titleElement.text());
    console.log(imageUrl);
    return { name: titleElement.text(), internalName: internalName, coverImage: imageUrl };
}

export function parsePageNumbers(pageNumHtml: string): PageInfo {
    const pageSpan: string[] = pageNumHtml.split(" ");
    return { currentPage: Number(pageSpan[1]), lastPage: Number(pageSpan[3]) };
}