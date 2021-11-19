<template>
  <el-button :loading="loading" v-bind="$attrs" @click.prevent="handleClick">
    <slot></slot>
  </el-button>
</template>

<script>
// 一个自动loading的按钮，click方法emit一个函数出去， 调用该函数关闭loading状态
export default {
  inheritAttrs: false,
  props: {
    autoLoading: {
      type: Boolean,
      default: true
    }
  },
  emits: ['click', 'submit'],
  data() {
    return {
      loading: false
    }
  },
  methods: {
    handleClick() {
      if (this.loading) {
        return
      }

      const done = this.autoLoading
        ? (this.loading = true) && this.loadingDone
        : (() => {
          this.loading = true
          return this.loadingDone
        })
      this.$emit('click', done)
      this.$emit('submit', done)
    },
    loadingDone() {
      this.loading = false
    }
  }
}

</script>
