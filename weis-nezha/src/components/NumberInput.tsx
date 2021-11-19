import { defineComponent, watch } from 'vue'
// 一个数字输入框
export default defineComponent({
  name: 'NumberInput',
  inheritAttrs: false,
  props: {
    modelValue: [Number, String],
    mode: { // mode 有整数和小数两种模式
      type: String,
      default: 'int',
      validator: (m: string) => ['int', 'digit'].includes(m)
    },
    clearable: {
      type: Boolean,
      default: true
    },
    max: Number,
    unsigned: { // 有符号数字 可输入负数，默认无符号
      type: Boolean,
      default: true
    },
    precision: Number // 精度，小数模式下 控制小数点后数字大小 整数模式控制整数位数
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    // eslint-disable-next-line
    const { mode, precision, unsigned } = props

    let pattern: string
    switch (mode) {
      case 'digit':
        pattern = precision
          ? `[0-9]*(\\.[0-9]{0,${precision}})?`
          : '[0-9]*(\\.[0-9]*)?'
        break
      default: // int
        pattern = precision
          ? `[0-9]{0,${precision}}`
          : '[0-9]*'
        break
    }
    // 生成正则匹配输入，选择有符号时加入符号匹配
    const regexp = new RegExp(unsigned ? `^${pattern}` : `^-?${pattern}`)

    function emitValue(value: string) {
      if (props.max) {
        ctx.emit('update:modelValue', Number(value) > props.max ? props.max : value)
      } else {
        ctx.emit('update:modelValue', value)
      }
    }

    function handleInput(value: string) {
      const match = value.match(regexp)
      // console.log(match, 'match')
      if (match) {
        emitValue(match[0])
      }
    }

    watch(() => props.modelValue, (value) => {
      const match = String(value).match(regexp)
      if (match) {
        emitValue(match[0])
      }
    }, {
      immediate: true
    })

    const elInputProps = {
      'onUpdate:modelValue': handleInput,
      ...ctx.attrs
    }

    return () => (
      <el-input {...elInputProps} model-value={props.modelValue} clearable={props.clearable}></el-input>
    )
  }
})
