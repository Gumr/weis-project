<template>
  <div class="">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="7"
        :label-width="60"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" :loading="$store.state.bloading" @click="handleExport">{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
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
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel'
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'

export default {
  components: {
    QueryComponents,
    BasePageTable
  },
  data() {
    return {
      height: window.innerHeight - 330,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '供餐点',
          prop: 'heatPointName'
        },
        {
          label: '菜品名称',
          prop: 'skuname'
        },
        {
          label: '食物类别',
          prop: 'catalogDesc'
        },
        {
          label: '菜品编码',
          prop: 'cid'
        },
        {
          label: '菜品规格',
          prop: 'quality',
          formatter: row => row.quality  + row.unit
        },
        {
          label: '计划出库量',
          prop: 'planDelivery'
        },
        {
          label: '实际出库量',
          prop: 'actualDelivery'
        },
        {
          label: '实际入库量',
          prop: 'actualWarehousing'
        },
        {
          label: '剩余库存量',
          prop: 'residueStock'
        },
        {
          label: '复用库存量',
          prop: 'reuseStock'
        },
        // {
        //   label: '销量',
        //   prop: 'salesQuantity'
        // },
        {
          label: '报损量',
          prop: 'breakageQuantity'
        },
        // {
        //   label: '门店报损率',
        //   prop: 'planBreakageRate',
        //   formatter: row => row.planBreakageRate + '%'
        // },
        // {
        //   label: '生产报损率',
        //   prop: 'whsBreakageRate',
        //   formatter: row => row.whsBreakageRate + '%'
        // },
        {
          label: '日期',
          prop: 'stockDate'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        skuname: '',
        date: [this.$day(new Date(Date.now())).format('YYYY-MM-DD'), this.$day(new Date(Date.now())).format('YYYY-MM-DD')],
        heatPointId: '',
        catalog: ''
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          placeholder: '选择日期',
          props: {
            type: 'daterange',
            'value-format': 'yyyy-MM-dd',
            clearable: false
          }
        },
        {
          component: 'el-input',
          key: 'skuname',
          label: '菜品名称',
          placeholder: '请输入菜品名称',
          props: {
            clearable: true
          },
          maxlength: 30
        },
        {
          component: 'BaseSelect',
          key: 'heatPointId',
          label: '供餐点',
          props: {
            options: []
          }
        },
        {
          component: 'BaseSelect',
          key: 'catalog',
          label: '食物类别',
          props: {
            options: []
          }
        }
      ]
    }
  },
  created() {
    this.getHeatPoint()
    this.getCatalog()
    this.getList()
  },
  methods: {
    async getHeatPoint() {
      const res = await this.$request('HeatingPoint/queryEnabledHeat')
      if (!res.data.errMsg) {
        this.queryComps[2].props.options = [{
          label: '全部供餐点',
          value: ''
        }].concat(res.data.obj.heatVos)
      }
    },
    async getCatalog() {
      const res = await this.$request('OrderStockHist/queryCatalogList', {})
      if (!res.data.errMsg) {
        this.queryComps[3].props.options = [{
          label: '全部类别',
          value: ''
        }].concat(res.data.obj)
      }
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      }
      this.$store.state.vloading = true
      const res = await this.$http('OrderStockHist/queryShopStatisticsList', params)
      if (!res.errMsg) {
        this.tableData = res.obj.dataPage.record
        this.tableDataTotal = res.obj.dataPage.totalRecordCount
        this.$nt(() => {
          this.$refs.table.doLayout()
        })
      }
    },
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    async handleExport() {
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const params = {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal
      }
      this.$store.state.bloading = true
      const res = await this.$http('OrderStockHist/queryShopStatisticsList', params)
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.dataPage.record
      })
    },
    goDetail(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          phase: row.trPhase
        }
      })
    },
    genQueryParams() {
      const params = { ...this.queryParams }
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date)
        params.startDate = startDate.format('YYYY-MM-DD')
        params.endDate = endDate.format('YYYY-MM-DD')
      }
      delete params.date
      return params
    }
  }
}
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>
