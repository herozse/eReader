<template>
  <g-page>
    <g-statusbar title="关于我们"></g-statusbar>
    <scroll-view :style="{ height: `calc(100vh - ${store.appOption.statusBarHeight * 2 || 44}px)` }" scroll-y="true">
      <view class="about">
        <view class="header">
          <image class="img" src="../../static/fengmian.png" mode="scaleToFill"></image>
          <view>e读</view>
          <view class="version">版本 1.0.0</view>
        </view>
        <view class="footer">
          <view class="protocol">
            <view @click="toUrl(`/pages/blank/agreement`)">用户协议</view>
            <view class="icon"></view>
            <view @click="toUrl(`/pages/blank/policy`)">隐私政策</view>
          </view>
          <view class="copyright">e读2024版权所有</view>
        </view>
      </view>
    </scroll-view>
  </g-page>
</template>

<script setup lang="ts">
import store from "@/store";

function toUrl(url: string) {
  uni.navigateTo({
    url,
  });
}
</script>

<style scoped lang="scss">
.about {
  background-color: var(--theme-bg-color);
  color: var(--theme-primary-color);
  font-size: 28rpx;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  .header {
    text-align: center;
    margin: 100rpx auto;

    .img {
      width: 160rpx;
      height: 160rpx;
    }

    .version {
      color: var(--theme-grey-color);
      padding-top: 8rpx;
    }
  }

  .footer {
    margin-bottom: 40rpx;
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-direction: column;

    .copyright {
      padding-top: 32rpx;
      font-size: 24rpx;
      color: var(--theme-grey-color);
    }

    .protocol {
      display: flex;
      align-items: center;

      .icon {
        margin: 0 45rpx;
        height: 40rpx;
        width: 2rpx;
        border-radius: 2rpx;
        background-color: var(--theme-primary-color);
      }
    }
  }
}
</style>
