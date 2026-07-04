<template>
  <div class="xcx-components-title">
    <div class="xcx-components-title-left">
      <span class="line"></span>
      <span>{{ title }}</span>
    </div>
    <div v-if="skipTitle" class="xcx-components-title-right" @click="handleSkip">
      <span>{{ skipTitle }}</span>
      <span><i class="el-icon-arrow-right"></i> </span>
    </div>
    <div v-if="updateTitle" class="xcx-components-title-right-update" @click="handleUpdate">
      <span>{{ updateTitle }}</span>
    </div>
    <div v-if="prefixTitle" class="xcx-components-title-right-update prefix">
      <span>{{ prefixTitle }}</span>
    </div>
  </div>
</template>

<script>
import "./index.less";
export default {
  data: () => ({}),
  components: {},
  mounted() { },
  methods: {
    handleSkip() {
      this.$emit("onskip", this.title);
    },
    handleUpdate() {
      this.$emit("onUpdate", this.title);
    },
  },
  watch: {},
  props: {
    title: {
      type: String,
      required: true,
      default: () => "",
    },
    skipTitle: {
      type: String,
      default: () => "",
    },
    updateTitle: {
      type: String,
      default: () => "",
    },
    prefixTitle: {
      type: String,
      default: () => "",
    },
  },
};
</script>
