<template>
  <svg class="icon-svg" aria-hidden="true">
    <use :href="IconName" />
  </svg>
</template>

<script>
export default {
  name: 'SvgIcon',
  props: {
    iconClass: {
      type: String,
      default: '',
      required: true
    }
  },
  computed: {
    // 用于接收传递的 svg 图标的名称
    IconName() {
      return `#icon-${this.iconClass}`
    }
  }
}
</script>

<style lang="less" scoped>
@import 'index.less';
</style>
