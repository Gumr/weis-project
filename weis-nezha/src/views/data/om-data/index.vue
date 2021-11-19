<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="4"
        :label-width="70"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :visible="false"
        :row-class-name="tableRowClassName"
        border
      >
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';

export default {
  name: 'business_om-data',
  components: {
    QueryComponents,
    BasePageTable,
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  created() {
    this.getAppAll();
    // this.getList();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '时间',
          prop: 'date'
        },
        {
          label: '端口',
          prop: 'appid'
        },
        {
          label: '当月注册用户数',
          prop: 'userNum'
        },
         {
          label: '当月有效注册用户数',
          prop: 'validUserNum'
        },
        {
          label: '当月注册下单用户数',
          prop: 'curRegistOrdered'
        },
        {
          label: '首单转化率',
          prop: 'percentConversion',
          formatter: row => `${row.percentConversion}%`
        },
        {
          label: '当月新用户订单数（不区分注册端口）',
          prop: 'registOrderNum'
        },
        {
          label: '当月注册下单用户平均单次',
          prop: 'curRegistOrderAver'
        },
        {
          label: '新用户客单价',
          prop: 'curRegistxEpenditure'
        },
        {
          label: '历史累计注册用户数',
          prop: 'historyRegistNum'
        },
        {
          label: '历史累计有效注册用户数',
          prop: 'historyValidRegistNum'
        },
        {
          label: '历史累计注册老用户数',
          prop: 'historyRegistOldNum'
        },
        {
          label: '历史累计有效注册老用户数',
          prop: 'historyValidRegistOldNum'
        },
        {
          label: '历史累计下单用户数',
          prop: 'historyRegistOrderNum'
        },
        {
          label: '历史累计下单转化率',
          prop: 'historyRegistFirstOrderRatio',
          formatter: row => `${row.historyRegistFirstOrderRatio}%`
        },
        {
          label: '老用户本月下单人数',
          prop: 'oldUserCount'
        },
        {
          label: '当月老用户下单转化率',
          prop: 'oldUserOrderChangeRatio',
          formatter: row => `${row.oldUserOrderChangeRatio}%`
        },
        {
          label: '当月老用户订单数（不区分注册端口）',
          prop: 'oldOrderNum'
        },
        {
          label: '老用户下单频次',
          prop: 'oldUserOrderRatio'
        },
        {
          label: '老用户当月访问人数',
          prop: 'oldVisitNum'
        },
         {
          label: '老用户当月访问率',        
          prop: 'oldVisitRatio',
          formatter: row => `${row.oldVisitRatio}%`
        },
        {
          label: '老用户客单价',
          prop: 'oldUserAvgPrice'
        },
        {
          label: '当月下单用户数',
          prop: 'curOrderUserNum'
        },
        {
          label: '当月复购用户数',
          prop: 'curOrderTwice'
        },

        {
          label: '复购率',
          prop: 'afterPurchase',
          formatter: row => `${row.afterPurchase}%`
        },
        {
          label: '当月订单数',
          prop: 'curTotalOrderNum'
        },
        {
          label: '平均下单频次',
          prop: 'meanOrderFrequency'
        },
        {
          label: '客单价',
          prop: 'expenditure'
        },
        {
          label: '总金额',
          prop: 'expensePrice'
        },
        {
          label: '新用户订单占比',
          prop: 'newCurUserOrderRatio',
          formatter: row => `${row.newCurUserOrderRatio}%`
        },
        {
          label: '老用户订单占比',
          prop: 'oldCurUserOrderRatio',
          formatter: row => `${row.oldCurUserOrderRatio}%`
        },
        {
          label: '所有在本端口下2单以上的用户数（不区分注册端口）',
          prop: 'historyOldNum'
        },
        {
          label: '前一列中近30天无下单的用户',
          prop: 'currentNotOrder'
        },
        {
          label: '有效用户流失率',
          prop: 'churnRate',
          formatter: row => `${row.churnRate}%`
        },

      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        market: [],
        date: [],
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            type: 'monthrange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
            'value-format': 'yyyy-MM'
          }
        },
        {
          component: 'BaseSelect',
          key: 'market',
          label: '渠道',
          props: {
            multiple: true,
            'collapse-tags': true,
            options: []
          }
        },
      ],
    };
  },
  methods: {
    tableRowClassName({ row }) {
      console.log(row, row.appid, 'row')
      if (row.appid.trim() === '总计') {
        return 'error-row'
      }
    },
    async getAppAll() {
      const res = await this.$http('Dictionaries/getAppidAll', {});
      this.queryComps[1].props.options = res.obj;
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      this.$store.state.vloading = true;
      const res = await this.$http('data.OperationData/getOperationData', params);
      if (!res.errMsg) {
        this.tableData = res.obj;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http('data.OperationData/getOperationData', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj
      });
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.format('YYYY-MM');
        params.endDate = endDate.format('YYYY-MM');
      }
      delete params.date;
      return params;
    },
  }
};
</script>

<style lang="less" scoped>
:deep(.el-table .error-row td) {
  background: #f56c6c !important;
  color: white;
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
</style>
