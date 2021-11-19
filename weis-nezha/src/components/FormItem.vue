<template>
  <div class="form-item">
    <span
      class="el-form-item__label form-item__label"
      :class="{ asterisk: required }"
      :style="labelStyle"
    >{{ semi ? `${label}：` : label }}</span>
    <div class="slot">
      <slot />
    </div>
  </div>
</template>

<script  lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FormItem',
  props: {
    label: {
      type: String,
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    semi: {
      type: Boolean,
      default: false
    },
    labelStyle: {
      type: [Object, String],
      default: () => ({})
    }
  }
})
</script>

<style lang="less">
.form-item {
  display: flex;
  &__label {
    white-space: nowrap;
    align-self: flex-start;
  }
}

.slot {
  line-height: 40px;
  flex-grow: 1;
}
</style>