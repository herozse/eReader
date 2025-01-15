<template>
  <view
    v-for="(gp, ix) in groups"
    class="book-item"
    :key="ix"
    @click.stop="goGroupDetail(gp)"
    v-LongPress="() => handleOpenGroup(gp)"
  >
    <image class="img" :lazy-load="true" src="../../../static/nothing.png" mode="scaleToFill"></image>
    <view class="book_info">
      <view class="name">
        <text>{{ gp.group }}</text>
        <view @click.stop="handleOpenGroup(gp)">
          <g-icon-fonts class="icon" name="more" size="20" />
        </view>
      </view>

      <text class="author">{{ gp.data.length }} 本</text>
      <text class="update">
        {{ gp.data.map((i) => i.bookName).join(" · ") }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { vLongPress } from "@/directives";
const props = defineProps<{ groups: groupBook[] }>();
const emit = defineEmits<{
  (event: "handleOpenGroup", group: groupBook): void;
}>();

function goGroupDetail(group: groupBook) {
  uni.navigateTo({
    url: `/pages/groupDetail/index?group=${group.group}`,
  });
}

function handleOpenGroup(group: groupBook) {
  emit("handleOpenGroup", group);
}
</script>

<style lang="scss" scoped>
.book-item {
  padding: 16rpx;
  width: 100%;
  height: 174rpx;
  display: flex;
  border-bottom: 1px solid var(--theme-border-color);

  .img {
    border-radius: 10rpx;
    width: 100rpx;
    height: 100%;
    margin-right: 20rpx;
  }

  .book_info {
    font-size: 24rpx;
    color: var(--theme-grey-color);
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;

    text {
      overflow: hidden;
      word-break: break-all;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
    }

    .name {
      font-size: 32rpx;
      color: var(--theme-primary-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .update {
      -webkit-line-clamp: 1;
    }
  }
}
</style>
