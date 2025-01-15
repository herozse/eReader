<template>
  <g-page>
    <view class="book">
      <view class="status_bar" :style="{ height: appOption.statusBarHeight + 'px', width: '100%' }"></view>
      <view class="search">
        <uni-search-bar
          :focus="isFocus"
          v-model="searchValue"
          @confirm="handleSearch"
          @cancel="handleCancel"
          @clear="handleClear"
          bgColor="var(--theme-bg-white-color)"
          placeholder="搜索小说"
          :radius="30"
          :maxlength="50"
        ></uni-search-bar>
      </view>

      <scroll-view
        v-if="isConfirm"
        :scroll-top="scrollTop"
        scroll-y="true"
        class="scroll_books"
        :enable-back-to-top="true"
        :scroll-anchoring="true"
        :style="{
          height: `calc(100% - 130rpx - ${appOption.statusBarHeight}px)`,
        }"
      >
        <view class="books">
          <view class="book-item" v-for="(item, index) in booksList" :key="index" @click="toDetail(item)">
            <image
              class="img"
              :lazy-load="true"
              :src="item.image ? `${item.image}` : '../../static/nothing3.png'"
              mode="scaleToFill"
            ></image>
            <view class="book_info">
              <text class="name">{{ item.bookName }}</text>
              <text class="author">{{ `${item.author}${item.categories ? ` · ${item.categories}` : ""}` }}</text>
              <text class="update">最新章节：{{ item.latestChapter }}</text>
            </view>
          </view>
          <view class="hz-button-primary button-loading" v-if="!complete" @click="loadMore">
            <view>{{ loading ? "加载中" : "加载更多" }}</view>
            <view v-if="loading" class="loader"></view>
          </view>
          <view class="complete" v-if="complete">已经到底啦~</view>
        </view>
      </scroll-view>

      <view class="history" v-else>
        <view class="header">
          <view class="title">搜索历史</view>
          <g-icon-fonts @click="clearHistory" name="shanchu" size="16" color="var(--theme-primary-color-light-1)" />
        </view>
        <scroll-view class="scroll_tag" scroll-y="true" :enable-back-to-top="true" :scroll-anchoring="true">
          <view class="tag_list">
            <view class="tag" v-for="(item, index) in historySearchList" :key="index" @click="tagClick(item)">
              {{ item }}
            </view>
          </view>
        </scroll-view>
      </view>

      <g-confirm ref="confirm" @handleConfirm="handleConfirm" />
    </view>
  </g-page>
</template>
<script lang="ts" setup>
import { reactive, ref } from "vue";
import store from "@/store";
import * as api from "@/api/common";
import { onLoad } from "@dcloudio/uni-app";
import parser from "@/parser/index";

const appOption = store.appOption;
const searchValue = ref("");
const scrollTop = ref(0);
const booksList = ref<searchBookList[]>([]);
const historySearchList = store.historySearchList;
const isFocus = ref(true);
const confirm = ref<ConfirmInstance | null>(null);
const pagination = reactive({
  pageSize: 2,
  pageNo: 1,
});
const isConfirm = ref(false);
const loading = ref(false);
const complete = ref(false);
function toDetail(item: searchBookList) {
  uni.navigateTo({
    url: `/pages/bookDetail/index?adress=${item.origin}${item.pathname}`,
  });
}

function handleConfirm(key: string) {
  if (key === "default") {
    dialogConfirm();
  }
}

function handleClear() {
  booksList.value = [];
  pagination.pageNo = 1;
  isConfirm.value = false;
}

function handleSearch() {
  if (searchValue.value.trim()) {
    booksList.value = [];
    pagination.pageNo = 1;
    uni.showLoading({
      title: "解析中...",
      mask: false,
    });
    saveHistory();
    getSearchList();
  }
}

function loadMore() {
  pagination.pageNo++;
  loading.value = true;

  getSearchList();
}

function getSearchList() {
  // #ifdef H5
  api
    .searchBook({ fuzzy: searchValue.value, limit: 10, ...pagination })
    .then((res) => {
      isConfirm.value = true;
      const data = res.data.data as searchBookList[];
      booksList.value = booksList.value.concat(data);
      complete.value = res.data.complete;
    })
    .finally(() => {
      uni.hideLoading();
      loading.value = false;
    });
  // #endif

  // #ifdef APP-PLUS
  parser
    .searchBook({ fuzzy: searchValue.value, limit: 10, ...pagination })
    .then((res) => {
      isConfirm.value = true;
      const data = res.data as searchBookList[];
      booksList.value = booksList.value.concat(data);
      complete.value = res.complete;
    })
    .finally(() => {
      uni.hideLoading();
      loading.value = false;
    });
  // #endif
}

function handleCancel() {
  uni.navigateBack();
}

function dialogConfirm() {
  historySearchList.value = [];
  store.saveHistorySearchList();
}
function clearHistory() {
  confirm.value?.show({
    title: "提示",
    type: "warn",
    content: "确定清除搜索记录？",
  });
}

function tagClick(value: string) {
  searchValue.value = value;
  handleSearch();
}

function saveHistory() {
  const value = searchValue.value.trim();
  if (value) {
    const findIndex = historySearchList.value.findIndex((i) => i === value);
    if (findIndex > -1) {
      historySearchList.value.splice(findIndex, 1);
    }
    historySearchList.value.unshift(value);
    store.saveHistorySearchList();
  }
}

onLoad((params: any) => {
  if (params.name) {
    searchValue.value = params.name;
    isFocus.value = false;
    handleSearch();
  }
});
</script>
<style lang="scss" scoped>
.book {
  height: 100vh;
  background-color: var(--theme-bg-color-deep);
  overflow: hidden;

  .search {
    padding-top: 10rpx;
    height: 130rpx;
    border-bottom: 1px solid var(--theme-border-color-light-1);
  }

  .scroll_books {
    .books {
      padding: 16rpx 16rpx 48rpx;
      .book-item {
        padding: 16rpx;
        width: 100%;
        height: 174rpx;
        display: flex;
        border-bottom: 1px solid var(--theme-border-color);

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
          .update {
            -webkit-line-clamp: 1;
          }
        }
      }
    }
  }
  .history {
    height: calc(100% - 250rpx);
    padding: 32rpx;
    .header {
      color: var(--theme-primary-color-light-1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10rpx;
    }

    .tag_list {
      display: flex;
      flex-wrap: wrap;
      color: var(--theme-primary-color-light-1);
      font-size: 24rpx;
      .tag {
        overflow: hidden;
        text-overflow: ellipsis;
        text-wrap: nowrap;
        max-width: 380rpx;
        height: 70rpx;
        line-height: 70rpx;
        padding: 0 28rpx;
        margin: 8rpx 12rpx 10rpx 0;
        background-color: var(--theme-bg-white-color);
        display: block;
        border-radius: 35rpx;
        min-width: 100rpx;
        text-align: center;
      }
    }
  }
}
.scroll_tag {
  height: calc(100% - 60rpx);
}
.complete {
  font-size: 28rpx;
  text-align: center;
  padding-top: 16rpx;
  color: var(--theme-grey-color);
}
</style>
