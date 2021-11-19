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
              >{{ row.tefStatus == 0 ? '下架' : '上架' }}</span
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
        MONDAY: '周一',
        TUESDAY: '周二',
        WEDNESDAY: '周三',
        THURSDAY: '周四',
        FRIDAY: '周五',
        SATURDAY: '周六',
        SUNDAY: '周日',
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
          prop: 'tefCid',
        },
        {
          label: '菜品名称',
          prop: 'cname',
        },
        {
          label: '饿了么菜品编码',
          prop: 'tefItemId',
        },
        {
          label: '饿了么上架名称',
          prop: 'tefItemName',
        },
        {
          label: '分类',
          prop: 'tefCategoryName',
        },
        {
          label: '上架价格（元）',
          prop: 'tefPrice',
        },
        {
          label: '商品特色',
          prop: 'tefType',
          formatter: (row) => {
            let str = ''
            if (row.tefType == '00') str += '单品、'
            if (row.tefType == '01') str += '套餐、'
            return str.slice(0, str.length - 1)
          },
        },
        {
          label: '是否套餐',
          prop: 'tefType',
          formatter: (row) => (row.tefType === '01' ? '是' : '否'),
        },
        {
          label: '可售时间',
          prop: 'tefSaleTime',
          formatter: (row) => {
            let saleTimeStr = '',
              saleDateStr = ''
            if (row.tefSaleTime) {
              const saleTime = JSON.parse(row.tefSaleTime)
              const times = saleTime.times
              const weeks = saleTime.weeks
              weeks.forEach((day) => {
                saleDateStr += `${this.week[day]}、`
              })
              saleDateStr = saleDateStr.slice(0, saleDateStr.length - 1)
              saleTimeStr = `${times[0].beginTime} ${times[0].endTime}`
            }

            return row.tefSaleTime == 'null' || !row.tefSaleTime
              ? '全时段售卖'
              : `${saleDateStr} ${saleTimeStr}`
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
        'cn.nezha.api.eleme.Food/updateFoodStatus',
        {
          itemId: row.tefItemId,
          status: row.tefStatus == 0 ? 1 : 0,
        },
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            if (res.result) row.tefStatus = row.tefStatus == 0 ? 1 : 0
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
          code: row ? row.tefItemId : null,
          tefId: row ? row.tefId : null,
        },
      })
    },
    searchClick() {
      this.queryGoods()
    },
    queryGoods() {
      this.$store.state.vloading = true
      this.$request(
        'cn.nezha.api.eleme.Food/queryFoods',
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
        'cn.nezha.api.eleme.Food/queryFoods',
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