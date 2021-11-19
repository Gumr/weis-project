<template>
  <div class="page-table">
    <!-- 根据columns 自动生成 table-column -->
    <el-table
      v-if="columns"
      ref="table"
      v-bind="$attrs"
      :data="data"
      :max-height="tableMaxHeight"
      :border="border"
      :stripe="stripe"
      style="width: 100%"
      v-on="listeners"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        align="center"
        v-for="col in columns"
        v-bind="col"
        :key="col.prop"
      >
      </el-table-column>
    </el-table>
    <!-- 不用columns 使用slot -->
    <el-table
      v-else
      ref="table"
      v-bind="$attrs"
      :data="data"
      :max-height="tableMaxHeight"
      :border="stripe"
      :stripe="stripe"
      style="width: 100%"
      v-on="listeners"
      @selection-change="handleSelectionChange"
      :size="size"
    >
      <slot></slot>
    </el-table>
    <div v-if="visible" class="pagination-wrap">
      <el-pagination
        v-bind="pageProps"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :layout="pageProps.layout || 'total, sizes, prev, pager, next, jumper'"
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  inject: ['mainHeight'],
  inheritAttrs: false,
  props: {
    border: {
      type: Boolean,
      default: true,
    },
    stripe: {
      type: Boolean,
      default: true,
    },
    maxHeight: {
      type: String,
    },
    
    data: {
      type: Array,
    },

    columns: {
      type: Array,
    },
    selection: {
      type: Array,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    total: {
      type: Number,
      default: 0,
    },
    pageProps: {
      type: Object,
      default: () => ({}),
    },
    visible: {
      type: Boolean,
      default: true,
    },
  },
  emits: [
    'update:current-page',
    'update:page-size',
    'update:selection',
    'current-page-change',
    'page-change',
    'size-change',
  ],
  computed: {
    tableMaxHeight() {
      return (
        this.maxHeight ||
        (this.mainHeight.value ? `${this.mainHeight.value}px` : 'auto')
      )
    },
    // mergePageProps() {
    //   return {
    //     layout: 'total, sizes, prev, pager, next, jumper',
    //     ...this.pageProps
    //   }
    // },
    listeners() {
      const listeners = { ...this.$attrs }
      console.log(listeners)
      const removeList = ['onSelect', 'onSelectAll', 'onSelectionChange']
      Object.keys(listeners).forEach((key) => {
        if (removeList.includes(key)) delete listeners[key]
      })

      return listeners
    },
  },
  watch: {
    data: {
      immediate: true,
      flush: 'post',
      handler() {
        const el = this.$refs.table
        if (el) {
          el.doLayout()
        }
      },
    },
  },
  methods: {
    handlePageChange(page) {
      this.$emit('update:current-page', page)
      this.$emit('current-page-change', page)
      this.$emit('page-change', {
        type: 'current-page',
        value: page,
      })
    },
    handlePageSizeChange(pageSize) {
      this.$emit('update:page-size', pageSize)
      this.$emit('size-change', pageSize)
      this.$emit('page-change', {
        type: 'page-size',
        value: pageSize,
      })
    },
    handleSelectionChange(selection) {
      this.$emit('update:selection', selection)
    },
    setSelection(list) {
      const { table } = this.$refs
      if (table) {
        table.clearSelection()
        list.forEach((item) => table.toggleRowSelection(item, true))
      }
    },
    doLayout() {
      this.$refs.table.doLayout()
    },
  },
})
</script>

<style lang="less" scoped>
.page-table {
  width: 100%;
}
</style>
