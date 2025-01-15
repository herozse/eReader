<template>
  <g-popup v-model:showDialog="showDetailDialog" :showCancel="false">
    <view class="popup-content">
      <view class="top_content" @click.stop="toDetail">
        <image
          class="img"
          :src="activeBook?.image ? activeBook?.image : '../../static/nothing3.png'"
          mode="scaleToFill"
        ></image>
        <view class="book_info">
          <view class="name">
            <text class="title">{{ activeBook?.bookName }}</text>
            <view class="to">
              <text style="padding-bottom: 6rpx">详情</text>
              <g-icon-fonts class="icon" name="arrowright" size="12" color="var(--theme-icon-link-color)" />
            </view>
          </view>
          <text class="author">作者：{{ activeBook?.author }}</text>
        </view>
      </view>
      <view class="bottom_content">
        <view class="item" @click="showShare">
          <g-icon-fonts class="icon" name="fenxiang1" size="20" color="var(--theme-light-icon-color)" />
          <text>分享</text>
        </view>
        <view class="item" @click="stickyBook">
          <g-icon-fonts
            class="icon"
            name="zhiding"
            size="20"
            :color="activeBook?.stickyIndex ? 'var(--theme-icon-active-color)' : 'var(--theme-light-icon-color)'"
          />
          <text
            :style="{
              color: activeBook?.stickyIndex ? 'var(--theme-icon-active-color)' : 'var(--theme-light-icon-color)',
            }"
          >
            置顶
          </text>
        </view>
        <view class="item" @click="showGroup">
          <g-icon-fonts class="icon" name="fenzu" size="20" color="var(--theme-light-icon-color)" />
          <text>移至分组</text>
        </view>
        <view class="item" @click="removeBook">
          <g-icon-fonts class="icon" name="yichushujia" size="20" color="var(--theme-light-icon-color)" />
          <text class="text">移除书架</text>
        </view>
      </view>
    </view>
  </g-popup>

  <AddGroupCmp ref="group" :moveBooks="[activeBook]" />
  <Share ref="share" :activeBook="activeBook" />
  <g-confirm ref="confirm" @handleConfirm="handleConfirm" />
</template>

<script setup lang="ts">
import store from "@/store";
import { ref } from "vue";
import AddGroupCmp from "./addGroup.vue";
import Share from "@/components/share.vue";

const bookShelvesData = store.bookShelves.data;
const group = ref<PopupInstance | null>(null);
const share = ref<PopupInstance | null>(null);
const confirm = ref<ConfirmInstance | null>(null);
const props = defineProps<{ activeBook: BooksShelvesData }>();
const showDetailDialog = ref(false);

const emit = defineEmits<{
  (event: "handleStickyBook"): void;
  (event: "handleRemoveBook"): void;
}>();

function showShare() {
  closePopup();
  setTimeout(() => {
    share.value?.open();
  }, 400);
}

function toDetail() {
  if (props.activeBook) {
    closePopup();
    uni.navigateTo({
      url: `/pages/bookDetail/index?adress=${props.activeBook.origin}${props.activeBook.pathname}`,
    });
  }
}

function stickyBook() {
  const idx = bookShelvesData.findIndex((i) => i.uid === props.activeBook.uid);
  if (idx > -1) {
    if (props.activeBook.stickyIndex) {
      // 取消置顶
      delete bookShelvesData[idx].stickyIndex;
    } else {
      // 置顶
      const max = findMaxStickyIndex();
      bookShelvesData[idx].stickyIndex = max + 1;
    }
    store.saveBookShelves();

    emit("handleStickyBook");
  }
}

const findMaxStickyIndex = (): number => {
  if (!bookShelvesData.length) return 0; // 如果数组为空，返回默认值

  return bookShelvesData.reduce(
    (max, item) => Math.max(max, item.stickyIndex || 0),
    0, // 初始值为 0
  );
};

function closePopup() {
  showDetailDialog.value = false;
}
function showGroup() {
  closePopup();
  setTimeout(() => {
    group.value?.open();
  }, 400);
}

function handleConfirm(key: string, inputValue: string) {
  if (key === "default") {
    console.log("confirm");
  } else if (key === "removeBook") {
    handleRemoveBook();
  }
}

function handleRemoveBook() {
  const idx = bookShelvesData.findIndex((i) => i.uid === props.activeBook.uid);
  if (idx > -1) {
    bookShelvesData.splice(idx, 1);
    store.saveBookShelves();
    closePopup();
    emit("handleRemoveBook");
  }
}
function removeBook() {
  confirm.value?.show({ type: "error", content: "确定将本书移除书架?", key: "removeBook" });
}

function open() {
  showDetailDialog.value = true;
}
function close() {
  showDetailDialog.value = false;
}
defineExpose({
  open,
  close,
});
</script>

<style lang="scss" scoped>
.popup-content {
  padding: 32rpx 0;
  background-color: var(--theme-bg-color);
  border-top-left-radius: 50rpx;
  border-top-right-radius: 50rpx;
  position: relative;

  .top_content {
    position: absolute;
    top: -52rpx;
    left: 32rpx;
    display: flex;

    .img {
      width: 100rpx;
      height: 140rpx;
      margin-right: 20rpx;
    }

    .img {
      border-radius: 10rpx;
      width: 110rpx;
      height: 154rpx;
      margin-right: 20rpx;
      background-color: var(--theme-bg-color);
    }

    .book_info {
      font-size: 24rpx;
      color: var(--theme-grey-color);
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;

      text {
        overflow: hidden;
        word-break: break-all;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
      }

      .name {
        display: flex;
        align-items: center;
        padding-bottom: 16rpx;

        .title {
          font-size: 32rpx;
          line-height: 32rpx;
          color: var(--theme-primary-color);
          max-width: 400rpx;
          margin-right: 20rpx;
        }

        .to {
          display: flex;
          align-items: center;
          font-size: 26rpx;
          color: var(--theme-link-color);
        }
      }
    }
  }

  .bottom_content {
    display: flex;
    margin-top: 100rpx;
    background-color: var(--theme-bg-color-deep);
    padding: 32rpx 0;
    border-radius: 40rpx;
    color: var(--theme-light-icon-color);

    .item {
      font-size: 24rpx;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;

      .icon {
        padding-bottom: 8rpx;
      }
    }
  }
}
</style>
