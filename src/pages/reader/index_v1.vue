<template>
  <view :class="['book', showMenu ? 'showMenu' : 'hide_menu', currentTheme.thmeName, 'reader']">
    <!-- 顶部菜单 -->
    <view
      class="top_menu"
      :style="{
        'padding-top': appOption.statusBarHeight + 'px',
        color: currentTheme.text,
        'background-color': currentTheme.optionColor,
      }"
    >
      <view class="back" @click="goBack()">
        <g-icon-fonts name="arrowleft" size="20" :color="currentTheme.text" />
      </view>
      <view class="option">
        <view class="title">{{ title }}</view>
        <view class="right">
          <g-icon-fonts
            name="shuqian"
            size="20"
            :color="isInMarks > -1 ? currentTheme.cacheColor : currentTheme.text"
            @click="switchMarks"
          />
          <g-icon-fonts
            class="shujia"
            name="jiarushujia"
            size="20"
            @click="switchSheleves"
            :color="isInBookShelvesIndex > -1 ? currentTheme.cacheColor : currentTheme.text"
          />
          <view class="huanyuan">换源</view>
        </view>
      </view>
    </view>

    <view
      id="chapter"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      :style="{
        'background-color': currentTheme.themeColor,
        color: currentTheme.text,
        padding: `${bookOption.sizeInfo.tPadding}px ${bookOption.sizeInfo.lrPadding}px  ${bookOption.sizeInfo.bPadding}px`,
      }"
    >
      <view class="title">{{ pageIndex > 0 ? title : bookInfo.bookName }}</view>
      <section
        id="reader-section"
        :style="{
          'font-size': bookOption.sizeInfo.p + 'px',
          transform: readerSectionStyle.transform,
          transition: readerSectionStyle.transition,
        }"
      >
        <view
          :style="{
            'font-size': bookOption.sizeInfo.title + 'px',
            'line-height': bookOption.sizeInfo.tLineHeight + 'px',
            'margin-bottom': bookOption.sizeInfo.titleMargin + 'px',
            'text-align': 'center',
          }"
        >
          {{ title }}
        </view>
        <p
          v-for="item in contentList"
          :style="{
            'text-indent': 2 * bookOption.sizeInfo.p + 'px',
          }"
        >
          {{ item }}
        </p>
        <p id="anchro_last_p" style="width: 100%; height: 0"></p>
      </section>

      <view class="pagination">
        {{ `${pageIndex + 1}/${pageCount}` }}
      </view>
    </view>

    <view :class="['slider_info_window', sliderWindowInfo.show ? '' : 'hide_info_window']">
      <view
        class="info"
        :style="{
          'background-color': currentTheme.sliderWindowColor,
          color: currentTheme.sliderWindowText,
        }"
      >
        <view class="title">{{ sliderWindowInfo.title }}</view>
        <view class="percent">{{ sliderWindowInfo.percent }}%</view>
      </view>
    </view>

    <!-- 底部菜单 -->
    <view
      class="bottom"
      :style="{
        color: currentTheme.text,
        'background-color': currentTheme.optionColor,
      }"
    >
      <view
        class="btns"
        :style="{
          color: currentTheme.settingColorText,
        }"
        @click="sliderWindowInfo.show = false"
      >
        <view class="btn" @click="openCataLog">
          <g-icon-fonts name="mulu" size="22" :color="currentTheme.settingColor" />
          <text class="text">目录</text>
        </view>
        <view class="btn" @click="switchThemeDark">
          <g-icon-fonts
            :name="bookOption.theme === 'dark' ? 'baitian' : 'night'"
            size="22"
            :color="currentTheme.settingColor"
          />
          <text class="text">{{ bookOption.theme === "dark" ? "白天" : "夜间" }}</text>
        </view>
        <view class="btn" @click="changeSetType('set')">
          <g-icon-fonts name="shezhi" size="22" :color="currentTheme.settingColor" />
          <text class="text">设置</text>
        </view>
        <view class="btn" @click="changeSetType('cache')">
          <g-icon-fonts name="huancun" size="22" :color="currentTheme.settingColor" />
          <text class="text">缓存</text>
        </view>
      </view>
    </view>

    <view
      :class="['switch', showMenu && setType === 'slider' ? 'active_type' : '']"
      :style="{
        color: currentTheme.text,
        'background-color': currentTheme.optionColor,
      }"
    >
      <view class="switch_icon" @click="chapterPrev(0)">
        <g-icon-fonts name="arrowleft" size="14" :color="currentTheme.text" />
        <text class="text">上一章</text>
      </view>
      <view style="flex: 1">
        <slider
          :value="chapter"
          :max="bookInfo.links.length - 1"
          :block-color="currentTheme.sliderBlockColor"
          :activeColor="currentTheme.sliderActiveColor"
          :backgroundColor="currentTheme.sliderColor"
          block-size="20"
          @change="(e: any) => sliderChapter(e)"
          @changing="sliderChapterMove"
        />
      </view>
      <view class="switch_icon" @click="chapterNext">
        <text class="text">下一章</text>
        <g-icon-fonts name="arrowright" size="14" :color="currentTheme.text" />
      </view>
    </view>

    <view
      :class="['menus', showMenu && setType === 'set' ? 'active_type' : '']"
      :style="{
        color: currentTheme.text,
        'background-color': currentTheme.optionColor,
      }"
    >
      <view class="menu">
        <view class="menu_tip">字体设置</view>
        <view class="size_setting">
          <view
            class="size_btn"
            :style="{
              'background-color': currentTheme.blockColor,
            }"
            @click="changeFontSize(0)"
          >
            <text>A-</text>
          </view>
          <view class="ft_sz">
            {{ bookOption.sizeInfo.p }}
          </view>
          <view
            class="size_btn"
            :style="{
              'background-color': currentTheme.blockColor,
            }"
            @click="changeFontSize(1)"
          >
            <text>A+</text>
          </view>
        </view>
      </view>
      <view class="menu">
        <view class="menu_tip">背景主题</view>
        <view class="menu_theme">
          <view
            v-for="(item, index) in themes"
            :key="index"
            :class="['theme', bookOption.theme == item.thmeName ? 'theme_on' : '', item.thmeName]"
            :style="{
              'background-color': item.themeColor,
            }"
            @click="switchTheme(item.thmeName)"
          ></view>
        </view>
      </view>
    </view>

    <view
      :class="['cache', showMenu && setType === 'cache' ? 'active_type' : '']"
      :style="{
        color: currentTheme.text,
        'background-color': currentTheme.optionColor,
      }"
    >
      <view class="cache_item" @click="switchCache('parts')">
        <g-icon-fonts
          name="circle-filled"
          size="16"
          :color="cacheType === 'parts' ? currentTheme.cacheColor : currentTheme.text"
        />
        <view
          :style="{
            color: cacheType === 'parts' ? currentTheme.cacheColor : '',
          }"
        >
          缓存本章节后20章
        </view>
      </view>
      <view class="cache_item" @click="switchCache('back')">
        <g-icon-fonts
          name="circle-filled"
          size="16"
          :color="cacheType === 'back' ? currentTheme.cacheColor : currentTheme.text"
        />
        <view
          :style="{
            color: cacheType === 'back' ? currentTheme.cacheColor : '',
          }"
        >
          缓存本章后所有章节
        </view>
      </view>
      <view class="cache_item" @click="switchCache('all')">
        <g-icon-fonts
          name="circle-filled"
          size="16"
          :color="cacheType === 'all' ? currentTheme.cacheColor : currentTheme.text"
        />
        <view
          :style="{
            color: cacheType === 'all' ? currentTheme.cacheColor : '',
          }"
        >
          缓存本书所有章节
        </view>
      </view>
    </view>

    <Catalog
      v-if="isInit && chapterInfo"
      :chapterInfo="chapterInfo"
      @toChapter="(value) => sliderChapter({ detail: { value } })"
      @removeMark="removeMark"
      @toMarkPage="toMarkPage"
      ref="catalog"
    />
    <BookTip v-if="firstTip" @click="closeBookTip" />
  </view>
</template>

<script lang="ts" setup>
import { computed, ref, reactive, nextTick } from "vue";
import { cloneDeep } from "lodash";
import store from "@/store";
import { onLoad, onUnload } from "@dcloudio/uni-app";
import { showLoading, showToast } from "@/utils/Control";
import { getContent } from "@/api/common";
import BookTip from "@/components/BookTip.vue";
import parser from "@/parser/index";

import Catalog from "./components/Catalog.vue";
import { formatDate } from "@/utils/index";

/** 页面是否初始化完成 */
const isInit = ref(false);
/** 页面过渡时间（毫秒） */
const slideTime = 260;
/** 有效拖拽时间（毫秒） */
const dragTime = 300;

const appOption = store.appOption;
/** 小说操作信息 */
const bookOption = store.bookOption;
/** 书架信息 */
const bookShelves = store.bookShelves.data;
/** 样式参数 */
const styleInfo = reactive({
  pagePaddingTop: 8,
  pagePaddingRight: 16,
  infoHeight: 30,
  infoMarginBottom: 10,
  /** 段落缩进 */
  indent: 24,
});

/** 显示菜单 */
const showMenu = ref(false);
/** 触摸位置 */
let touchPosition = 0;
/** 触摸的时间 */
let touchTime = 0;
/** 首次打开提示 */
const firstTip = ref(false);
/** 是否开始触摸 */
let startTouch = false;
/** 目录dom */
const catalog = ref<InstanceType<typeof Catalog>>();

/** 阅读器样式主题 */
const themes = [
  {
    thmeName: "light",
    text: "#0D0700",
    blockColor: "#C7C1BA",
    sliderColor: "#D0CAC3",
    sliderActiveColor: "#C3BDB6",
    sliderBlockColor: "#DFD8D2",
    sliderWindowColor: "#615A54",
    sliderWindowText: "#DFD8D2",
    themeColor: "#DFD8D2",
    optionColor: "#D7D1CA",
    settingColor: "#625B55",
    settingColorText: "#928C85",
    settingColorActive: "#C14843",
    cacheColor: "#ae570e",
  },
  {
    thmeName: "dark",
    text: "#9F9992",
    blockColor: "#362F29",
    sliderColor: "#362F29",
    sliderActiveColor: "#3E3831",
    sliderBlockColor: "#6D6660",
    sliderWindowColor: "#715852",
    sliderWindowText: "#DFD8D2",
    themeColor: "#231C16",
    optionColor: "#2C261F",
    settingColor: "#7D7770",
    settingColorText: "#5F5952",
    settingColorActive: "#CF514C",
    cacheColor: "#cb776e",
  },
  {
    thmeName: "eyeProtect",
    text: "#1F2111",
    blockColor: "#BCBDAE",
    sliderColor: "#BCBDAE",
    sliderActiveColor: "#B0B1A2",
    sliderBlockColor: "#D1D0C4",
    sliderWindowColor: "#5C5F52",
    sliderWindowText: "#DFD8D2",
    themeColor: "#BCC2AE",
    optionColor: "#CACBBC",
    settingColor: "#525344",
    settingColorText: "#787A6A",
    settingColorActive: "#46774C",
    cacheColor: "#396f21",
  },
  {
    thmeName: "pink",
    text: "#340E03",
    blockColor: "#CFBEB6",
    sliderColor: "#CFBEB6",
    sliderActiveColor: "#C2B0A8",
    sliderBlockColor: "#DDD1CA",
    sliderWindowColor: "#6C5A53",
    sliderWindowText: "#DFD8D2",
    themeColor: "#DBC3BA",
    optionColor: "#DDCDC6",
    settingColor: "#65463C",
    settingColorText: "#8B7269",
    settingColorActive: "#AA584F",
    cacheColor: "#cf5944",
  },
  {
    thmeName: "emulate",
    text: "#332408",
    blockColor: "#A89672",
    sliderColor: "#A89673",
    sliderActiveColor: "#9F8C6A",
    sliderBlockColor: "#C2B49B",
    sliderWindowColor: "#665B49",
    sliderWindowText: "#DFD8D2",
    themeColor: "#BCAD8D",
    optionColor: "#B2A07C",
    settingColor: "#59492A",
    settingColorText: "#756544",
    settingColorActive: "#845C1C",
    cacheColor: "#a10909",
  },
];
/** 当前章节 */
const chapter = ref(0);
/**  当前页 */
const pageIndex = ref(0);
/** 总页数 */
const pageCount = ref(0);
/** 拖拽信息窗口 */
const sliderWindowInfo = reactive({
  show: false,
  title: "",
  percent: "",
});
/** 是否为第一页 */
const isFirstPage = computed(() => pageIndex.value === 0 && chapter.value === 0);
/** 否最后一页 */
const isLastPage = computed(
  () => pageIndex.value === pageCount.value - 1 && chapter.value === bookInfo.links.length - 1,
);
/** 当前主题色 */
const currentTheme = computed(() => themes.find((i) => i.thmeName === bookOption.theme) || themes[0]);
/** 容器样式 */
const readerSectionStyle = reactive({
  transition: "0s all",
  transform: "translateX(0px)",
});
/** 源信息 */
let bookInfo: bookInfo;
/** uid信息 */
let chapterInfo: chapterInfo;
/** touch时原transLateX值 */
let currentTranslateX: number;
/** 小说uid信息 */
let uid: string;
/** 章节内容 */
const contentList = ref<string[]>([]);
/** 标题 */
const title = ref("");
/** 设置界面 */
const setType = ref<"slider" | "set" | "cache">("slider");
/** 缓存类型 */
const cacheType = ref<"parts" | "back" | "all">("parts");
/** 缓存范围 */
const cacheRange = computed(() => {
  let min = chapter.value + 1,
    length = bookInfo.links.length - 1,
    max = min + 20 >= length ? length : min + 20;
  if (length === chapter.value) {
    min = max = length;
  }
  switch (cacheType.value) {
    case "back":
      max = length;
      break;
    case "all":
      min = 0;
      max = length;
      break;
    default:
      break;
  }
  return {
    min,
    max,
  };
});
/** 否在书架 */
const isInBookShelvesIndex = computed(() => {
  return bookShelves.findIndex((i) => i.uid === uid);
});
/** 否在书签 */
const isInMarks = computed(() => {
  return chapterInfo?.mark?.findIndex(
    (i) => i.chapter === chapter.value && i.pageIndex === pageIndex.value && i.pageCount === pageCount.value,
  );
});

function switchMarks() {
  const idx = chapterInfo.mark.findIndex(
    (i) => i.chapter === chapter.value && i.pageIndex === pageIndex.value && i.pageCount === pageCount.value,
  );

  if (idx > -1) {
    // 移除书签
    chapterInfo.mark.splice(idx, 1);
  } else {
    // 加入书签
    chapterInfo.mark.unshift({
      pageIndex: pageIndex.value,
      pageCount: pageCount.value,
      chapter: chapter.value,
      title: title.value,
      time: formatDate(new Date()),
    });
  }
  updateBookStorage();
}

function switchSheleves() {
  if (isInBookShelvesIndex.value > -1) {
    bookShelves.splice(isInBookShelvesIndex.value, 1);
  } else {
    let data = Object.assign(cloneDeep(bookInfo), {
      uid: uid,
      latestReadeTimestamp: new Date().getTime(),
      chapter: chapter.value,
      pageIndex: pageIndex.value,
    }) as BooksShelvesData;

    bookShelves.unshift(data);
  }

  store.modifyTempData({
    author: bookInfo.author,
    bookName: bookInfo.bookName,
    uid,
  });
  store.saveBookShelves();
}

function saveHistory() {
  let data = Object.assign(cloneDeep(bookInfo), {
    uid: uid,
    latestReadeTimestamp: new Date().getTime(),
    chapter: chapter.value,
    pageIndex: pageIndex.value,
  }) as BooksShelvesData;

  store.modifyHistoryBookShelves(data);
}

function getCacheList() {
  const list = [];

  for (let index = cacheRange.value.min; index <= cacheRange.value.max; index++) {
    if (!chapterInfo.cache[index]) {
      list.push(index);
    }
  }

  return list;
}

function changeSetType(type: "slider" | "set" | "cache") {
  if (setType.value === type) {
    setType.value = "slider";
  } else {
    setType.value = type;
  }
}

function openCataLog() {
  catalog.value?.show();
}

/** 滑动 */
function sliderChapterMove(e: any) {
  const value = e.detail.value;
  const percent = ((value + 1) * 100) / bookInfo.links.length;
  sliderWindowInfo.show = true;
  sliderWindowInfo.title = bookInfo.links[value].text;
  sliderWindowInfo.percent = percent.toFixed(2);
}
/** 滑动切换章节 */
function sliderChapter(e: any, cb?: () => void) {
  pageIndex.value = 0;
  const value = e.detail.value;

  getChapterData(value, (res) => {
    updateSection(res, () => {
      chapter.value = value;
      readerSectionStyle.transition = "0s";
      updateBookStorage();

      cb && cb();
      turnPage();
      getCacheData(getCacheList());
    });
  });
}

function toMarkPage(params: { chapter: number; pageIndex: number; pageCount: number }) {
  sliderChapter({ detail: { value: params.chapter } }, () => {
    if (pageCount.value === params.pageCount) {
      pageIndex.value = params.pageIndex;
    } else {
      const percent = params.pageIndex / params.pageCount;
      pageIndex.value = Math.floor(pageCount.value * percent);
    }
  });
}

function removeMark(index: number) {
  chapterInfo?.mark.splice(index, 1);
  updateBookStorage();
}
function changeFontSize(type: number) {
  if (type) {
    if (bookOption.sizeInfo.p >= 28) return showToast("已经是最大字体了");
    bookOption.sizeInfo.title++;
    bookOption.sizeInfo.p++;
  } else {
    if (bookOption.sizeInfo.p <= 14) return showToast("已经是最小字体了");
    bookOption.sizeInfo.title--;
    bookOption.sizeInfo.p--;
  }
  bookOption.sizeInfo.tLineHeight = bookOption.sizeInfo.title * 1.5;
  bookOption.sizeInfo.pLineHeight = bookOption.sizeInfo.p * 1.5;
  store.saveBookOption();
  updateChapterPage();
}

function switchThemeDark() {
  const theme = bookOption.theme === "dark" ? bookOption.themeLight : "dark";
  switchTheme(theme);
}
function switchCache(type: "back" | "parts" | "all") {
  if (cacheType.value == type) {
    return;
  }
  cacheType.value = type;

  getCacheData(getCacheList());
}
function switchTheme(theme: string) {
  if (theme !== "dark") {
    bookOption.themeLight = theme;
  }
  bookOption.theme = theme;
  store.saveBookOption();
}

function getCacheData(chapters: Array<number>) {
  const setCacheData = (index: number, chapterIndex: number, preCacheIndex: number) => {
    // #ifdef H5
    getContent({
      url: `${bookInfo.origin}${bookInfo.links[chapterIndex].href}`,
    })
      .then((res) => {
        const data = res.data;
        const content = {
          title: bookInfo.links[chapterIndex].text,
          content: data.data,
        };
        chapterInfo.cache[chapterIndex] = content;
        updateBookStorage();
      })
      .finally(() => {
        // 1. 所有章节变动的时候都会去调用getCacheData方法查询需要缓存的内容
        // 2. 当章节变动的时候停止上一次的异步递归，去调用新的递归缓存
        if (preCacheIndex === chapter.value) {
          search(index + 3);
        }
      });
    // #endif

    // #ifdef APP-PLUS
    parser
      .getPageContent({
        url: `${bookInfo.origin}${bookInfo.links[chapterIndex].href}`,
      })
      .then((res) => {
        const data = res;
        const content = {
          title: bookInfo.links[chapterIndex].text,
          content: data.data,
        };
        chapterInfo.cache[chapterIndex] = content;
        updateBookStorage();
      })
      .finally(() => {
        // 1. 所有章节变动的时候都会去调用getCacheData方法查询需要缓存的内容
        // 2. 当章节变动的时候停止上一次的异步递归，去调用新的递归缓存
        if (preCacheIndex === chapter.value) {
          search(index + 3);
        }
      });
    // #endif
  };

  function search(index: number) {
    const chapterIndex = chapters[index];
    // 1. 已经缓存的章节不需要缓存
    // 2. 必须在cacheRange范围内的数据才能缓存
    if ((chapterIndex || chapterIndex === 0) && !chapterInfo.cache[chapterIndex]) {
      if (chapterIndex >= cacheRange.value.min && chapterIndex <= cacheRange.value.max) {
        setCacheData(index, chapterIndex, chapter.value);
      }
    }
  }
  // 开启三个请求实列
  search(0);
  search(1);
  search(2);
}

function updateChapterPage() {
  const percent = pageIndex.value / pageCount.value;
  nextTick(() => {
    readerSectionStyle.transition = "0s all";
    updatePageCount();
    pageIndex.value = Math.floor(pageCount.value * percent);
    turnPage();
  });
}

function getReaderTranslateX() {
  const transform = readerSectionStyle.transform;
  let x = 0;
  if (transform) {
    const regex = /translateX\((-?\d+(?:\.\d+)?)\px\)/;
    const match = transform.match(regex);
    if (match && match[1]) {
      x = parseFloat(match[1]);
    }
  }

  return x;
}

function onTouchStart(e: TouchEvent) {
  startTouch = true;
  const pageX = e.touches[0].pageX;
  touchPosition = pageX;

  touchTime = Date.now();

  currentTranslateX = getReaderTranslateX();
}

function onTouchMove(e: TouchEvent) {
  if (!startTouch) return;

  if (showMenu.value) return;
  const pageX = e.touches[0].pageX;
  const slide = pageX - touchPosition;
  if (slide < 0 && isLastPage.value) {
    showToast("没有啦~");
    return;
  }
  if (slide > 0 && isFirstPage.value) {
    showToast("当前为第一页");
    return;
  }
  readerSectionStyle.transition = "0s all";
  readerSectionStyle.transform = `translateX(${slide + currentTranslateX}px)`;
}
function onTouchEnd(e: TouchEvent) {
  if (!startTouch) return;
  startTouch = false;
  if (sliderWindowInfo.show) {
    sliderWindowInfo.show = false;
  }
  if (showMenu.value) {
    showMenu.value = false;
    return;
  }
  const pageX = e.changedTouches[0].pageX;
  const slideX = pageX - touchPosition;
  const value = appOption.screenWidth / 3;
  const now = Date.now();

  // /** 返回原来位置 */
  const backPosition = () => {
    readerSectionStyle.transition = "0.4s all";
    readerSectionStyle.transform = `translateX(${currentTranslateX}px)`;
  };
  // 点击事件
  if (Math.abs(slideX) <= 0) {
    if (pageX < value) {
      // pre
      pagePrev();
    } else if (pageX > value * 2) {
      // next
      pageNext();
    } else {
      //点击中间
      setType.value = "slider";
      showMenu.value = true;
    }
  } else {
    // 短时间拖拽和长时间长距离拖拽
    if (now - touchTime < dragTime || (now - touchTime > dragTime && Math.abs(slideX) >= value)) {
      // 拖拽距离大于 1/3
      if (slideX < 0) {
        // next
        pageNext();
      } else {
        // pre
        pagePrev();
      }
    } else {
      backPosition();
    }
  }
}
/** 上一章 */
function chapterPrev(index?: number) {
  getChapterData(chapter.value - 1, (res) => {
    updateSection(res, () => {
      --chapter.value;
      pageIndex.value = index ?? pageCount.value - 1;
      readerSectionStyle.transition = "0s all";
      updateBookStorage();
      turnPage();
      getCacheData(getCacheList());
    });
  });
}

/** 下一章 */
function chapterNext() {
  getChapterData(chapter.value + 1, (res) => {
    updateSection(res, () => {
      ++chapter.value;
      pageIndex.value = 0;
      readerSectionStyle.transition = "0s all";
      updateBookStorage();
      turnPage();
      getCacheData(getCacheList());
    });
  });
}
function pagePrev() {
  if (pageIndex.value === 0) {
    if (isFirstPage.value) {
      showToast("当前为第一页");
    } else {
      // 上一章
      chapterPrev();
    }
  } else {
    // 上一页
    readerSectionStyle.transition = "0.4s all";
    pageIndex.value--;
    updateBookStorage();
    turnPage();
  }
}

function pageNext() {
  // 下一章
  if (pageIndex.value === pageCount.value - 1) {
    if (isLastPage.value) {
      showToast("没有啦~");
    } else {
      // 下一章
      chapterNext();
    }
  } else {
    // 下一页
    pageIndex.value++;
    readerSectionStyle.transition = "0.4s all";
    updateBookStorage();
    turnPage();
  }
}

function turnPage() {
  let translateX =
    (appOption.screenWidth - bookOption.sizeInfo.lrPadding * 2) * -pageIndex.value - pageIndex.value * 32;
  readerSectionStyle.transform = `translateX(${translateX}px)`;
}

async function getChapterData(chapter: number, success: (res: { title: string; content: string[] }) => void) {
  if (chapterInfo.cache[chapter]) {
    success(chapterInfo.cache[chapter]);
  } else {
    showLoading();
    // #ifdef H5
    getContent({
      url: `${bookInfo.origin}${bookInfo.links[chapter].href}`,
    })
      .then((res) => {
        const data = res.data;
        const content = {
          title: bookInfo.links[chapter].text,
          content: data.data,
        };
        chapterInfo.cache[chapter] = content;
        updateBookStorage();
        success(content);
      })
      .finally(() => {
        uni.hideLoading();
      });
    // #endif

    // #ifdef APP-PLUS
    parser
      .getPageContent({
        url: `${bookInfo.origin}${bookInfo.links[chapter].href}`,
      })
      .then((res) => {
        const data = res;
        const content = {
          title: bookInfo.links[chapter].text,
          content: data.data,
        };
        chapterInfo.cache[chapter] = content;
        updateBookStorage();
        success(content);
      })
      .finally(() => {
        uni.hideLoading();
      });
    // #endif
  }
}

function updateSection(res: { title: string; content: string[] }, onSectionUpdated?: () => void) {
  title.value = res.title;
  contentList.value = res.content;

  nextTick(() => {
    updatePageCount();
    turnPage();
    if (onSectionUpdated) {
      onSectionUpdated();
    }
  });
}

function updatePageCount() {
  getNodeInfo("#anchro_last_p").then((res) => {
    setTimeout(() => {
      const right = res?.right ?? 0;
      const scrollWidth = right - bookOption.sizeInfo.lrPadding;
      pageCount.value = (scrollWidth + 32) / (appOption.screenWidth - bookOption.sizeInfo.lrPadding * 2 + 32);
    }, 0);
  });
}

function updateBookStorage() {
  chapterInfo.pageIndex = pageIndex.value;
  chapterInfo.chapter = chapter.value;

  uni.setStorage({
    key: uid,
    data: JSON.stringify(chapterInfo),
  });

  if (isInBookShelvesIndex.value > -1) {
    bookShelves[isInBookShelvesIndex.value].chapter = chapter.value;
    bookShelves[isInBookShelvesIndex.value].pageIndex = pageIndex.value;
    bookShelves[isInBookShelvesIndex.value].latestReadeTimestamp = new Date().getTime();
    store.saveBookShelves();
  }

  saveHistory();
}

function closeBookTip() {
  bookOption.first = firstTip.value = false;
  store.saveBookOption();
}

function goBack() {
  uni.navigateBack();
}

function init(params: any) {
  uid = params?.uid;
  const value = uni.getStorageSync(uid);
  if (value) {
    const info: chapterInfo = JSON.parse(value);
    chapterInfo = reactive(info);
    bookInfo = info.bookInfo;
    pageIndex.value = info.pageIndex;
    chapter.value = info.chapter;

    getChapterData(chapter.value, (res) => {
      updateSection(res, () => {
        isInit.value = true;
        if (bookOption.first) {
          firstTip.value = true;
        }
        if (params.pageCount) {
          if (pageCount.value != params.pageCount) {
            const percent = pageIndex.value / params.pageCount;
            pageIndex.value = Math.floor(pageCount.value * percent);
          }
        }
        getCacheData(getCacheList());
        updateBookStorage();
      });
    });
  }
}

function getNodeInfo(selector: string): Promise<UniApp.NodeInfo | null> {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery();
    query
      .select(selector)
      .boundingClientRect((data) => {
        resolve((data as UniApp.NodeInfo) || null);
      })
      .exec();
  });
}

onLoad((params) => {
  init(params);
});
onUnload(() => {
  const isInBookShevlvs = bookShelves.find((i) => i.uid === uid);
  if (isInBookShevlvs) {
    console.log("在书架");
  } else {
    uni.removeStorage({
      key: uid,
    });
  }
});
</script>

<style lang="scss" scoped>
#chapter {
  height: 100vh;
  overflow: hidden;

  .title,
  .pagination {
    font-size: 24rpx;
    height: 40rpx;
    line-height: 40rpx;
    opacity: 0.4;
  }

  .pagination {
    text-align: right;
  }

  #reader-section {
    columns: calc(100vw - 32px) 1;
    column-gap: 32px;
    margin-top: 20rpx;
    height: calc(100% - 100rpx);

    p {
      line-height: 1.6;
      margin-bottom: 20rpx;
      text-align: justify;
      word-break: break-all;
    }
  }
}

/* 顶部菜单栏 */
.top_menu {
  width: 100%;
  min-height: 88rpx;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  overflow: hidden;
  transition: 0.3s all;
  box-sizing: content-box;
  .back {
    padding: 14rpx;
    width: 80rpx;
  }

  .option {
    font-size: 28rpx;
    flex: 1;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    padding-right: 40rpx;
    .title {
      width: 380rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .right {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 180rpx;
    }
  }

  .option_btn {
    font-size: 30rpx;
    margin-right: 10rpx;
    padding: 10rpx;
  }
}

/* 菜单显示隐藏 */
.hide_menu {
  .top_menu {
    transform: translateY(-100%);
  }

  .bottom {
    transform: translateY(100%);
  }

  .menus {
    transform: translateY(calc(100% + 160rpx));
  }
  .cache {
    transform: translateY(calc(100% + 160rpx));
  }
  .switch {
    transform: translateY(calc(100% + 160rpx));
  }
}
.active_type {
  transform: translateY(0) !important;
}
.slider_info_window {
  z-index: 9;
  position: fixed;
  bottom: 250rpx;
  left: 0;
  width: 100%;
  padding: 0 60rpx;

  .info {
    font-size: 28rpx;
    padding: 20rpx 40rpx;
    text-align: center;
    border-radius: 20rpx;

    .title {
      margin-bottom: 10rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.hide_info_window {
  opacity: 0;
  z-index: -99;
}

.bottom {
  width: 100%;
  position: fixed;
  height: 160rpx;
  bottom: 0;
  left: 0;
  width: 100%;
  transition: 0.3s all;
  z-index: 8;
  padding: 30rpx 0;

  .btns {
    display: flex;
    align-items: center;
    justify-content: space-around;
    .btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      .text {
        padding-top: 6rpx;
      }
    }
  }
}

.switch {
  width: 100%;
  position: fixed;
  bottom: 158rpx;
  left: 0;
  z-index: 5;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  transform: translateY(500%);
  transition: 0.3s all;

  .switch_icon {
    padding: 14rpx;
    display: flex;
    align-items: center;
    .text {
      padding-bottom: 4rpx;
      font-size: 24rpx;
    }
  }
}

.menus {
  width: 100%;
  position: fixed;
  bottom: 158rpx;
  left: 0;
  z-index: 5;
  transform: translateY(500%);
  transition: 0.3s all;
  .menu {
    width: 100%;
    height: 100rpx;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 0 40rpx;

    .menu_tip {
      font-size: 24rpx;
      padding-right: 40rpx;
    }

    .menu_theme {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .theme {
        width: 66rpx;
        height: 66rpx;
        border-radius: 50%;
        box-sizing: border-box;
      }
    }

    .book_pos {
      font-size: 30rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .size_setting {
      flex: 1;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: space-between;
      align-items: center;
    }

    .size_btn {
      flex: 1;
      text-align: center;
      line-height: 70rpx;
      font-size: 30rpx;
      border-radius: 35rpx;
    }

    .ft_sz {
      margin: 0 60rpx;
    }
  }
}
.cache {
  width: 100%;
  position: fixed;
  bottom: 158rpx;
  left: 0;
  z-index: 5;
  padding: 30rpx 40rpx 10rpx;
  transform: translateY(500%);
  transition: 0.3s all;
  .cache_item {
    display: flex;
    align-items: center;
    font-size: 30rpx;
    &:nth-child(2) {
      padding: 20rpx 0;
    }
    view {
      padding-left: 10rpx;
    }
  }
}

/* 内容容器 */
.content {
  width: 100%;
  height: 100%;
  position: relative;

  .page {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.5);
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
  }

  .info_box {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    .name {
      font-size: 30rpx;
      flex: 1;
    }

    .integral {
      padding: 0 40rpx;
      background-color: rgba(0, 0, 0, 0.05);
      line-height: 40rpx;
      border-radius: 20rpx;
      position: relative;

      .text {
        font-size: 28rpx;
        font-weight: bold;
      }

      .icon {
        position: absolute;
        font-size: 30rpx;
        line-height: 50rpx;
        width: 50rpx;
        text-align: center;
        top: -5rpx;
        left: -20rpx;
        border-radius: 50%;
        color: transparent;
      }
    }
  }
}

.theme_on {
  border: 4rpx #aa584f solid;
}
</style>
