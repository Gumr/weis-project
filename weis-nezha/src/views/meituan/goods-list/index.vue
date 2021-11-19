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
        <template #buttons>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
            >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button
          >
          <el-button type="primary" @click="toEdit('create')"
            >新建菜品</el-button
          >
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-model:selection="tableSelection"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="queryGoods"
        @size-change="queryGoods"
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="{ row }">
            <span
              class="brand-color cursor-pointer"
              style="margin-right: 8px"
              @click="toEdit('edit', row)"
              >编辑
            </span>
            <span
              class="brand-color cursor-pointer"
              @click="saleStatusFn(row)"
              >{{ row.is_sold_out == 0 ? '下架' : '上架' }}</span
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
import exportExcel from '@/utils/export-excel'

export default {
  components: {
    QueryComponents,
    BasePageTable,
  },
  // 定义属性
  data() {
    return {
      week: {
        monday: '周一',
        tuesday: '周二',
        wednesday: '周三',
        thursday: '周四',
        friday: '周五',
        saturday: '周六',
        sunday: '周日',
      },
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      height: window.innerHeight - 330,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          type: 'selection',
        },
        {
          label: '后台菜品ID',
          prop: 'tmfCid',
        },
        {
          label: '菜品名称',
          prop: 'cname',
        },
        {
          label: '美团菜品编码',
          prop: 'app_food_code',
        },
        {
          label: '美团上架名称',
          prop: 'name',
        },
        {
          label: '分类',
          prop: 'category_name',
        },
        {
          label: '上架价格（元）',
          prop: 'price',
        },
        {
          label: '商品特色',
          prop: '',
          formatter: (row) => {
            let str = ''
            if (row.speciality == 1) str += '招牌、'
            if (row.tmfType == '01') str += '套餐、'
            return str.slice(0, str.length - 1)
          },
        },
        {
          label: '是否套餐',
          prop: 'tmfType',
          formatter: (row) => (row.tmfType === '01' ? '是' : '否'),
        },
        {
          label: '可售时间',
          prop: 'skus',
          formatter: (row) => {
            let isCustom = false
            let saleDateStr = ''
            let saleTimeStr = ''
            const { available_times: times } = JSON.parse(row.skus)[0]
            for (var day in this.week) {
              if (times[day]) {
                isCustom = true
                saleDateStr += `${this.week[day]}、`
                saleTimeStr = JSON.parse(times[day])
              }
            }
            saleDateStr = saleDateStr.slice(0, saleDateStr.length - 1)
            return isCustom ? `${saleDateStr} ${saleTimeStr}` : '时间不限'
          },
        },
        {
          label: '目标门店',
          prop: 'tmfPublishStore',
          formatter: (row) =>
            row.tmfPublishStore ? row.tmfPublishStore : '所有门店',
        },
      ],
      queryParams: {
        name: '',
        isSingle: '',
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'name',
          label: '菜品名称',
          placeholder: '请输入菜品名称',
          prop: {
            clearable: true,
          },
        },
        {
          component: 'BaseSelect',
          key: 'isSingle',
          label: '是否套餐',
          props: {
            clearable: true,
            options: [
              {
                label: '是',
                value: 0,
              },
              {
                label: '否',
                value: 1,
              },
            ],
          },
        },
        {
          slot: 'buttons',
        },
      ],
      tableSelection: [],
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
  mounted() {
    this.queryGoods()
  },
  methods: {
    // 菜品上下架
    saleStatusFn(row) {
      this.$request(
        'cn.nezha.api.meituan.Food/updateFoodInfo',
        {
          id: row.tmfId,
          foodCode: row.app_food_code,
          status: row.is_sold_out == 0 ? 1 : 0,
        },
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            if (res.result) row.is_sold_out = row.is_sold_out == 0 ? 1 : 0
          } else {
            this.$message.warning(err.errMsg)
          }
        })
      )
    },
    toEdit(type, row) {
      sessionStorage.setItem('good-data', JSON.stringify(row))
      this.$router.push({
        path: `${this.$route.path}/edit`,
        query: {
          type,
          code: row ? row.app_food_code : null,
          tmfId: row ? row.tmfId : null,
        },
      })
    },
    searchClick() {
      this.queryGoods()
    },
    queryGoods() {
      this.$store.state.vloading = true
      this.$request(
        'cn.nezha.api.meituan.Food/queryFoods',
        {
          ...this.page,
          ...this.genQueryParams(),
        },
        true
      ).then(
        this.$rw((err, res) => {
          this.$store.state.vloading = false
          if (!err) {
            const { record, totalRecordCount } = res.result
            this.tableData = record
            this.tableDataTotal = totalRecordCount
          }
        })
      )
    },
    genQueryParams() {
      const params = { ...this.queryParams }
      return params
    },
    // 导出
    handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const col = this.tableCol
      this.reqAllFoods().then(
        this.$rw((err, res) => {
          this.$store.state.bloading = false
          exportExcel({
            columns: col,
            filename,
            data: res.result.record,
          })
        })
      )
    },
    reqAllFoods() {
      return this.$request(
        'cn.nezha.api.meituan.Food/queryFoods',
        {
          pageNo: 1,
          pageSize: this.tableDataTotal,
          ...this.genQueryParams(),
        },
        true
      )
    },
  },
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
.container {
  padding: 0 30px;
}
</style>