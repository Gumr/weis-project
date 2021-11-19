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
        <template #type>
          <el-radio-group v-model="aggaregate" @change="aggaregateChange">
            <el-radio :label="false">直接汇总</el-radio>
            <el-radio :label="true">分月汇总</el-radio>
          </el-radio-group>
        </template>
        <template #action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
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
        :total="tableTotal"
        :data="tableData"
        :visible="aggaregate"
        :show-summary="!aggaregate"
        :summary-method="getSummaries"
        border
        @current-page-change="requestList"
        @size-change="requestList"
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
  components: {
    QueryComponents,
    BasePageTable
  },
  data() {
    return {
      aggaregate: false,
      height: window.innerHeight - 240,
      formData: {},
      tableData: [],
      tableTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 20
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
        },
        {
          slot: 'type'
        }
      ]
    }
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps]
      return list
    },
    tableCol() {
      return this.aggaregate
        ? [
          {
            label: '序号',
            type: 'index',
            width: '80'
          },
          {
            label: '日期',
            prop: 'date'
          },
          {
            label: '渠道',
            prop: 'channel'
          },
          {
            label: '端口',
            prop: 'market'
          },
          {
            label: '注册用户数',
            prop: 'registerNum'
          },
          {
            label: '注册用户占比',
            prop: 'registeredRatio'
          },
          {
            label: '下单用户数',
            prop: 'orderPeopleNum'
          },
          {
            label: '下单转化率',
            prop: 'orderTransformRatio'
          }
        ]
        : [
          {
            label: '序号',
            type: 'index',
            width: '80'
          },
          {
            label: '渠道',
            prop: 'channel'
          },
          {
            label: '端口',
            prop: 'market'
          },
          {
            label: '注册用户数',
            prop: 'registerNum'
          },
          {
            label: '注册用户占比',
            prop: 'registeredRatio'
          },
          {
            label: '下单用户数',
            prop: 'orderPeopleNum'
          },
          {
            label: '下单转化率',
            prop: 'orderTransformRatio'
          }
        ]
    }
  },
  created() {
    this.getMarket()
    // this.requestList()
  },
  methods: {
    requestList() {
      if (this.aggaregate) {
        this.getTotalList()
      } else {
        this.getList()
      }
    },
    aggaregateChange() {
      if (this.aggaregate) {
        this.page.pageNo = 1
      }
      this.requestList()
    },
    async getMarket() {
      const res = await this.$http('Dictionaries/getAppidAll', {})
      this.queryComps[1].props.options = res.obj
    },
    async getTotalList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      }
      this.$store.state.vloading = true

      const res = await this.$http('data.RegisterChannel/queryRegisterChannelPool', params)

      if (!res.errMsg) {
        this.formData = res.obj
        this.tableTotal = res.obj.totalRecordCount
        this.tableData = res.obj.record
        this.tableDataTotal = res.obj.totalRecordCount
        this.$nt(() => {
          this.$refs.table.doLayout()
        })
      }
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      }
      this.$store.state.vloading = true

      const res = await this.$http('data.RegisterChannel/queryRegisterChannel', params)
      if (!res.errMsg) {
        this.formData = res.obj
        this.tableData = res.obj.registerChannelData
        this.$nt(() => {
          this.$refs.table.doLayout()
        })
      }
    },
    getSummaries(params) {
      const sums = []
      sums[0] = '-'
      sums[1] = this.formData.channel
      sums[2] = this.formData.market
      sums[3] = this.formData.registerNum
      sums[4] = this.formData.registeredRatio
      sums[5] = this.formData.orderPeopleNum
      sums[6] = this.formData.orderTransformRatio
      return sums
    },
    searchClick() {
      this.page.pageNo = 1
      this.requestList()
    },
    async handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const params = {
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal || 9999
      }
      const res = this.aggaregate
        ? await this.$http('data.RegisterChannel/queryRegisterChannelPool', params)
        : await this.$http('data.RegisterChannel/queryRegisterChannel', params)

      const data = this.aggaregate
        ? res.obj.record
        : res.obj.registerChannelData
      data.push({
        channel: res.obj.channel,
        market: res.obj.market,
        registerNum: res.obj.registerNum,
        registeredRatio: res.obj.registeredRatio,
        orderPeopleNum: res.obj.orderPeopleNum,
        orderTransformRatio: res.obj.orderTransformRatio
      })
      exportExcel({
        columns: this.tableCol,
        filename,
        data
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
.page-container {
  position: relative;
}
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
.total {
  height: 30px;
  position: absolute;
  bottom: 10px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
}
</style>
