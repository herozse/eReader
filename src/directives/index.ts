import { Directive } from "vue";

// 声明模块扩展
declare module "vue" {
  interface DirectiveBindings {
    value: () => void;
  }
}

export const vLongPress: Directive = {
  mounted(el, binding) {
    let timer: NodeJS.Timeout | null = null;

    const start = () => {
      timer = setTimeout(() => {
        binding.value(); // 触发长按逻辑
      }, 350); // 长按时间设为 350 毫秒
    };

    const cancel = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    el.addEventListener("touchstart", start);
    el.addEventListener("touchend", cancel);
    el.addEventListener("touchmove", cancel);
  },

  unmounted(el) {
    const cancel = () => {}; // 避免卸载时使用未定义的函数
    el.removeEventListener("touchstart", cancel);
    el.removeEventListener("touchend", cancel);
    el.removeEventListener("touchmove", cancel);
  },
};
