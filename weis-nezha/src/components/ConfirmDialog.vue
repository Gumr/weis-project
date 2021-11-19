<template>
  <el-dialog
    v-bind="$attrs"
    :model-value="modelValue"
    :close-on-click-modal="closeOnClickModal"
    v-on="$attrs"
    @update:model-value="handleVisibleUpdate"
  >
    <slot></slot>
    <template #footer>
      <slot name="footer">
        <span class="dialog-footer">
          <el-button v-if="cancelVisible" @click="cancelClick">取 消</el-button>
          <component
            :is="confirmButtonType"
            v-if="comfirmVisible"
            type="primary"
            :auto-loading="autoLoading"
            @click="confirmClick"
            >{{ confirmText }}</component
          >
        </span>
      </slot>
    </template>
  </el-dialog>
</template>

<script>
import SubmitButton from './SubmitButton.vue'
// 简单封装的dialog 默认有取消按钮和确认按钮
export default {
  components: {
    SubmitButton,
  },
  inheritAttrs: false,
  props: {
    confirmText: {
      type: String,
      default: '确定',
    },
    modelValue: {
      type: Boolean,
    },
    concelbtn: {
      type: Boolean,
      default: true,
    },
    cancelVisible: {
      type: Boolean,
      default: true,
    },
    comfirmVisible: {
      type: Boolean,
      default: true,
    },
    autoCancel: {
      // 是否点击取消按钮自动隐藏dialog
      type: Boolean,
      default: true,
    },
    autoConfirm: {
      // 是否点击确定按钮自动隐藏dialog
      type: Boolean,
      default: true,
    },
    asyncConfirm: {
      // 判断确定按钮是否用submitButton button组件loading状态
      type: Boolean,
      default: false,
    },
    closeOnClickModal: {
      type: Boolean,
      default: false,
    },
    autoLoading: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'on-cancel', 'on-confirm'],
  computed: {
    confirmButtonType() {
      return this.asyncConfirm ? 'SubmitButton' : 'el-button'
    },
  },
  methods: {
    handleVisibleUpdate(visible) {
      this.$emit('update:modelValue', visible)
    },
    cancelClick() {
      this.$emit('on-cancel')
      if (this.autoCancel) {
        this.handleVisibleUpdate(false)
      }
    },
    confirmClick(done) {
      // 弹窗可能有个动画效果消失 动画过程中测试还要去点击 这里拦截一下
      if (!this.modelValue) return
      if (this.asyncConfirm) {
        if (typeof done !== 'function') return
        this.$emit('on-confirm', done)
      } else {
        this.$emit('on-confirm')
        if (this.autoConfirm) this.handleVisibleUpdate(false)
      }
    },
  },
}
</script>
