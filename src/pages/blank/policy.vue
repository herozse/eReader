<template>
  <g-page>
    <g-statusbar title="隐私政策"></g-statusbar>
    <scroll-view :style="{ height: `calc(100vh - ${store.appOption.statusBarHeight * 2 || 44}px)` }" scroll-y="true">
      <view class="page">
        <h2 class="title">隐私政策</h2>
        <h3>一、总则</h3>
        <view>1.1 本软件尊重并保护用户隐私，本隐私政策旨在说明本软件对用户数据的收集、使用和保护方式。</view>
        <view>
          1.2 用户在使用本软件前，请仔细阅读并理解本隐私政策。如用户不同意本隐私政策的任一内容，应立即停止使用本软件。
        </view>
        <h3>二、数据收集与使用</h3>

        <view>2.1 本软件不主动收集、存储或共享任何用户的个人信息。</view>
        <view>
          2.2
          用户在使用本软件时可能通过访问第三方服务或内容而涉及个人信息的处理，此类信息的处理和使用规则由该第三方的隐私政策约束，与本软件无关。
        </view>

        <h3>三、数据保护与共享</h3>

        <view>3.1 本软件不会与任何第三方共享用户数据。</view>
        <view>3.2 在可控范围内，本软件采取合理的技术手段保护用户在使用过程中可能产生的临时数据。</view>
        <view>3.3 用户应妥善保护自身设备和账户信息，防止因自身原因导致的数据泄露或安全问题。</view>

        <h3>四、第三方服务与链接</h3>

        <view>4.1 本软件通过第三方接口获取公开内容，开发者不对第三方内容的合法性、准确性或完整性负责。</view>
        <view>4.2 用户因访问第三方网站或服务引发的隐私或数据问题，与本软件及开发者无关。</view>

        <h3>五、用户权利</h3>
        <view>5.1 用户有权知晓本软件的运行机制，并了解其数据使用方式。</view>
        <view>5.2 用户有权随时停止使用本软件，并删除本地存储的所有相关数据。</view>
        <view>5.3 若未来版本涉及用户数据的收集或处理，本软件将在明确告知并征得用户同意后实施。</view>
        <h3>六、联系我们</h3>
        <view>
          如您对本协议或隐私政策有任何疑问或建议，请通过GitHub平台提交Issue或发送邮件至linzesen021@163.com
          。开发者将在合理时间内回复您的问题。
        </view>
      </view>
    </scroll-view>
  </g-page>
</template>

<script setup lang="ts">
import store from "@/store";
</script>

<style scoped lang="scss">
.page {
  background-color: var(--theme-bg-color);
  color: var(--theme-primary-color);
  padding: 32rpx;
  font-size: 26rpx;
  text-align: justify;
  min-height: 100%;
  .title {
    text-align: center;
  }
  h3 {
    margin: 24rpx 0;
  }
  view {
    line-height: 1.5;
  }
}
</style>
