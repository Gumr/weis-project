
import { defineComponent, computed, PropType } from 'vue'
import dayjs, {ConfigType} from 'dayjs'

export default defineComponent({
  name: 'DatePicker',
  inheritAttrs: false,
  props: {
    modelValue: {
      default: new Date(),
      type: [String, Date, Array] as PropType<ConfigType | ConfigType[]>
    },
    type: {
      default: 'date',
      type: String as PropType<'date' | 'daterange'>
    },
    valueFormat: {
      default: 'YYYYMMDD',
      type: String
    }
  },
  setup(props, ctx) {
    function valueToDate(value: ConfigType) {
      return new Date(dayjs(value).valueOf())
    }

    function valueToFormat(value: ConfigType) {
      return dayjs(value).format(props.valueFormat)
    }

    const value = computed<Date | Date[] | ''>({
      get: () => {
        const {modelValue} = props
        switch (props.type) {
          case 'date':
            return modelValue ? valueToDate(modelValue as ConfigType) : ''
          case 'daterange':
            if (Array.isArray(modelValue)) {
              return modelValue.length ? (modelValue  as ConfigType[]).map(value => valueToDate(value)) : []
            }
            return []
          default:
            return ''
        }
      },
      set: (values) => {
        if (Array.isArray(values)) {
          ctx.emit('update:modelValue', values.map(value => valueToFormat(value)))
        } else {
          ctx.emit('update:modelValue', values ? valueToFormat(values) : '')
        }
      }
    })
    return () => <el-date-picker {...ctx.attrs} type={props.type} v-model={value.value}></el-date-picker>
  }
})
