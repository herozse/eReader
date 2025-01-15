<template>
  <uni-popup ref="popup" type="dialog" :class="`popup-${options.mode}`">
    <uni-popup-dialog
      :type="options.type"
      :mode="options.mode"
      :maxlength="options.maxlength"
      :showClose="options.showClose"
      :placeholder="options.placeholder"
      :cancelText="options.cancelText"
      :confirmText="options.confirmText"
      :title="options.title"
      :content="options.content"
      :before-close="options.beforeClose"
      v-model="options.value"
      @confirm="handleConfirm"
      @close="handleCancel"
    ></uni-popup-dialog>
  </uni-popup>
</template>

<script setup lang="ts">
import { cloneDeep } from "lodash";
import { ref } from "vue";

const OPTIONS: ConfirmOptions = {
  type: "success",
  cancelText: "取消",
  confirmText: "确定",
  title: "提示",
  content: "提示信息",
  beforeClose: false,
  mode: "base",
  maxlength: 20,
  showClose: true,
  placeholder: "20字以内",
  value: "",
  key: "default",
};
const popup = ref<PopupInstance | null>(null);
const options = ref<ConfirmOptions>(cloneDeep(OPTIONS));

function show(params: Partial<ConfirmOptions>) {
  options.value = cloneDeep(OPTIONS);
  updateObject(options.value, params);
  popup.value?.open();
}

function close() {
  popup.value?.close();
}

function updateObject<T>(target: T, updates: Partial<T>): void {
  Object.keys(updates).forEach((key) => {
    const typedKey = key as keyof T;
    const value = updates[typedKey];
    if (Object.prototype.hasOwnProperty.call(target, typedKey)) {
      target[typedKey] = value!;
    }
  });
}

const emit = defineEmits<{
  (e: "handleConfirm", key: string, inputValue: string): void;
  (e: "handleCancel"): void;
}>();

function handleConfirm() {
  emit("handleConfirm", options.value.key, options.value.value.trim());
}

function handleCancel() {
  emit("handleCancel");
}

defineExpose({
  show,
  close,
});
</script>

<style lang="scss" scoped>
::v-deep {
  .uni-popup-dialog {
    background-color: var(--theme-bg-color-deep);
    color: var(--theme-primary-color);
    .uni-dialog-content {
      color: var(--theme-primary-color-light-1);
    }
    .uni-dialog-title-text {
      color: var(--theme-primary-color);
    }
    .uni-dialog-input {
      background-color: var(--theme-bg-color);
      border: unset;
    }
    .uni-dialog-button-group {
      border: unset;
    }
    .uni-dialog-button {
      height: 100rpx;
      border-radius: 50rpx;
      line-height: 100rpx;
      text-align: center;
      background-color: #fae0da;
      border: unset;
      margin: 0 24rpx 24rpx;
      .uni-dialog-button-text {
        color: #d44842;
      }
    }
    .uni-border-left {
      background-color: #d44842;
      .uni-dialog-button-text {
        color: #fef8f2;
      }
    }
  }
}
</style>
