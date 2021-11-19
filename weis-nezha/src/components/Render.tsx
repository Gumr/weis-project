import { defineComponent, PropType, VNode } from 'vue'
export default defineComponent({
  name: 'Render',
  props: {
    render: {
      type: Function as PropType<(() => unknown)>,
      required: true
    }
  },
  setup(props) {
    return () => props.render()
  }
})