<template>
  <g-page :class="showMenu ? 'show-menu' : 'hide-menu'">
    <g-statusbar :title="title">
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
          <view class="books">
            <checkbox-group @change="handleChecked">
              <view
                class="book-item"
                v-for="(item, index) in groupBooks"
                :key="item.uid"
                @click.stop="openReader(item)"
                v-LongPress="() => handleLongPress(item)"
              >
                <checkbox
                  v-if="showMenu"
                  :value="item.uid"
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
                  <view class="name">
                    <text>{{ item.bookName }}</text>
                    <view @click.stop="handleLongPress(item)">
                      <g-icon-fonts class="icon" name="more" size="20" />
                    </view>
                  </view>

                  <text class="author">
                    {{ item.author }} ·
                    {{
                      item.latestReadeTimestamp
                        ? item.links.length - 1 === item.chapter
                          ? "已读完"
                          : ` ${item.links.length - item.chapter - 1} 章未读`
                        : "未读过"
                    }}
                  </text>
                  <text class="update">最新章节：{{ item.latestChapter }}</text>
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
          <view>全选本分组</view>
        </view>
        <view class="right">
          已选
          <text style="color: var(--theme-icon-active-color)">{{ checekdGroup.length }}</text>
          本
        </view>
      </view>

      <view class="type">
        <view class="item" @click="moveTo">
          <g-icon-fonts class="icon" name="fenzu1" size="20" />
          <text>移动至</text>
        </view>
        <view class="item" @click="disband">
          <g-icon-fonts class="icon" name="fenzu" size="20" />
          <text>移除</text>
        </view>
        <view class="item" @click="deleteBook">
          <g-icon-fonts class="icon" name="shanchu" size="20" />
          <text>删除</text>
        </view>
      </view>

      <g-confirm ref="confirm" @handleConfirm="handleConfirm" />
    </view>

    <addGroupCmp ref="group" :moveBooks="moveBooks" @hadledMoved="resetChecked" />
    <bookDetail v-if="activeBook" ref="detail" :activeBook="activeBook" @handleStickyBook="handleStickyBook" />
  </g-page>
</template>
<script lang="ts" setup>
import store from "@/store";
import { ref, computed } from "vue";
import { vLongPress } from "@/directives";
import { cloneDeep } from "lodash";
import { onLoad } from "@dcloudio/uni-app";
import addGroupCmp from "@/pages/tabBar/components/addGroup.vue";
import { showToast } from "@/utils/Control";
import bookDetail from "@/pages/tabBar/components/bookDetail.vue";

const bookShelvesData = store.bookShelves.data;
const scrollTop = ref(0);
const group = ref<PopupInstance | null>(null);
const detail = ref<PopupInstance | null>(null);
const title = ref("");
const checekdGroup = ref<Array<string>>([]);
const checkedAll = ref<Array<string>>([]);
const showMenu = ref(false);
const confirm = ref<ConfirmInstance | null>(null);
const activeBook = ref<BooksShelvesData>();

interface GroupBooks extends BooksShelvesData {
  checked?: boolean;
}

const groupBooks = computed(() => {
  const t: GroupBooks[] = cloneDeep(bookShelvesData.filter((i) => i.group === title.value));
  // 根据 stickyIndex 排序，置顶的书籍排在最前
  const sortBySticky = (a: BooksShelvesData, b: BooksShelvesData) => (b.stickyIndex || 0) - (a.stickyIndex || 0);
  t.map((i) => {
    if (checekdGroup.value.includes(i.uid)) {
      i.checked = true;
    } else {
      i.checked = false;
    }
    return i;
  });

  t.sort(sortBySticky);
  return t;
});

const moveBooks = computed(() => {
  return groupBooks.value.filter((i) => checekdGroup.value.includes(i.uid));
});

function handleStickyBook() {
  activeBook.value = groupBooks.value.find((i) => i.uid === activeBook.value?.uid);
}

function resetChecked() {
  checekdGroup.value = [];
  checkedAll.value = [];
}

function moveTo() {
  if (checekdGroup.value.length) {
    group.value?.open();
  } else {
    showToast("请选择需要移动的书籍");
  }
}
function disband() {
  if (checekdGroup.value.length) {
    confirm.value?.show({ type: "warn", content: "确定将所选书籍移除该分组？", key: "disband" });
  } else {
    showToast("请选择需要移除的书籍");
  }
}
function deleteBook() {
  if (checekdGroup.value.length) {
    confirm.value?.show({ type: "error", content: "删除后作品也将从书架中删除，确定删除吗？", key: "delete" });
  } else {
    showToast("请选择需要删除的书籍");
  }
}
function handleConfirm(key: string) {
  if (key === "default") {
    console.log("confirm");
  } else if (key === "delete") {
    handleRemoveBook();
  } else if (key === "disband") {
    handleDisbandBook();
  }
}
function handleRemoveBook() {
  checekdGroup.value.forEach((uid) => {
    const ix = bookShelvesData.findIndex((i) => i.uid === uid);
    if (ix > -1) {
      bookShelvesData.splice(ix, 1);
    }
  });
  store.saveBookShelves();
  resetChecked();
}

function handleDisbandBook() {
  checekdGroup.value.forEach((uid) => {
    const ix = bookShelvesData.findIndex((i) => i.uid === uid);
    if (ix > -1) {
      delete bookShelvesData[ix].group;
    }
  });
  store.saveBookShelves();
  resetChecked();
}
function doEdit() {
  checekdGroup.value = [];
  checkedAll.value = [];
  showMenu.value = !showMenu.value;
}

function handleChecked(e: any) {
  const value = e.detail.value;
  checekdGroup.value = value;

  if (value.length === groupBooks.value.length) {
    checkedAll.value = ["all"];
  } else {
    checkedAll.value = [];
  }
}
function handleCheckedAll(e: any) {
  const value = e.detail.value;
  checkedAll.value = value;
  if (value.length) {
    checekdGroup.value = groupBooks.value.map((i) => i.uid);
  } else {
    checekdGroup.value = [];
  }
}
// 长按逻辑
const handleLongPress = (item: BooksShelvesData) => {
  if (showMenu.value) return;
  activeBook.value = item;
  detail.value?.open();
};

function openReader(bookInfo: BooksShelvesData) {
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

onLoad((params: any) => {
  title.value = params.group;
});
</script>
<style lang="scss" scoped>
.history {
  background-color: var(--theme-bg-color);
  color: var(--theme-primary-color);
  min-height: 100%;
  transition: 0.3s all;
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
