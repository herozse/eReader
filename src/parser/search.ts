import * as cheerio from "cheerio";
import * as api from "@/api/common";
import sourceJson from "./source";
const source = sourceJson.local;

export async function searchBook(params: {
  fuzzy: string;
  limit?: number;
  pageSize: number;
  pageNo: number;
  origins?: Array<string>;
}) {
  let bookList: searchBookList[] = [];

  const { pageSize, pageNo, origins } = params;
  let allowSource = source;
  // 从指定源搜索
  if (origins?.length) {
    allowSource = source.filter((i) => origins.includes(i.origin));
  }
  const start = (pageNo - 1) * pageSize;
  const end = pageSize * pageNo;
  const requestList = allowSource.slice(start, end);

  for (let index = 0; index < requestList.length; index++) {
    try {
      const element = requestList[index];
      let res: string;
      if (element.search.method === "POST") {
        const options: AnyObject = {};
        if (element.search.queryType === "FormData") {
          options.sendFormData = true;
        }
        const [url, query] = formatPostUrl(element.origin, element.search.pathname, params, element.search.query);
        res = (await api.searchBookByApp(url, element.search.method, query, options)) as string;
      } else {
        const url = formatUrl(element.origin, element.search.pathname, params, element.search.query);
        res = (await api.searchBookByApp(url)) as string;
      }

      if (res) {
        let value = paraseSearchContent(res, element);
        if (params.limit) {
          value = value.slice(0, params.limit);
        }

        bookList = bookList.concat(value);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const result: searchBookList[] = handlerSearch(bookList);
  const value = { data: result, complete: end >= allowSource.length - 1 };
  return Promise.resolve(value);
}

function paraseSearchContent(res: string, item: any) {
  const bookList: searchBookList[] = [];
  const { rules } = item.search;
  const $ = cheerio.load(res);

  // 第一步：获取类
  const wrapperContainer = $(rules.wrapContainer.selector);
  // 第二步：遍历每个元素，提取其内部具体内容
  wrapperContainer.each((index, element) => {
    // 封面 书名 作者 目录地址 分类 最新章节 最近更新时间
    const { image, bookName, author, pathname, categories, latestChapter } = rules.infomation;

    const bookInfo = {
      origin: item.origin,
      bookName: "",
      author: "",
      image: "",
      pathname: "",
      categories: "",
      latestChapter: "",
    };

    const handlers = [
      ["image", image],
      ["bookName", bookName],
      ["author", author],
      ["pathname", pathname],
      ["categories", categories],
      ["latestChapter", latestChapter],
    ];

    type HanderKeys = "image" | "bookName" | "author" | "pathname" | "categories" | "latestChapter";
    handlers.forEach((arr) => {
      const key: HanderKeys = arr[0];
      const rule = arr[1];
      if (!rule) return;

      const ele = $(element).find(rule.selector);

      if (ele) {
        if (key === "image") {
          bookInfo[key] = ele.attr(rule.attr || "src") || "";
        } else if (key === "pathname") {
          bookInfo[key] = ele.attr(rule.attr || "href") || "";
        } else {
          bookInfo[key] = ele.text() || "";
        }

        if (rule.subPath) {
          bookInfo[key] = `${item.origin}${bookInfo[key]}`;
        }
      }

      if (rule?.hasOwnProperty("nthchild")) {
        const num = rule.nthchild;
        if (ele?.length >= num + 1) {
          const text = ele.eq(num).text() || "";
          bookInfo[key] = text;
        }
      }
      if (rule?.handler) {
        Object.entries(rule.handler).forEach(([type, value]) => {
          switch (type) {
            case "replace":
              bookInfo[key] = bookInfo[key].replace(new RegExp(value as string, "g"), rule.handler?.replaceValue || "");
              break;
            default:
              break;
          }
        });
      }

      bookInfo[key] = bookInfo[key].trim();
    });
    bookList.push(bookInfo);
  });

  return bookList;
}

const handlerSearch = (bookList: searchBookList[]) => {
  bookList = bookList.filter((i) => i.bookName && i.pathname);

  return bookList;
};

const formatUrl = (origin: string, path: string, params: { fuzzy: string; limit?: number }, query: AnyObject) => {
  origin = origin.endsWith("/") ? origin.slice(0, origin.length - 1) : origin;
  path = path.startsWith("/") ? path : `/${path}`;
  let str = `${origin}${path}?`;
  let searchParams = ``;

  Object.entries(query).forEach(([key, value]) => {
    if (typeof value === "string") {
      searchParams += `&${key}=${encodeURIComponent(value)}`;
    }
    if (value instanceof Object) {
      switch (value.type) {
        case "date":
          searchParams += `&${key}=${new Date().getTime()}`;
          break;
        case "query":
          searchParams += `&${key}=${encodeURIComponent(params.fuzzy)}`;
          break;
        default:
          break;
      }
    }
  });

  str += searchParams.slice(1, searchParams.length);
  return str;
};

const formatPostUrl = (origin: string, path: string, params: { fuzzy: string; limit?: number }, query: AnyObject) => {
  origin = origin.endsWith("/") ? origin.slice(0, origin.length - 1) : origin;
  path = path.startsWith("/") ? path : `/${path}`;
  let str = `${origin}${path}`;
  let searchParams: AnyObject = {};

  Object.entries(query).forEach(([key, value]) => {
    if (typeof value === "string") {
      searchParams[key] = value;
    }
    if (value instanceof Object) {
      switch (value.type) {
        case "date":
          searchParams[key] = new Date().getTime();
          break;
        case "query":
          searchParams[key] = params.fuzzy;
          break;
        default:
          break;
      }
    }
  });
  const res = [str, searchParams];

  return res as [string, AnyObject];
};
