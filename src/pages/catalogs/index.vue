<template>
  <view
    id="catalog_container"
    :class="theme === 'dark' ? 'theme_dark' : 'theme_light'"
    :style="{
      'background-color': currentTheme.colorContainer,
    }"
  >
    <view
      class="status_bar"
      :style="{ height: appOption.statusBarHeight + 'px', width: '100%', 'background-color': currentTheme.colorHeader }"
    ></view>
    <view
      class="header"
      :style="{
        'background-color': currentTheme.colorHeader,
        color: currentTheme.colorGrey,
      }"
    >
      <view class="title">
        <g-icon-fonts name="arrowleft" size="16" :color="currentTheme.colorPrimary" @click="backToReader" />
        <text
          class="name"
          :style="{
            color: currentTheme.colorPrimary,
          }"
        >
          {{ chapterInfo.bookInfo.bookName }}
        </text>
      </view>
      <view class="block">
        <view
          class="total"
          :style="{
            color: `rgba(${currentTheme.colorPrimary_RGB}, 0.5)`,
          }"
        >
          共{{ chapterInfo.bookInfo.links.length }}章
        </view>
        <view
          :style="{
            color: currentTab === 'catalog' ? currentTheme.colorPrimary : '',
          }"
          :class="['catalog', currentTab === 'catalog' ? 'active' : '']"
          @click="changeTab('catalog')"
        >
          目录
        </view>
        <view
          :style="{
            color: currentTab === 'bookmark' ? currentTheme.colorPrimary : '',
          }"
          :class="['', currentTab === 'bookmark' ? 'active' : '']"
          @click="changeTab('bookmark')"
        >
          书签
        </view>
        <view
          class="jump"
          @click="jump"
          :style="{
            color: currentTheme.colorPrimary,
          }"
        >
          <g-icon-fonts
            v-if="jumpStatus === JumpType.UP"
            name="qudingbu"
            size="20"
            :color="currentTheme.colorPrimary"
          />
          <g-icon-fonts
            v-if="jumpStatus === JumpType.DOWN"
            name="qudibu"
            size="20"
            :color="currentTheme.colorPrimary"
          />
          <g-icon-fonts
            v-if="jumpStatus === JumpType.NOW"
            name="qudangqian"
            size="20"
            :color="currentTheme.colorPrimary"
          />
          <text class="tip">{{ jumpName }}</text>
        </view>
      </view>
    </view>
    <scroll-view
      v-show="currentTab === 'catalog'"
      :scroll-y="true"
      class="chapter-list"
      :scroll-top="scrollTop"
      :enable-back-to-top="true"
      :scroll-anchoring="true"
      :scroll-with-animation="animation"
      @scroll="handleScroll"
      :style="{
        height: `calc(100% - 200rpx - ${appOption.statusBarHeight}px)`,
      }"
    >
      <view id="catelog_list">
        <view
          v-for="(chapter, index) in visibleChapters"
          :key="index"
          :class="['chapter-item', caches[index] ? 'is_cached' : '']"
          @click.stop.prevent="toChapter(index)"
          :style="{
            'border-bottom': `1px solid rgba(${currentTheme.colorGrey_RGB}, 0.15)`,
          }"
        >
          <view
            class="chapter-title"
            :style="{
              color:
                currentChapter === index
                  ? currentTheme.colorActive
                  : caches[index]
                    ? currentTheme.colorPrimary
                    : currentTheme.colorGrey,
            }"
          >
            {{ chapter.text }}
          </view>
          <view class="cache">
            <g-icon-fonts name="xiazaiyun" size="16" :color="currentTheme.colorGrey" />
          </view>
        </view>
      </view>
    </scroll-view>

    <scroll-view
      v-show="currentTab === 'bookmark'"
      :scroll-y="true"
      class="chapter-list"
      :scroll-top="scrollTopMark"
      :enable-back-to-top="true"
      :scroll-anchoring="true"
      :scroll-with-animation="animation"
      :style="{
        height: `calc(100% - 200rpx - ${appOption.statusBarHeight}px)`,
      }"
    >
      <view class="marks-container">
        <view
          v-for="(item, index) in marks"
          :key="index"
          class="chapter-item"
          :style="{
            'border-bottom': `1px solid rgba(${currentTheme.colorGrey_RGB}, 0.15)`,
          }"
          @click="toMarkPage({ chapter: item.chapter, pageIndex: item.pageIndex, pageCount: item.pageCount })"
        >
          <view
            class="mark-header"
            :style="{
              color: currentTheme.colorPrimary,
            }"
          >
            <view class="chapter-title">{{ item.title }}</view>
            <view class="time" :style="{ color: currentTheme.colorGrey }">
              {{ item.time }} · {{ `（${item.pageIndex + 1}/${item.pageCount}页）` }}
            </view>
          </view>
          <view class="cache" @click.stop="delMark(index)">
            <g-icon-fonts name="shanchu" size="16" :color="currentTheme.colorGrey" />
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { rpxToPx } from "@/utils/index";
import store from "@/store";
import { onLoad, onShow, onUnload } from "@dcloudio/uni-app";
import { reactive } from "vue";
import { modifyData } from "@/utils";

const appOption = store.appOption;
enum JumpType {
  DOWN = "down",
  UP = "up",
  NOW = "now",
}

let chapterInfo: chapterInfo;
let inOutOpener: boolean;
let theme: "light" | "dark" = "light";

const bookOption = store.bookOption;
let isRemoveMarks = false;
const themes = {
  light: {
    colorPrimary: "#251e18",
    colorPrimary_RGB: "37,30,24",
    colorHeader: "#f4eee7",
    colorContainer: "#fef7f1",
    colorActive: "#d44842",
    colorGrey: "#868079",
    colorGrey_RGB: "134,128,121",
    colorThumb: "#ebe4de",
  },
  dark: {
    colorPrimary: "#e9e2dc",
    colorPrimary_RGB: "233,226,220",
    colorHeader: "#1d1710",
    colorContainer: "#251e18",
    colorActive: "#d44842",
    colorGrey: "#8c8680",
    colorGrey_RGB: "140,134,128",
    colorThumb: "#554e48",
  },
};

const currentTheme = computed(() => {
  return themes[theme];
});

const currentTab = ref("catalog");
// 控制渲染的章节数量
const currentChapter = ref(0);
const marks = ref<BookMark[]>([]);
const caches = ref<cacheInfo[]>([]);
const visibleChapters = ref<any[]>([]); // 当前显示的章节
const isLoading = ref(false); // 是否正在加载更多章节
const animation = ref(false); // 是否正在加载更多章节
const batchSize = 300; // 每次渲染的章节数
const startIndex = ref(0); // 渲染起始索引
const endIndex = ref(batchSize); // 渲染结束索引
const scrollTop = ref(0); // 滚动条位置
const oldScrollTop = ref(0);
const scrollTopMark = ref("bookmark_top"); // 滚动条位置
const jumpStatus = ref<JumpType>(JumpType.DOWN);
const jumpName = computed(() => {
  const jmEnum = {
    [JumpType.DOWN]: {
      text: "去底部",
      icon: "arrowdown",
    },
    [JumpType.UP]: {
      text: "去顶部",
      icon: "arrowup",
    },
    [JumpType.NOW]: {
      text: "去当前",
      icon: "undo",
    },
  };
  return jmEnum[jumpStatus.value].text;
});

let currentTop = 0;
let bottomTop = 0;

function handleScroll(e: { detail: { scrollTop: number } }) {
  oldScrollTop.value = e.detail.scrollTop;
}
function backToReader() {
  uni.navigateBack();
}

function delMark(index: number) {
  marks.value.splice(index, 1);
  const value = uni.getStorageSync(chapterInfo.uid);
  if (value) {
    const data = JSON.parse(value) as chapterInfo;
    data.mark.splice(index, 1);
    uni.setStorage({
      key: chapterInfo.uid,
      data: JSON.stringify(data),
    });
  }
  isRemoveMarks = true;
}

function toMarkPage(params: { chapter: number; pageIndex: number; pageCount: number }) {
  if (inOutOpener) {
    toReader(params);
  } else {
    uni.$emit("toMarkPage", params);
    uni.navigateBack();
  }
}

function toChapter(index: number) {
  if (inOutOpener) {
    toReader({ chapter: index });
  } else {
    if (index !== chapterInfo.chapter) {
      uni.$emit("toChapter", index);
    }
    uni.navigateBack();
  }
}
function toReader(params: { chapter?: number; pageIndex?: number; pageCount?: number } = {}) {
  const { pageCount } = params;
  let url = `/pages/reader/index?uid=${chapterInfo.uid}`;
  chapterInfo.chapter = params.chapter || 0;
  chapterInfo.pageIndex = params.pageIndex || 0;
  uni.setStorageSync(chapterInfo.uid, JSON.stringify(chapterInfo));

  // modify bookshelves
  const currentBook = store.bookShelves.data.find(
    (i) => i.bookName === chapterInfo.bookInfo.bookName && i.author === chapterInfo.bookInfo.author,
  );
  if (currentBook) {
    if (currentBook.origin !== chapterInfo.bookInfo?.origin) {
      modifyData(currentBook, chapterInfo.bookInfo);
      store.saveBookShelves();
    }
  }

  if (pageCount) {
    url += `&pageCount=${pageCount}`;
  }
  uni.navigateTo({
    url,
  });
}
function jump() {
  if (currentTab.value === "bookmark") return;
  scrollTop.value = oldScrollTop.value;

  nextTick(() => {
    switch (jumpStatus.value) {
      case JumpType.DOWN:
        scrollTop.value = bottomTop;
        jumpStatus.value = JumpType.UP;
        break;
      case JumpType.UP:
        scrollTop.value = 0;
        jumpStatus.value = JumpType.NOW;
        break;
      case "now":
        scrollTop.value = currentTop;
        jumpStatus.value = JumpType.DOWN;
        break;
      default:
        break;
    }
  });
}

function changeTab(tab: string) {
  if (currentTab.value === tab) return;
  currentTab.value = tab;
}

// 初次渲染批量渲染章节
const asyncRenderChapters = () => {
  let start = startIndex.value;
  const batch = chapterInfo.bookInfo.links.slice(start, endIndex.value);
  visibleChapters.value.push(...batch);
  startIndex.value = endIndex.value;
  endIndex.value = Math.min(chapterInfo.bookInfo.links.length, endIndex.value + batchSize);

  if (endIndex.value < chapterInfo.bookInfo.links.length) {
    setTimeout(asyncRenderChapters, 0);
  } else {
    const batch = chapterInfo.bookInfo.links.slice(startIndex.value, endIndex.value);
    visibleChapters.value.push(...batch);

    isLoading.value = false;
    nextTick(() => {
      init();
    });
  }
};

function init() {
  getNodeInfo("#catelog_list").then((catelogList) => {
    bottomTop = catelogList?.height ?? 0;
  });
  jumpStatus.value = JumpType.DOWN;
  currentTop = rpxToPx(chapterInfo.chapter * 110);

  scrollTop.value = currentTop;

  const percent = chapterInfo.chapter / (chapterInfo.bookInfo.links.length - 1);
  if (percent > 0.5) {
    jumpStatus.value = JumpType.UP;
  }

  nextTick(() => {
    animation.value = true;
  });
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
let paramValue: any;
onLoad((params: any) => (paramValue = params));

onShow(() => {
  const value = uni.getStorageSync("__User_Current_Catalogs__");
  if (value) {
    chapterInfo = reactive(JSON.parse(value)) as chapterInfo;
    currentChapter.value = chapterInfo.chapter;
    marks.value = chapterInfo.mark;
    caches.value = chapterInfo.cache;
    inOutOpener = !!paramValue?.inOutOpener;
    theme = paramValue?.theme === "dark" ? "dark" : "light";
  }
});

// 初次加载数据
onMounted(() => {
  isLoading.value = true;
  asyncRenderChapters(); // 开始异步渲染章节
});

onUnload(() => {
  if (isRemoveMarks && !inOutOpener) {
    uni.$emit("removeMark");
  }
});
</script>

<style scoped lang="scss">
$color-primary: #251e18;
$color-grey: #868079;
$color-container: #fef7f1;
$color-thumb: #ebe4de;
$color-thumb-dark: #554e48;
$color-container-dark: #251e18;

::v-deep ::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 30rpx !important;
  height: 2rpx !important;
  background: #ccc !important;
  -webkit-appearance: auto !important;
}

::v-deep ::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  height: 180rpx;
  border-radius: 30rpx !important;
  box-shadow: inset 0 0 10rpx rgba($color: $color-thumb, $alpha: 0.6) !important;
  background: $color-thumb !important;
}

::v-deep ::-webkit-scrollbar-track {
  position: absolute !important;
  background: $color-container !important;
}

.theme_dark {
  ::v-deep ::-webkit-scrollbar-track {
    background: $color-container-dark !important;
  }
  ::v-deep ::-webkit-scrollbar-thumb {
    box-shadow: inset 0 0 10rpx rgba($color: $color-thumb-dark, $alpha: 0.6) !important;
    background: $color-thumb-dark !important;
  }
}

#catalog_container {
  font-size: 30rpx;
  height: 100vh;
  overflow: hidden;
  width: 100%;

  .header {
    height: 200rpx;
    padding: 40rpx 40rpx;

    .title {
      display: flex;
      align-items: center;

      .name {
        padding-left: 20rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        text-wrap: nowrap;
        max-width: 540rpx;
      }
    }

    .block {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .active {
        font-weight: 900;
        background-image: linear-gradient(to right, salmon 50%, transparent 50%);
        background-size: 60% 4rpx;
        background-position: 20rpx bottom;
        background-repeat: no-repeat;
        padding-bottom: 3rpx;
      }

      .total {
        font-size: 13px;
      }

      .jump {
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: scale(0.7);
        height: 80rpx;
      }
    }
  }

  .chapter-list {
    .chapter-item {
      height: 110rpx;
      margin: 0 30rpx;
      padding: 30rpx 0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .mark-header {
        max-width: 560rpx;
        .time {
          padding-top: 10rpx;
          font-size: 24rpx;
        }
      }
      .chapter-title {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        text-wrap: nowrap;
      }

      .cache {
        margin-left: 20rpx;
      }
    }
    .is_cached {
      .cache {
        display: none;
      }
    }
  }
}

#catelog_list {
  padding-bottom: 40rpx;
}
.marks-container {
  padding-bottom: 40rpx;
}
</style>
