<template>
  <div class="page-container">
    <QueryComponents
      v-model="tableQuery"
      style="margin: 20px 0;"
      :query-list="queryComps"
      :span="6"
      :label-width="90"
      semi
    >
      <template #action>
        <el-button type="primary" @click="searchClick">搜索</el-button>
        <el-button
          type="primary"
          :loading="$store.state.bloading"
          @click="exportClick"
        >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
      </template>
    </QueryComponents>
    <BasePageTable
      ref="table"
      v-model:current-page="table.page.pageNo"
      v-model:page-size="table.page.pageSize"
      v-loading="$store.state.vloading"
      :height="height"
      :data="table.data"
      :total="table.total"
      @current-page-change="getTableData"
      @size-change="getTableData"
    >
      <el-table-column v-for="col in table.col" v-bind="col" :key="col.prop"></el-table-column>
    </BasePageTable>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import exportExcel from '@/utils/export-excel'
import { transformDaterange } from '@/utils/transform'

// const CouponStatusMap = {
//   '01': '已激活',
//   '02': '已兑换',
//   '03': '已核销',
//   '04': '已失效'
// };

// const CouponTypeMap = {
//   '00': '未激活', '01': '已激活', '02': '已兑换', '03': '已核销', '04': '已失效'
// };

export default {
  name: 'marketing_recharge-card_coupon_receive-coupon-list',
  components: {
    QueryComponents,
    BasePageTable
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableQuery: {
        tcuStt: undefined,
        port: '',
        tcuId: '',
        phone: '',
        date: [],
        activityType: '',
        activityName: ''
      },
      table: {
        data: [],
        col: [
          {
            label: '序号',
            type: 'index',
            width: 80
          },
          {
            label: '卡券ID',
            prop: 'tcuId'
          },
          {
            label: '卡券名称',
            prop: 'tcuName'
          },
          {
            label: '对应活动ID',
            prop: 'tcuActivityId'
          },
          {
            label: '活动名称',
            prop: 'activityName'
          },
          {
            label: '券面金额',
            prop: 'tcuAmount'
          },
          {
            label: '卡券类型',
            prop: 'tcuTypeContent'
          },
          {
            label: '卡券使用类型',
            prop: 'useType'
          },
          {
            label: '活动类型',
            prop: 'activityType'
          },
          {
            label: '有效期',
            prop: 'tcuPeriodValid'
          },
          {
            label: '领取人昵称',
            prop: 'tcuUname'
          },
          {
            label: '领取人ID',
            prop: 'tcuUid'
          },
          {
            label: '领取人手机',
            prop: 'tcuUphone'
          },
          {
            label: '领取时间',
            prop: 'tcuSendTime'
          },
          {
            label: '渠道',
            prop: 'tcuSourceDesc'
          },
          {
            label: '领券来源',
            prop: 'port'
          },
          {
            label: '用券订单号',
            prop: 'tcuOrderId'
          },
          {
            label: '当前状态',
            prop: 'tcuSttContent'
          }
        ],
        total: 0,
        page: {
          pageNo: 1,
          pageSize: 10
        }
      },
      queryComps: [
        {
          label: '活动名称',
          component: 'el-input',
          key: 'activityName',
          placeholder: '活动名称',
          props: {
            clearable: true
          }
        },
        {
          component: 'BaseSelect',
          key: 'activityType',
          label: '活动类型',
          props: {
            clearable: true,
            options: [

            ]
          }
        },
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
          key: 'tcuStt',
          label: '状态',
          props: {
            clearable: true,
            options: []
          }
        },
        {
          component: 'BaseSelect',
          key: 'port',
          label: '来源筛选',
          props: {
            clearable: true,
            options: [
              {
                label: '饮食小程序',
                value: '10'
              },
              {
                label: '糖三彩',
                value: '20'
              },
              {
                label: '数搭',
                value: '30'
              }
            ]
          }
        },
        {
          label: '卡券ID',
          component: 'el-input',
          key: 'tcuId',
          placeholder: '卡券ID',
          props: {
            clearable: true
          }
        },
        {
          label: '领取人手机',
          component: 'el-input',
          key: 'phone',
          placeholder: '领取人手机',
          props: {
            clearable: true
          }
        }
      ]
    }
  },
  created() {
    this.getRelevantInfo()
    this.getTableData()
    this.getCouponStateOptions()
  },
  methods: {
    async getRelevantInfo() {
      const res = await this.$http('coupon.Hotlist/relevantInfo', {})
      this.queryComps[1].props.options = [{ label: '全部类型', value: '' }].concat(res.obj.activityType)
    },
    searchClick() {
      this.table.page.pageNo = 1
      this.getTableData()
    },
    getCouponStateOptions() {
      this.$request('coupon.ActivityCoupon/getCouponStateList', {})
        .then(this.$rw((err, data) => {
          if (!err) {
            this.queryComps[3].props.options = data.result.filter(({ value }) => ['00', '02'].indexOf(value) === -1)
          }
        }))
    },
    async exportClick() {
      this.$store.state.bloading = true
      const data = await this.getAllTableData()
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      exportExcel({
        filename,
        data,
        columns: this.table.col
      })
      this.$store.state.bloading = false
    },
    getAllTableData() {
      const handler = (err, { dataPage }) => (err ? Promise.reject(err) : dataPage.record)

      return this.$request('coupon.ActivityCoupon/couponDetailList', {
        pageNo: 1,
        pageSize: 99999,
        ...this.tableQuery,
        ...this.genQueryParams()
      }).then(this.$rw(handler))
    },
    getTableData() {
      const handler = (err, { dataPage }) => {
        if (!err) {
          this.table.data = dataPage.record
          this.table.total = dataPage.totalRecordCount
        }
      }
      this.$request('coupon.ActivityCoupon/couponDetailList', {
        ...this.table.page,
        ...this.tableQuery,
        ...this.genQueryParams()
      }).then(this.$rw(handler))
    },
    genQueryParams() {
      const params = { ...this.tableQuery }
      if (params.date && params.date.length > 0) {
        const [startTime, endTime] = transformDaterange(params.date)
        params.startTime = startTime.format('YYYY-MM-DD')
        params.endTime = endTime.format('YYYY-MM-DD')
      }
      delete params.date
      return params
    }
  }
}
</script>
