<template>
  <el-button v-on="$attrs" v-bind="$attrs" :type="type" :icon="icon" @click="handleClick">
    <slot>返回</slot>
  </el-button>
</template>

<script>
export default {
  inheritAttrs: false,
  name: 'ReturnButton', // 一个自动返回的button按钮
  props: {
    back: {
      type: Boolean,
      default: false
    },
    replace: {
      type: Boolean,
      default: false
    },
    icon: {
      default: 'el-icon-arrow-left'
    },
    type: {
      default: 'primary'
    }
  },
  methods: {
    handleClick() {
      if (this.back) {
        this.$router.back();
      } else {
        let { path } = this.$route;
        const lastIndex = path.lastIndexOf('/');
        path = path.slice(0, lastIndex);

        const method = this.replace ? 'replace' : 'push';
        this.$router[method]({
          path
        });
      }
    }
  }
};
</script>
