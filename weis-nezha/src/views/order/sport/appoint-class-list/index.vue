<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="5"
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
        <el-table-column
          label="约课订单编号"
          prop="appointId"
        ></el-table-column>
        <el-table-column label="所属买课订单" prop="orderNo"></el-table-column>
        <el-table-column label="下单人ID" prop="uid"></el-table-column>
        <el-table-column
          label="下单人手机"
          prop="phone"
          width="120"
        ></el-table-column>
        <el-table-column label="下单时间" prop="orderTime" width="160">
          <template #default="{ row }">
            {{ $day(+row.orderTime).format("YYYY-MM-DD HH:mm:ss") }}
          </template>
        </el-table-column>
        <el-table-column label="教练姓名" prop="teachName"></el-table-column>
        <el-table-column label="教练电话" prop="teachPhone"></el-table-column>
        <el-table-column label="课程ID" prop="courseId"></el-table-column>
        <el-table-column label="课程标题" prop="courseName"></el-table-column>
        <el-table-column label="上课时间" prop="appointTime" width="160">
          <template #default="{ row }">
            {{ transformAppointTime(row) }}
          </template>
        </el-table-column>
        <el-table-column label="课程金额" prop="courseMoney"></el-table-column>
        <el-table-column label="订单状态" prop="orderState">
          <template #default="{ row }">
            {{ formatOrderStatus(row.orderState) }}
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue'
// import { mapToOptions } from '@/utils/data-map';
import exportExcel from '@/utils/export-excel'
import { transformDaterange } from '@/utils/transform'

const orderStatusMap = {
  0: '已取消',
  1: '待开始',
  2: '进行中',
  3: '已完成',
  4: '未开始'
}

export default {
  name: 'order_sport_appoint-class-order',
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
        state: '-1',
        phone: '',
        teachPhone: ''
      },
      tableCol: [{
        label: '序号',
        type: 'index'
      }, {
        label: '约课订单编号',
        prop: 'appointId'
      }, {
        label: '所属买课订单',
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
        label: '教练姓名',
        prop: 'teachName'
      }, {
        label: '教练电话',
        prop: 'teachPhone'
      }, {
        label: '课程ID',
        prop: 'courseId'
      }, {
        label: '课程标题',
        prop: 'courseName'
      }, {
        label: '上课时间',
        prop: 'appointTime',
        formatter: this.transformAppointTime
      }, {
        label: '课程金额',
        prop: 'courseMoney'
      }, {
        label: '订单状态',
        prop: 'orderState',
        formatter: this.formatOrderStatus
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
          key: 'state',
          label: '订单状态',
          placeholder: '订单状态选择',
          props: {
            clearable: true,
            options: [{
              label: '全部',
              value: '-1'
            }, {
              label: '未开始',
              value: '4'
            }, {
              label: '待开始',
              value: '1'
            }, {
              label: '进行中',
              value: '2'
            }, {
              label: '已完成',
              value: '3'
            }, {
              label: '已取消',
              value: '0'
            }]
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
        },
        {
          component: 'el-input',
          key: 'teachPhone',
          label: '教练手机',
          placeholder: '请输入教练手机号',
          props: {
            clearable: true
          }
        }]
    }
  },
  created() {
    const { phone } = this.$route.query
    if (phone) {
      this.queryParams.phone = phone
    }

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
      return this.$request('Order/queryAppointOrderHist', {
        ...page,
        ...this.genQueryParams()
      })
    },
    getOrderList() {
      this.$store.state.vloading = true
      this.reqOrderrData(this.page)
        .then(this.$rw((err, { dataPage }) => {
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
    formatOrderStatus(row) {
      return orderStatusMap[row]
    },
    transformAppointTime(data) {
      const { startTime, endTime } = data
      return `(${this.$day(+startTime).format('YYYY-MM-DD')}) ${this.$day(+startTime).format('HH:mm:ss')}--${this.$day(+endTime).format('HH:mm:ss')}`
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
