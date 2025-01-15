<template>
  <view
    :class="['book', showMenu ? 'showMenu' : 'hide_menu', currentTheme.thmeName, 'reader']"
    :style="{
      backgroundColor: currentTheme.themeColor,
    }"
  >
    <Renderjs :rjsChapter="rjsChapter" @handelContentUpdated="updateContainerContent" />
    <!-- 顶部菜单 -->
    <view
      class="top_menu"
      :style="{
        'padding-top': appOption.statusBarHeight + 'px',
        color: currentTheme.text,
        'background-color': currentTheme.optionColor,
      }"
    >
      <view class="back" @click="goBack">
        <g-icon-fonts name="arrowleft" size="20" :color="currentTheme.text" />
      </view>
      <view class="option">
        <view class="title">{{ bookInfo?.links[chapter]?.text }}</view>
        <view class="right">
          <g-icon-fonts
            name="shuqian"
            size="20"
            :color="isInMarks > -1 ? currentTheme.cacheColor : currentTheme.text"
            @click="switchMarks"
          />
          <g-icon-fonts
            class="shujia"
            :name="isInBookShelvesIndex > -1 ? 'zaishujia' : 'tianjiashujia'"
            size="20"
            @click="switchSheleves"
            :color="isInBookShelvesIndex > -1 ? currentTheme.cacheColor : currentTheme.text"
          />
          <view class="huanyuan" @click="changeOrigin">换源</view>
        </view>
      </view>
    </view>

    <view
      id="chapter"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      :style="{
        color: currentTheme.text,
      }"
    >
      <view
        v-for="(style, index) in styles"
        :class="['page', `page-${bookOption.turnPageType}`]"
        :key="index"
        :style="{
          'background-color': currentTheme.themeColor,
          transition: style.transition,
          transform: 'translate3d(' + style.transform + ',0px,0px)',
          'z-index': style.zIndex,
          padding: `${bookOption.sizeInfo.tPadding}px ${bookOption.sizeInfo.lrPadding}px  ${bookOption.sizeInfo.bPadding}px`,
        }"
      >
        <!-- 顶部状态占位 -->
        <view class="status_bar" :style="{ height: appOption.statusBarHeight + 'px', width: '100%' }"></view>
        <!-- 小说信息 -->
        <view
          class="title"
          :style="{
            height: bookOption.sizeInfo.infoHeight + 'px',
            'line-height': bookOption.sizeInfo.infoHeight + 'px',
            'margin-bottom': bookOption.sizeInfo.infoMarginBottom + 'px',
          }"
        >
          <view class="name">{{ pageIndex > 0 ? bookInfo?.links[chapter].text : bookInfo?.bookName }}</view>
        </view>
        <!-- 小说标题 -->
        <view
          v-show="pageTextList[index].title"
          :style="{
            'font-size': bookOption.sizeInfo.title + 'px',
            'line-height': bookOption.sizeInfo.tLineHeight + 'px',
            'margin-bottom': bookOption.sizeInfo.margin + 'px',
            'text-align': 'center',
          }"
        >
          {{ pageTextList[index].title }}
        </view>

        <!-- 小说段落 -->
        <view
          v-for="(p, pIndex) in pageTextList[index].content"
          :key="pIndex"
          class="no-wrap"
          :style="{
            'font-size': bookOption.sizeInfo.p + 'px',
            'line-height': bookOption.sizeInfo.pLineHeight + 'px',
            'margin-bottom': bookOption.sizeInfo.margin + 'px',
            'text-indent': pageTextList[index].breakLineIndex?.includes(pIndex)
              ? '0'
              : bookOption.sizeInfo.p * 2 + 'px',
            'text-align': 'justify',
            'word-break': 'break-all',
          }"
        >
          {{ p }}
        </view>

        <view
          class="pagination"
          :style="{
            height: bookOption.sizeInfo.pagginationHeight + 'px',
            'line-height': bookOption.sizeInfo.pagginationHeight + 'px',
            bottom: bookOption.sizeInfo.bPadding - 15 + 'px',
            right: bookOption.sizeInfo.lrPadding + 'px',
          }"
        >
          {{ `${pageIndex + 1}/${pageCount}` }}
        </view>
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
      <view class="switch_icon" @click="chapterPrev">
        <g-icon-fonts name="arrowleft" size="14" :color="currentTheme.text" />
        <text class="text">上一章</text>
      </view>
      <view style="flex: 1">
        <slider
          :value="chapter"
          :max="maxChapter"
          :block-color="currentTheme.sliderBlockColor"
          :activeColor="currentTheme.sliderActiveColor"
          :backgroundColor="currentTheme.sliderColor"
          block-size="20"
          @change="(e: any) => sliderChapter(e)"
          @changing="(e: any) => sliderChapterMove(e)"
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
      <!-- <view class="menu">
        <view class="menu_tip">字体设置</view>
        <view class="family_wrap">
          <view
            :class="['size_btn', 'family', bookOption.fontFamilyIndex == index ? 'active' : '']"
            :style="{
              'background-color': currentTheme.blockColor,
            }"
            v-for="(item, index) in bookOption.fontFamilyList"
            @click="switchFamily(index)"
          >
            {{ item.name }}
          </view>
        </view>
      </view> -->
      <view class="menu">
        <view class="menu_tip">翻页方式</view>
        <view class="family_wrap">
          <view
            :class="['size_btn', bookOption.turnPageType == item.key ? 'active' : '']"
            :style="{
              'background-color': currentTheme.blockColor,
            }"
            v-for="(item, index) in turnPageType"
            @click="changePageType(item.key)"
          >
            {{ item.name }}
          </view>
        </view>
      </view>
      <view class="menu">
        <view class="menu_tip">字号设置</view>
        <view class="size_setting">
          <view
            class="size_btn"
            :style="{
              'background-color': currentTheme.blockColor,
            }"
            @click="reduceFontSize"
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
            @click="addFontSize"
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

    <BookTip v-if="firstTip" @click="closeBookTip" />
    <Origin
      v-if="bookInfo"
      ref="origin"
      :bookInfo="bookInfo"
      @handleOriginsChange="handleOriginsChange"
      @setOrigin="setOrigin"
    />
  </view>
</template>

<script lang="ts" setup>
import { computed, ref, reactive, nextTick } from "vue";
import { cloneDeep } from "lodash";
import store from "@/store";
import { onLoad, onUnload } from "@dcloudio/uni-app";
import { showLoading, showToast } from "@/utils/Control";
import BookTip from "@/components/BookTip.vue";
import Renderjs from "./components/Renderjs.vue";
import Origin from "./components/Origin.vue";
import parser from "@/parser/index";
import { formatDate } from "@/utils/index";
import { modifyData } from "@/utils";
import * as api from "@/api/common";

const rjsChapter = ref<{
  chapter: number;
  isPrePage?: number;
  pageCount?: number;
  data: { title: string; content: string };
  options?: {
    pageWidth: number;
    pageHeight: number;
    statusBarHeight: number;
    bookOption: typeof store.bookOption;
  };
}>({
  chapter: 0,
  data: { title: "", content: "" },
});
const origin = ref<PopupInstance | null>(null);
/** 页面过渡时间（毫秒） */
const slideTime = computed(() => {
  if (bookOption.turnPageType === "cover") {
    return 180;
  } else if (bookOption.turnPageType === "none") {
    return 50;
  }
  return 220;
});
/** 有效拖拽时间（毫秒） */
const dragTime = 300;

const appOption = store.appOption;
/** 小说操作信息 */
const bookOption = store.bookOption;
/** 书架信息 */
const bookShelves = store.bookShelves.data;
/** 显示菜单 */
const showMenu = ref(false);
/** 页面负偏移量（负数） */
let pageSlideValue = computed(() => {
  if (bookOption.turnPageType === "transition") {
    return appOption.screenWidth;
  }
  return appOption.screenWidth + 10;
});
/** 触摸位置 */
let touchPosition = 0;
/** 触摸的时间 */
let touchTime = 0;
/** 首次打开提示 */
const firstTip = ref(false);
/** 滑动计时器 */
let slideTimer: NodeJS.Timeout | null;
/** 是否开始触摸 */
let startTouch = false;
/** 小数三个页面样式列表 */
const styles = ref([
  {
    transform: "-102%",
    transition: "0s all",
    zIndex: 3,
  },
  {
    transform: "0px",
    transition: "0s all",
    zIndex: 2,
  },
  {
    transform: "0px",
    transition: "0s all",
    zIndex: 1,
  },
]);
/** 章节阅读器数据 */
const chapterList = ref<Array<Array<{ title: string; content: Array<string>; breakLineIndex?: Array<number> }>>>([]);
/** 页面内容列表 */
const pageTextList = ref<Array<{ title: string; content: Array<string>; breakLineIndex?: Array<number> }>>([
  {
    title: "", // "page-1",
    content: [],
  },
  {
    title: "", // "page-2",
    content: [],
  },
  {
    title: "", // "page-3",
    content: [],
  },
]);
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
/** 源信息 */
let bookInfo: bookInfo;
/** 当前章节 */
const chapter = ref(0);
/**  当前页 */
const pageIndex = ref(0);
/** 总页数 */
const pageCount = computed(() => chapterList.value[chapter.value]?.length || 0);
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
  () => pageIndex.value === pageCount.value - 1 && chapter.value === bookInfo?.links?.length - 1,
);
const readerFamily = computed(() => bookOption.fontFamilyList[bookOption.fontFamilyIndex].value);
/** 当前主题色 */
const currentTheme = computed(() => themes.find((i) => i.thmeName === bookOption.theme) || themes[0]);
const turnPageType: Array<{ name: string; key: "cover" | "transition" | "none" }> = [
  {
    name: "覆盖",
    key: "cover",
  },
  {
    name: "平移",
    key: "transition",
  },
  {
    name: "无",
    key: "none",
  },
];
/** uid信息 */
let chapterInfo: chapterInfo;
/** 页面高度 */
let pageHeight = 0;
/** 状态栏高度 */
let statusBarHeight = appOption.statusBarHeight;
/** 页面宽度 */
let pageWidth = 0;
/** 小说uid信息 */
let uid: string;
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
const maxChapter = computed(() => (bookInfo?.links?.length ? bookInfo.links.length - 1 : 0));

function changeOrigin() {
  origin.value?.open();
}

function handleOriginsChange(origins: Origins) {
  bookInfo.origins = origins;
  chapterInfo.bookInfo.origins = origins;
  updateBookStorage();
}

function setOrigin(item: OriginItem) {
  const address = item.origin + item.pathname;
  getCatalogs(address);
}

function getCatalogs(adress: string) {
  showLoading("解析中...");
  // #ifdef APP-PLUS
  parser
    .getCatalogs({ url: adress })
    .then((res) => {
      const data = res as bookInfo;
      updateCurrentInfo(data);
    })
    .finally(() => {
      uni.hideLoading();
    });
  // #endif

  // #ifdef H5
  api
    .getCatalogs({ url: adress })
    .then((res) => {
      const data = res.data as bookInfo;
      updateCurrentInfo(data);
      // bookInfo = reactive(data)
    })
    .finally(() => {
      uni.hideLoading();
    });
  // #endif
}
function updateCurrentInfo(data: bookInfo) {
  // remainOrigins
  const title = bookInfo?.links[chapter.value]?.text;
  const origins = bookInfo.origins;
  bookInfo = reactive(data);
  bookInfo.origins = origins;

  // set chapter index
  let index = data.links.findIndex((i) => i.text === title);
  if (index === -1) {
    if (data.links[chapter.value]) {
      index = chapter.value;
    } else {
      index = 0;
    }
  }
  chapterInfo = reactive({
    bookInfo,
    cache: [],
    mark: [],
    pageIndex: 0,
    chapter: index,
    uid: chapterInfo.uid,
  });
  chapter.value = index;

  // modify bookshelves
  if (isInBookShelvesIndex.value > -1) {
    const currentBook = bookShelves[isInBookShelvesIndex.value];
    modifyData(currentBook, bookInfo);
  }

  origin.value?.close();
  changeChapter({ chapter: chapter.value });
  updateBookStorage();
}

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
      title: bookInfo.links[chapter.value].text,
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
  let theme = bookOption.theme === "dark" ? "dark" : "light";
  uni.navigateTo({
    url: `/pages/catalogs/index?theme=${theme}&refreshTime=${new Date().getTime()}`,
  });
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
function sliderChapter(e: any) {
  const value = Number(e.detail.value);
  changeChapter({ chapter: value });
}

function addFontSize() {
  if (bookOption.sizeInfo.p >= 39) return showToast("已经是最大字体了");
  if (bookOption.sizeInfo.p >= 25) {
    bookOption.sizeInfo.title = bookOption.sizeInfo.title + 2;
    bookOption.sizeInfo.p = bookOption.sizeInfo.p + 2;
  } else {
    bookOption.sizeInfo.title++;
    bookOption.sizeInfo.p++;
  }

  bookOption.sizeInfo.tLineHeight = bookOption.sizeInfo.title * 1.5;
  bookOption.sizeInfo.pLineHeight = bookOption.sizeInfo.p * 1.5;
  store.saveBookOption();

  getChapterData(chapter.value, (res) => {
    rjsChapter.value = {
      chapter: chapter.value,
      data: res,
      options: {
        pageWidth,
        pageHeight,
        statusBarHeight,
        bookOption,
      },
    };
  });
}

/** 缩小字体 */
function reduceFontSize() {
  if (bookOption.sizeInfo.p <= 12) return showToast("已经是最小字体了");
  if (bookOption.sizeInfo.p > 25) {
    bookOption.sizeInfo.title = bookOption.sizeInfo.title - 2;
    bookOption.sizeInfo.p = bookOption.sizeInfo.p - 2;
  } else {
    bookOption.sizeInfo.title--;
    bookOption.sizeInfo.p--;
  }

  bookOption.sizeInfo.tLineHeight = bookOption.sizeInfo.title * 1.5;
  bookOption.sizeInfo.pLineHeight = bookOption.sizeInfo.p * 1.5;
  store.saveBookOption();

  getChapterData(chapter.value, (res) => {
    rjsChapter.value = {
      chapter: chapter.value,
      data: res,
      options: {
        pageWidth,
        pageHeight,
        statusBarHeight,
        bookOption,
      },
    };
  });
}

function changePageType(key: "cover" | "transition" | "none") {
  if (bookOption.turnPageType === key) return;
  bookOption.turnPageType = key;
  resetPage();
  store.saveBookOption();
}

function switchFamily(index: number) {
  if (bookOption.fontFamilyIndex === index) return;
  bookOption.fontFamilyIndex = index;
  store.saveBookOption();
  getChapterData(chapter.value, (res) => {
    rjsChapter.value = {
      chapter: chapter.value,
      data: res,
      options: {
        pageWidth,
        pageHeight,
        statusBarHeight,
        bookOption,
      },
    };
  });
}

function updateContainerContent(cjs: {
  params: {
    chapter: number;
    pageCount?: number;
    isPrePage?: number;
    data: {
      title: string;
      content: string;
    };
  };
  chapterPageList: {
    title: string;
    content: string[];
    breakLineIndex?: number[] | undefined;
  }[];
}) {
  const { params, chapterPageList } = cjs;
  chapterList.value[params.chapter] = chapterPageList;
  if (Object.prototype.hasOwnProperty.call(params, "isPrePage")) {
    loadPrePage(params.chapter, params.isPrePage!);
    return;
  }
  updateContent();
  if (params.pageCount) {
    if (pageCount.value != params.pageCount) {
      const percent = pageIndex.value / params.pageCount;
      pageIndex.value = Math.floor(pageCount.value * percent);
    }
  }
  getCacheData(getCacheList());
  updateBookStorage();
}

/** 切换到上一页 */
function pagePrev() {
  if (bookOption.turnPageType === "cover") {
    styles.value[0].transition = `${slideTime.value}ms all`;
    styles.value[0].transform = "0px";

    styles.value[1].transition = "0s all";
    styles.value[1].transform = "0px";

    styles.value[2].transition = "0s all";
    styles.value[2].transform = "0px";
  } else if (bookOption.turnPageType === "transition") {
    styles.value[0].transition = `${slideTime.value}ms all`;
    styles.value[0].transform = "0px";

    styles.value[1].transition = `${slideTime.value}ms all`;
    styles.value[1].transform = `${pageSlideValue.value}px`;

    styles.value[2].transition = "0s all";
    styles.value[2].transform = "0px";
  }
  slideTimer = setTimeout(() => {
    if (pageIndex.value > 0) {
      pageIndex.value--;
    } else {
      chapter.value--;
      pageIndex.value = chapterList.value[chapter.value].length - 1;
    }
    updateContent();
    resetPage();
    clearTimeout(slideTimer!);
    slideTimer = null;
    updateBookStorage();
  }, slideTime.value);
}

/** 切换到下一页 */
function pageNext() {
  if (bookOption.turnPageType === "cover") {
    styles.value[0].transition = "0s all";
    styles.value[0].transform = `${-pageSlideValue.value}px`;

    styles.value[1].transition = `${slideTime.value}ms all`;
    styles.value[1].transform = `${-pageSlideValue.value}px`;

    styles.value[2].transition = "0s all";
    styles.value[2].transform = "0px";
  } else if (bookOption.turnPageType === "transition") {
    styles.value[0].transition = "0s all";
    styles.value[0].transform = `${-pageSlideValue.value}px`;

    styles.value[1].transition = `${slideTime.value}ms all`;
    styles.value[1].transform = `${-pageSlideValue.value}px`;

    styles.value[2].transition = `${slideTime.value}ms all`;
    styles.value[2].transform = "0px";
  }
  slideTimer = setTimeout(() => {
    if (pageIndex.value == chapterList.value[chapter.value].length - 1) {
      chapter.value++;
      pageIndex.value = 0;
    } else {
      pageIndex.value++;
    }
    updateContent();
    resetPage();
    clearTimeout(slideTimer!);
    slideTimer = null;
    updateBookStorage();
  }, slideTime.value);
}

function resetPage() {
  styles.value[0].transition = "0s all";
  styles.value[0].transform = `${-pageSlideValue.value}px`;

  styles.value[1].transition = "0s all";
  styles.value[1].transform = "0px";

  styles.value[2].transition = "0s all";
  if (bookOption.turnPageType === "transition") {
    styles.value[2].transform = `${pageSlideValue.value}px`;
  } else {
    styles.value[2].transform = "0px";
  }
}

function onTouchStart(e: TouchEvent) {
  if (slideTimer) return;
  const pageX = e.touches[0].pageX;
  const pageY = e.touches[0].pageY;
  // safearea
  if (appOption.screenHeight - pageY < 20) return;
  startTouch = true;
  touchPosition = pageX;
  touchTime = Date.now();
}

function onTouchMove(e: TouchEvent) {
  if (!startTouch) return;
  if (showMenu.value) return;
  const pageX = e.touches[0].pageX;
  const slide = pageX - touchPosition;
  if (slide < 0) {
    if (isLastPage.value) return;
    if (bookOption.turnPageType === "cover") {
      styles.value[1].transition = "0s all";
      styles.value[1].transform = `${slide}px`;
    } else if (bookOption.turnPageType === "transition") {
      styles.value[1].transition = "0s all";
      styles.value[1].transform = `${slide}px`;
      styles.value[2].transition = "0s all";
      styles.value[2].transform = `${pageSlideValue.value + slide}px`;
    } else if (bookOption.turnPageType === "none") {
      styles.value[1].transition = "0s all";
      styles.value[1].transform = `0px`;
    }
  } else {
    if (isFirstPage.value) return;
    if (bookOption.turnPageType === "cover") {
      styles.value[0].transition = "0s all";
      styles.value[0].transform = `${-pageSlideValue.value + slide}px`;
    } else if (bookOption.turnPageType === "transition") {
      styles.value[0].transition = "0s all";
      styles.value[0].transform = `${-pageSlideValue.value + slide}px`;
      styles.value[1].transition = "0s all";
      styles.value[1].transform = `${slide}px`;
    } else if (bookOption.turnPageType === "none") {
      styles.value[0].transition = "0s all";
      styles.value[0].transform = `0px`;
    }
  }
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
  const now = Date.now();
  const slideX = pageX - touchPosition;
  const value = pageWidth / 3;
  /** 返回原来位置 */
  const backPosition = () => {
    if (bookOption.turnPageType === "cover") {
      styles.value[0].transition = `${slideTime.value}ms all`;
      styles.value[0].transform = `${-pageSlideValue.value}px`;
      styles.value[1].transition = `${slideTime.value}ms all`;
      styles.value[1].transform = "0px";
    } else if (bookOption.turnPageType === "transition") {
      styles.value[0].transition = `${slideTime.value}ms all`;
      styles.value[0].transform = `${-pageSlideValue.value}px`;
      styles.value[1].transition = `${slideTime.value}ms all`;
      styles.value[1].transform = "0px";
      styles.value[2].transition = `${slideTime.value}ms all`;
      styles.value[2].transform = `${pageSlideValue.value}px`;
    }
  };
  // 点击事件
  if (Math.abs(slideX) <= 0) {
    if (pageX < value) {
      // pre
      if (isFirstPage.value) {
        showToast("没有上一页了");
      } else {
        pagePrev();
      }
    } else if (pageX > value * 2) {
      // next
      if (isLastPage.value) {
        showToast("当前为最后一页");
      } else {
        pageNext();
      }
    } else {
      //点击中间
      setType.value = "slider";
      showMenu.value = true;
    }
  } else {
    // 短时间拖拽和长时间长距离拖拽
    if (now - touchTime < dragTime || (now - touchTime > dragTime && Math.abs(slideX) >= value)) {
      // 拖拽距离大于 1/3
      if (slideX > 0) {
        if (isFirstPage.value) {
          showToast("没有上一页了");

          backPosition();
        } else {
          pagePrev();
        }
      } else {
        if (isLastPage.value) {
          showToast("当前为最后一页");
          backPosition();
        } else {
          pageNext();
        }
      }
    } else {
      // 重置当前页和上一页的回弹
      backPosition();
    }
  }
}

/** 上一章 */
function chapterPrev() {
  if (chapter.value === 0) return showToast("当前为第一章");
  changeChapter({ chapter: chapter.value - 1 });
}

/** 下一章 */
function chapterNext() {
  if (chapter.value === bookInfo.links.length - 1) return showToast("当前小说已完结");
  changeChapter({ chapter: chapter.value + 1 });
}

function changeChapter(params: { chapter: number; pageIndex?: number; pageCount?: number }) {
  getChapterData(params.chapter, (res) => {
    chapter.value = params.chapter;
    pageIndex.value = params.pageIndex || 0; // 重置章节到第一页

    let obj: any = {
      chapter: chapter.value,
      data: res,
      options: {
        pageWidth,
        pageHeight,
        statusBarHeight,
        bookOption,
      },
    };
    if (params.pageCount) {
      obj.pageCount = params.pageCount;
    }
    rjsChapter.value = obj;
  });
}
/** 更新3个页面的文章内容 */
function updateContent() {
  /** 当前章节内容列表 */
  const contents = chapterList.value[chapter.value];

  // 调整字体由大到小的时候，章节列表会对应的缩短，所以要检测当前章节的页数位置
  if (pageIndex.value > contents.length - 1) {
    pageIndex.value = contents.length - 1;
  }

  // 上一页显示的内容 =====================================================================
  if (isFirstPage.value) {
    pageTextList.value[0].title = "";
    pageTextList.value[0].content = [];
  } else if (pageIndex.value == 0) {
    // 写到这里...判断加载上一章的篇章
    /** 上一章 */
    const prevChapter = chapter.value - 1;
    // 加载上一章
    getChapterData(prevChapter, (res) => {
      rjsChapter.value = {
        chapter: prevChapter,
        isPrePage: 0,
        data: res,
        options: {
          pageWidth,
          pageHeight,
          statusBarHeight,
          bookOption,
        },
      };
    });
  } else {
    pageTextList.value[0].title = contents[pageIndex.value - 1].title;
    pageTextList.value[0].content = contents[pageIndex.value - 1].content;
    pageTextList.value[0].breakLineIndex = contents[pageIndex.value - 1].breakLineIndex;
  }

  // 当前显示的内容 =====================================================================
  pageTextList.value[1].title = contents[pageIndex.value].title;
  pageTextList.value[1].content = contents[pageIndex.value].content;
  pageTextList.value[1].breakLineIndex = contents[pageIndex.value].breakLineIndex;

  // 下一页显示的内容 =====================================================================
  if (isLastPage.value) {
    // 最后一章最后一页
    pageTextList.value[2].title = "";
    pageTextList.value[2].content = [];
  } else if (pageIndex.value == contents.length - 1) {
    /** 下一章索引 */
    const nextChapter = chapter.value + 1;
    // 加载下一章
    getChapterData(nextChapter, (res) => {
      rjsChapter.value = {
        chapter: nextChapter,
        isPrePage: 2,
        data: res,
        options: {
          pageWidth,
          pageHeight,
          statusBarHeight,
          bookOption,
        },
      };
    });
  } else {
    pageTextList.value[2].title = contents[pageIndex.value + 1].title;
    pageTextList.value[2].content = contents[pageIndex.value + 1].content;
    pageTextList.value[2].breakLineIndex = contents[pageIndex.value + 1].breakLineIndex;
  }
}

function loadPrePage(chapter: number, index: number) {
  if (index === 0) {
    const lastPage = chapterList.value[chapter].length - 1;
    pageTextList.value[0].title = chapterList.value[chapter][lastPage].title;
    pageTextList.value[0].content = chapterList.value[chapter][lastPage].content;
    pageTextList.value[0].breakLineIndex = chapterList.value[chapter][lastPage].breakLineIndex;
  } else if (index === 2) {
    pageTextList.value[2].title = chapterList.value[chapter][0].title;
    pageTextList.value[2].content = chapterList.value[chapter][0].content;
    pageTextList.value[2].breakLineIndex = chapterList.value[chapter][0].breakLineIndex;
  }
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
  const setCacheData = (index: number, pageIndex: number, preCacheIndex: number) => {
    // #ifdef H5
    api
      .getContent({
        url: `${bookInfo.origin}${bookInfo.links[pageIndex].href}`,
      })
      .then((res) => {
        const data = res.data;
        const content = {
          title: bookInfo.links[pageIndex].text,
          content: data.text,
        };
        chapterInfo.cache[pageIndex] = content;
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
        url: `${bookInfo.origin}${bookInfo.links[pageIndex].href}`,
      })
      .then((res) => {
        const data = res;
        const content = {
          title: bookInfo.links[pageIndex].text,
          content: data.text,
        };
        chapterInfo.cache[pageIndex] = content;
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
    const pageIndex = chapters[index];
    // 1. 已经缓存的章节不需要缓存
    // 2. 必须在cacheRange范围内的数据才能缓存
    if ((pageIndex || pageIndex === 0) && !chapterInfo.cache[pageIndex]) {
      if (pageIndex >= cacheRange.value.min && pageIndex <= cacheRange.value.max) {
        setCacheData(index, pageIndex, chapter.value);
      }
    }
  }
  // 开启三个请求实列
  search(0);
  search(1);
  search(2);
}

async function getChapterData(chapter: number, success: (res: { title: string; content: string }) => void) {
  if (chapterInfo.cache[chapter]) {
    success(chapterInfo.cache[chapter]);
  } else {
    showLoading();
    // #ifdef H5
    api
      .getContent({
        url: `${bookInfo.origin}${bookInfo.links[chapter].href}`,
      })
      .then((res) => {
        const data = res.data;
        const content = {
          title: bookInfo.links[chapter].text,
          content: data.text,
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
          content: data.text,
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

function updateBookStorage() {
  chapterInfo.pageIndex = pageIndex.value;
  chapterInfo.chapter = chapter.value;

  uni.setStorage({
    key: uid,
    data: JSON.stringify(chapterInfo),
  });
  uni.setStorage({
    key: "__User_Current_Catalogs__",
    data: JSON.stringify(chapterInfo),
  });
  if (isInBookShelvesIndex.value > -1) {
    bookShelves[isInBookShelvesIndex.value].origins = bookInfo.origins;
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
    bookInfo = reactive(info.bookInfo);

    nextTick(() => {
      pageWidth = appOption.screenWidth;
      pageHeight = appOption.screenHeight;

      if (bookOption.first) {
        firstTip.value = true;
      }
      styles.value[0].transform = `${-pageSlideValue.value}px`;
      if (bookOption.turnPageType === "transition") {
        styles.value[2].transform = `${pageSlideValue.value}px`;
      }
      // 获取数据
      changeChapter({ chapter: info.chapter, pageIndex: info.pageIndex, pageCount: params.pageCount });
    });
  }
}

function removeMark() {
  const value = uni.getStorageSync(uid);
  if (value) {
    const data = JSON.parse(value) as chapterInfo;
    chapterInfo.mark = data.mark;
    updateBookStorage();
  }
}
onLoad((param) => {
  init(param);

  uni.$on("toChapter", (index) => {
    changeChapter({ chapter: index });
  });
  uni.$on("toMarkPage", (params: { chapter: number; pageIndex: number; pageCount: number }) => {
    changeChapter(params);
  });
  uni.$on("removeMark", () => {
    removeMark();
  });
});

onUnload(() => {
  const isInBookShevlvs = bookShelves.find((i) => i.uid === uid);
  if (!isInBookShevlvs) {
    uni.removeStorage({
      key: uid,
    });
  }

  uni.$off("toChapter");
  uni.$off("toMarkPage");
});
</script>

<style lang="scss" scoped>
#chapter {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;

  .page {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5);
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
  }
  .page-transition {
    box-shadow: unset;
  }
  .title,
  .pagination {
    font-size: 24rpx;
    opacity: 0.4;
  }
  .pagination {
    position: absolute;
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
  padding-top: 16rpx;
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
    .family_wrap {
      flex: 1;
      display: flex;
      justify-content: space-between;
      .size_btn {
        margin: 0 10rpx;
        &:nth-child(1) {
          margin-left: 0;
        }
        &:nth-last-child(1) {
          margin-right: 0;
        }
      }

      .active {
        border: 1rpx #aa584f solid;
        color: #aa584f;
      }
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
