<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="6"
        :label-width="80"
        semi
      >
        <template #action>
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
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span
              class="brand-color cursor-pointer action-label"
              @click="goDetail('detail', row)"
            >详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel'
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'
import { orderStatusOptions, orderStatusMap } from '@/utils/data-map'

export default {
  name: 'business_fast-foods_order-list',
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
          label: '订单编码',
          prop: 'orderId'
        },
        {
          label: '订单内容',
          prop: 'orderContent'
        },
        {
          label: '订单类型',
          prop: 'orderTypeDesc'
        },
        {
          label: '加热点',
          prop: 'heatPointName'
        },
        {
          label: '订单原价格',
          prop: 'accountsPrice'
        },
        {
          label: '实付价格',
          prop: 'actualPrice'
        },
        {
          label: '下单员工姓名',
          prop: 'uname'
        },
        {
          label: '下单人手机',
          prop: 'phone'
        },
        {
          label: '下单人角色',
          prop: 'roleDesc'
        },
        {
          label: '所属企业',
          prop: 'corpName'
        },
         {
          label: '企业类型',
          prop: 'corpTypeDesc'
        },
        {
          label: '地址',
          prop: 'address'
        },
        {
          label: '下单时间',
          prop: 'ctime'
        },
        {
          label: '配送时间',
          prop: 'shipTime'
        },
        {
          label: '订单状态',
          prop: 'sttDesc'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 100
      },
      queryParams: {
        date: [],
        orderId: '',
        orderType: '',
        stt: '',
        phone: '',
        corpId: ''
      },
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
          component: 'el-input',
          key: 'orderId',
          label: '订单编码',
          placeholder: '请输入订单编码',
          props: {
            clearable: true
          }
        },
        {
          component: 'BaseSelect',
          key: 'orderType',
          label: '订单类型',
          placeholder: '请选择订单类型',
          props: {
            clearable: true,
            options: [
              { label: '全部', value: '' },
              { label: '团体', value: '00' },
              { label: '个人', value: '01' }
            ]
          }
        },
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '订单状态',
          placeholder: '请选择订单状态',
          props: {
            clearable: true,
            options: orderStatusOptions
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '下单人手机',
          placeholder: '请输入下单人手机',
          props: {
            clearable: true
          }
        },
        {
          component: 'BaseSelect',
          key: 'corpId',
          label: '企业',
          placeholder: '请选择企业',
          props: {
            clearable: true,
            filterable:true,
            options: [],
            props: {
              label: 'tgcName',
              value: 'tgcId'
            }
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
    // this.getList()
    this.getCorpOptions()
  },
  methods: {
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      }
      this.$store.state.vloading = true
      const res = await this.$http('groupmeal.Order/queryList', params)
      if (!res.errMsg) {
        this.tableData = res.obj.record
        this.tableDataTotal = res.obj.totalRecordCount
        this.$nt(() => {
          this.$refs.table.doLayout()
        })
      } else {
        this.$msg(res.errMsg)
      }
    },
    getCorpOptions() {
      this.$request('groupmeal.Corp/queryCorpAllList', {})
        .thenwrap((err, data) => {
          if (!err) {
            this.queryComps.find(i => i.label === '企业').props.options = data
          }
        })
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
        pageNo: 1,
        pageSize: this.tableDataTotal
      }
      const res = await this.$http('groupmeal.Order/queryList', params)
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
      })
    },
    goDetail(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          id: row.orderId
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
