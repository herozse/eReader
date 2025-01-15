<template>
  <g-page>
    <view class="home">
      <view class="status_bar" :style="{ height: appOption.statusBarHeight + 'px', width: '100%' }"></view>
      <view class="header">
        <view class="left">
          <view @click="changeTabs(0)" :class="['now', swiperCurrent === 0 ? 'active' : '']">书架</view>
          <view @click="changeTabs(1)" :class="['history', swiperCurrent === 1 ? 'active' : '']">浏览记录</view>
        </view>
        <view class="right">
          <g-icon-fonts name="search" @click="toSearch" size="20" />
          <Popver
            placement="bottom-end"
            :options="actions"
            ref="popver"
            :theme="store.appOption.theme"
            @select="handleSelect"
            class="item-popover"
            :activeIdx="activeIdx"
          >
            <view class="set">
              <g-icon-fonts class="more" name="more" size="20" />
            </view>
          </Popver>
        </view>
      </view>
      <view
        class="container_tabs__list"
        :style="{
          height: `calc(100% - 100rpx - ${appOption.statusBarHeight}px)`,
        }"
      >
        <swiper class="container_tabs__swiper" :current="swiperCurrent" @animationfinish="animationFinished">
          <swiper-item class="swiper_item" v-for="(outItem, outIndex) in 2" :key="outIndex">
            <scroll-view
              :scroll-top="scrollTop"
              @scroll="handleScroll"
              scroll-y="true"
              :enable-back-to-top="true"
              :scroll-anchoring="true"
              :scroll-with-animation="true"
              class="scroll_books"
            >
              <view class="books" :class="outIndex === 0 ? 'now' : 'history'">
                <template v-if="outIndex === 0">
                  <groupItem :groups="groups.filter((i) => i.index < 0)" @handleOpenGroup="handleOpenGroup" />

                  <template v-for="(item, index) in currentBookList[outIndex]">
                    <view
                      v-if="item.show"
                      class="book-item"
                      :key="item.uid"
                      @click.stop="openReader(item)"
                      v-LongPress="() => handleLongPress(item, index)"
                    >
                      <image
                        class="img"
                        :lazy-load="true"
                        :src="item.image ? `${item.image}` : '../../static/nothing3.png'"
                        mode="scaleToFill"
                      ></image>
                      <view class="book_info">
                        <view class="name">
                          <text>{{ item.bookName }}</text>
                          <view @click.stop="handleLongPress(item, index)">
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

                    <template v-if="findGroupsIndex(index) > -1">
                      <groupItem :groups="[groups[findGroupsIndex(index)]]" @handleOpenGroup="handleOpenGroup" />
                    </template>
                  </template>
                </template>

                <template v-else>
                  <view
                    class="book-item"
                    v-for="(item, index) in currentBookList[outIndex].slice(0, historyLength)"
                    :key="index"
                    @click.stop="openReader(item)"
                  >
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
                        <text class="update">
                          {{ item.latestReadeTimestamp ? formatDate(new Date(item.latestReadeTimestamp)) : "--" }}
                        </text>
                      </view>

                      <view :class="item.isInBookShelves ? 'in_book' : 'add_book'" @click.stop="addBook(item)">
                        {{ item.isInBookShelves ? "已在书架" : "+ 书架" }}
                      </view>
                    </view>
                  </view>
                </template>
              </view>

              <view class="nomore" v-if="outIndex === 1 && currentBookList[1].length > historyLength">
                当前显示最近{{ historyLength }}条浏览记录，更多请到 [我的-浏览历史] 中查看
              </view>
            </scroll-view>
          </swiper-item>
        </swiper>
      </view>
      <bookDetail
        ref="detail"
        v-if="activeBook"
        :activeBook="activeBook"
        @handleStickyBook="handleStickyBook"
        @handleRemoveBook="handleRemoveBook"
      />
      <addGroupCmp ref="group" :moveBooks="[activeBook]" v-if="activeBook" />
      <g-popup v-model:showDialog="showPopupGroup">
        <view class="popup-group">
          <view class="group-list group-popup">
            <view class="group-item" @click="renameGroup">
              <text>重命名分组</text>
            </view>
            <view class="group-item" @click="stickGroup">
              <text>{{ (activeGroup.index ?? 0) < 0 ? "取消" : "" }}置顶分组</text>
            </view>
            <view class="group-item" @click="disbandGroup">
              <text>解散分组</text>
            </view>
            <view class="group-item" @click="removeGroup">
              <text>删除分组</text>
            </view>
          </view>
        </view>
      </g-popup>
      <g-confirm ref="confirm" @handleConfirm="handleConfirm" />
    </view>
    <Tabbar cureentPage="home" :isBackTop="isBackTop" @goBackTop="goBackTop" />
  </g-page>
</template>
<script lang="ts" setup>
import { onShow } from "@dcloudio/uni-app";
import store from "@/store";
import { ref, computed, nextTick } from "vue";
import { vLongPress } from "@/directives";
import Tabbar from "@/components/TabBar.vue";
import Popver from "@/components/popover/index.vue";
import addGroupCmp from "@/pages/tabBar/components/addGroup.vue";
import bookDetail from "./components/bookDetail.vue";
import groupItem from "./components/groupItem.vue";
import { formatDate } from "@/utils/index";
import { cloneDeep } from "lodash";

const bookGroups = store.bookGroups;
const appOption = store.appOption;
const bookShelvesData = store.bookShelves.data;
const historyBookShelves = store.historyBookShelves;
const scrollTop = ref(0);
const oldScrollTop = ref(0);
const activeBook = ref<BooksShelvesData>();
const popver = ref<InstanceType<typeof Popver>>(null);
const group = ref<PopupInstance | null>(null);
const confirm = ref<ConfirmInstance | null>(null);
const detail = ref<PopupInstance | null>(null);
const swiperCurrent = ref(0);
const historyLength = 20;
const isBackTop = ref(false);
const showPopupGroup = ref(false);

let activeGroup: groupBook;
let groupIndex: number = -1;
let isBacking = false;

const actions = [
  { text: "按最近阅读排序", sort: "default" },
  { text: "按照添加时间排序", sort: "join" },
  { text: "按字母排序", sort: "chart" },
];

const sortedBooks = computed(() => {
  const { sort, data } = store.bookShelves;

  const books = [...data];

  // 根据 stickyIndex 排序，置顶的书籍排在最前
  const sortBySticky = (a: BooksShelvesData, b: BooksShelvesData) => (b.stickyIndex || 0) - (a.stickyIndex || 0);

  let res = books;
  switch (sort) {
    case "default": {
      // 按照最近阅读排序
      books
        .sort((a, b) => (b.latestReadeTimestamp || 0) - (a.latestReadeTimestamp || 0)) // 按阅读时间排序
        .sort(sortBySticky); // 按置顶排序
      break;
    }
    case "join": {
      // 按照添加时间排序
      books.sort(sortBySticky); // 仅按照置顶排序
      break;
    }
    case "chart": {
      // 按照字母顺序排序
      books
        .sort((a, b) => a.bookName.localeCompare(b.bookName, "zh")) // 按名字排序，支持中文
        .sort(sortBySticky); // 按置顶排序
      break;
    }
    default:
      break;
  }
  res.forEach((i) => {
    if (i.group) {
      const isIn = bookGroups.value.find((gp) => gp.name === i.group);
      if (isIn) {
        i.show = false;
      } else {
        i.show = true;
      }
    } else {
      i.show = true;
    }
  });

  return res;
});

const groups = computed(() => {
  let groups: groupBook[] = [];

  sortedBooks.value.forEach((i, j) => {
    if (i.group) {
      const isIn = bookGroups.value.find((gp) => gp.name === i.group);
      if (isIn) {
        const g = groups.find((g) => g.group === i.group);
        if (!g) {
          const index = isIn.stickyIndex
            ? isIn.stickyIndex
            : sortedBooks.value.slice(0, j).filter((i) => i.show).length + groups.length;
          groups.push({
            index,
            group: i.group,
            data: [i as BooksShelvesData],
            type: "group",
          });
        } else {
          g.data.push(i as BooksShelvesData);
        }
      }
    }
  });

  return groups.sort((a: groupBook, b: groupBook) => a.index - b.index);
});

const activeIdx = computed(() => {
  const { sort } = store.bookShelves;
  const idx = actions.findIndex((i) => i.sort === sort) || 0;
  return idx;
});

const historyBooks = computed(() => {
  const t = cloneDeep(historyBookShelves.value);
  t.map((i) => {
    const ix = bookShelvesData.findIndex((j) => j.uid === i.uid);
    i.isInBookShelves = ix > -1;
    i.show = true;
    return i;
  });
  return t;
});

const currentBookList = ref([sortedBooks.value, historyBooks.value]);

function handleStickyBook() {
  activeBook.value = sortedBooks.value.find((i) => i.uid === activeBook.value?.uid);
  refreshList();
}

function handleRemoveBook() {
  refreshList();
}

function handleOpenGroup(group: groupBook) {
  activeGroup = group;
  showPopupGroup.value = true;
}

function findGroupsIndex(index: number) {
  return groups.value.findIndex((i) => i.index === index);
}

function renameGroup() {
  const t = bookGroups.value.findIndex((i) => i.name === activeGroup.group);
  if (t > -1) {
    groupIndex = t;
    showPopupGroup.value = false;
    confirm.value?.show({ mode: "input", title: "重命名分组", value: activeGroup.group, key: "renameGroup" });
  }
}

function removeGroup() {
  const t = bookGroups.value.findIndex((i) => i.name === activeGroup.group);
  if (t > -1) {
    groupIndex = t;
    showPopupGroup.value = false;
    confirm.value?.show({
      title: "提示",
      type: "warn",
      content: `当前分组包含 ${activeGroup.data.length} 本作品，删除后作品也将从书架中删除，确定删除吗？`,
      key: "removeGroup",
    });
  }
}
function disbandGroup() {
  const t = bookGroups.value.findIndex((i) => i.name === activeGroup.group);
  if (t > -1) {
    groupIndex = t;
    showPopupGroup.value = false;
    confirm.value?.show({
      title: "提示",
      type: "warn",
      content: "解散分组后，分组内的书籍仍在书架中保留，确定解散吗？",
      key: "disbandGroup",
    });
  }
}
function handleRenameGroup(name: string) {
  activeGroup.data.forEach((book) => {
    const ix = bookShelvesData.findIndex((i) => i.uid === book.uid);
    if (ix > -1) {
      bookShelvesData[ix].group = name;
    }
  });
  bookGroups.value[groupIndex].name = name;
  store.saveBookGroups();
  store.saveBookShelves();
}

function handleDisbandGroup() {
  bookGroups.value.splice(groupIndex, 1);
  store.saveBookGroups();
  store.saveBookShelves();
}

function handleRemoveGroup() {
  const books = activeGroup.data;
  books.forEach((book) => {
    const ix = bookShelvesData.findIndex((i) => i.uid === book.uid);
    if (ix > -1) {
      bookShelvesData.splice(ix, 1);
    }
  });
  bookGroups.value.splice(groupIndex, 1);
  store.saveBookShelves();
  store.saveBookGroups();
}
function stickGroup() {
  const t = bookGroups.value.find((i) => i.name === activeGroup.group);
  if (activeGroup.index < 0) {
    delete t?.stickyIndex;
  } else {
    const min = findMinStickyIndex();

    if (t) {
      t.stickyIndex = min - 1;
    }
  }
  store.saveBookGroups();
  showPopupGroup.value = false;
}
const findMinStickyIndex = (): number => {
  let min = Infinity;

  for (const item of bookGroups.value) {
    const index = item.stickyIndex === undefined ? 0 : item.stickyIndex;
    if (index < min) {
      min = index;
    }
  }

  return min === Infinity ? 0 : min;
};

function handleScroll(e: { detail: { scrollTop: number } }) {
  if (isBacking) return;
  oldScrollTop.value = e.detail.scrollTop;
  if (oldScrollTop.value > appOption.screenHeight / 2) {
    isBackTop.value = true;
  } else {
    isBackTop.value = false;
  }
}

function goBackTop() {
  scrollTop.value = oldScrollTop.value;
  isBackTop.value = false;
  isBacking = true;

  nextTick(() => {
    scrollTop.value = oldScrollTop.value = 0;
    // animation 动画时长为 300
    setTimeout(() => {
      isBacking = false;
    }, 400);
  });
}

function refreshList() {
  currentBookList.value = [sortedBooks.value, historyBooks.value];
}

function addBook(book: BooksShelvesData) {
  if (book.isInBookShelves) return;
  delete book.isInBookShelves;
  bookShelvesData.unshift(book);
  store.saveBookShelves();

  refreshList();
}

function animationFinished(e: any) {
  if (e.detail.current === swiperCurrent.value) return;
  swiperCurrent.value = e.detail.current;
}

function changeTabs(index: number) {
  if (index === swiperCurrent.value) return;
  swiperCurrent.value = index;
}

function handleSelect(item: { text: string; sort: "default" | "join" | "chart" }, index: number) {
  store.bookShelves.sort = item.sort;
  store.saveBookShelves();
  refreshList();
}

function handleConfirm(key: string, inputValue: string) {
  if (key === "default") {
    console.log("confirm");
  } else if (key === "renameGroup") {
    handleRenameGroup(inputValue);
  } else if (key === "removeGroup") {
    handleRemoveGroup();
  } else if (key === "disbandGroup") {
    handleDisbandGroup();
  }
}

function toSearch() {
  uni.navigateTo({
    url: `/pages/search/index`,
  });
}

// 长按逻辑
const handleLongPress = (item: BooksShelvesData, index: number) => {
  if (swiperCurrent.value === 1) return;
  detail.value?.open();
  activeBook.value = item;
};

function openReader(bookInfo: BooksShelvesData) {
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
onShow(() => {
  refreshList();
});
</script>
<style lang="scss" scoped>
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
    border-bottom: 1px solid var(--theme-border-color-light-1);

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
      display: flex;
      align-items: center;

      .manage {
        padding-right: 32rpx;
        font-size: 28rpx;
      }

      .set {
        padding: 20rpx 0 20rpx 32rpx;
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

        .history {
          .book_info {
            flex-direction: row !important;
            align-items: center;
            justify-content: space-between !important;
            .info {
              max-width: 420rpx;
            }
            .name {
              padding-bottom: 12rpx;
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
          }
        }

        .nomore {
          font-size: 24rpx;
          padding: 16rpx 32rpx;
          text-align: center;
          color: var(--theme-grey-color);
        }
      }
    }
  }
}
.popup-group {
  height: unset;
  color: var(--theme-primary-color);
  font-size: 30rpx;
  .group-title {
    text-align: center;
    padding-bottom: 24rpx;
    color: var(--theme-primary-color-light-1);
    font-size: 24rpx;
  }
  .group-list {
    background-color: var(--theme-bg-color-deep);
    border-radius: 40rpx;
    padding: 0 32rpx;
    .group-item {
      height: 100rpx;
      padding: 24rpx 0;
      border-bottom: 1px solid var(--theme-border-color);
      display: flex;
      align-items: center;
      &:nth-last-child(1) {
        border-bottom: unset;
      }
      .icon {
        margin-right: 24rpx;
      }
    }
  }
  .group-popup {
    .group-item {
      text {
        flex: 1;
        text-align: center;
      }
    }
  }
}
</style>
