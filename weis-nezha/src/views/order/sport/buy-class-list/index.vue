<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="6"
        :label-width="80"
        semi
      >
        <template #action>
          <el-button type="primary" @click="resetPageRequestData">搜索</el-button>
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
        @current-page-change="getOrderList"
        @size-change="getOrderList"
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="订单编号" prop="orderNo"></el-table-column>
        <el-table-column label="下单人ID" prop="uid"></el-table-column>
        <el-table-column label="下单人手机" prop="phone"></el-table-column>
        <el-table-column label="下单时间" prop="orderTime" width="160">
          <template #default="{ row }">
            {{ $day(+row.orderTime).format("YYYY-MM-DD HH:mm:ss") }}
          </template>
        </el-table-column>
        <el-table-column label="买课节数" prop="courseNumber"></el-table-column>
        <el-table-column label="课程ID" prop="courseId"></el-table-column>
        <el-table-column label="课程标题" prop="courseName"></el-table-column>
        <el-table-column label="教练姓名" prop="teachName"></el-table-column>
        <el-table-column label="教练电话" prop="teachPhone"></el-table-column>
        <el-table-column label="应付金额" prop="orderPrice"></el-table-column>
        <el-table-column label="实付金额" prop="payPrice"></el-table-column>
        <el-table-column label="付款时间" prop="payTime" width="160">
          <template #default="{ row }">
            {{ $fm.date(+row.payTime) }}
          </template>
        </el-table-column>
        <el-table-column label="订单状态" prop="orderStatus">
          <template #default="{ row }">
            {{ formatOrderStatus(row.orderStatus) }}
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue'
// appointOrderStatusMap,
import exportExcel from '@/utils/export-excel'
import { mapToOptions } from '@/utils/data-map'
import { transformDaterange } from '@/utils/transform'

const orderStatusMap = {
  0: '无效',
  1: '有效'
}

export default {
  name: 'order_sport_buy-class-list',
  components: {
    BasePageTable
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      tableDataTotal: 0,
      queryParams: {
        date: [],
        status: '-1',
        phone: ''
      },
      tableCol: [{
        label: '序号',
        type: 'index'
      }, {
        label: '订单编号',
        prop: 'orderNo'
      }, {
        label: '下单人ID',
        prop: 'uid'
      }, {
        label: '下单人手机',
        prop: 'phone'
      }, {
        label: '下单时间',
        prop: 'orderTime',
        formatter: row => this.$day(+row.orderTime).format('YYYY-MM-DD HH:mm:ss')
      }, {
        label: '买课节数',
        prop: 'courseNumber'
      }, {
        label: '课程ID',
        prop: 'courseId'
      }, {
        label: '课程标题',
        prop: 'courseName'
      }, {
        label: '教练姓名',
        prop: 'teachName'
      }, {
        label: '教练电话',
        prop: 'teachPhone'
      }, {
        label: '应付金额',
        prop: 'orderPrice'
      }, {
        label: '实付金额',
        prop: 'payPrice'
      }, {
        label: '付款时间',
        prop: 'payTime',
        formatter: row => this.$fm.date(+row.payTime)
      }, {
        label: '订单状态',
        prop: 'orderStatus',
        formatter: row => this.formatOrderStatus(row.orderStatus)
      }],
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'BaseSelect',
          key: 'status',
          label: '订单状态',
          plceholder: '订单状态选择',
          props: {
            options: mapToOptions(orderStatusMap)
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '下单人手机',
          placeholder: '请输入下单人手机号',
          props: {
            clearable: true
          }
        }]
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    handleExport() {
      this.$store.state.bloading = true
      const filename = `${this.$route.meta.title}-导出`

      this.reqOrderrData({
        pageNo: 1,
        pageSize: this.tableDataTotal
      }).then(this.$rw((err, { dataPage }) => {
        this.$store.state.bloading = false
        exportExcel({
          columns: this.tableCol,
          filename,
          data: dataPage.record
        })
      }))
    },
    resetPageRequestData() {
      this.page.pageNo = 1
      this.getOrderList()
    },
    reqOrderrData(page = {}) {
      return this.$request('Order/queryPurchaseOrderHist', {
        ...page,
        ...this.genQueryParams()
      })
    },
    getOrderList() {
      this.$store.state.vloading = true
      this.reqOrderrData(this.page).then(this.$rw((err, { dataPage }) => {
        if (!err) {
          this.$store.state.vloading = false
          this.tableDataTotal = dataPage.totalRecordCount
          this.tableData = dataPage.record
          this.$nt(() => {
            this.$refs.table.doLayout()
          })
        }
      }))
    },
    genQueryParams() {
      const params = { ...this.queryParams }
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date)
        params.startDate = startDate
        params.endDate = endDate
      }
      delete params.date
      return params
    },
    formatOrderStatus(status) {
      return orderStatusMap[status]
    }
  }
}
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 12px 22px 0;
}
</style>
