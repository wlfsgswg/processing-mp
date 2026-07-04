<template>
  <div :class="`xcx-components-dialog`">
    <el-dialog
      :key="title"
      :title="null"
      :visible="visible"
      :show-close="false"
      :width="width"
      :before-close="onCancel"
      custom-class="components-dialog"
    >
      <div class="components-dialog-top">
        <div class="title">{{ title }}</div>
        <div class="svg-close_big" @click="onCancel">
          <i class="el-icon-close"></i>
        </div>
      </div>
      <div class="components-dialog-content" v-if="!slotObject.content">
        默认内容瑟瑟发抖
      </div>
      <div v-if="slotObject.content">
        <slot name="content"></slot>
      </div>
      <div class="components-dialog-bottom clearfix" v-if="!slotObject.footer">
        <div class="r-right">
          <el-button
            type="primary"
            size="small"
            :loading="okButtonLoading"
            @click="onOk"
          >
            {{ okText }}
          </el-button>
        </div>
        <div class="r-right p-r-8">
          <el-button plain @click="onCancel" size="small">{{
            cancelText
          }}</el-button>
        </div>
      </div>
      <div v-if="slotObject.footer">
        <slot name="footer"></slot>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "public-xcx-dialog",
  data() {
    return {};
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: () => false,
    },
    /**
     * solt主要用来让父组件选择是否开启content or footer的插槽
     * 若要开启，请先把content or footer 值置为true
     * 然后再在父组件添加相关插槽
     */
    slotObject: {
      type: Object,
      default: () => ({ content: true, footer: false }),
    },
    title: {
      type: String,
      required: true,
      default: () => "null",
    },
    width: {
      type: String,
      default: () => "520px",
    },
    okButtonLoading: {
      type: Boolean,
      default: () => false,
    },
    okText: {
      type: String,
      default: () => "确认",
    },
    cancelText: {
      type: String,
      default: () => "取消",
    },
  },
  methods: {
    onCancel() {
      this.$emit("onCancel");
    },
    onOk() {
      this.$emit("onOk");
    },
  },
};
</script>

<style lang="less" scoped>
@import "index.less";
</style>
