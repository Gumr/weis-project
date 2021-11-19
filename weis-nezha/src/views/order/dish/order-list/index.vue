<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="7"
        :label-width="80"
        :action="false"
        semi
      >
        <template #actions>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >
            {{ $store.state.bloading ? '导出中' : '导出' }}
          </el-button>
        </template>
      </QueryComponents>
    </div>
    <div class="table">
      <BasePageTable
        ref="table"
        v-model:selection="tableSelection"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :height="tableHeight"
        :data="tableData"
        :total="tableDataTotal"
        :cell-style="{ padding: 0, height: '200px' }"
        border
        @current-page-change="getOrderList"
        @size-change="getOrderList"
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.key"
          v-bind="col"
        ></el-table-column>
        <el-table-column label="操作" fixed="right" align="center">
          <template #default="{ row }">
            <span
              v-if="
                (row.tdotOrderStt == '05' || row.tdotOrderStt == '01') &&
                infoList.activeTab != 0
              "
              class="brand-color cursor-pointer"
              @click="creastate(row)"
              >已自取</span
            >
            <span
              class="brand-color cursor-pointer"
              style="padding-left: 20px"
              @click="goDetail('detail', row)"
              >详情</span
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue'
import {
  orderStatusOptions,
  orderStatusMap,
  spellOrderOptions,
} from '@/utils/data-map'
import { transformDaterange } from '@/utils/transform'
import { defineComponent } from 'vue'
const orderStatusMap3 = {
  0: '配送',
  1: '自取',
}

const categoryOpts = [
  {
    label: '早餐',
    value: '01',
  },
  {
    label: '午餐',
    value: '02',
  },
  {
    label: '晚餐',
    value: '03',
  },
]

export default defineComponent({
  name: 'order_dish_order-list',
  components: {
    BasePageTable,
  },
  data() {
    return {
      loading: false,
      tableHeight: 'auto',
      rows: {
        sku_name: '',
        buy_nums: '',
        real_price: '',
        sku_price: '',
        sku_sn: '',
        unit_value: '',
        orderId: '',
      },
      tableSelection: [],
      tableData: [],
      infoList: {
        activeTab: '0',
        date: null,
      },
      dishStatusTabs: [
        {
          label: '配送单',
          value: '0',
        },
        {
          label: '自取单',
          value: '1',
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      userdate: [],
      tableDataTotal: 0,
      queryParams: {
        distributionMode: undefined,
        category: '',
        date: [],
        heatPointId: '',
        orderMethod: '',
        source: '',
        shipWithCold: '',
        receiverPhone: '',
        shipOid: '',
        mergeFlag: '',
        isCompOrder: '',
      },
      queryComps: [
        {
          component: 'BaseSelect',
          key: 'distributionMode',
          label: '配送方式',
          props: {
            clearable: true,
            options: [
              {
                label: '全部',
                value: undefined,
              },
              {
                label: '配送单',
                value: '0',
              },
              {
                label: '自取单',
                value: '1',
              },
              {
                label: ' 企业专送',
                value: '2',
              },
            ],
          },
        },
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
          },
        },
        {
          component: 'BaseSelect',
          key: 'tfsStt',
          label: '配送状态',
          placeholder: '请选择菜品状态',
          props: {
            clearable: true,
            options: orderStatusOptions,
          },
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '下单人手机',
          placeholder: '请输入下单人手机号',
          props: {
            clearable: true,
          },
        },
        {
          component: 'el-input',
          key: 'receiverPhone',
          label: '收货人手机',
          placeholder: '请输入收货人手机',
          props: {
            clearable: true,
          },
        },
        {
          component: 'BaseSelect',
          key: 'category',
          label: '餐别',
          props: {
            clearable: true,
            options: categoryOpts,
          },
        },
        {
          component: 'BaseSelect',
          key: 'heatPointId',
          label: '供餐点',
          props: {
            clearable: true,
            options: [],
          },
        },
        {
          component: 'BaseSelect',
          key: 'orderMethod',
          label: '点餐方式',
          props: {
            clearable: true,
            options: [
              { label: '预定', value: '01' },
              { label: '现点', value: '02' },
            ],
          },
        },
        {
          component: 'BaseSelect',
          key: 'source',
          label: '来源',
          props: {
            clearable: true,
            options: [],
          },
        },
        {
          component: 'el-input',
          key: 'orderId',
          label: '餐单编码',
          placeholder: '请输入餐单编码',
          props: {
            clearable: true,
          },
        },
        {
          component: 'el-input',
          key: 'shipOid',
          label: '配送单号',
          placeholder: '请输入配送单号',
          props: {
            clearable: true,
          },
        },
        {
          component: 'BaseSelect',
          key: 'shipWithCold',
          label: '配送类型',
          props: {
            clearable: true,
            options: [
              { label: '全部', value: '' },
              { label: '热食', value: '00' },
              { label: '冷链', value: '01' },
            ],
          },
        },
        {
          component: 'BaseSelect',
          key: 'activityType',
          label: '订单类型',
          props: {
            clearable: true,
            options: [],
          },
        },
        {
          component: 'BaseSelect',
          key: 'mergeFlag',
          label: '是否拼单',
          placeholder: '是否拼单',
          props: {
            clearable: true,
            options: spellOrderOptions,
          },
        },
        {
          component: 'BaseSelect',
          key: 'isCompOrder',
          label: '是否企业单',
          placeholder: '是否企业单',
          props: {
            clearable: true,
            options: [
              { label: '全部订单', value: '00' },
              { label: '普通订单', value: '01' },
              { label: '企业订单', value: '02' },
            ],
          },
        },
        {
          slot: 'actions',
        },
      ],
      tableCol: [
        {
          label: '序号',
          type: 'index',
        },
        {
          label: '餐单编码',
          prop: 'tdotOrderId',
        },
        {
          label: '配送单编码',
          prop: 'tdotShipOid',
        },
        {
          label: '大订单编码（支付行为）',
          prop: 'tdotSoid',
        },
        {
          label: '支付方式',
          prop: 'tdotPayWay',
        },
        {
          label: '是否拼单',
          prop: 'mergeMethod',
        },
        {
          label: '供餐点名称',
          prop: 'thpName',
        },
        {
          label: '微信名/收货人',
          prop: 'uname',
        },
        {
          label: '用户手机',
          prop: 'tdotContactNumber',
        },
        {
          label: '收货人手机',
          prop: 'receiverPhone',
        },
        {
          label: '性别',
          prop: 'sex',
          formatter: (row) => (row.sex ? row.sex : '无'),
        },
        {
          label: '身高',
          prop: 'stature',
          formatter: (row) => (row.stature ? `${row.stature}cm` : '无'),
        },
        {
          label: '年龄',
          prop: 'age',
          formatter: (row) => (row.age ? row.age : '无'),
        },
        {
          label: '体重',
          prop: 'weight',
          formatter: (row) => (row.weight ? `${row.weight}kg` : '无'),
        },
        {
          label: '历史下单数',
          prop: 'orderNumber',
          formatter: (row) =>
            (row.orderNumber = row.orderNumber ? row.orderNumber : 0),
        },
        {
          label: '餐别',
          prop: 'tdotCategory',
        },
        {
          label: '下单时间',
          prop: 'tdotCtime',
        },
        {
          label: '取餐方式',
          prop: 'tdotDistributionMode',
        },
        {
          label: '点餐方式',
          prop: 'tdotOrderMethod',
        },
        {
          label: '配送方式',
          prop: 'tdotShipWithColdDesc',
        },
        {
          label: '渠道',
          prop: 'channelDesc',
        },
        {
          label: '订单类型',
          prop: 'activityType',
        },
        {
          label: '来源',
          prop: 'source',
        },
        {
          label: '菜品',
          prop: 'skuname',
          formatter: (row) =>
            row.skuname
              ? row.skuname.length > 30
                ? `${row.skuname.substring(0, 30)}...`
                : row.skuname
              : '无',
        },
        {
          label: '是否含套餐',
          prop: 'packageFlag',
        },
        {
          label: '是否含套餐',
          prop: 'packageFlag',
        },
        {
          label: '餐单菜品合计金额',
          prop: 'tdotOrderPrice',
        },
        {
          label: '预订奖励金额',
          prop: 'tdotAdvanceRewards',
        },
        {
          label: '折扣抵扣金额',
          prop: 'tdotDiscountAmount',
        },
        {
          label: '优惠券抵扣金额',
          prop: 'tdotCouponAmount',
        },
        {
          label: '维士红包抵扣金额',
          prop: 'tdotRedAmount',
        },
        {
          label: '实付金额（不含配送费）',
          prop: 'tdotActualPrice',
        },
        {
          label: '实付本金金额（不含配送费）',
          prop: 'tdotPaidPrice',
        },
        {
          label: '实付赠送金金额（不含配送费）',
          prop: 'tdotGiftPrice',
        },
        {
          label: '关联的配送单金额',
          prop: 'tdotFoodDeliveryPrice',
        },
        // {
        //   label: '餐单的配送金额',
        //   prop: 'disPrice'
        // },
        // {
        //   label: '餐单的配送本金金额',
        //   prop: 'disPrincipalPrice'
        // },
        // {
        //   label: '餐单的配送赠送金额',
        //   prop: 'disGiftPrice'
        // },
        // {
        //   label: '订单金额',
        //   prop: 'tdotOrderPrice'
        // },
        // {
        //   label: '优惠券抵扣金额',
        //   prop: 'tdotCouponAmount'
        // },
        // {
        //   label: '实付金额',
        //   prop: 'tdotActualPrice'
        // },
        // {
        //   label: '本金支付金额',
        //   prop: 'tdotPaidPrice'
        // },
        // {
        //   label: '赠送金支付金额',
        //   prop: 'tdotGiftPrice'
        // },
        // {
        //   label: '关联配送单支付金额',
        //   prop: 'tdotFoodDeliveryPrice'
        // },
        {
          label: '客户经理姓名',
          prop: 'counselorName',
        },
        {
          label: '客户经理手机',
          prop: 'counselorPhone',
        },
        {
          label: '配送地址',
          prop: 'tdotReceivingAddress',
        },
        {
          label: '配送日期',
          prop: 'tdotDate',
        },
        {
          label: '自取时间',
          prop: 'tdotMealTakingTime',
        },
        {
          label: '当前状态',
          prop: 'tdotOrderStt',
          formatter: (row) => this.formatOrderStatus2(row.tdotOrderStt),
        },
        {
          label: '当餐是否有饮食方案',
          prop: 'planExist',
        },
        {
          label: '方案当天总摄入',
          prop: 'planDayIntake',
        },
        {
          label: '方案当餐应摄入',
          prop: 'planMealIntake',
        },
        {
          label: '当餐点餐热量',
          prop: 'mealEnergy',
        },
        {
          label: '热量差',
          prop: 'energyDiff',
        },
      ],
    }
  },
  created() {
    const { phone } = this.$route.query
    if (phone) {
      this.queryParams.phone = phone
    }
    const height = window.innerHeight
    this.tableHeight = `${height - 330}px`
    this.getAppAll()
    this.getHeatPoint()
    this.relevantInfo()
    // this.getOrderList()
  },
  methods: {
    async getAppAll() {
      const res = await this.$http('Dictionaries/getAppidAll', {})
      const item = this.queryComps.find((val) => val.key == 'source')
      item.props.options = res.obj
    },
    relevantInfo() {
      this.$request('OrderManage/relevantInfo', {}).thenwrap((err, data) => {
        if (!err) {
          const queryItem = this.queryComps.find(
            (it) => it.key === 'activityType'
          )
          queryItem.props.options = data.activityType
        }
      })
    },
    // 获取供餐点
    getHeatPoint() {
      this.$request('HeatingPoint/queryAllHeat').then(
        this.$rw((err, dataPage) => {
          if ((!err, dataPage)) {
            this.queryComps[6].props.options = dataPage.heatVos
          }
        })
      )
    },
    getCategoryTag(category) {
      const map = {
        早餐: 'warning',
        午餐: 'success',
        晚餐: 'danger',
      }

      return map[category]
    },
    searchClick() {
      this.page.pageNo = 1
      this.getOrderList()
    },
    isSameRow(row1, row2) {
      return row1.tdotOrderId === row2.tdotOrderId
    },
    goDetail(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          id: row.tdotOrderId,
        },
      })
    },
    creastate(data) {
      this.$request('ServeMealsOperation/orderStt', {
        orderId: data.tdotOrderId,
      }).then(
        this.$rw((err) => {
          if (!err) {
            this.getOrderList()
          }

          this.$errorNotify(err)
        })
      )
    },
    formatOrderStatus2(status) {
      return orderStatusMap[status]
    },
    formatOrderStatus3(status) {
      return orderStatusMap3[status]
    },
    async handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date}).xlsx`
      const col = this.$deepClone(this.tableCol)
      col.splice(9, 0, { label: '玩法', prop: 'tdotPlanName' })
      const index = col.findIndex((item) => item.prop == 'skuname')
      col[index] = {
        label: '菜品',
        prop: 'skuname',
      }
      const params = {
        ...this.genParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal,
      }
      const res = await this.$http.download(
        '/export/excel/cn.nezha.impl.OrderManageImpl/exportOrderExcel',
        params
      )

      this.$store.state.bloading = false
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
      const downloadElement = document.createElement('a')
      const href = window.URL.createObjectURL(blob) // 创建下载的链接
      downloadElement.href = href
      downloadElement.download = filename // 下载后文件名
      document.body.appendChild(downloadElement)
      downloadElement.click() // 点击下载
      document.body.removeChild(downloadElement) // 下载完成移除元素
      window.URL.revokeObjectURL(href)
    },
    genParams() {
      let lstartDate
      let lendDate
      const _this = this
      if (this.queryParams.date && this.queryParams.date.length > 0) {
        const [startDate, endDate] = transformDaterange(this.queryParams.date)
        lstartDate = startDate.format('YYYY-MM-DD')
        lendDate = endDate.format('YYYY-MM-DD')
      }
      const { queryParams } = this
      return {
        isCompOrder: queryParams.isCompOrder,
        activityType: queryParams.activityType,
        mergeFlag: queryParams.mergeFlag,
        distributionMode: queryParams.distributionMode,
        heatPointId: queryParams.heatPointId,
        orderMethod: queryParams.orderMethod,
        pageNo: _this.page.pageNo,
        pageSize: _this.page.pageSize,
        category: queryParams.category,
        state: queryParams.tfsStt,
        staDate: lstartDate,
        endDate: lendDate,
        pho: queryParams.phone,
        orderId: queryParams.orderId,
        source: queryParams.source,
        shipWithCold: queryParams.shipWithCold,
        receiverPhone: queryParams.receiverPhone,
        shipOid: queryParams.shipOid,
      }
    },
    getOrderList() {
      this.$store.state.vloading = true
      return this.$request('OrderManage/getOrderList', this.genParams()).then(
        this.$rw((err, res) => {
          if (!err) {
            this.tableDataTotal = res.dispatchinglist.totalRecordCount
            this.tableData = res.dispatchinglist.record
            this.$store.state.vloading = false
            this.$nt(() => {
              this.$refs.table.doLayout()
            })
          } else {
            this.$msg(err.errMsg, 'error')
          }
        })
      )
    },

    transformAppointTime(data) {
      const { startTime, endTime } = data
      return `(${this.$day(+startTime).format('YYYY-MM-DD')}) ${this.$day(
        +startTime
      ).format('HH:mm:ss')}--${this.$day(+endTime).format('HH:mm:ss')}`
    },
  },
})
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>
