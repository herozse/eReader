<template>
  <g-page>
    <view
      class="home"
      :style="{
        '--tab-line-translateX': swiperTranstionX,
      }"
    >
      <view class="status_bar" :style="{ height: appOption.statusBarHeight + 'px', width: '100%' }"></view>
      <view class="header">
        <view class="left">
          <view :class="gender === 'male' ? 'active' : ''" @click="switchGender('male')" class="now">男生</view>
          <view :class="gender === 'female' ? 'active' : ''" @click="switchGender('female')" class="histore">女生</view>
        </view>
        <view class="right">
          <g-icon-fonts name="search" @click="toSearch" size="20" />
        </view>
      </view>

      <view class="tabs">
        <view
          v-for="(item, index) in swiperList"
          :key="index"
          @click="switchTab(index)"
          :class="['tab', swiperCurrent === index ? 'active' : '']"
        >
          {{ item.name }}
        </view>
      </view>

      <view
        class="container_tabs__list"
        :style="{
          height: `calc(100% - 200rpx - ${appOption.statusBarHeight}px)`,
        }"
      >
        <swiper
          class="container_tabs__swiper"
          :current="swiperCurrent"
          @animationfinish="animationFinished"
          @transition="transition"
        >
          <swiper-item class="swiper_item" v-for="(outItem, outIndex) in swiperList" :key="outIndex">
            <scroll-view
              :scroll-top="scrollTop"
              @scroll="scroll"
              @scrolltolower="loadeMore"
              :scroll-y="canScroll"
              :enable-back-to-top="true"
              :scroll-anchoring="true"
              :scroll-with-animation="animation"
              :refresher-threshold="100"
              class="scroll_books"
              @refresherrefresh="onRefresh"
              :refresher-enabled="canRefresher"
              refresher-background="var(--theme-bg-color)"
              :refresher-triggered="refreshTriggered"
            >
              <view class="books">
                <view
                  class="book-item"
                  v-for="(item, index) in tabs[gender][outItem.key].data"
                  :key="item.bookName + item.author"
                  @click="toSearch(item.bookName)"
                >
                  <image
                    class="img"
                    :lazy-load="true"
                    :src="item.image ? `${item.image}` : '../../static/nothing3.png'"
                    mode="scaleToFill"
                  ></image>
                  <view class="book_info">
                    <text class="name">{{ item.bookName }}</text>
                    <text class="author">{{ item.author }} · {{ item.tag }}</text>
                    <text class="desc">{{ item.description }}</text>
                  </view>
                </view>
              </view>
            </scroll-view>
          </swiper-item>
        </swiper>
      </view>
    </view>

    <Tabbar cureentPage="book" :isBackTop="isBackTop" @goBackTop="goBackTop" />
  </g-page>
</template>
<script lang="ts" setup>
import { onLoad } from "@dcloudio/uni-app";

import Tabbar from "@/components/TabBar.vue";
import store from "@/store";
import { computed, reactive, ref, nextTick } from "vue";
import * as api from "@/api/common";
import parser from "@/parser/index";
const appOption = store.appOption;
const gender = ref<"male" | "female">("male");
const scrollTop = ref(0);
const canScroll = ref(true);
const canRefresher = ref(true);
const oldScrollTop = ref(0);
const refreshTriggered = ref(false);
const isBackTop = ref(false);
const animation = ref(false);
let isBacking = false;
const swiperCurrent = ref(0);
const tabItemLeft = (appOption.screenWidth - 20) / 8 - 7;
const swiperTranstionX = ref(tabItemLeft + "px");
let tabSwiperFlag = false;
interface SwiperList {
  name: string;
  key: SwiperListType;
  page: number;
}
type SwiperListType = "rank_hot" | "rank_good" | "rank_increase" | "rank_new";
interface TabsType {
  male: {
    [key in SwiperListType]: TabItem;
  };
  female: {
    [key in SwiperListType]: TabItem;
  };
}
interface TabItem {
  page: number;
  data: TopBookInfo[];
  originData: TopBookInfo[];
}
const swiperList: SwiperList[] = [
  {
    name: "小说热搜",
    key: "rank_hot",
    page: 1,
  },
  {
    name: "好评榜",
    key: "rank_good",
    page: 1,
  },
  {
    name: "飙升榜",
    key: "rank_increase",
    page: 1,
  },
  {
    name: "新书榜",
    key: "rank_new",
    page: 1,
  },
];

const tabs = reactive<TabsType>({
  male: {
    rank_hot: {
      page: 1,
      data: [],
      originData: [],
    },
    rank_good: {
      page: 1,
      data: [],
      originData: [],
    },
    rank_increase: {
      page: 1,
      data: [],
      originData: [],
    },
    rank_new: {
      page: 1,
      data: [],
      originData: [],
    },
  },
  female: {
    rank_hot: {
      page: 1,
      data: [],
      originData: [],
    },
    rank_good: {
      page: 1,
      data: [],
      originData: [],
    },
    rank_increase: {
      page: 1,
      data: [],
      originData: [],
    },
    rank_new: {
      page: 1,
      data: [],
      originData: [],
    },
  },
});
const currentSwiperKey = computed(() => {
  return swiperList[swiperCurrent.value].key;
});

function loadeMore() {
  const tab = tabs[gender.value][currentSwiperKey.value];
  if (tab.data.length !== tab.originData.length) {
    tab.page++;
    tab.data = tab.originData.slice(0, 10 * tab.page);
  }
}
function transition(e: any) {
  canScroll.value = false;
  canRefresher.value = false;
  refreshTriggered.value = false;
  if (tabSwiperFlag) return;
  const dx = e.detail.dx;

  if (Math.abs(dx) % appOption.screenWidth === 0) {
    swiperTranstionX.value = tabItemLeft + "px";
  } else {
    const screenWidth = appOption.screenWidth;

    const x = (dx / screenWidth) * (screenWidth / 4);

    swiperTranstionX.value = `${tabItemLeft + x}px`;
  }
}
function animationFinished(e: any) {
  animation.value = false;
  canScroll.value = true;
  setTimeout(() => {
    canRefresher.value = true;
  }, 150);
  tabSwiperFlag = false;
  if (e.detail.current === swiperCurrent.value) return;
  swiperCurrent.value = e.detail.current;
  searchTop();
}

function scroll(e: { detail: { scrollTop: number } }) {
  if (isBacking) return;
  oldScrollTop.value = e.detail.scrollTop;
  animation.value = false;
  if (oldScrollTop.value > appOption.screenHeight / 2) {
    isBackTop.value = true;
  } else {
    isBackTop.value = false;
  }
}

function goBackTop() {
  isBacking = true;
  animation.value = true;
  isBackTop.value = false;
  goTop();

  setTimeout(() => {
    isBacking = false;
  }, 400);
}
function goTop() {
  scrollTop.value = oldScrollTop.value;
  nextTick(() => {
    scrollTop.value = 0;
  });
}

function toSearch(bookName?: string) {
  let url = "/pages/search/index";
  if (bookName) {
    url += `?name=${bookName}`;
  }
  uni.navigateTo({
    url,
  });
}
function onRefresh() {
  if (refreshTriggered.value) return;
  refreshTriggered.value = true;
  getTop();
}

function switchGender(type: "male" | "female") {
  if (type === gender.value) return;
  gender.value = type;
  searchTop();
}

function switchTab(index: number) {
  if (index === swiperCurrent.value) return;
  tabSwiperFlag = true;
  canRefresher.value = true;
  refreshTriggered.value = false;
  swiperCurrent.value = index;
  searchTop();
}

function searchTop() {
  goTop();
  const tab = tabs[gender.value][currentSwiperKey.value];
  if (!tab.originData.length) {
    getTop();
  } else {
    tab.page = 1;
    tab.data = tab.originData.slice(0, 10);
  }
}
function getTop() {
  uni.showLoading({
    title: "解析中...",
    mask: false,
  });
  // #ifdef H5
  api
    .getTopBooks({
      gender: gender.value,
      cate: "全部",
      rank: currentSwiperKey.value,
    })
    .then((res) => {
      handleResult(res.data);
    })
    .finally(() => {
      uni.hideLoading();
    });
  // #endif

  // #ifdef APP-PLUS
  parser
    .getTopBook({
      gender: gender.value,
      cate: "全部",
      rank: currentSwiperKey.value,
    })
    .then((res) => {
      const data = res as TopBookInfo[];
      handleResult(data);
    })
    .finally(() => {
      uni.hideLoading();
    });
  // #endif
}
function handleResult(data: TopBookInfo[]) {
  tabs[gender.value][currentSwiperKey.value] = {
    originData: data,
    data: data.slice(0, 10),
    page: 1,
  };

  nextTick(() => {
    refreshTriggered.value = false;
  });
}
onLoad(() => {
  getTop();
});
</script>
<style lang="scss" scoped>
$tab-line-translateX: var(--tab-line-translateX);
.home {
  height: calc(100vh - 160rpx);
  background-color: var(--theme-bg-color);
  overflow: hidden;

  .header {
    padding: 32rpx 32rpx 20rpx;
    display: flex;
    font-size: 30rpx;
    height: 100rpx;
    justify-content: space-between;
    align-items: center;
    .left {
      color: var(--theme-primary-color-light-1);
      font-size: 32rpx;
      font-weight: 600;
      display: flex;
      .now {
        margin-right: 40rpx;
      }
      .active {
        color: var(--theme-primary-color);
        transform: translateY(-6rpx) scale(1.2);
      }
    }
    .right {
      .more {
        margin-left: 32rpx;
      }
    }
  }
  .tabs {
    padding: 0 10px 20rpx;
    display: flex;
    align-items: center;
    // justify-content: space-around;
    height: 100rpx;
    border-bottom: 1px solid var(--theme-border-color-light-1);
    font-size: 32rpx;
    font-weight: 600;
    color: var(--theme-primary-color-light-1);
    .tab {
      height: 100rpx;
      line-height: 100rpx;
      position: relative;
      transition: 0.2s all;
      text-align: center;
      flex: 1;
    }
    .active {
      font-size: 36rpx;
      position: relative;
      color: var(--theme-primary-color);
      &::after {
        width: 14px;
        height: 4px;
        position: absolute;
        bottom: 0;
        left: $tab-line-translateX;
        content: "";
        background-color: var(--theme-icon-active-color);
        border-radius: 8rpx;
      }
    }
  }
}
.container_tabs__list {
  .container_tabs__swiper {
    height: 100%;
    .swiper_item {
      height: 100%;
      .scroll_books {
        height: 100%;
        .books {
          padding: 16rpx;
          .book-item {
            padding: 16rpx;
            width: 100%;
            height: 174rpx;
            display: flex;
            border-bottom: 1px solid var(--theme-border-color-light-1);

            .img {
              border-radius: 10rpx;
              width: 100rpx;
              height: 100%;
              margin-right: 20rpx;
            }

            .book_info {
              font-size: 24rpx;
              color: var(--theme-grey-color);
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
                color: var(--theme-primary-color);
              }
              .desc {
                -webkit-line-clamp: 1;
              }
            }
          }
        }
      }
    }
  }
}
</style>
