<template>
  <g-page>
    <g-popup v-model:showDialog="showDialog" type="center" :showCancel="false">
      <view class="container">
        <scroll-view :style="{ height: `60vh` }" scroll-y="true">
          <view
            :class="['item', bookInfo.origin === item.origin ? 'active' : '']"
            v-for="item in loaded"
            @click="setOrigin(item)"
          >
            <view class="title">{{ bookInfo.bookName }}</view>
            <view class="author">{{ bookInfo.author }}</view>
            <view class="link">{{ `${item.origin}${item.pathname}` }}</view>
          </view>

          <view class="loading" v-if="loading">
            <view class="tip">加载中</view>
            <view :class="store.appOption.theme === 'dark' ? 'loader' : 'loader-dark'"></view>
          </view>
        </scroll-view>
        <view class="btn">
          <view class="hz-button-primary" @click="showDialog = false">取消</view>
        </view>
      </view>
      >
    </g-popup>
  </g-page>
</template>

<script setup lang="ts">
import store from "@/store";
import sourceJson from "@/parser/source";
import { ref, reactive } from "vue";
import { onLoad, onUnload } from "@dcloudio/uni-app";
import * as api from "@/api/common";
import parser from "@/parser/index";

interface SourceItem {
  name: string;
  origin: string;
}

const emit = defineEmits<{
  (event: "handleOriginsChange", origins: Origins): void;
  (event: "setOrigin", origin: OriginItem): void;
}>();

const props = defineProps<{ bookInfo: bookInfo }>();
const pagination = reactive({
  pageSize: 3,
  pageNo: 1,
});
const showDialog = ref(false);
const loading = ref(false);
const breakRequest = ref(false);
const source: SourceItem[] = reactive(sourceJson.local);
const loaded = ref(props.bookInfo.origins);
const maxLoadNumber = 3;
const errorLoaded = ref<{ origin: string; loadNumber: number }[]>([]);

function load() {
  let loadOrigins = getOriginList();

  if (loadOrigins.length === 0) {
    loading.value = false;
    return;
  }

  let origins: Array<string> = [];
  loadOrigins.forEach((i) => {
    const isInError = errorLoaded.value.find((e) => e.origin === i);
    if (isInError) {
      // 最后处理加载失败的书源
      origins.push(i);
    } else {
      // 优先处理未加载过的书源
      origins.unshift(i);
    }
  });
  origins = origins.slice(0, 3);

  loading.value = true;
  // #ifdef H5
  api
    .searchBook({ fuzzy: props.bookInfo.bookName, limit: 10, ...pagination, origins })
    .then((res) => {
      const data = res.data.data as searchBookList[];
      handlerResult(data, origins);
    })
    .catch((e) => {
      handlerErr(origins);
    })
    .finally(() => {
      uni.hideLoading();
    });
  // #endif

  // #ifdef APP-PLUS
  parser
    .searchBook({ fuzzy: props.bookInfo.bookName, limit: 10, ...pagination, origins })
    .then((res) => {
      const data = res.data as searchBookList[];
      handlerResult(data, origins);
    })
    .catch((e) => {
      handlerErr(origins);
    })
    .finally(() => {
      uni.hideLoading();
    });
  // #endif
}
function handlerErr(origins: Array<string>) {
  origins.forEach((i) => {
    const inError = errorLoaded.value.findIndex((e) => e.origin === i);
    if (inError > -1) {
      errorLoaded.value[inError].loadNumber++;
    } else {
      errorLoaded.value.push({
        origin: i,
        loadNumber: 1,
      });
    }
  });

  if (!breakRequest.value) {
    load();
  }
}
function handlerResult(data: searchBookList[], origins: string[]) {
  const result = data.filter((i) => i.bookName === props.bookInfo.bookName && i.author === props.bookInfo.author);

  const realRequest = origins.slice(0, pagination.pageSize);
  realRequest.forEach((i) => {
    const value = result.find((j) => j.origin === i);

    if (!value) {
      const inError = errorLoaded.value.findIndex((e) => e.origin === i);
      if (inError > -1) {
        errorLoaded.value[inError].loadNumber++;
      } else {
        errorLoaded.value.push({
          origin: i,
          loadNumber: 1,
        });
      }
    }
  });

  result.forEach((i) => {
    if (!loaded.value.find((l) => l.origin === i.origin)) {
      loaded.value.push({
        origin: `${i.origin}`,
        pathname: `${i.pathname}`,
      });
    }
  });
  saveOrgins();

  if (!breakRequest.value) {
    load();
  }
}

function saveOrgins() {
  emit("handleOriginsChange", loaded.value);
}

function setOrigin(item: OriginItem) {
  emit("setOrigin", item);
}

function open() {
  showDialog.value = true;
}

function close() {
  showDialog.value = false;
}

defineExpose({
  open,
  close,
});

function getOriginList() {
  const disable = store.sourceMap.value.filter((i) => !i.enable).map((i) => i.origin);

  const enable = source
    .filter((i) => !disable.includes(i.origin))
    .filter((i) => loaded.value.findIndex((j) => i.origin === j.origin) === -1)
    .map((i) => i.origin);

  // 如果超最大请求数，忽略
  errorLoaded.value.forEach((i) => {
    if (i.loadNumber > maxLoadNumber) {
      const idx = enable.findIndex((j) => j === i.origin);
      if (idx > -1) {
        enable.splice(idx, 1);
      }
    }
  });
  return enable;
}

onLoad(() => {
  load();
});
onUnload(() => {
  breakRequest.value = true;
});
</script>

<style lang="scss" scoped>
.container {
  background-color: var(--theme-bg-color-deep);
  padding: 24rpx 0;
  border-radius: 30rpx;
  width: 85vw;
  .item {
    padding: 16rpx 0;
    margin: 0 32rpx;
    border-bottom: 1px solid var(--theme-border-color-light-1);
    .title {
      font-size: 28rpx;
      color: var(--theme-primary-color);
    }
    .author {
      padding: 6rpx 0;
      color: var(--theme-primary-color-light-1);
      font-size: 26rpx;
    }

    .link {
      color: var(--theme-grey-color);
      font-size: 24rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      text-wrap: nowrap;
    }
  }
  .active {
    .title {
      color: var(--theme-icon-active-color);
    }
    .author {
      color: var(--theme-icon-active-color);
    }
    .link {
      color: var(--theme-icon-active-color);
    }
  }
  .btn {
    padding: 0 32rpx;
  }
}
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  .tip {
    font-size: 28rpx;
    color: var(--theme-primary-color);
  }
}
</style>
