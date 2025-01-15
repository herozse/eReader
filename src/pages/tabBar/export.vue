<template>
  <view class="export">
    <input class="tm ipt" v-model="bookName" placeholder="输入书名" />
    <view class="tm btn" @click="search">搜索</view>

    <input class="tm ipt" v-model="catalogUrl" placeholder="输入地址" />
    <view class="tm btn" @click="getCatalogs">获取目录</view>

    <input class="tm ipt" v-model="contentUrl" placeholder="输入地址=" />
    <view class="tm btn" @click="getContent">获取内容</view>

    <view class="tm btn" @click="getTop">获取热搜</view>
  </view>
  <Tabbar cureentPage="export" />
</template>
<script lang="ts" setup>
import * as api from "@/api/common";
import Tabbar from "@/components/TabBar.vue";
import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import parser from "@/parser/index";

const bookName = ref("");
// const catalogUrl = ref("http://www.xtangsanshu.com/bulaoji/");
const catalogUrl = ref("http://www.xtangsanshu.com/wozhendehenlihai/");

// const contentUrl = ref("http://www.xtangsanshu.com/quanqiugaowu/280497.html");
const contentUrl = ref("https://www.22biqu.com/biqu173/217248.html");

function getContent() {
  // #ifdef APP-PLUS
  parser.getPageContent({ url: catalogUrl.value }).then((res) => {
    console.log(res);
  });
  // #endif

  uni.showLoading({
    title: "解析中...",
    mask: false,
  });
  // #ifdef H5
  api
    .getContent({ url: contentUrl.value })
    .then((res) => {
      console.log(res.data);
    })
    .finally(() => {
      uni.hideLoading();
    });
  // #endif
}

async function getTop() {
  // #ifdef APP-PLUS
  parser
    .getTopBook({
      gender: "male",
      cate: "全部",
      rank: "rank_hot",
    })
    .then((res) => {
      console.log(res);
    });
  // #endif

  // #ifdef H5
  uni.showLoading({
    title: "解析中...",
    mask: false,
  });
  api
    .getTopBooks({
      gender: "male",
      cate: "全部",
      rank: "rank_hot",
    })
    .then((res) => {
      console.log(res.data);
    })
    .finally(() => {
      uni.hideLoading();
    });
  // #endif
}

function getCatalogs() {
  // parser.getCatalogs({ url: catalogUrl.value }).then((res) => {
  //   console.log(res);
  // });
  // #ifdef APP-PLUS
  parser.getCatalogs({ url: catalogUrl.value }).then((res) => {
    console.log(res);
  });
  // #endif

  // #ifdef H5
  uni.showLoading({
    title: "解析中...",
    mask: false,
  });
  api
    .getCatalogs({ url: catalogUrl.value })
    .then((res) => {
      console.log(res.data);
    })
    .finally(() => {
      uni.hideLoading();
    });
  // #endif
}

function search() {
  // #ifdef APP-PLUS
  parser.searchBook({ fuzzy: bookName.value }).then((res) => {
    console.log(res);
  });
  // #endif

  // #ifdef H5
  uni.showLoading({
    title: "解析中...",
    mask: false,
  });
  api
    .searchBook({ fuzzy: bookName.value })
    .then((res) => {
      console.log(res.data);
    })
    .finally(() => {
      uni.hideLoading();
    });
  // #endif
}
</script>
<style lang="scss" scoped>
.export {
  height: calc(100vh - 50px);
  background-color: #323943e0;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 999;
}

.tm {
  width: 100%;
  height: 50px;
  background-color: #f5f5f5;
  border-radius: 25px;
}

.ipt {
  padding: 0 20px;
}

.btn {
  margin: 20px 0;
  text-align: center;
  line-height: 50px;
  background-color: #4bb067;
  color: #fff;
}
</style>
