<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
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
// import QueryComponents from '@/components/QueryComponents.vue'
// import BasePageTable from '@/components/BasePageTable.vue'
// import { transformDaterange } from '@/utils/transform'

export default {
  name: 'business_coupon-data',
  // components: {
  //   QueryComponents,
  //   BasePageTable
  // },
  data() {
    return {
      // height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        // {
        //   label: '序号',
        //   type: 'index',
        //   width: '80'
        // },
        {
          label: '卡券名称',
          prop: 'couponName'
        },
        {
          label: '活动类型',
          prop: 'activityTypeStr'
        },
        // {
        //   label: '端口',
        //   prop: 'market'
        // },
        {
          label: '活动名称',
          prop: 'activityName'

        },
        {
          label: '活动周期',
          // prop: 'tcNum',
          formatter: (row) => `${row.activityStartTime}-${row.activityEndTime}`
        },
        {
          label: '面额',
          prop: 'couponAmount'
        },
        {
          label: '发行数量',
          prop: 'couponNum'
        },
        {
          label: '已激活',
          prop: 'activateNum'
        },
        {
          label: '已使用',
          prop: 'useNum'
        },
        {
          label: '已失效',
          prop: 'loseEfficacyNum'
        },
        {
          label: '下单转化率',
          // prop: 'orderRatio'
           formatter: (row) => row.orderRatio?row.orderRatio+'%':''
        },
        {
          label: '券使用金额总计',
          prop: 'useCouponAmount'
        },
        {
          label: '订单实付金额总计',
          prop: 'orderAmount'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        couponName: ''
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'couponName',
          label: '活动名称',
          placeholder: '请输入活动名称',
          props: {
            clearable: true
            // type: 'daterange',
            // startPlaceholder: '开始日期',
            // endPlaceholder: '结束日期',
            // 'value-format': 'yyyy-MM-dd'
          }
        }
        // {
        //   component: 'BaseSelect',
        //   key: 'market',
        //   label: '端口',
        //   props: {
        //     multiple: true,
        //     'collapse-tags': true,
        //     options: [

        //     ]
        //   }
        // }
      ]
    }
  },
  // computed: {
  //   computedQueryComps() {
  //     const list = [...this.queryComps]
  //     return list
  //   }
  // },
  created() {
    // this.getMarket()
    // this.getList()
  },
  methods: {
    // async getMarket() {
    //   const res = await this.$http('OrderManage/getPayOrderQueryInfo', {})
    //   this.queryComps[1].props.options = res.obj.market
    // },
    async getList() {
      this.$store.state.vloading = true
      const res = await this.$http('data.CouponData/queryGetCouponData', {
        ...this.page,
        ...this.queryParams
      })
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

      const res = await this.$http('data.CouponData/queryGetCouponData', {
        ...this.page,
        ...this.queryParams
      })
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
      })
    }
    // genQueryParams() {
    //   const params = { ...this.queryParams }
    //   if (params.date && params.date.length > 0) {
    //     const [startDate, endDate] = transformDaterange(params.date)
    //     params.startDate = startDate.format('YYYY-MM-DD')
    //     params.endDate = endDate.format('YYYY-MM-DD')
    //   }
    //   delete params.date
    //   return params
    // }
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
