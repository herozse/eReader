<template>
  <view
    class="status_bar"
    :style="{
      height: appOption.statusBarHeight + 'px',
      backgroundColor: backgroundColor,
      width: '100%',
    }"
  ></view>
  <view
    class="page_header"
    :style="{
      height: height + 'px',
      backgroundColor: backgroundColor,
    }"
  >
    <view
      class="status_bar"
      :style="{
        height: height + 'px',
      }"
    >
      <g-icon-fonts name="arrowleft" size="20" class="icon" @click="back" color="var(--theme-primary-color)" />
      <view class="status_left">
        <slot name="left"></slot>
      </view>
      <view class="status_title">
        {{ props.title }}
      </view>
      <view class="status_right">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import store from "@/store";
import { ref } from "vue";
const appOption = store.appOption;

const height = ref(appOption.statusBarHeight || 44);
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  backgroundColor: {
    type: String,
    default: "var(--theme-bg-color)",
  },
});
function back() {
  uni.navigateBack();
}
</script>

<style scoped lang="scss">
.status_bar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16rpx;
  color: var(--theme-primary-color);
  .status_title {
    font-weight: 600;
    font-size: 16px;
    flex: 1;
    text-align: center;
  }
  .status_left {
    text-align: left;
  }
  .icon {
    width: 50rpx;
    text-align: left;
  }
  .status_left {
    min-width: 50rpx;
  }
  .status_right {
    width: 50px;
    text-align: right;
  }
}
</style>
