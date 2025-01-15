<template>
  <g-page>
    <g-statusbar title="意见反馈"></g-statusbar>
    <scroll-view :style="{ height: `calc(100vh - ${store.appOption.statusBarHeight * 2 || 44}px)` }" scroll-y="true">
      <view class="page">
        <uni-easyinput
          trim="both"
          type="textarea"
          :clearable="true"
          autoHeight
          v-model="msg"
          :inputBorder="false"
          placeholder="请输入您的内容"
          :maxlength="200"
        ></uni-easyinput>
        <view class="tip">{{ `${msg.length}/200` }}</view>

        <view class="emial">
          <view style="margin-right: 10px">您的联系方式：</view>
          <uni-easyinput trim="all" v-model="email" placeholder="请输入您的邮箱" :inputBorder="false"></uni-easyinput>
        </view>
        <view class="hz-button-primary" @click="submit">提交</view>

        <view class="ft">非常感谢您的反馈，您的意见和建议对我们非常重要和宝贵，我们将认真对待每一条建议和意见。</view>
      </view>
    </scroll-view>
  </g-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { showToast } from "@/utils/Control";
import store from "@/store";

const msg = ref("");
const email = ref("");

function submit() {
  if (/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(email.value)) {
    if (!msg.value.length) {
      return showToast("请输入内容");
    }
    const params = {
      content: msg.value,
      email: email.value,
    };
    uni.showLoading({
      title: "",
      mask: false,
    });
    console.log(params);

    setTimeout(() => {
      uni.hideLoading();
      showToast("提交成功，非常感谢您的反馈");
    }, 300);
  } else {
    showToast("请输入正确的邮箱地址");
  }
}
</script>

<style scoped lang="scss">
.page {
  background-color: var(--theme-bg-color-deep);
  color: var(--theme-primary-color);
  padding: 32rpx;
  font-size: 26rpx;
  text-align: justify;
  min-height: 100%;
  .tip {
    margin: 24rpx 0;
    text-align: right;
    color: var(--theme-grey-color);
  }

  .ft {
    margin: 24rpx 0;
    color: var(--theme-grey-color);
  }

  .emial {
    display: flex;
    align-items: center;
    padding: 10rpx 20rpx;
    border-radius: 20rpx;
    background-color: var(--theme-bg-white-color);
  }
}

::v-deep .uni-easyinput__content {
  border-radius: 16rpx;
}

::v-deep .uni-easyinput__content-textarea {
  margin-left: 6px;
}
</style>
