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
    calcByReader(data) {
      const content = {
        tit: data.title,
        cont: data.content,
      };
      const width = this.pageWidth - this.bookOption.sizeInfo.lrPadding * 2;

      const height =
        this.pageHeight -
        this.bookOption.sizeInfo.infoHeight -
        this.bookOption.sizeInfo.infoHeight -
        this.bookOption.sizeInfo.tPadding -
        this.bookOption.sizeInfo.bPadding -
        this.statusBarHeight;

      const list = Reader(content.cont, {
        platform: "browser", // 平台
        id: "canvas", // canvas 对象
        splitCode: "\n", // 段落分割符
        width, // 容器宽度
        height, // 容器高度
        fontSize: this.bookOption.sizeInfo.p, // 段落字体大小
        lineHeight: 1.5, // 段落文字行高
        pGap: this.bookOption.sizeInfo.margin, // 段落间距
        title: content.tit, // 标题
        titleSize: this.bookOption.sizeInfo.title, // 标题字体大小
        titleHeight: 1.5, // 标题文字行高
        titleWeight: 500, // 标题文字字重
        titleGap: this.bookOption.sizeInfo.margin, // 标题距离段落的间距
      });

      return list;
    },
    loadChapter(newVal, oldValue, ownerInstance, instance) {
      if (newVal?.data?.title && newVal?.data?.title) {
        const { pageWidth, pageHeight, statusBarHeight, bookOption } = newVal.options;
        this.pageWidth = pageWidth;
        this.pageHeight = pageHeight;
        this.statusBarHeight = statusBarHeight;
        this.bookOption = bookOption;
        const d1 = +new Date();
        const chapterPageList = this.calcByReader(newVal.data);
        this.$ownerInstance.callMethod("updateContainerContent", { params: newVal, chapterPageList });
        const d2 = +new Date();
        console.log(d2 - d1, "total Spend Timer!!!!!");
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
