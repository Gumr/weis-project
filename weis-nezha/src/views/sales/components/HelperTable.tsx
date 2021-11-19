import { defineComponent, computed, PropType } from 'vue'

export default defineComponent({
  props: {
    data: {
      default: () => ([]),
      type: Array as PropType<any[]>
    }
  },
  setup(props) {
    const table = computed(() => props.data)
    const columns = [
      {
        label: '助手昵称',
        prop: 'helperName'
      },
      {
        label: '助手手机号',
        prop: 'helperPhone'
      }
    ]

    return () => (
      <el-table data={table.value} border stripe>
        {
          columns.map(col => <el-table-column {...col} key={col.prop}></el-table-column>)
        }   
      </el-table>
    )
  }
})