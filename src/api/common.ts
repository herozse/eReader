import { requestService, requestCrawlerHtml } from "@/utils/request";

export function parseBookHtml(params: { origin: string }) {
  return requestCrawlerHtml(params.origin);
}

export function searchBook(params: {
  fuzzy: string;
  limit?: number;
  pageSize: number;
  pageNo: number;
  origins?: Array<string>;
}) {
  return requestService<{ data: searchBookList[]; complete: boolean }>("POST", "/books/search", params);
}
export function getCatalogs(params: { url: string }) {
  return requestService<bookInfo>("POST", "/books/getCatalogs", params);
}

export function getContent(params: { url: string }) {
  return requestService<{ title: string; text: string }>("POST", "/books/getContent", params);
}

export function getTopBooks(params: { gender?: string; cate?: string; rank?: string }) {
  return requestService<TopBookInfo[]>("POST", "/books/getTopBooks", params);
}

// APP端
export async function getTopBooksByApp(url: string) {
  return requestCrawlerHtml(url);
}

export function searchBookByApp(url: string, method?: RequestMethod, data?: any, options?: object) {
  return requestCrawlerHtml(url, method, data, options);
}

export function getCatalogsByApp(url: string) {
  return requestCrawlerHtml(url);
}

export function getContentByApp(url: string) {
  return requestCrawlerHtml(url);
}
