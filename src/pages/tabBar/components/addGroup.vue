<template>
  <g-popup v-model:showDialog="showDialogGroup">
    <view class="popup-group">
      <view class="group-title">移动到分组</view>
      <view class="group-list">
        <view class="group-item" @click="addGroup" style="border-bottom: unset">
          <view>
            <g-icon-fonts class="icon" name="xinzengfenzu" size="18" />
            <text>新建分组</text>
          </view>
        </view>
        <scroll-view
          scroll-y="true"
          :style="{
            height: `${gropsList.length > 4 ? 430 : gropsList.length * 100}rpx`,
          }"
        >
          <view class="group-item" v-for="(item, idx) in gropsList" :key="idx" @click="addInGroups(item.name)">
            <view>
              <g-icon-fonts class="icon" name="fenzu1" size="18" />
              <text>{{ item.name }}</text>
            </view>
            <view class="tip">
              <view class="total">
                <text style="color: var(--theme-icon-active-color)">{{ item.total || 0 }}</text>
                本
              </view>
              <view class="btn" @click.stop="deleteGroup(item)" v-if="item.total === 0">
                <g-icon-fonts name="shanchu" size="18" />
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </g-popup>
  <g-confirm ref="confirm" @handleConfirm="handleConfirm" />
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import store from "@/store";
import { cloneDeep } from "lodash";
import { showToast } from "@/utils/Control";

const props = defineProps<{ moveBooks: BooksShelvesData[] }>();
const bookGroups = store.bookGroups;
const showDialogGroup = ref(false);
const bookShelvesData = store.bookShelves.data;
const confirm = ref<ConfirmInstance | null>(null);
let activeGroup: GropsList;
interface GropsList extends BookGrop {
  total?: number;
}

const gropsList = computed(() => {
  let t: GropsList[] = cloneDeep(bookGroups.value);
  t.map((i) => {
    i.total = bookShelvesData.filter((book) => book.group === i.name).length;
    return i;
  });

  return t;
});

const emit = defineEmits<{
  (event: "hadledMoved", moveBooks: BooksShelvesData[]): void;
}>();

function deleteGroup(group: GropsList) {
  activeGroup = group;
  confirm.value?.show({ type: "warn", content: `确定要删除分组 [${group.name}] 吗？`, key: "deleteGroup" });
}

function addGroup() {
  confirm.value?.show({ mode: "input", title: "新建分组", key: "addGroup" });
}

function addInGroups(group: string) {
  props.moveBooks.forEach((book) => {
    const idx = bookShelvesData.findIndex((i) => i.uid === book.uid);
    if (idx > -1) {
      bookShelvesData[idx].group = group;
    }
  });

  showDialogGroup.value = false;
  store.saveBookShelves();

  emit("hadledMoved", props.moveBooks);
}
function handleAddGroup(inputValue: string) {
  if (inputValue) {
    if (bookGroups.value.find((i) => i.name === inputValue)) {
      return showToast("该分组已存在");
    }
    bookGroups.value.push({
      name: inputValue,
    });
    store.saveBookGroups();
  }
}
function handleDeleteGroup() {
  const ix = bookGroups.value.findIndex((i) => i.name === activeGroup.name);
  if (ix > -1) {
    bookGroups.value.splice(ix, 1);
    store.saveBookGroups();
  }
}
function handleConfirm(key: string, inputValue: string) {
  if (key === "default") {
    console.log("confirm");
  } else if (key === "addGroup") {
    handleAddGroup(inputValue);
  } else if (key === "deleteGroup") {
    handleDeleteGroup();
  }
}

function open() {
  showDialogGroup.value = true;
}

function close() {
  showDialogGroup.value = false;
}

defineExpose({
  open,
  close,
});
</script>

<style lang="scss" scoped>
.popup-group {
  height: unset;
  color: var(--theme-primary-color);
  font-size: 30rpx;
  .group-title {
    text-align: center;
    padding-bottom: 24rpx;
    color: var(--theme-primary-color-light-1);
    font-size: 24rpx;
  }
  .group-list {
    background-color: var(--theme-bg-color-deep);
    border-radius: 40rpx;
    padding: 0 32rpx;
    .group-item {
      height: 100rpx;
      width: 100%;
      padding: 24rpx 0;
      border-bottom: 1px solid var(--theme-border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      &:nth-last-child(1) {
        border-bottom: unset;
      }
      .icon {
        margin-right: 24rpx;
      }
      .tip {
        display: flex;
        padding-right: 24rpx;
        color: var(--theme-grey-color);
        .btn {
          padding-left: 12rpx;
        }
      }
    }
  }
  .group-popup {
    .group-item {
      text {
        flex: 1;
        text-align: center;
      }
    }
  }
}
</style>
