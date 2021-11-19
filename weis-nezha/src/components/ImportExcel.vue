<template>
  <input
    ref="Input"
    accept=".xls, .xlsx"
    type="file"
    style="position: fixed; top: -9999px;"
    @change="handleFileChange"
  />
  <div style="display: inline-block;" @click="triggerImport">
    <slot>
      <el-button type="success">选择模板导入</el-button>
    </slot>
  </div>
</template>
<script lang="ts">
import { ElMessage } from 'element-plus'
import { defineComponent, ref, Ref, PropType } from 'vue'
import XLSX from '@/utils/xlsx'

// 一个导入excel的组件
export default defineComponent({
  name: 'ImportExcel',
  props: {
    onImport: {
      type: Function as PropType<(list: unknown[]) => void>
    }
  },
  emits: ['import', 'file'],
  setup(props, ctx) {
    const Input = ref({}) as Ref<HTMLInputElement>

    function triggerImport() {
      Input.value.click()
    }

    function handleFileChange() {
      const files = Input.value.files || []
      if (files.length <= 0) {
        ElMessage.error('未选择导入文件')
        return
      }
      const fr = new FileReader()
      fr.onload = (ev) => {
        if (!ev.target) return

        try {
          const data = ev.target.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const wsname = workbook.SheetNames[0]// 取第一张表
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname])// 生成json表格内容
          ctx.emit('import', ws)
          Input.value.value = ''
        } catch (e) {
          ElMessage.error(e)
        }
      }

      ctx.emit('file', files[0])
      fr.readAsBinaryString(files[0])
    }

    return {
      Input,
      triggerImport,
      handleFileChange
    }
  }
})
</script>
