<template>
  <g-page>
    <view class="personal">
      <view class="status_bar" :style="{ height: appOption.statusBarHeight + 'px', width: '100%' }"></view>
      <view class="header">
        <image class="img" src="../../static/user_male.png" mode="scaleToFill"></image>
        <view class="title">
          <view class="h1">{{ getGreetingMessage() }}</view>
          <view class="name">欢迎使用e读</view>
        </view>
      </view>
      <view class="setting">
        <view
          class="item"
          v-for="(item, idx) in settingType"
          :key="idx"
          @click="item.method"
          :class="item.type === 'switch' ? 'nopadding' : ''"
        >
          <view class="title">
            <image class="img" :src="item.img" mode="scaleToFill"></image>
            <text>{{ item.name }}</text>
          </view>
          <text class="text" v-if="item.text">{{ item.text }}</text>
          <view class="switch" v-if="item.type === 'switch'">
            <switch :checked="isThemeDark" color="#FFCC33" style="transform: scale(0.7)" @change="switchTheme" />
          </view>
          <g-icon-fonts v-if="!item.hideIcon" name="arrowright" size="12" />
        </view>
      </view>
    </view>
    <Share ref="share" />
    <g-confirm ref="confirm" @handleConfirm="handleConfirm" />
    <Tabbar cureentPage="personal" />
  </g-page>
</template>
<script lang="ts" setup>
import store from "@/store";
import Tabbar from "@/components/TabBar.vue";
import Share from "@/components/share.vue";
import { ref, computed } from "vue";

const appOption = store.appOption;
const share = ref<PopupInstance | null>(null);
const confirm = ref<ConfirmInstance | null>(null);

const isThemeDark = computed(() => store.appOption.theme === "dark");

const settingType = [
  {
    name: "书源管理",
    img: "../../static/shuyuan.png",
    method: toUrl.bind(null, `/pages/blank/origin`),
  },
  {
    name: "浏览历史",
    img: "../../static/lishi.png",
    method: toUrl.bind(null, `/pages/blank/history`),
  },
  {
    name: "夜间模式",
    img: "../../static/yejian.png",
    hideIcon: true,
    type: "switch",
    method: "",
  },
  {
    name: "关于我们",
    img: "../../static/guanyu.png",
    method: toUrl.bind(null, `/pages/blank/about`),
  },
  {
    name: "意见反馈",
    img: "../../static/yijian.png",
    method: toUrl.bind(null, `/pages/blank/feedback`),
  },
  {
    name: "联系我们",
    img: "../../static/lianxi.png",
    hideIcon: true,
    text: "linzesen021@163.com",
    method: "",
  },
  {
    name: "清除缓存",
    img: "../../static/qingchu.png",
    method: handleClearCache,
  },
  {
    name: "分享给朋友",
    img: "../../static/fenxiang.png",
    method: handleShare,
  },
];

function switchTheme(e: any) {
  const value = e.detail.value;
  if (value) {
    store.appOption.theme = "dark";
  } else {
    store.appOption.theme = "light";
  }

  store.saveAppOption();
}

function toUrl(url: string) {
  uni.navigateTo({
    url,
  });
}

function handleConfirm() {
  store.clearAllCache();
}

function handleClearCache() {
  confirm.value?.show({ type: "warn", content: "确定要清除所有缓存数据吗" });
}
function handleShare() {
  share.value?.open();
}

function getGreetingMessage() {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 9) {
    return "早上好";
  } else if (currentHour >= 9 && currentHour < 12) {
    return "上午好";
  } else if (currentHour >= 12 && currentHour < 14) {
    return "中午好";
  } else if (currentHour >= 14 && currentHour < 18) {
    return "下午好";
  } else if (currentHour >= 18 && currentHour < 24) {
    return "晚上好";
  } else {
    return "夜晚深了，该休息了哦~";
  }
}
</script>
<style lang="scss" scoped>
.personal {
  height: calc(100vh - 160rpx);
  overflow: hidden;
  background-color: var(--theme-bg-color-deep);
  font-size: 28rpx;
  color: var(--theme-primary-color);

  .header {
    padding: 0 32rpx 50rpx;
    height: 240rpx;
    display: flex;
    align-items: flex-end;

    .img {
      width: 120rpx;
      height: 120rpx;
      border: 1rpx solid var(--theme-bg-color);
      border-radius: 60rpx;
      margin-right: 32rpx;
    }

    .title {
      .h1 {
        font-size: 38rpx;
      }

      .name {
        font-size: 30rpx;
        margin-top: 10rpx;
      }
    }
  }

  .setting {
    margin: 0 32rpx;
    padding: 0 24rpx;
    overflow: hidden;
    border-radius: 32rpx;
    background-color: var(--theme-bg-color);

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100rpx;
      border-bottom: 1px solid var(--theme-border-color);

      &:nth-last-child(1) {
        border-bottom: unset;
      }

      .text {
        color: var(--theme-grey-color);
      }

      .title {
        display: flex;
        align-items: center;

        .img {
          width: 52rpx;
          height: 52rpx;
          border-radius: 26rpx;
          overflow: hidden;
          margin-right: 32rpx;
        }
      }
    }
    .nopadding {
      padding-right: 0;
    }
  }
}
</style>
