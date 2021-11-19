<template>
  <el-select
    :model-value="modelValue"
    v-bind="$attrs"
    v-on="$attrs"
    @update:model-value="updateValue"
  >
    <el-option
      v-for="(opt, idx) in options"
      :label="opt[props.label]"
      :value="opt[props.value]"
      :key="idx"
    ></el-option>
  </el-select>
</template>

<script>
export default {
  name: 'BaseSelect',
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: [Number, String, Boolean],
      default: '',
    },
    options: {
      type: Array
    },
    props: {
      type: Object,
      default: () => ({
        label: 'label', // option.label 所用的key
        value: 'value' // option.value 所用的key
      })
    }
  },
  methods: {
    updateValue(v) {
      this.$emit('update:modelValue', v);
    }
  }
};
</script>
