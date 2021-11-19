<template>
  <el-radio-group v-bind="$attrs" :model-value="modelValue" :size="size" @update:model-value="handleInput">
    <el-radio-button v-for="(tab, index) in tabs" :key="index" :label="tab.value">
      <span v-if="tab.label">{{ tab.label }}</span>
    </el-radio-button>
  </el-radio-group>
  <div v-if="useSlot">
    <Render :render="currentSlot" />
  </div>
</template>

<script lang="ts">
import Render from './Render'
import { PropType, defineComponent, Slot } from 'vue'

type ValueType = string | number | boolean

type TabItem = {
  label: string,
  value: ValueType
}

export default defineComponent({
  components: {
    Render
  },
  props: {
    useSlot: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    size: {
      type: String as PropType<string>,
      value: 'medium'
    },
    modelValue: {
      type: [String, Number, Boolean] as PropType<ValueType>,
      required: true
    },
    tabs: {
      type: Array as PropType<TabItem[]>
    }
  },
  emits: ['update:modelValue'],
  computed: {
    currentSlot(): Slot | (() => null) {
      const slot = (typeof this.modelValue === 'string') && this.$slots[this.modelValue]

      return slot || (() => null)
    }
  },
  methods: {
    handleInput(val: ValueType) {
      this.$emit('update:modelValue', val)
    }
  }
})
</script>
