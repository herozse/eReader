<template>
  <g-popup v-model:showDialog="showShareDialog">
    <view class="painter"></view>
    <view class="popup-share">
      <view class="share-list">
        <view class="share-item" @click="shareWeiXin('WXSceneSession')">
          <view class="box">
            <image class="img weixin" src="/src/static/weixin.png" mode="scaleToFill"></image>
          </view>
          <text>微信</text>
        </view>
        <view class="share-item" @click="shareWeiXin('WXSceneTimeline')">
          <view class="box">
            <image class="img" src="/src/static/pengyouquan.png" mode="scaleToFill"></image>
          </view>
          <text>朋友圈</text>
        </view>
        <view class="share-item" @click="copyAddress">
          <view class="box">
            <g-icon-fonts class="icon" name="fuzhilianjie" size="20" color="var(--theme-primary-color-light-1)" />
          </view>
          <text>复制链接</text>
        </view>
        <view class="share-item" @click="sharePoster" v-if="activeBook">
          <view class="box">
            <g-icon-fonts class="icon" name="haibao" size="20" color="var(--theme-primary-color-light-1)" />
          </view>
          <text>生成海报</text>
        </view>
      </view>
    </view>
  </g-popup>
  <g-popup v-model:showDialog="showPainter" type="center" :showCancel="false" v-if="activeBook">
    <view class="painter">
      <image :src="path" mode="widthFix" class="poster"></image>
      <l-painter
        ref="painter"
        isCanvasToTempFilePath
        @success="($event: any) => handSuccessPoster($event)"
        custom-style="position: fixed; left: 200%"
        css="width: 750rpx; padding: 64rpx 32rpx; background: #FEF7F1"
      >
        <l-painter-view css="width: 100%; display: inline-block; text-align: center;">
          <l-painter-image
            :src="imageUrl"
            css="object-fit: fill; object-position: 50% 50%; width: 128rpx; height: 180rpx; border-radius: 12rpx;"
          />
          <l-painter-view css="margin-top: 16rpx; font-size: 36rpx; color: #251e18; font-weight: bold">
            <l-painter-text :text="activeBook.bookName" />
          </l-painter-view>
          <l-painter-view css="margin-top: 16rpx; font-size: 26rpx; color: #857f78;">
            <l-painter-text :text="activeBook.author" />
          </l-painter-view>
          <l-painter-view css="margin-top: 16rpx; font-size: 26rpx; color: #857f78;">
            <l-painter-text :text="activeBook.categories" />
          </l-painter-view>
          <l-painter-view css="margin-top: 16rpx; font-size: 26rpx; color: #554e48; text-align: left;">
            <l-painter-text :text="activeBook.description.trim()" css="line-clamp: 3" />
          </l-painter-view>
          <l-painter-view css="margin-top: 30rpx; height: 120rpx; text-align: left; vertical-align: bottom">
            <l-painter-view css="position: fixed; left: 32rpx; bottom: 80rpx">
              <l-painter-text css="color: #554e48; font-weight: bold; " text="e读"></l-painter-text>
              <l-painter-text css="margin-left: 16rpx; color: #857f78;" text="扫码看本书"></l-painter-text>
            </l-painter-view>

            <l-painter-qrcode
              css="width: 138rpx; height: 138rpx; position: fixed; right: 32rpx; bottom: 32rpx"
              text="https://gitee.com/linzesen021/herozs_reader"
            ></l-painter-qrcode>
          </l-painter-view>
        </l-painter-view>
      </l-painter>
    </view>

    <view class="hz-button-primary" style="margin-top: 80rpx" @click="savePoster">保存图片</view>
  </g-popup>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { showToast, showLoading } from "@/utils/Control";
import { downloadImage } from "@/utils";
const path = ref("");
const showPainter = ref(false);
const painter = ref<PainterInstance | null>();

type Options = {
  title?: string;
  summary?: string;
  imageUrl?: string;
  href?: string;
};

const props = defineProps<{ activeBook?: BooksShelvesData | bookInfo; options?: Options }>();
const showShareDialog = ref(false);
const imageUrl = ref("/src/static/nothing.png");

function shareWeiXin(scene: "WXSceneSession" | "WXSceneTimeline") {
  let title = `全网免费阅读，看书就用e读`;
  let summary = `免费、开源、你看书最佳的选择`;
  let imageUrl = "/src/static/nothing.png";
  let href = `https://gitee.com/linzesen021/herozs_reader`;

  if (props.activeBook) {
    title = `我在看这本好书《${props.activeBook.bookName}》，推荐给你`;
    summary = `${props.activeBook.description}`;
    imageUrl = props.activeBook.image;
  }

  if (props.options) {
    title = props.options.title ?? title;
    summary = props.options.summary ?? summary;
    imageUrl = props.options.imageUrl ?? imageUrl;
  }
  // #ifdef APP-PLUS
  uni.share({
    provider: "weixin",
    type: 0,
    scene,
    title,
    summary,
    href,
    imageUrl,
    success(res) {
      console.log("success:" + JSON.stringify(res));
    },
    fail(err) {
      console.log("fail:" + JSON.stringify(err));
    },
  });
  // #endif
}

function copyAddress() {
  uni.setClipboardData({
    data: "https://gitee.com/linzesen021/herozs_reader",
    showToast: false,
    success() {
      showToast("复制成功");
    },
    fail() {
      showToast("复制失败");
    },
  });
}

function handSuccessPoster(evt: any) {
  uni.hideLoading();
  path.value = evt;
}

function savePoster() {
  if (!path.value) return;
  painter.value?.canvasToTempFilePathSync({
    fileType: "jpg",
    quality: 1,
    success: (res: any) => {
      // #ifdef H5
      let name = `e_Reader_${new Date().getTime()}`;
      if (props.activeBook) {
        name = `e读_${props.activeBook.bookName}_${props.activeBook.author}`;
      }
      downloadImage(res.tempFilePath, name);
      // #endif

      // 非H5 保存到相册
      // #ifndef H5
      uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: function () {
          showToast("已保存到相册");
        },
      });
      // #endif
    },
  });
}

function sharePoster() {
  close();
  setTimeout(() => {
    showLoading();
    showPainter.value = true;
  }, 400);
}
function open() {
  // #ifndef H5
  imageUrl.value = props.activeBook?.image || props.options?.imageUrl || imageUrl.value;
  // #endif
  showShareDialog.value = true;
}
function close() {
  showShareDialog.value = false;
}

defineExpose({
  open,
  close,
});
</script>

<style lang="scss" scoped>
.popup-share {
  color: var(--theme-primary-color-light-1);
  .share-list {
    display: flex;
    .share-item {
      font-size: 24rpx;
      margin: 0 16rpx;
      padding: 20rpx 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      .box {
        background-color: var(--theme-bg-color-deep);
        height: 110rpx;
        width: 110rpx;
        border-radius: 20rpx;
        margin-bottom: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        .img {
          width: 22px;
          height: 22px;
        }
        .weixin {
          width: 24px;
          height: 24px;
        }
      }
    }
  }
}

.painter {
  width: 700rpx;
  font-size: 30rpx;
  background-color: var(--theme-bg-color);
  color: var(--theme-primary-color);
  border-radius: 24rpx;
  overflow: hidden;
  .poster {
    width: 100%;
    border-radius: 24rpx;
    overflow: hidden;
  }
}
</style>
