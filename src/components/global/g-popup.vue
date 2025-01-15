<template>
  <uni-popup
    :safe-area="false"
    ref="popup"
    :type="type"
    :class="['u-poup', `popup-${type}`]"
    :is-mask-click="false"
    background-color="transparent"
    @maskClick="close"
  >
    <view class="popup-content">
      <slot></slot>
      <view v-if="showCancel" class="group-cancel hz-button-cancel" @click="close">{{ cancelTest }}</view>
    </view>
  </uni-popup>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { ref, nextTick } from "vue";

const popup = ref<PopupInstance | null>(null);
const popopAnimationCompulete = ref(false);

const emit = defineEmits<{
  (e: "update:showDialog", value: boolean): void;
}>();
const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "bottom",
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  cancelTest: {
    type: String,
    default: "取消",
  },
});
watch(
  () => props.showDialog,
  (newVal, oldVal) => {
    if (newVal) {
      show();
    } else {
      close();
    }
  },
  {
    immediate: true,
    deep: true,
  },
);

function show() {
  if (!popup.value) {
    nextTick(() => {
      openPopup();
    });
  } else {
    openPopup();
  }
}

function openPopup() {
  popup.value?.open();
  popopAnimationCompulete.value = false;
  setTimeout(() => {
    popopAnimationCompulete.value = true;
  }, 400);
}

function close() {
  if (!popopAnimationCompulete.value) return;
  popup.value?.close();
  emit("update:showDialog", false);
}
</script>

<style lang="scss" scoped>
.popup-bottom {
  .popup-content {
    font-size: 30rpx;
    padding: 32rpx 32rpx 64rpx;
    position: relative;
    border-top-left-radius: 50rpx;
    border-top-right-radius: 50rpx;
    background-color: var(--theme-bg-color);
    color: var(--theme-primary-color);
  }
}

</style>
