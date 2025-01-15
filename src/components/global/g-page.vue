<template>
  <view
    :class="['hz-page', store.appOption.theme === 'dark' ? 'theme-dark' : 'theme-light']"
    :style="{
      '--theme-bg-color': themeStyle.bgColor,
      '--theme-bg-color-light-1': themeStyle.bgColorLight1,
      '--theme-bg-white-color': themeStyle.bgWhiteColor,
      '--theme-bg-color-deep': themeStyle.bgColorDeep,
      '--theme-bg-book-color': themeStyle.bgColorBook,

      '--theme-primary-color': themeStyle.primaryColor,
      '--theme-primary-book-color': themeStyle.primaryBookColor,
      '--theme-primary-color-light-1': themeStyle.primaryColorLight1,
      '--theme-grey-color': themeStyle.greyColor,
      '--theme-link-color': themeStyle.linkColor,

      '--theme-border-color': themeStyle.borderColor,
      '--theme-border-color-light-1': themeStyle.borderColorLight1,

      '--theme-light-icon-color': themeStyle.lightIconColor,
      '--theme-grey-icon-color': themeStyle.greyIconColor,
      '--theme-icon-active-color': themeStyle.iconActiveColor,
      '--theme-icon-link-color': themeStyle.iconLinkColor,
    }"
  >
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import store from "@/store";

const pages = getCurrentPages();
let currentRoute = pages[pages.length - 1].route;
// console.log("当前页面路径：" + currentRoute);

const themeStyle = computed(() => {
  let isDark = store.appOption.theme === "dark";
  if (currentRoute === "pages/reader/index") {
    isDark = store.bookOption.theme === "dark";
  }
  return {
    bgColor: isDark ? "#2A241D" : "#FEF7F1",
    bgColorLight1: isDark ? "#3B352E" : "#F4EEE7",
    bgColorDeep: isDark ? "#1D1710" : "#f4eee7",
    bgWhiteColor: isDark ? "#38312B" : "#f1edea",
    bgColorBook: isDark ? "#4c4945" : "#c0a374",

    lightIconColor: isDark ? "#FEF7F1" : "#251e18",
    greyIconColor: isDark ? "#a8a19a" : "#554334",
    iconActiveColor: isDark ? "#EC5D57" : "#D44842",
    iconLinkColor: isDark ? "#4F5C75" : "#92afe2",

    primaryColor: isDark ? "#E9E3DC" : "#251e18",
    primaryBookColor: isDark ? "#c9c9c9" : "#482936",
    primaryColorLight1: isDark ? "#BDB7B1" : "#554e48",
    greyColor: isDark ? "#8F8982" : "#857f78",
    linkColor: isDark ? "#7E9EDA" : "#92afe2",

    borderColor: isDark ? "#5d5c5a" : "#eae0e0",
    borderColorLight1: isDark ? "#383838" : "#eee",
  };
});
</script>
