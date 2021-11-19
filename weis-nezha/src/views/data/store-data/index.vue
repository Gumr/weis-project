<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="4"
        :label-width="70"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
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
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
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
  name: 'goods_dish-unit',
  components: {
    QueryComponents,
    BasePageTable
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '门店名称',
          prop: 'shopName'
        },
        {
          label: '日期',
          prop: 'data'
        },
        // {
        //   label: '端口',
        //   prop: 'market'
        // },
        {
          label: '2B订单数量',
          prop: 'tbNum'
        },
        {
          label: '2C(小程序)订单数量',
          prop: 'tcNum'
        },
        {
          label: '顾客实付',
          prop: 'tcPrice'
        },
        {
          label: '2C(美团)订单数量',
          prop: 'mtNum'
        },
        {
          label: '顾客实付',
          prop: 'mtPrice'
        },
        {
          label: '2C(饿了么)订单数量',
          prop: 'elmNum'
        },
        {
          label: '顾客实付',
          prop: 'elmPrice'
        },
        {
          label: '总订单数量',
          prop: 'orderNum'
        },
     
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        market: [],
        date: []
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
            'value-format': 'yyyy-MM-dd'
          }
        },
        {
          component: 'BaseSelect',
          key: 'market',
          label: '端口',
          props: {
            multiple: true,
            'collapse-tags': true,
            options: [

            ]
          }
        }
      ]
    }
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps]
      return list
    }
  },
  created() {
    this.getMarket()
    // this.getList()
  },
  methods: {
    async getMarket() {
      const res = await this.$http('OrderManage/getPayOrderQueryInfo', {})
      this.queryComps[1].props.options = res.obj.market
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      }
      this.$store.state.vloading = true
      const res = await this.$http('data.ShopData/queryShopData', params)
      if (!res.errMsg) {
        this.tableData = res.obj.record
        this.tableDataTotal = res.obj.totalRecordCount
      }
    },
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    async handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const params = {
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal
      }
      const res = await this.$http('data.ShopData/queryShopData', params)
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
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
.medium-input {
  width: 250px;
  margin-right: 20px;
}

.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}
.action-label {
  margin-right: 10px;
}
</style>
