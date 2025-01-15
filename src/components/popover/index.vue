<template>
  <view
    class="zbPopover"
    :style="{
      '--theme-bg-color': bgStyleColor,
    }"
  >
    <view @click.stop="handleClick" class="zb-button-popover">
      <slot></slot>
    </view>
    <view
      class="zb-popover"
      v-show="inited"
      ref="zb-transition"
      :class="[classes, `zb-popover-${placement}`]"
      :style="[mergeStyle]"
      @touchmove="noop"
    >
      <view
        class="zb-popover-arrow"
        :style="[arrowStyle]"
        :class="[
          {
            zb_popper__up: placement.indexOf('bottom') === 0,
            zb_popper__arrow: placement.indexOf('top') === 0,
            zb_popper__right: placement.indexOf('right') === 0,
            zb_popper__left: placement.indexOf('left') === 0,
          },
        ]"
      ></view>
      <slot name="content">
        <view
          :class="[
            {
              horizontal__action: actionsDirection === 'horizontal',
            },
          ]"
        >
          <view
            @click.stop="actionAction(item, index)"
            v-for="(item, index) in options"
            class="zb-popover__action"
            :class="[
              {
                dark__action: theme === 'dark',
                active_action: index == activeIdx,
              },
            ]"
            :key="index"
          >
            <view class="zb-popover__action-text">{{ item.text }}</view>
          </view>
        </view>
      </slot>
    </view>
    <view class="mask" v-if="show" @touchend.stop="handleTouchEnd"></view>
  </view>
</template>

<script>
const tranClass = {
  enter: "zb-fade-zoom-enter zb-fade-zoom-enter-active",
  "enter-to": "zb-fade-zoom-enter-to zb-fade-zoom-enter-active",
  leave: "zb-fade-zoom-leave zb-fade-zoom-leave-active",
  "leave-to": "zb-fade-zoom-leave-to zb-fade-zoom-leave-active",
};
export default {
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    activeIdx: {
      type: [Number, String],
    },
    placement: {
      type: String,
      default: "bottom-start",
    },
    bgColor: {
      type: String,
    },
    // light dark
    theme: {
      type: String,
      default: "light",
    },
    // horizontal vertical
    actionsDirection: {
      type: String,
      default: "vertical",
    },
  },
  name: "Popover",
  watch: {
    show: {
      handler(newVal) {
        newVal ? this.vueEnter() : this.vueLeave();
      },
      // 表示同时监听初始化时的props的show的意思
      immediate: true,
    },
  },
  data() {
    return {
      show: false,
      inited: false, // 是否显示/隐藏组件
      classes: "", // 应用的类名
      display: false, // 组件是否展示
      duration: 100,
      popoverStyle: {},
      arrowOldStyle: {},
    };
  },
  computed: {
    bgStyleColor() {
      if (this.bgColor) {
        return this.bgColor;
      }
      if (this.theme === "light") {
        return "#FEF7F1";
      }
      if (this.theme === "dark") {
        return "#2A241D";
      }
    },

    mergeStyle() {
      return {
        transitionDuration: `${this.duration}ms`,
        transitionTimingFunction: `ease-out`,
        ...this.popoverStyle,
      };
    },
    arrowStyle() {
      return {
        ...this.arrowOldStyle,
      };
    },
  },
  mounted() {
    // #ifdef H5
    // window.addEventListener("click", () => {
    //   this.show = false;
    // });
    // #endif
  },
  methods: {
    handleTouchEnd() {
      setTimeout(() => {
        this.close();
      }, 50);
    },
    handleClick() {
      if (this.show) {
        this.show = false;
      } else {
        this.show = true;
      }
      this.$emit("handleClick", this.show);
    },
    close() {
      this.show = false;
    },
    actionAction(item, index) {
      this.$emit("select", item, index);
      this.show = false;
    },
    sleep(value) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, value);
      });
    },
    vueEnter() {
      this.inited = true;
      this.getPosition();
      this.classes = tranClass.enter;
      this.$nextTick(async () => {
        await this.sleep(30);
        this.classes = tranClass["enter-to"];
      });
    },
    vueLeave() {
      this.classes = tranClass.leave;

      this.$nextTick(async () => {
        this.classes = tranClass["leave-to"];
        await this.sleep(120);
        this.inited = false;
      });
    },
    // 阻止事件冒泡
    preventEvent(e) {
      e && typeof e.stopPropagation === "function" && e.stopPropagation();
    },

    getPosition() {
      return new Promise((resolve) => {
        this.$nextTick(() => {
          let selectorQuery = uni.createSelectorQuery().in(this).selectAll(".zb-button-popover,.zb-popover");
          selectorQuery
            .boundingClientRect(async (data) => {
              let { left, bottom, right, top, width, height } = data[0];
              let popoverClientRect = data[1];
              let popoverStyle = {};
              let arrowOldStyle = {};

              switch (this.placement) {
                case "top":
                  if (popoverClientRect.width > width) {
                    popoverStyle.left = `-${(popoverClientRect.width - width) / 2}px`;
                  } else {
                    popoverStyle.left = `${Math.abs(popoverClientRect.width - width) / 2}px`;
                  }
                  popoverStyle.bottom = `${height + 8}px`;
                  arrowOldStyle.left = popoverClientRect.width / 2 - 6 + "px";
                  break;
                case "top-start":
                  popoverStyle.left = `0px`;
                  popoverStyle.bottom = `${height + 8}px`;
                  arrowOldStyle.left = "16px";
                  break;
                case "top-end":
                  popoverStyle.right = `0px`;
                  popoverStyle.bottom = `${height + 8}px`;
                  arrowOldStyle.right = "16px";
                  break;
                case "bottom":
                  if (popoverClientRect.width > width) {
                    popoverStyle.left = `-${(popoverClientRect.width - width) / 2}px`;
                  } else {
                    popoverStyle.left = `${Math.abs(popoverClientRect.width - width) / 2}px`;
                  }
                  popoverStyle.top = `${height + 8}px`;
                  arrowOldStyle.left = popoverClientRect.width / 2 - 6 + "px";
                  break;
                case "bottom-start":
                  popoverStyle.top = `${height + 8}px`;
                  popoverStyle.left = `0px`;
                  arrowOldStyle.left = "16px";
                  break;
                case "bottom-end":
                  popoverStyle.top = `${height + 8}px`;
                  popoverStyle.right = `0px`;
                  arrowOldStyle.right = "16px";
                  break;
                case "right":
                  popoverStyle.left = `${width + 8}px`;
                  if (popoverClientRect.height > height) {
                    popoverStyle.top = `-${(popoverClientRect.height - height) / 2}px`;
                  } else {
                    popoverStyle.top = `${Math.abs((popoverClientRect.height - height) / 2)}px`;
                  }
                  arrowOldStyle.top = `${popoverClientRect.height / 2 - 6}px`;
                  break;
                case "right-start":
                  popoverStyle.left = `${width + 8}px`;
                  popoverStyle.top = `0px`;
                  arrowOldStyle.top = `8px`;
                  break;
                case "right-end":
                  popoverStyle.left = `${width + 8}px`;
                  popoverStyle.bottom = `0px`;
                  arrowOldStyle.bottom = `8px`;
                  break;
                case "left":
                  popoverStyle.right = `${width + 8}px`;
                  if (popoverClientRect.height > height) {
                    popoverStyle.top = `-${(popoverClientRect.height - height) / 2}px`;
                  } else {
                    popoverStyle.top = `${Math.abs((popoverClientRect.height - height) / 2)}px`;
                  }
                  arrowOldStyle.top = `${popoverClientRect.height / 2 - 6}px`;
                  break;
                case "left-start":
                  popoverStyle.right = `${width + 8}px`;
                  popoverStyle.top = `0px`;
                  arrowOldStyle.top = `8px`;
                  break;

                case "left-end":
                  popoverStyle.right = `${width + 8}px`;
                  popoverStyle.bottom = `0px`;
                  arrowOldStyle.bottom = `8px`;
                  break;
              }

              this.popoverStyle = popoverStyle;
              this.arrowOldStyle = arrowOldStyle;
              resolve();
            })
            .exec();
        });
      });
    },
    // 空操作
    noop(e) {
      this.preventEvent(e);
    },
  },
};
</script>

<style lang="scss" scoped>
$theme-bg-color: var(--theme-bg-color);
.zbPopover {
  position: relative;
}
.zb-button-popover {
  display: inline-block;
}
.zb-popover {
  border-radius: 8px;
  z-index: 2144;
  position: absolute;
  background-color: $theme-bg-color;
  box-shadow: 0 2px 12px #3232331f;
}
.zb-popover-top {
  transform-origin: 50% bottom;
}
.zb-popover-top-start {
  transform-origin: 50% bottom;
}
.zb-popover-top-end {
  transform-origin: 0 bottom;
}
.zb-popover-bottom {
  transform-origin: 50% 0;
}
.zb-popover-bottom-end {
  transform-origin: 100% 0;
}
.zb-popover-bottom-start {
  transform-origin: 0 0;
}
.zb-popover-right {
  transform-origin: left 50%;
}
.zb-popover-right-start {
  transform-origin: left 0;
}
.zb-popover-right-end {
  transform-origin: left 100%;
}
.zb-popover-left {
  transform-origin: right 50%;
}
.zb-popover-left-start {
  transform-origin: right 0;
}
.zb-popover-left-end {
  transform-origin: right 100%;
}
.zb-popover-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
  border-width: 6px;
  color: $theme-bg-color;
}
.zb_popper__up {
  border-top-width: 0;
  border-bottom-color: currentColor;
  top: -6px;
}
.zb_popper__right {
  border-left-width: 0;
  border-right-color: currentColor;
  left: -5px;
}
.zb_popper__left {
  border-right-width: 0;
  border-left-color: currentColor;
  right: -5px;
}
.zb_popper__arrow {
  border-bottom-width: 0;
  border-top-color: currentColor;
  bottom: -6px;
}
.zb-popover__action {
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 88rpx;
  padding: 0 40rpx;
  font-size: 28rpx;
  cursor: pointer;
  color: #251e18;
}
.zb-popover__action-text {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-bottom: 1rpx solid #ebedf0;
  word-wrap: break-word;
  white-space: nowrap;
}
.zb-popover__action:last-child {
  .zb-popover__action-text {
    border-bottom: none;
  }
}
.active_action {
  color: #EC5D57 !important;
}
.dark__action {
  color: white;
  .zb-popover__action-text {
    border-bottom: 1rpx solid #ebedf033;
  }
}
.horizontal__action {
  display: flex;
  .zb-popover__action {
    padding: 0 20rpx;
    border-right: 1rpx solid #ebedf0;
  }
  .zb-popover__action-text {
    padding: 0;
  }
}

$u-zoom-scale: scale(0.95);

.zb-fade-enter-active,
.zb-fade-leave-active {
  transition-property: opacity;
}

.zb-fade-enter,
.zb-fade-leave-to {
  opacity: 0;
}

.zb-fade-zoom-enter,
.zb-fade-zoom-leave-to {
  transform: $u-zoom-scale;
  opacity: 0;
}

.zb-fade-zoom-enter-active,
.zb-fade-zoom-leave-active {
  transition-property: transform, opacity;
}

.zb-fade-down-enter-active,
.zb-fade-down-leave-active,
.zb-fade-left-enter-active,
.zb-fade-left-leave-active,
.zb-fade-right-enter-active,
.zb-fade-right-leave-active,
.zb-fade-up-enter-active,
.zb-fade-up-leave-active {
  transition-property: opacity, transform;
}

.zb-fade-up-enter,
.zb-fade-up-leave-to {
  transform: translate3d(0, 100%, 0);
  opacity: 0;
}

.zb-fade-down-enter,
.zb-fade-down-leave-to {
  transform: translate3d(0, -100%, 0);
  opacity: 0;
}

.zb-fade-left-enter,
.zb-fade-left-leave-to {
  transform: translate3d(-100%, 0, 0);
  opacity: 0;
}

.zb-fade-right-enter,
.zb-fade-right-leave-to {
  transform: translate3d(100%, 0, 0);
  opacity: 0;
}

.zb-popover__action {
  // &:active {
  //   background-color: rgba(0, 0, 0, 0.2);
  // }

  &--disabled {
    color: var(--van-popover-dark-action-disabled-text-color);

    &:active {
      background-color: transparent;
    }
  }
}
.mask {
  position: fixed;
  width: 100vw;
  height: 100vh;
  // background-color: #fff;
  background-color: transparent;
  top: 0;
  left: 0;
  z-index: 2100;
}
</style>
