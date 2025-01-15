import * as cheerio from "cheerio";
import * as api from "@/api/common";
import sourceJson from "./source";
import { URLPolyfill } from "@/utils";
const source = sourceJson.local;

export const getCatalogs = async (params: { url: string }) => {
  let content = (await getDeepthHtml(params.url)) as bookInfo;

  const result = handlerCatelogs(content);
  return Promise.resolve(result);
};

const getDeepthHtml = async (url: string, content: AnyObject = {}) => {
  try {
    let res = (await api.getCatalogsByApp(url)) as string;
    if (res) {
      const parse = URLPolyfill(url);
      const targetSource = source.find((i) => i.origin === parse.origin);
      if (targetSource) {
        const $ = cheerio.load(res);
        const { wrapContainer, infomation, pagination, redirect } = targetSource.catalogs.rules;

        let info = {
          bookName: "",
          author: "",
          image: "",
          categories: "",
          latestChapter: "",
          latestUpdateTime: "",
          description: "",
        };

        const reflect = [
          ["bookName", infomation.bookName],
          ["author", infomation.author],
          ["image", infomation.image],
          ["categories", infomation.categories],
          ["latestChapter", infomation.latestChapter],
          ["latestUpdateTime", infomation.latestUpdateTime],
          ["description", infomation.description],
        ];

        type HanderKeys =
          | "bookName"
          | "author"
          | "image"
          | "categories"
          | "latestChapter"
          | "latestUpdateTime"
          | "description";

        reflect.forEach((arr: any) => {
          const key: HanderKeys = arr[0];
          const rule = arr[1];
          let node = $(rule.selector);
          if (rule?.hasOwnProperty("nthchild")) {
            const num = rule.nthchild;
            if (node?.length >= num + 1) {
              node = node.eq(num);
            }
          }
          if (rule.type === "element") {
            if (rule.attr) {
              info[key] = node.attr(rule.attr) || "";
            } else {
              info[key] = node.text() || "";
            }

            if (rule.subPath) {
              info[key] = `${parse.origin}${info[key]}`;
            }
          } else {
            info[key] = node.attr("content") || "";
          }

          // 处理文字信息
          if (rule?.handler) {
            Object.entries(rule.handler).forEach(([type, value]) => {
              switch (type) {
                case "replace":
                  info[key] = info[key].replace(new RegExp(value as string, "g"), rule.handler?.replaceValue || "");
                  break;
                default:
                  break;
              }
            });
          }
        });

        if (!content.isParse) {
          content = {
            isParse: true,
            origin: parse.origin,
            pathname: parse.pathname,
            links: [],
            ...info,
          };
        }

        const wrapperContainer = $(wrapContainer.selector);
        wrapperContainer.each((index, element) => {
          let href = $(element).attr("href");
          if (redirect) {
            href = `${parse.pathname}${href}`;
          }

          content.links.push({
            href,
            text: $(element).text(),
          });
        });
        if (redirect) {
          let node = $(redirect.selector);
          if (redirect?.hasOwnProperty("nthchild")) {
            const num = redirect.nthchild;
            if (node?.length >= num + 1) {
              node = node.eq(num);
            }
          }
          const redirectUrl = node.attr("href");
          if (redirectUrl) {
            const nextUrl = `${parse.origin}${redirectUrl}`;

            content = await getDeepthHtml(nextUrl, content);
          }
        }
        if (pagination) {
          const nextPagination = $(pagination.selector).last();

          let nextPath = nextPagination.attr("href");
          let nextButtonName = nextPagination.text();

          if (nextPath && nextButtonName === "下一页") {
            const nextUrl = pagination.fullpath
              ? `${parse.origin}${parse.pathname}${nextPath}`
              : `${parse.origin}${nextPath}`;

            content = await getDeepthHtml(nextUrl, content);
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    return content;
  }

  return content as bookInfo;
};

const handlerCatelogs = (content: bookInfo) => {
  const array = content.links || [];

  type LinkType = {
    href: string;
    text: string;
  };
  // 过滤重复的 href
  const uniqueArray = Array.from(new Set(array.map((item) => item.href))).map((href) =>
    array.find((item) => item.href === href),
  ) as LinkType[];

  // 按照 xxxx.html 从小到大排序
  uniqueArray.sort((a, b) => {
    const numA = parseInt(a?.href?.split("/")?.pop()?.split(".html")[0] || "0");
    const numB = parseInt(b?.href?.split("/")?.pop()?.split(".html")[0] || "0");
    return numA - numB;
  });

  content.links = uniqueArray;
  content.origins = [
    {
      origin: content.origin,
      pathname: content.pathname,
    },
  ];
  
  return content;
};
