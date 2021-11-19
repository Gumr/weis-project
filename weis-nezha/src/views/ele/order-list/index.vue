<template>
  <div class="container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="5"
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
        @current-page-change="getEleOrder"
        @size-change="getEleOrder"
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column label="操作" align="center" fixed="right">
          <template #default="{ row }" class="action-cell">
            <span
              style="color: blue"
              class="brand-color cursor-pointer action-label"
              @click="printEleOrder(row)"
              >打印</span
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
import exportExcel from '@/utils/export-excel'
import {
  printEleOrder, //美团单
} from '@/utils/pushPrint.js'
// import { spawn } from 'child_process';

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ButtonTabs,
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
          label: '日期',
          prop: 'telCtime',
          width: 100,
          formatter: (row) => this.$day(row.telCtime).format('YYYY-MM-DD'),
        },
        {
          label: '门店名称',
          prop: 'telShopName',
          width: 120,
        },
        // {
        //   label: '门店id',
        //   prop: 'tmoAppPoiCode',
        //   width: 120,
        // },
        // {
        //   label: '门店所在城市',
        //   prop: 'tmoWmPoiAddress',
        //   width: 110,
        // },
        {
          label: '订单编号',
          prop: 'telOrderId',
          width: 120,
        },
        {
          label: '订单序号',
          prop: 'telDaySn',
        },
        {
          label: '收件人',
          prop: 'telConsignee',
        },
        {
          label: '收件人电话',
          prop: 'telConsigneePhones',
          formatter: (row) =>
            row.telConsigneePhones && JSON.parse(row.telConsigneePhones)[0],
        },
        {
          label: '收件人地址',
          prop: 'telAddress',
          width: '200',
        },
        {
          label: '下单时间',
          prop: 'telCtime',
          width: 100,
          formatter: (row) =>
            this.$day(row.telCtime).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          label: '完成时间',
          prop: 'telUtime',
          width: 100,
          formatter: (row) => {
            return row.telStatus == 'settled'
              ? this.$day(row.tmoUtime).format('YYYY-MM-DD HH:mm:ss')
              : ''
          },
        },
        // {
        //   label: '配送时长',
        //   prop: 'tmoAvgSendTime',
        // },
        {
          label: '订单状态',
          prop: 'telStatus',
          minWidth: 120,
          formatter: (row) => {
            const status = {
              pending: '未生效订单',
              unprocessed: '未处理订单',
              refunding: '退单处理中',
              valid: '已处理的有效订单',
              invalid: '无效订单',
              settled: '已完成订单',
            }
            return status[row.telStatus]
          },
        },
        {
          label: '是否预订单',
          prop: 'telBook',
          formatter: (row) => (row.telBook == 'true' ? '是' : '否'),
        },
        // {
        //   label: '是否到店自取',
        //   prop: 'tmoPickType',
        //   formatter: (row) => (row.tmoPickType == 1 ? '是' : '否'),
        // },
        {
          label: '是否门店新客户',
          prop: 'tmoIsPoiFirstOrder',
          formatter: (row) => (row.tmoIsPoiFirstOrder ? '是' : '否'),
        },
        {
          label: '商品信息',
          prop: 'telGroups',
          formatter: (row) => {
            let str = ''
            const detail = JSON.parse(row.telGroups)
            detail.forEach((item) => {
              item.items.forEach((sub) => {
                const { name, quantity, unit, price, food_discount } = sub
                str += `${name}*${quantity}、`
              })
            })

            return str.slice(0, str.length - 1)
          },
        },
         {
          label: '商品信息(套餐单品)',
          prop: 'telGroups',
          formatter: (row) => {
            let str = ''
          
            const detail = JSON.parse(row.telGroups)
            detail.forEach((item) => {
              item.items.forEach((sub) => {
                  // debugger
                const { weisPackageDetail } = sub
                if(weisPackageDetail){            
                weisPackageDetail.forEach((sub2) => {
                   str += `${sub2.tfsSkuname}、`
                })
                 }
               
              })
            })

            return str.slice(0, str.length - 1)
          },
        },
        // {
        //   label: '活动信息',
        //   prop: 'tmfPublishStore',
        // },
        // {
        //   label: '配送类型',
        //   prop: 'tmoIsThirdShipping',
        //   formatter: (row) =>
        //     row.tmoIsThirdShipping == 1 ? '美团专送' : '第三方配送',
        // },
        // {
        //   label: '是否部分退款',
        //   prop: 'tmoNotifyType',
        //   formatter: (row) => (row.tmoNotifyType == 'part' ? '是' : '否'),
        // },
        // {
        //   label: '是否全额退款 ',
        //   prop: 'tmoNotifyType',
        //   formatter: (row) => {
        //     return row.tmoNotifyType == 'apply' || row.tmoStatus == 9
        //       ? '是'
        //       : '否'
        //   },
        // },
        {
          label: '顾客实付',
          prop: 'telTotalPrice',
        },
        {
          label: '商品原价',
          prop: 'telGroups',
          formatter: (row) => {
            let total = 0
            console.log(JSON.parse(row.telGroups))

            JSON.parse(row.telGroups).forEach((group) => {
              group.items.forEach((item) => {
                if (item.name != '其它费用') {
                  total += item.total
                }
              })
            })
            console.log(total)

            return total
          },
        },
        {
          label: '配送费',
          prop: 'telDeliverFee',
        },
        {
          label: '包装费',
          prop: 'telPackageFee',
        },

        // {
        //   label: '活动补贴(平台+商家)',
        //   prop: '',
        // },
        // {
        //   label: '商家活动支出',
        //   prop: 'tmfPublishStore',
        // },
        // {
        //   label: '是否商责取消',
        //   prop: 'tmoDealOpType',
        //   formatter: (row) => (row.tmoDealOpType == 2 ? '是' : '否'),
        // },
        // {
        //   label: '商责取消原因',
        //   prop: 'tmoReason',
        //   width: 180,
        // },
        // {
        //   label: '是否配送延迟',
        //   prop: 'tmfPublishStore',
        // },
      ],
      queryParams: {
        date: [
          this.$day(new Date()).format('YYYYMMDD'),
          this.$day(new Date()).format('YYYYMMDD'),
        ],
        storeId: '',
        orderNum: '',
        status: '',
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
          },
        },
        {
          component: 'BaseSelect',
          key: 'storeId',
          label: '门店',
          placeholder: '下拉选择门店',
          props: {
            clearable: true,
            options: {},
          },
        },
        {
          component: 'BaseSelect',
          key: 'telStatus',
          label: '订单状态',
          props: {
            clearable: true,
            options: [
              {
                label: '已处理的有效订单',
                value: 'valid',
              },
              {
                label: '无效订单',
                value: 'invalid',
              },
              {
                label: '未生效订单 ',
                value: 'pending',
              },
              {
                label: '未处理订单',
                value: 'unprocessed',
              },
              {
                label: '退单处理中',
                value: 'refunding',
              },
              {
                label: '已完成订单',
                value: 'settled',
              },
            ],
          },
        },
        {
          component: 'el-input',
          key: 'orderNum',
          label: '订单号',
          placeholder: '请输入订单号',
          props: {
            clearable: true,
          },
        },
        {
          component: 'el-input',
          key: 'orderDaySeq',
          label: '订单序号',
          placeholder: '请输入订单序号',
          props: {
            clearable: true,
          },
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '手机号',
          placeholder: '请输入手机号',
          props: {
            clearable: true,
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
    this.queryStores()
    this.getEleOrder()
  },
  methods: {
    printEleOrder(row) {
      printEleOrder(row, '31')
    },
    searchClick() {
      this.getEleOrder()
    },
    // 获取美团订单
    getEleOrder() {
      this.$request(
        '/cn.nezha.api.eleme.Order/getElemeOrder',
        {
          ...this.page,
          ...this.genQueryParams(),
        },
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            this.tableData = res.orderList
            this.tableDataTotal = res.totalRecordCount
          }
        })
      )
    },
    queryStores() {
      this.$request('/cn.nezha.api.eleme.Store/queryStores', {}, true).then(
        this.$rw((err, res) => {
          if (!err) {
            let storeNames = []
            storeNames = res.result.map((item) => {
              return {
                label: item.tesShopName,
                value: item.tesShopId,
              }
            })
            this.queryComps[1].props.options = storeNames
          }
        })
      )
    },
    genQueryParams() {
      const { options: opts } = this.queryComps[1].props
      const params = { ...this.queryParams }
      if (params.date && params.date.length > 0) {
        params.beginTime = this.$day(params.date[0]).format('YYYYMMDD')
        params.endTime = this.$day(params.date[1]).format('YYYYMMDD')
      }
      if (typeof opts == 'Array') {
        opts.forEach((item) => {
          if (item.label == params.storeName) params.storeId = item.value
        })
      }
      delete params.date
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
            data: res.orderList,
          })
        })
      )
    },
    reqAllFoods() {
      return this.$request(
        'cn.nezha.api.eleme.Order/getElemeOrder',
        {
          pageNo: 1,
          pageSize: this.tableDataTotal,
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