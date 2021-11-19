<template>
  <el-select
    v-bind="{ ...$attrs, ...searchProps }"
    ref="selectTree"
    :model-value="modelValue"
    v-on="$attrs"
    @update:model-value="handleInput"
    @clear="handleClear"
    @focus="handleFocus"
  >
    <el-option hidden :value="modelValue" :label="label" />
    <el-tree
      :style="{width}"
      :data="treeOptions"
      :props="defaultProps"
      :expand-on-click-node="false"
      :check-on-click-node="true"
      @node-click="handleNodeClick"
    />
  </el-select>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SelectTree',
  inheritAttrs: false,
  props: {
    modelValue: {},
    defaultProps: {
      type: Object
    },
    valueKey: {
      type: String
    },
    width: {
      type: String,
      default: 'auto'
    },
    search: {
      type: Boolean
    },
    options: {
      type: Array
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      label: null,
      treeOptions: []
    }
  },
  computed: {
    searchProps() {
      return this.search ? { filterable: true, remote: true, remoteMethod: this.handleSearch } : null
    }
  },
  watch: {
    modelValue: {
      handler(value) {
        if (!value) {
          this.label = null
        } else if (this.valueKey) { // 如果有valueKey
          const node = this.trace(this.options, value) // 对整个树进行递归查找
          if (node) {
            this.label = this.nodeGetter(node, 'label')
          }
        }
      },
      immediate: true
    },
    options(value) {
      this.treeOptions = [...value]
    }
  },
  beforeCreate() {
    this.nodeGetter = (function nodeGetter(node ,key) {
      const { defaultProps }  = this
      return node[(defaultProps && defaultProps[key])|| key]
    }).bind(this)
  },
  methods: {
    handleSearch(query) {
      if (query.length) {
        this.treeOptions = this.traceList(this.options.slice(), query)
      } else {
        this.treeOptions = this.options.slice()
      }
    },
    handleFocus() {
      this.treeOptions = this.options.slice()
    },
    handleNodeClick(val) {
      this.label = this.nodeGetter(val, 'label')
      this.$refs.selectTree.blur()
      this.$emit('nodeClick', val)
    },
    handleClear() {
      this.label = ''
    },
    trace(nodes, value) {
      const { valueKey } = this

      for (const node of nodes) { // 拿到一个节点列表进行循环
        if (node && (node[valueKey] === value)) {// node valuekey = 要找的值返回node
          return node
        }
        const children = this.nodeGetter(node, 'children')
        if (Array.isArray(children)) { // 是否有子节点继续查找
          const result =  this.trace(children, value) // 递归查找
          if (result) {
            return result
          } // 有匹配到节点才有值 否则是undefined 不用返回
        }
      }
    },
    traceList(nodes, query) {
      const list = []
      const trace = (nds) => {
        nds.forEach(node => {
          if (!node) return
          if (this.nodeGetter(node, 'label').includes(query)) {
            list.push(node)
          }
          const children = this.nodeGetter(node, 'children')
          if (Array.isArray(children)) {
            trace(children)
          }
        })
      }
      trace(nodes)
      return list
    },
    handleInput(val) {
      this.$emit('update:modelValue', val)
    }
  }
})
</script>
<style>
.el-tree-node__content {
  height: 34px;
}
</style>
