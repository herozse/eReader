<template>
  <text
    :style="{ color: props.color, 'font-size': props.size + 'px' }"
    :class="`iconfont icon-${props.name}`"
    @click="theClick"
  ></text>
</template>
<script lang="ts" setup>
const props = defineProps({
  name: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "var(--theme-grey-icon-color)",
  },
  size: {
    type: [Number, String],
    default: 16,
  },
});

const emit = defineEmits<{
  (e: "click"): void;
}>();

function theClick() {
  emit("click");
}
</script>

<style scoped lang="scss"></style>
