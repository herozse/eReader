<template>
  <g-page>
    <g-statusbar :backgroundColor="backgroundColor">
      <template v-slot:left>
        <view class="header_icon" v-show="showTip">
          <image class="img" :src="book?.image ? book.image : '../../static/nothing3.png'" mode="scaleToFill"></image>
          <view class="header_title">
            <text class="name">{{ book?.bookName }}</text>
            <text class="categories">{{ book?.categories }}</text>
          </view>
        </view>
      </template>
      <template v-slot:right>
        <view class="icon" @click="share?.open()">
          <g-icon-fonts name="more" size="16" />
        </view>
      </template>
    </g-statusbar>
    <view
      :style="{ height: `calc(100vh - ${store.appOption.statusBarHeight * 2 || 44}px)` }"
      class="book_detial"
      v-if="book"
    >
      <scroll-view :style="{ height: `calc(100% - 200rpx)` }" scroll-y="true" @scroll="handleScroll">
        <view class="top">
          <view class="top_content">
            <image class="img" :src="book.image ? book.image : '../../static/nothing3.png'" mode="scaleToFill"></image>
            <view class="book_info">
              <text class="name">{{ book.bookName }}</text>
              <text class="author">{{ book.author }} · {{ book.categories }}</text>
              <text class="update">最新章节：{{ book.latestChapter }}</text>
              <text class="update">更新时间：{{ book.latestUpdateTime }}</text>
            </view>
          </view>
        </view>
        <view class="description">
          <Expand v-if="book.description" ref="expand" :content="book.description" />
        </view>
        <view class="block" :style="{ height: posHeight, transition: '0.3s all' }"></view>
        <view class="catalogs">
          <view class="header">
            <text class="title">目录</text>
            <view class="last" @click="openCataLog">
              <text class="name">连载至 · {{ book.latestChapter }} · {{ book.latestUpdateTime }}</text>
              <g-icon-fonts name="arrowright" size="12" />
            </view>
          </view>
          <view class="list" v-if="book.links?.length">
            <view class="list_item" v-for="(item, idx) in book.links?.slice(0, 10)" :key="idx" @click="toChapter(idx)">
              <text class="title">{{ item.text }}</text>
            </view>
            <view class="more" @click="openCataLog">进入目录，查看更多</view>
          </view>
        </view>
        <view class="block" style="height: 20rpx"></view>
      </scroll-view>

      <view class="btns" v-show="book.links?.length">
        <view class="btn hz-button-plain" @click="switchSheleves" :class="isInBookShelvesIndex > -1 ? 'is_in' : ''">
          {{ isInBookShelvesIndex > -1 ? "从书架中移除" : "加入书架" }}
        </view>
        <view class="btn hz-button-primary" @click="openDetails(book)">开始阅读</view>
      </view>
    </view>
    <view
      v-else
      :style="{ height: `calc(100vh - ${store.appOption.statusBarHeight * 2 || 44}px)` }"
      class="book_detial"
    ></view>

    <Share ref="share" :activeBook="book" v-if="book" />
  </g-page>
</template>

<script setup lang="ts">
import * as api from "@/api/common";
import { onLoad } from "@dcloudio/uni-app";
import { computed, ref } from "vue";

import Expand from "@/components/Expand.vue";
import Share from "@/components/share.vue";
import store from "@/store";
import { v4 as uuidv4 } from "uuid";
import { cloneDeep } from "lodash";
import { modifyData } from "@/utils";
import parser from "@/parser/index";

const bookShelves = store.bookShelves;
const tempData = store.tempData;
const expand = ref<InstanceType<typeof Expand>>();
const book = ref<bookInfo>();
const share = ref<PopupInstance | null>(null);
const isInit = ref(false);
const showTip = ref(false);
const backgroundColor = ref("var(--theme-bg-color-deep)");
const posHeight = computed(() => {
  const h = expand.value?.containerHeightValue;
  let eh = 0;
  if (h) {
    eh = h;
  }
  // topHeight + expandPadding + expandHeight - topCover + margin
  const height = 420 + 64 + eh - (420 - 350) + 20;
  return height + "rpx";
});
const isInBookShelvesIndex = computed(() => {
  return bookShelves.data.findIndex((i) => i.bookName === book.value?.bookName && i.author === book.value.author);
});

const chapterInfo = ref<chapterInfo>();

function handleScroll(e: { detail: { scrollTop: number } }) {
  if (e.detail.scrollTop > 48) {
    showTip.value = true;
    backgroundColor.value = "var(--theme-bg-color)";
  } else {
    showTip.value = false;
    backgroundColor.value = "var(--theme-bg-book-color)";
  }
}

function switchSheleves() {
  if (isInBookShelvesIndex.value > -1) {
    // 从书架移除移除 -> uid
    let uid = bookShelves.data[isInBookShelvesIndex.value].uid;
    let bookName = bookShelves.data[isInBookShelvesIndex.value].bookName;
    let author = bookShelves.data[isInBookShelvesIndex.value].author;

    uni.removeStorage({
      key: uid,
    });
    bookShelves.data.splice(isInBookShelvesIndex.value, 1);
    // 加入temp
    store.modifyTempData({
      author,
      bookName,
      uid,
    });
  } else {
    let uid = uuidv4();

    let data = Object.assign(cloneDeep(book.value || {}), {
      uid,
      chapter: 0,
      pageIndex: 0,
    }) as BooksShelvesData;

    bookShelves.data.unshift(data);
    // 移除temp
    store.modifyTempData({
      author: data.author,
      bookName: data.bookName,
      uid,
    });
  }
  store.saveBookShelves();
}

function toChapter(chapter: number) {
  openDetails(book.value, {
    chapter,
    pageIndex: 0,
  });
}

function getCatalogs(adress: string) {
  uni.showLoading({
    title: "解析中...",
    mask: false,
  });
  // #ifdef APP-PLUS
  parser
    .getCatalogs({ url: adress })
    .then((res) => {
      const data = res as bookInfo;
      book.value = data;
      isInit.value = true;
      backgroundColor.value = "var(--theme-bg-book-color)";
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
      book.value = data;
      isInit.value = true;
      backgroundColor.value = "var(--theme-bg-book-color)";
    })
    .finally(() => {
      uni.hideLoading();
    });
  // #endif
}

function openCataLog() {
  setChapterInfo(book.value);
  uni.setStorageSync("__User_Current_Catalogs__", JSON.stringify(chapterInfo.value));
  uni.navigateTo({
    url: `/pages/catalogs/index?inOutOpener=true&theme=${store.appOption.theme}&refreshTime=${new Date().getTime()}`,
  });
}

function setChapterInfo(
  bookInfo: bookInfo | undefined,
  params: { chapter?: number; pageIndex?: number; pageCount?: number } = {},
) {
  if (bookInfo) {
    let uid;
    if (isInBookShelvesIndex.value > -1) {
      const data = bookShelves.data[isInBookShelvesIndex.value];
      uid = data.uid;
    } else {
      const idx = tempData.value.findIndex((i) => i.author === bookInfo.author && i.bookName === bookInfo.bookName);
      if (idx > -1) {
        uid = tempData.value[idx].uid || uuidv4();
      } else {
        uid = uuidv4();
        store.modifyTempData({
          author: bookInfo.author || "",
          bookName: bookInfo.bookName || "",
          uid,
        });
      }
    }

    const val = uni.getStorageSync(uid);
    if (!val) {
      chapterInfo.value = {
        pageIndex: 0,
        chapter: params?.chapter || 0,
        cache: [],
        mark: [],
        bookInfo,
        uid,
      } as chapterInfo;
    } else {
      let data: chapterInfo = JSON.parse(val);

      if (Object.prototype.hasOwnProperty.call(params, "chapter")) {
        data.chapter = params.chapter || 0;
      }
      if (Object.prototype.hasOwnProperty.call(params, "pageIndex")) {
        data.pageIndex = params?.pageIndex || 0;
      }
      data.uid = uid;

      if (data.bookInfo.origin !== bookInfo.origin) {
        const value = updateCurrentInfo(cloneDeep(data), cloneDeep(bookInfo));
        if (value) {
          data = value;
        }
      }

      chapterInfo.value = data;
    }
  }
}

function updateCurrentInfo(oldData: chapterInfo, newData: bookInfo) {
  if (isInBookShelvesIndex.value > -1) {
    const currentBook = bookShelves.data[isInBookShelvesIndex.value];
    // update to new origin
    const oldChapter = oldData.chapter;
    const title = oldData.bookInfo.links[oldChapter].text;
    // remainOrigins
    const origins = currentBook.origins;

    // set chapter index
    let index = newData.links.findIndex((i) => i.text === title);
    if (index === -1) {
      if (newData.links[oldChapter]) {
        index = oldChapter;
      } else {
        index = 0;
      }
    }

    // set origins
    const allOrigins = newData.origins.concat(origins);
    newData.origins = Array.from(new Set(allOrigins.map((item) => item.origin))).map(
      (origin) => allOrigins.find((item) => item.origin === origin)!,
    );
    const value = {
      bookInfo: newData,
      cache: [],
      mark: [],
      pageIndex: 0,
      chapter: index,
      uid: oldData.uid,
    };

    return value;
  }
}

function openDetails(
  bookInfo: bookInfo | undefined,
  params: { chapter?: number; pageIndex?: number; pageCount?: number } = {},
) {
  setChapterInfo(bookInfo, params);
  const { pageCount } = params;

  uni.setStorageSync(chapterInfo.value!.uid, JSON.stringify(chapterInfo.value));
  // modify bookshelves
  if (isInBookShelvesIndex.value > -1) {
    const currentBook = bookShelves.data[isInBookShelvesIndex.value];
    if (currentBook.origin !== bookInfo?.origin) {
      modifyData(currentBook, chapterInfo.value?.bookInfo);
      store.saveBookShelves();
    }
  }
  let url = `/pages/reader/index?uid=${chapterInfo.value?.uid}`;

  if (pageCount) {
    url += `&pageCount=${pageCount}`;
  }
  uni.navigateTo({
    url,
  });
}

onLoad((params: any) => {
  const { adress } = params;
  if (adress) {
    getCatalogs(adress);
  }
});
</script>

<style scoped lang="scss">
.book_detial {
  overflow: hidden;
  background-color: var(--theme-bg-color-deep);
  position: relative;
  color: var(--theme-primary-color-light-1);

  .top {
    position: absolute;
    top: 0;
    left: 0;
    padding: 32rpx;
    height: 420rpx;
    background-color: var(--theme-bg-book-color);
    border-bottom: 1px solid var(--theme-border-color);
    width: 100%;
    .top_bar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 32rpx;
    }
    .top_content {
      display: flex;
      height: 260rpx;
      .img {
        width: 180rpx;
        height: 100%;
        margin-right: 20rpx;
        border-radius: 16rpx;
      }

      .book_info {
        font-size: 24rpx;
        color: var(--theme-primary-book-color);
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-around;

        text {
          overflow: hidden;
          word-break: break-all;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        .name {
          font-size: 32rpx;
        }
        .update {
          -webkit-line-clamp: 2;
        }
      }
    }
  }
  .description {
    position: absolute;
    top: 350rpx;
    padding: 32rpx;
    width: 100%;
    background-color: var(--theme-bg-color);
    border-top-left-radius: 40rpx;
    border-top-right-radius: 40rpx;
  }
  .catalogs {
    padding: 32rpx;
    background-color: var(--theme-bg-color);
    transition: 0.3s all;
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .title {
        color: var(--theme-primary-color);
        font-size: 36rpx;
        font-weight: 600;
      }
      .last {
        display: flex;
        width: 500rpx;
        align-items: center;
        .name {
          flex: 1;
          font-size: 26rpx;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }
    }
    .list {
      margin-top: 20rpx;
      font-size: 28rpx;
      .list_item {
        padding: 20rpx 0;
        border-bottom: 1px solid var(--theme-border-color);
      }
    }
    .more {
      margin-top: 20rpx;
      background-color: var(--theme-bg-white-color);
      color: var(--theme-primary-color-light-1);
      height: 80rpx;
      line-height: 80rpx;
      width: 100%;
      text-align: center;
      font-size: 24rpx;
      border-radius: 40rpx;
    }
  }
  .block {
    height: 200rpx;
  }
  .btns {
    height: 200rpx;
    background-color: var(--theme-bg-color);
    border-top: 1px solid var(--theme-border-color-light-1);
    padding: 24rpx 32rpx 64rpx;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    .btn {
      width: 280rpx;
      height: 100rpx;
      border-radius: 50rpx;
      line-height: 100rpx;
      text-align: center;
      margin-top: 0;
      &:nth-child(1) {
        margin-right: 32rpx;
      }
    }
    .is_in {
      color: #cac4be;
      background-color: rgba($color: #fae0da, $alpha: 0.5);
    }
  }
}

.header_icon {
  display: flex;
  .img {
    border-radius: 5rpx;
    width: 43rpx;
    height: 60rpx;
  }
  .header_title {
    display: flex;
    flex-direction: column;
    margin-left: 16rpx;
    max-width: 500rpx;

    .name {
      font-size: 24rpx;
      font-weight: 600;
      color: var(--theme-primary-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .categories {
      font-size: 20rpx;
      color: var(--theme-grey-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
