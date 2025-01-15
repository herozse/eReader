<template>
  <g-page :class="showMenu ? 'show-menu' : 'hide-menu'">
    <g-statusbar title="浏览历史">
      <template v-slot:right>
        <view style="font-size: 14px" @click="doEdit">{{ showMenu ? "取消" : "编辑" }}</view>
      </template>
    </g-statusbar>
    <scroll-view :style="{ height: `calc(100vh - ${store.appOption.statusBarHeight * 2 || 44}px)` }" scroll-y="true">
      <view class="history">
        <scroll-view
          :scroll-top="scrollTop"
          scroll-y="true"
          :enable-back-to-top="true"
          :scroll-anchoring="true"
          class="scroll_books"
          :style="{
            height: `calc(100vh - ${store.appOption.statusBarHeight || 44}px)`,
          }"
        >
          <view class="books history">
            <checkbox-group @change="handleChecked">
              <view
                class="book-item"
                v-for="(item, index) in historyBooks"
                :key="item.uid + index"
                @click.stop="openReader(item)"
              >
                <checkbox
                  v-if="showMenu"
                  :value="`${index}`"
                  :checked="item.checked"
                  :class="['check-radio', showMenu ? 'active' : '', item.checked ? 'checked' : '']"
                />
                <image
                  class="img"
                  :lazy-load="true"
                  :src="item.image ? `${item.image}` : '../../static/nothing3.png'"
                  mode="scaleToFill"
                ></image>
                <view class="book_info">
                  <view class="info">
                    <view class="name">
                      <text>{{ item.bookName }}</text>
                    </view>
                    <view class="author">
                      <text>{{ item?.links[item.chapter]?.text }}</text>
                    </view>
                    <text class="update">
                      浏览时间：{{ item.latestReadeTimestamp ? formatDate(new Date(item.latestReadeTimestamp)) : "--" }}
                    </text>
                  </view>

                  <view :class="item.isInBookShelves ? 'in_book' : 'add_book'" @click.stop="addBook(item)">
                    {{ item.isInBookShelves ? "已在书架" : "+ 书架" }}
                  </view>
                </view>
              </view>
              <view class="block" style="width: 100%; height: 280rpx" v-if="showMenu"></view>
            </checkbox-group>
          </view>
        </scroll-view>
      </view>
    </scroll-view>

    <view class="footer-bar">
      <view class="select-all">
        <view class="left">
          <checkbox-group @change="handleCheckedAll">
            <checkbox
              value="all"
              class="radio"
              :checked="checkedAll.length > 0"
              :class="checkedAll.length ? 'checked' : ''"
            />
          </checkbox-group>
          <view>全选</view>
        </view>
        <view class="right">
          已选
          <text style="color: var(--theme-icon-active-color)">{{ checekdGroup.length }}</text>
          本
        </view>
      </view>

      <view class="type">
        <view class="item" @click="addBooks">
          <g-icon-fonts class="icon" name="tianjiashujia" size="20" />
          <text>加入书架</text>
        </view>
        <view class="item" @click="deleteBook">
          <g-icon-fonts class="icon" name="shanchu" size="20" />
          <text>删除</text>
        </view>
      </view>

      <g-confirm ref="confirm" @handleConfirm="handleConfirm" />
    </view>
  </g-page>
</template>
<script lang="ts" setup>
import store from "@/store";
import { ref, computed } from "vue";
import { formatDate } from "@/utils/index";
import { cloneDeep } from "lodash";
import { showToast } from "@/utils/Control";

const bookShelvesData = store.bookShelves.data;
const historyBookShelves = store.historyBookShelves;
const scrollTop = ref(0);
const checekdGroup = ref<Array<string>>([]);
const checkedAll = ref<Array<string>>([]);
const showMenu = ref(false);
const confirm = ref<ConfirmInstance | null>(null);

interface GroupBooks extends BooksShelvesData {
  checked?: boolean;
}
const historyBooks = computed(() => {
  const t: GroupBooks[] = cloneDeep(historyBookShelves.value);

  t.map((i, index) => {
    const ix = bookShelvesData.findIndex((j) => j.uid === i.uid);
    i.isInBookShelves = ix > -1;
    if (checekdGroup.value.includes(`${index}`)) {
      i.checked = true;
    } else {
      i.checked = false;
    }
    return i;
  });
  return t;
});

function doEdit() {
  checekdGroup.value = [];
  checkedAll.value = [];
  showMenu.value = !showMenu.value;
}
function handleChecked(e: any) {
  const value = e.detail.value;
  checekdGroup.value = value;

  if (value.length === historyBooks.value.length) {
    checkedAll.value = ["all"];
  } else {
    checkedAll.value = [];
  }
}
function handleCheckedAll(e: any) {
  const value = e.detail.value;
  checkedAll.value = value;
  if (value.length) {
    checekdGroup.value = historyBooks.value.map((i, j) => `${j}`);
  } else {
    checekdGroup.value = [];
  }
}

function deleteBook() {
  if (checekdGroup.value.length) {
    checekdGroup.value.forEach((ix) => {
      historyBookShelves.value.splice(+ix, 1);
    });
    store.saveHistoryBookShelves();
    showToast("操作成功");
    resetChecked();
  } else {
    showToast("请选择书籍");
  }
}

function resetChecked() {
  checekdGroup.value = [];
  checkedAll.value = [];
}

function addBooks() {
  if (checekdGroup.value.length) {
    checekdGroup.value.forEach((ix) => {
      const book: GroupBooks = historyBookShelves.value[+ix];
      const index = bookShelvesData.findIndex((j) => j.uid === book.uid);
      if (index === -1) {
        delete book.isInBookShelves;
        delete book.checked;
        bookShelvesData.unshift(book);
      }
    });
    store.saveBookShelves();
    showToast("操作成功");
    resetChecked();
  } else {
    showToast("请选择书籍");
  }
}

function handleRemoveBook() {
  console.log(checekdGroup.value);
}

function handleAddBooks() {
  console.log(checekdGroup.value);
}

function handleConfirm(key: string) {
  if (key === "default") {
    console.log("confirm");
  } else if (key === "deleteBook") {
    handleRemoveBook();
  } else if (key === "addBooks") {
    handleAddBooks();
  }
}

function addBook(book: GroupBooks) {
  if (showMenu.value) return;
  if (book.isInBookShelves) return;
  delete book.isInBookShelves;
  delete book.checked;
  bookShelvesData.unshift(book);
  store.saveBookShelves();
}

function openReader(bookInfo: GroupBooks) {
  if (showMenu.value) return;
  const val = uni.getStorageSync(bookInfo.uid);

  if (!val) {
    uni.setStorageSync(
      bookInfo.uid,
      JSON.stringify({
        pageIndex: 0,
        chapter: 0,
        cache: [],
        mark: [],
        bookInfo,
      }),
    );
  }
  uni.navigateTo({
    url: `/pages/reader/index?uid=${bookInfo.uid}`,
  });
}
</script>
<style lang="scss" scoped>
.history {
  background-color: var(--theme-bg-color);
  color: var(--theme-primary-color);
  min-height: 100%;
}

.scroll_books {
  .books {
    padding: 16rpx 16rpx 48rpx;
    .book-item {
      padding: 16rpx;
      width: 100%;
      height: 174rpx;
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--theme-border-color);
      .img {
        border-radius: 10rpx;
        width: 100rpx;
        height: 100%;
        margin-right: 20rpx;
      }

      .book_info {
        height: 100%;
        font-size: 24rpx;
        color: var(--theme-grey-color);
        flex: 1;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        .info {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          height: 100%;
          max-width: 350rpx;
        }

        .in_book {
          padding-right: 20rpx;
        }

        .add_book {
          color: var(--theme-icon-active-color);
          border: 1px solid var(--theme-icon-active-color);
          padding: 12rpx 24rpx;
          border-radius: 30rpx;
        }

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
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .update {
          -webkit-line-clamp: 1;
        }
      }
    }
  }
}

.footer-bar {
  font-size: 28rpx;
  padding-bottom: 64rpx;
  width: 100%;
  height: 280rpx;
  background-color: var(--theme-bg-color);
  position: fixed;
  z-index: 12;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  color: var(--theme-grey-color);
  transition: 0.3s all;
  .select-all {
    padding: 12rpx 32rpx;
    display: flex;
    align-items: center;
    background-color: var(--theme-bg-color-light-1);
    .left {
      display: flex;
      align-items: center;
      flex: 1;
    }
  }

  .type {
    flex: 1;
    display: flex;
    justify-content: space-between;
    .item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .icon {
        margin-bottom: 12rpx;
      }
    }
  }
}

.hide-menu {
  .footer-bar {
    transform: translateY(100%);
  }
}
</style>
