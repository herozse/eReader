<template>
  <g-page>
    <g-statusbar title="用户协议"></g-statusbar>
    <scroll-view :style="{ height: `calc(100vh - ${store.appOption.statusBarHeight * 2 || 44}px)` }" scroll-y="true">
      <view class="page">
        <h2 class="title">用户协议</h2>
        <h3>一、总则</h3>
        <view>
          1.1
          [e读]（以下简称“本软件”）由个人开发并开源，旨在提供小说阅读功能，仅供学习和技术交流使用。用户在下载、安装、使用本软件前，应仔细阅读本用户协议（以下简称“本协议”）。
        </view>
        <view>
          1.2
          本协议构成用户与本软件开发者之间的法律协议。用户使用本软件即视为完全理解并接受本协议条款，如用户不同意本协议内容，应立即停止使用本软件。
        </view>
        <view>
          1.3 本协议适用于用户对本软件的访问、安装和使用行为。因使用本软件而产生的行为及其后果须遵守本协议约定。
        </view>
        <h3>二、软件使用规则</h3>
        <view>
          2.1 本软件为开源项目，源代码已发布于 GitHub 平台，用户可按照开源许可协议（MIT License）使用和修改本软件。
        </view>
        <view>2.2 用户承诺不得利用本软件从事以下行为：</view>
        <view>
          <strong>·</strong>
          违反法律法规的行为；
        </view>
        <view>
          <strong>·</strong>
          侵害第三方合法权益的行为，包括但不限于侵犯知识产权、隐私权等；
        </view>
        <view>
          <strong>·</strong>
          发布、传播违法或有害信息；
        </view>
        <view>
          <strong>·</strong>
          对软件功能进行反向工程、解密或尝试规避安全保护措施；
        </view>
        <view>
          <strong>·</strong>
          其他可能对本软件开发者、其他用户或第三方造成损害的行为。
        </view>
        <view>
          2.3 用户应自行承担使用本软件可能产生的风险，包括但不限于因内容来源问题引发的法律责任、数据丢失或服务中断。
        </view>
        <h3>三、知识产权声明</h3>
        <view>
          3.1
          本软件的源代码及相关文档的著作权归开发者所有。用户可基于开源许可协议使用和分发本软件，但不得将本软件用于任何未经授权的商业用途。
        </view>
        <view>
          3.2 用户通过本软件访问的第三方内容的知识产权归其原始权利人所有，用户不得擅自复制、修改、发布或传播上述内容。
        </view>
        <h3>四、免责声明</h3>
        <view>4.1 本软件作为开源项目，以"现状"提供，不对功能的完整性、适用性、可靠性作任何明示或默示的担保。</view>
        <view>4.2 本软件获取的内容均来源于第三方公开渠道，开发者对内容的合法性、准确性或完整性不承担责任。</view>
        <view>
          4.3
          开发者不对因使用本软件引发的任何直接、间接、附带或衍生损害承担责任，包括但不限于数据丢失、服务中断或版权纠纷。
        </view>
        <view>4.4 如因用户使用本软件导致第三方提出索赔或诉讼，用户应自行解决并承担相关责任，与开发者无关。</view>
        <h3>五、终止和修改</h3>
        <view>5.1 用户违反本协议任一条款的，开发者有权随时终止其使用本软件的权利。</view>
        <view>5.2 本协议的解释、修改及更新权归开发者所有，更新后的协议将通过适当方式通知用户。</view>
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
