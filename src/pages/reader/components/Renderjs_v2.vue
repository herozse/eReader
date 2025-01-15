<template>
  <view
    :prop="rjsChapter"
    :change:prop="renderScript.loadChapter"
    style="position: absolute; display: none; top: -9999px; left: -9999px"
  ></view>
</template>

<script>
export default {
  props: {
    rjsChapter: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {};
  },
  methods: {
    updateContainerContent(params) {
      this.$emit("handelContentUpdated", params);
    },
  },
};
</script>
<script module="renderScript" lang="renderjs" lang="ts">
import { Reader } from "../readerLayout";
export default {
  data() {
    return {
      pageWidth: 0,
      pageHeight: 0,
      statusBarHeight: 0,
      bookOption: {},
      canvas: null,
    };
  },
  methods: {
    loadChapter(newVal, oldValue, ownerInstance, instance) {
      if (newVal?.data?.title && newVal?.data?.title) {
        const { pageWidth, pageHeight, statusBarHeight, bookOption } = newVal.options;
        this.pageWidth = pageWidth;
        this.pageHeight = pageHeight;
        this.statusBarHeight = statusBarHeight;
        this.bookOption = bookOption;
        const d1 = +new Date();
        const chapterPageList = this.updateChapterList(newVal.data);
        this.$ownerInstance.callMethod("updateContainerContent", { params: newVal, chapterPageList });
        const d2 = +new Date();
        console.log(d2 - d1, "total Spend Timer!!!!!");
      }
    },
    updateChapterList(data: { title: string; content: string }) {
      function customRound(num1: number, num2: number) {
        const result = num1 / num2;
        const integerPart = Math.floor(result); // 获取整数部分
        const decimalPart = result - integerPart; // 获取小数部分
        if (decimalPart > 3 / 4) {
          return Math.ceil(result);
        } else {
          return Math.floor(result);
        }
        // return Math.floor(result);
      }
      /** 当前章节的段落列表 */

      const contents = data.content
        .split("\n")
        .map((i) => i.trim())
        .filter((i) => i);

      /** 下边距 */
      const margin = this.bookOption.sizeInfo.margin;
      /** 容器实际宽度 */
      const width = this.pageWidth - this.bookOption.sizeInfo.lrPadding * 2;
      /** 实际一行能展示的宽度 */
      const actualWidth = this.getActualWidth(width);

      /** 计算的页数 */
      let page = 0;
      /** 是否第一页 */
      let firstPage = true;
      /** 一页的字体容器高度 */
      let height = 0;
      /** 一页的字体列表 */
      let list = [];
      /** 下一页超出的数据 */
      let nextPageText = {
        height: 0,
        text: "",
      };

      // 先重置为一个空的数组，因为二维数组的值初始化是`undefined`
      const chapterPageList: Array<{ title: string; content: Array<string>; breakLineIndex?: Array<number> }> = [];
      // 软分段索引值
      const breakLineIdx: Array<number> = [];
      let i = 0;
      while (i < contents.length) {
        // 在这里进行你的操作，比如插入新元素
        const item = contents[i];
        let fontWidth = this.getTextWidth(item, actualWidth, breakLineIdx.includes(i)); // 使用 getTextWidth 来计算文本宽度
        const row = Math.ceil(fontWidth / actualWidth);
        const itemHeight = row * this.bookOption.sizeInfo.pLineHeight + margin;

        if (firstPage) {
          const w = this.getTextWidth(data.title, actualWidth, true, this.bookOption.sizeInfo.title);
          const r = Math.ceil(w / actualWidth);
          const h = r * this.bookOption.sizeInfo.tLineHeight + margin;

          height += h;
          firstPage = false;
        }

        // 把上一页超出的内容加到当前页中去
        if (nextPageText.height) {
          height += nextPageText.height;
          list.push(nextPageText.text);
          // 用完拼接好的页面记得清除
          nextPageText.height = 0;
          nextPageText.text = "";
        }

        // 处理长段落：如果当前段落不能完全放下，分为两部分
        const containerHeight =
          this.pageHeight -
          this.bookOption.sizeInfo.infoHeight -
          this.bookOption.sizeInfo.infoHeight -
          this.bookOption.sizeInfo.tPadding -
          this.bookOption.sizeInfo.bPadding -
          this.statusBarHeight;

        if (height - margin + itemHeight > containerHeight) {
          // 当前段落超出页面，尝试将一部分放到下一页
          const remainingSpace = containerHeight - height; // 剩余的可用空间
          const allowRemainRow = customRound(remainingSpace, this.bookOption.sizeInfo.pLineHeight); // 可填充的行数

          // console.log(
          //   `总空间 ${containerHeight} 第${page + 1}页剩余可用空间 ${remainingSpace} 可填充行数 ${allowRemainRow} 需要填充的字符串 ${item}`,
          // );

          if (allowRemainRow > 0) {
            let currentText = ""; // 当前页已经填充的文本
            let currentLineCount = 0; // 当前页已经填充的行数
            let fontWidth = 0;

            // 逐字符处理，直到文本的宽度大于可以填充的行数宽度
            let remainingText = item; // 剩余的文本

            while (remainingText.length > 0) {
              fontWidth = this.getTextWidth(currentText + remainingText[0], actualWidth); // 加上一个字符的宽度

              const totalWidth = actualWidth * allowRemainRow; // 当前页的总宽度
              // 如果当前行的宽度超出剩余空间，就跳出循环
              if (fontWidth > totalWidth) {
                break;
              }

              currentText += remainingText[0]; // 将当前字符添加到当前页的文本
              remainingText = remainingText.slice(1); // 剩余文本去掉第一个字符
            }

            // 当前页填满后，保存内容
            list.push(currentText);
            height += currentLineCount * this.bookOption.sizeInfo.pLineHeight + margin;

            // 剩余部分的文本
            const nextText = remainingText;

            if (nextText) {
              contents.splice(i + 1, 0, nextText);
              breakLineIdx.push(i + 1);
            }
            // 保存当前页的内容
            chapterPageList[page] = {
              title: "",
              content: list,
            };
            list = [];
            height = 0;
            page++; // 跳到下一页
            i++;
            continue; // 当前段落已经被拆分，跳过继续处理
          }
        }

        // 如果当前段落没有超出页面，直接放到当前页
        list.push(item);
        height += itemHeight;
        // 判断是否超出一页的高度
        if (height - margin > containerHeight) {
          list.pop();
          nextPageText.height = itemHeight;
          nextPageText.text = item;
          chapterPageList[page] = {
            title: "",
            content: list,
          };
          list = [];
          height = 0;
          page++;
        } else {
          if (i === contents.length - 1) {
            // 最后一页
            chapterPageList[page] = {
              title: "",
              content: list,
            };
          }
        }
        i++;
      }

      // 最后一页的标题
      chapterPageList[0].title = data.title;

      if (breakLineIdx.length) {
        let i = 0;
        for (let index = 0; index < chapterPageList.length; index++) {
          const page = chapterPageList[index];

          if (!page.breakLineIndex) {
            page.breakLineIndex = [];
          }
          page.content.forEach((ctx, pos) => {
            if (breakLineIdx.includes(i)) {
              page.breakLineIndex!.push(pos);
            }
            i++;
          });
        }
      }

      return chapterPageList;
    },
    // 获取文本的实际宽度
    getTextWidth(
      text: string,
      actualWidth?: number,
      isBreakLine: boolean = false,
      fontSize: number = this.bookOption.sizeInfo.p,
    ) {
      if (!this.canvas) {
        const cvs = document.createElement("canvas");
        this.canvas = cvs.getContext("2d")!;
      }

      this.canvas.font = `${fontSize}px PingFang SC`; // 设置字体大小

      // 如果文本的第一个字符是半角特殊字符或全角特殊字符，就将它替换为一个中文字符
      if (this.isSpecialCharacter(text.charAt(0))) {
        text = "啊" + text.slice(1); // 用中文字符 '啊' 替换开头的字符
      }

      // 计算实际宽度
      if (!actualWidth) {
        return this.canvas.measureText(text).width;
      }

      // 如果不是软分行段首，即有两个字符缩进
      if (!isBreakLine) {
        text = "啊啊" + text;
      }
      let totalWidth = this.canvas.measureText(text).width;
      if (totalWidth <= actualWidth) {
        return totalWidth;
      }
      // 如果宽度大于实际容器宽度，判断是否有特殊符号，进行换行处理
      // 这里实际是因为，如果下一行是以特殊字符开始，web的排版会自动把上一行的段尾放到下一行的段首，会尽可能的处理以符号开始的情况
      let currentLineWidth = 0;
      let lines = [];
      let textArr = text.split("");
      let line = "";
      // 循环处理每个字符并判断换行
      for (let i = 0; i < textArr.length; i++) {
        let str = line + textArr[i];
        currentLineWidth = this.canvas.measureText(str).width;
        // 如果当前行宽度超过了容器宽度
        if (currentLineWidth <= actualWidth) {
          // 尝试把中间的全角字符转换成一个中文字符
          // 因为  canvas.measureText(str) 中带有全角，计算会不准确
          str = str.replace(/[！“”‘’（）、，．：；＜＞＠@［］＼＾＿｀｛｝｜～]/g, "啊");
          currentLineWidth = this.canvas.measureText(str).width;
        }
        if (currentLineWidth > actualWidth) {
          // 判断是否需要将特殊符号移到下一行
          if (this.isSpecialCharacter(textArr[i])) {
            lines.push(line.slice(0, -1)); // 将当前行最后一个字符挪到下一行
            line = textArr[i - 1];
          } else {
            lines.push(line);
            line = "";
          }
          currentLineWidth = 0; // 重置当前行宽度
        }
        line += textArr[i];
      }

      // 最后一行如果有剩余的文本，则加入
      if (line.length > 0) {
        lines.push(line);
      }

      if (lines.length > 1) {
        totalWidth = actualWidth * (lines.length - 1) + this.canvas.measureText(lines.pop() || "").width;
      }

      return totalWidth;
    },
    // 判断字符是否是半角特殊字符或全角特殊字符
    isSpecialCharacter(char: string) {
      const halfWidthSpecialChars = /[!"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~]/; // 半角特殊字符
      const fullWidthSpecialChars = /[！“”‘’（）、，．：；＜＞＠［］＼＾＿｀｛｝｜～]/; // 全角特殊字符
      return halfWidthSpecialChars.test(char) || fullWidthSpecialChars.test(char);
    },
    getActualWidth(width: number) {
      // 获取一行实际的宽度
      let sizeWidth = 0;
      let str = "啊";
      while (sizeWidth <= width) {
        str += "啊";
        sizeWidth = this.getTextWidth(str);
      }

      return this.getTextWidth(str.slice(1));
    },
  },
};
</script>
<style lang="scss" scoped></style>
