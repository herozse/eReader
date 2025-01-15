<template>
  <view class="tabbar">
    <view
      v-for="(item, index) in tabbarList"
      :key="index"
      class="tab-item"
      @tap="navigatorTo(item.pagePath, item.key)"
      :style="{
        color: cureentPage === item.key ? 'var(--theme-icon-active-color)' : 'var(--theme-light-icon-color)',
        flex: 1,
        textAlign: 'center'
      }"
    >
      <g-icon-fonts
        class="icon"
        size="20"
        :name="cureentPage === item.key && isBackTop ? 'huidaodingbu' : item.icon"
        :color="cureentPage === item.key ? 'var(--theme-icon-active-color)' : 'var(--theme-light-icon-color)'"
      />
      <view class="name" style="font-size: 24rpx; padding-top: 8rpx">
        {{ cureentPage === item.key && isBackTop ? "回顶部" : item.text }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps({
  cureentPage: {
    type: String,
    default: "home",
  },
  isBackTop: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (event: "goBackTop"): void;
}>();

const tabbarList = [
  {
    pagePath: "/pages/tabBar/home",
    icon: "shujia",
    color: "var(--theme-light-icon-color)",
    key: "home",
    text: "书架",
  },
  {
    pagePath: "/pages/tabBar/book",
    icon: "huo",
    color: "var(--theme-light-icon-color)",
    key: "book",
    text: "精选",
  },
  // {
  //   pagePath: "/pages/tabBar/export",
  //   icon: "export",
  //   color: "#251E18",
  //   key: "export",
  //   text: "导入",
  // },
  {
    pagePath: "/pages/tabBar/personal",
    icon: "wode",
    color: "var(--theme-light-icon-color)",
    key: "personal",
    text: "我的",
  },
];

const navigatorTo = (path: String, key: String) => {
  if (key === props.cureentPage) {
    if (props.isBackTop) {
      emit("goBackTop");
    }
    return;
  }
  uni.redirectTo({
    url: path,
  });
};
</script>

<style scoped>
.tabbar {
  padding-top: 20rpx;
  border-top: 1px solid var(--theme-border-color-light-1);
  background-color: var(--theme-bg-color);
  z-index: 22;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 160rpx;
  display: flex;
  justify-content: space-between;
}
</style>
