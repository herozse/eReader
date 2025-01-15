<template>
  <view class="expand" @click="canExpand && toggleInfo()">
    <view class="content_container info" :style="{ height: containerHeight }" id="container">
      <view class="content_des" id="content">
        <view class="des_p" v-for="(item, idx) in desc" :key="idx">
          {{ item.trim() }}
        </view>
      </view>
    </view>
    <view class="hidebtn" @click.stop="toggleInfo" v-if="canExpand && !isExpand">
      <g-icon-fonts name="expand" size="24" color="#CDC7C1" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { pxToRpx } from "@/utils/index";

const props = defineProps({
  content: {
    type: String,
    default: "",
  },
  lines: {
    type: Number,
    default: 2,
  },
});

const isExpand = ref(false); // 控制展开/收起状态
const containerHeight = ref("auto"); // 动态高度
const containerHeightValue = ref(0); // 动态高度

const fontSize = pxToRpx(14); // 字体大小 14px
const lineHeight = fontSize * 1.5; // 计算行高，假设 1.5 倍字体大小
const maxHeight = lineHeight * props.lines;

const canExpand = ref(false); // 控制是否显示“展开”按钮

const desc = computed(() => {
  return props.content.replace(/\\n/g, "\n").split("\n");
});

function toggleInfo() {
  if (isExpand.value) {
    // 收起
    containerHeight.value = `${maxHeight}rpx`; // 两行高度
    containerHeightValue.value = maxHeight;
  } else {
    // 展开
    getNodeInfo("#content").then((contentEl) => {
      if (contentEl) {
        const height = pxToRpx(contentEl.height ?? 0);
        containerHeight.value = `${height}rpx`; // 完整内容高度
        containerHeightValue.value = height;
      }
    });
  }

  isExpand.value = !isExpand.value;
}

function initializeHeight() {
  Promise.all([getNodeInfo("#content"), getNodeInfo("#container")]).then(([contentEl, containerEl]) => {
    if (contentEl && containerEl) {
      const height = pxToRpx(contentEl.height ?? 0);
      if (height > maxHeight) {
        containerHeight.value = `${maxHeight}rpx`; // 设置为两行高度
        containerHeightValue.value = maxHeight;
        canExpand.value = true; // 显示“展开”按钮
      } else {
        containerHeight.value = "auto"; // 内容不足两行
        containerHeightValue.value = height;
        canExpand.value = false; // 不显示“展开”按钮
      }
    }
  });
}

function getNodeInfo(selector: string): Promise<UniApp.NodeInfo | null> {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery();
    query
      .select(selector)
      .boundingClientRect((data) => {
        resolve((data as UniApp.NodeInfo) || null);
      })
      .exec();
  });
}

onMounted(() => {
  initializeHeight();
});

defineExpose({
  containerHeightValue,
});
</script>

<style lang="scss" scoped>
.expand {
  display: flex;
  flex-direction: column;
  position: relative;
  line-height: 1.5;
  width: 100%;

  .info {
    overflow: hidden;
    transition: height 0.3s ease;
  }

  .content_des {
    font-size: 28rpx;
    color: var(--theme-primary-color-light-1);
    word-break: break-word;
    white-space: pre-line;
    text-align: justify;
  }

  .hidebtn {
    width: 100rpx;
    height: 40rpx;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, var(--theme-bg-color) 50%);
    position: absolute;
    z-index: 4;
    right: 0;
    bottom: 0;
  }
}
</style>
