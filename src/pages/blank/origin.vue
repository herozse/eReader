<template>
  <g-page :class="showMenu ? 'show-menu' : 'hide-menu'">
    <g-statusbar title="书源管理">
      <template v-slot:right>
        <view style="font-size: 14px" @click="doEdit">{{ showMenu ? "取消" : "编辑" }}</view>
      </template>
    </g-statusbar>
    <scroll-view :style="{ height: `calc(100vh - ${store.appOption.statusBarHeight * 2 || 44}px)` }" scroll-y="true">
      <view class="history">
        <scroll-view
          :scroll-top="scrollTop"
          scroll-y="true"
          :enable-back-to-top="true"
          :scroll-anchoring="true"
          class="scroll_books"
          :style="{
            height: `calc(100vh - ${store.appOption.statusBarHeight || 44}px)`,
          }"
        >
          <view class="books history">
            <checkbox-group @change="handleChecked">
              <view class="book-item" v-for="(item, index) in originList" :key="index">
                <checkbox
                  v-if="showMenu"
                  :value="`${item.origin}`"
                  :checked="item.checked"
                  :class="['check-radio', showMenu ? 'active' : '', item.checked ? 'checked' : '']"
                />
                <view class="book_info">
                  <view class="left">
                    <view class="name">{{ item.name }}</view>
                    <view class="origin">{{ item.origin }}</view>
                  </view>
                  <switch
                    :checked="item.enable"
                    color="#FFCC33"
                    style="transform: scale(0.7)"
                    @change="(v) => switchOrigin(v, item)"
                  />
                </view>
              </view>
              <view class="block" style="width: 100%; height: 280rpx" v-if="showMenu"></view>
            </checkbox-group>
          </view>
        </scroll-view>
      </view>
    </scroll-view>

    <view class="footer-bar">
      <view class="select-all">
        <view class="left">
          <checkbox-group @change="handleCheckedAll">
            <checkbox
              value="all"
              class="radio"
              :checked="checkedAll.length > 0"
              :class="checkedAll.length ? 'checked' : ''"
            />
          </checkbox-group>
          <view>全选</view>
        </view>
        <view class="right">
          已选
          <text style="color: var(--theme-icon-active-color)">{{ checekdGroup.length }}</text>
          个书源
        </view>
      </view>

      <view class="type">
        <view class="item" @click="addBooks">
          <g-icon-fonts class="icon" name="qiyong" size="20" />
          <text>启用</text>
        </view>
        <view class="item" @click="deleteBook">
          <g-icon-fonts class="icon" name="jinyong" size="20" />
          <text>禁用</text>
        </view>
      </view>
    </view>
  </g-page>
</template>
<script lang="ts" setup>
import store from "@/store";
import sourceJson from "@/parser/source";
import { ref, computed } from "vue";
import { showToast } from "@/utils/Control";
import { reactive } from "vue";

interface SourceItem {
  name: string;
  origin: string;
  enable?: boolean;
  checked?: boolean;
}

const scrollTop = ref(0);
const checekdGroup = ref<Array<string>>([]);
const checkedAll = ref<Array<string>>([]);
const showMenu = ref(false);
const source: SourceItem[] = reactive(sourceJson.local);
const sourceMap = store.sourceMap;

const originList = computed(() => {
  source.forEach((i) => {
    const ix = sourceMap.value.find((item) => i.origin === item.origin);
    if (ix) {
      i.enable = ix.enable;
    } else {
      i.enable = true;
    }

    i.checked = checekdGroup.value.includes(i.origin);
  });

  return source;
});

function switchOrigin(e: any, item: SourceItem) {
  const ix = sourceMap.value.find((i) => i.origin === item.origin);
  if (ix) {
    ix.enable = e.detail.value;
  } else {
    sourceMap.value.push({
      origin: item.origin,
      name: item.name,
      enable: e.detail.value,
    });
  }

  store.saveSourceMap();
}

function doEdit() {
  checekdGroup.value = [];
  checkedAll.value = [];
  showMenu.value = !showMenu.value;
}
function handleChecked(e: any) {
  const value = e.detail.value;
  checekdGroup.value = value;
  console.log(value);

  if (value.length === originList.value.length) {
    checkedAll.value = ["all"];
  } else {
    checkedAll.value = [];
  }
}
function handleCheckedAll(e: any) {
  const value = e.detail.value;
  checkedAll.value = value;
  if (value.length) {
    checekdGroup.value = originList.value.map((i) => i.origin);
  } else {
    checekdGroup.value = [];
  }
}

function deleteBook() {
  if (checekdGroup.value.length) {
    showToast("操作成功");
    switchEnables(false);
    resetChecked();
  } else {
    showToast("请选择书源");
  }
}

function resetChecked() {
  checekdGroup.value = [];
  checkedAll.value = [];
}

function switchEnables(enable: boolean) {
  const select = source.filter((i) => checekdGroup.value.includes(i.origin));
  select.forEach((item) => {
    const ix = sourceMap.value.find((i) => i.origin === item.origin);
    if (ix) {
      ix.enable = enable;
    } else {
      sourceMap.value.push({
        origin: item.origin,
        name: item.name,
        enable: enable,
      });
    }
  });

  store.saveSourceMap();
}

function addBooks() {
  if (checekdGroup.value.length) {
    switchEnables(true);
    showToast("操作成功");
    resetChecked();
  } else {
    showToast("请选择书源");
  }
}
</script>
<style lang="scss" scoped>
.history {
  background-color: var(--theme-bg-color);
  color: var(--theme-primary-color);
  min-height: 100%;
}

.scroll_books {
  .books {
    padding: 32rpx 32rpx 48rpx;
    .book-item {
      padding: 16rpx;
      width: 100%;
      height: 120rpx;
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--theme-border-color);

      .book_info {
        height: 100%;
        font-size: 26rpx;
        color: var(--theme-grey-color);
        flex: 1;
        display: flex;
        align-content: center;
        justify-content: space-between;
        .name {
          font-size: 30rpx;
          color: var(--theme-primary-color);
          margin-bottom: 8rpx;
        }
      }
    }
  }
}

.footer-bar {
  font-size: 28rpx;
  padding-bottom: 64rpx;
  width: 100%;
  height: 280rpx;
  background-color: var(--theme-bg-color);
  position: fixed;
  z-index: 12;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  color: var(--theme-grey-color);
  transition: 0.3s all;
  .select-all {
    padding: 12rpx 32rpx;
    display: flex;
    align-items: center;
    background-color: var(--theme-bg-color-light-1);
    .left {
      display: flex;
      align-items: center;
      flex: 1;
    }
  }

  .type {
    flex: 1;
    display: flex;
    justify-content: space-between;
    .item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .icon {
        margin-bottom: 12rpx;
      }
    }
  }
}

.hide-menu {
  .footer-bar {
    transform: translateY(100%);
  }
}
</style>
