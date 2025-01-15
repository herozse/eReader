import * as cheerio from "cheerio";
import * as api from "@/api/common";
import sourceJson from "./source";
import { URLPolyfill } from "@/utils";

const source = sourceJson.local;
type ContentParser = { title: string; text: string };

export const getPageContent = async (params: { url: string }) => {
  const r = await getDeepthPage(params.url) as ContentParser;
  let content: ContentParser = {
    title: "Not Foud",
    text: "找不到资源",
  };
  if (r) {
    content = r;
  }
  const result: ContentParser = handlerPage(content, params.url);

  return Promise.resolve(result);
};

const getDeepthPage = async (url: string, content: AnyObject = {}) => {
  try {
    const res = (await api.getContentByApp(url)) as string;
    if (res) {
      const parse = URLPolyfill(url);
      const targetSource = source.find((i) => i.origin === parse.origin);
      if (targetSource) {
        const $ = cheerio.load(res);
        const { wrapContainer, titleContainer, pagination, lineBreak } = targetSource.content.rules;

        if (!content.isParse) {
          content = {
            isParse: true,
            text: "",
            title: $(titleContainer.selector).text() || "",
          };
        }
        if (lineBreak === "br") {
          const txtElement = $(wrapContainer.selector);
          // 将 <br> 标签替换为 \n
          const modifiedHtml = txtElement.html()?.replace(/<br\s*\/?>/g, "\n");
          // 获取修改后的文本内容
          const text = cheerio.load(modifiedHtml || "").text();
          content.text += text;
        } else {
          $(wrapContainer.selector).each((index, element) => {
            const text = $(element).text();
            content.text += `${text}\n`;
          });
        }

        if (pagination) {
          const nextPagination = $(pagination.selector).last();
          const nextPath = nextPagination.attr("href") || "";
          const nextPathText = nextPagination.text();

          if (nextPath.startsWith("/") && nextPathText === "下一页") {
            content = await getDeepthPage(`${parse.origin}${nextPath}`, content);
          }
        }
      }
    }
  } catch (error) {
    console.log(error, "error");
    return content;
  }

  return content as ContentParser;
};

const handlerPage = (content: ContentParser, url: string) => {
  const parse = URLPolyfill(url);
  const targetSource = source.find((i) => i.origin === parse.origin);
  let handler = targetSource?.content?.handler;

  let { text, title } = content;
  text = text.replace(/\n\s*\n/g, "\n");
  const p = text
    .split(/\n/)
    .map((i) => i.trim())
    .filter((i) => i);
  handler?.replace?.forEach((r) => {
    if (r.type === "Array") {
      p.splice(r.value, 1);
    }
  });

  text = p.join("\n");

  return {
    text,
    title,
  };
};
