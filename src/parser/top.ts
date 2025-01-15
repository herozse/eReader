import * as cheerio from "cheerio";
import * as api from "@/api/common";

export function getTopBook(params: { gender: string; cate: string; rank: string }) {
  return new Promise((resolve, reject) => {
    const url = formatUrl("https://vt.quark.cn/blm/novel-rank-627/index", params);
    api
      .getTopBooksByApp(url)
      .then((res) => {
        const value = paraseSearchContent(res as string);
        const result: TopBookInfo[] = handlerSearch(value);
        resolve(result);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

function paraseSearchContent(res: string) {
  const $ = cheerio.load(res);
  let targetScript = "";
  let initialPropsStr = null;
  $("script").each((index, element) => {
    const scriptText = $(element).text();
    if (scriptText.includes("window.__INITIAL_PROPS__")) {
      targetScript = scriptText;
      return false; // 找到后就停止遍历
    }
  });

  // 找到window.__INITIAL_PROPS__在脚本中的起始位置
  const startIndex = targetScript.indexOf("window.__INITIAL_PROPS__ =");
  if (startIndex !== -1) {
    // 提取等号后面的JSON字符串部分（去除末尾可能多余的分号等）
    let jsonStr = targetScript.substring(startIndex + "window.__INITIAL_PROPS__ =".length).trim();
    if (jsonStr.endsWith(";")) {
      jsonStr = jsonStr.slice(0, -1).trim();
    }
    try {
      initialPropsStr = JSON.parse(jsonStr);
    } catch (error) {
      initialPropsStr = {};
      console.error("解析JSON字符串失败：", error);
    }
  }
  return initialPropsStr;
}

const handlerSearch = (value: any) => {
  let bookList = value?.initialData?.data?.item?.novel_list?.novel_item || [];
  bookList = bookList.map((i: any) => {
    return {
      bookName: i.title,
      author: i.author,
      image: i.icon,
      categories: i.second_category,
      description: i.description,
      status: i.status,
      tag: i.tag,
    };
  });

  return bookList;
};

const formatUrl = (origin: string, params: { gender: string; cate: string; rank: string }) => {
  let str = `${origin}`;

  Object.entries(params).forEach(([key, value], index) => {
    if (index === 0) {
      str += `?${key}=${value}`;
    } else {
      str += `&${key}=${value}`;
    }
  });

  return str;
};
