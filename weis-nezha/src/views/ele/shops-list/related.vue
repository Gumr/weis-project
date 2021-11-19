<template>
  <div class="container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="4"
        :action="false"
        :label-width="60"
        semi
      >
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <span
              class="brand-color cursor-pointer"
              style="margin-right: 8px"
              @click="goDishPage('edit', row)"
              >编辑</span
            >
            <span class="brand-color cursor-pointer" @click="goDetai(row)"
              >详情</span
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import ButtonTabs from '@/components/ButtonTabs.vue'

export default {
  components: {},
  // 定义属性
  data() {
    return {
      height: window.innerHeight - 330,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '供餐点编码',
          prop: 'shopId',
        },
        {
          label: '供餐点名称',
          prop: 'shopName',
        },
        {
          label: '供餐点地址',
          prop: 'skuname',
        },
        {
          label: '操作',
          prop: 'catalogDesc',
        },
      ],
    }
  },
  // 计算属性，会监听依赖属性值随之变化
  computed: {},
  // 监控data中的数据变化
  watch: {},
  // 方法集合
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  methods: {},
  beforeCreate() {}, // 生命周期 - 创建之前
  beforeMount() {}, // 生命周期 - 挂载之前
  beforeUpdate() {}, // 生命周期 - 更新之前
  updated() {}, // 生命周期 - 更新之后
  beforeDestroy() {}, // 生命周期 - 销毁之前
  destroyed() {}, // 生命周期 - 销毁完成
  activated() {}, // 如果页面有keep-alive缓存功能，这个函数会触发
}
</script>

<style lang='less' scoped>
</style>