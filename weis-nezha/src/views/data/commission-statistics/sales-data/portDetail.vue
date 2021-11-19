<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :span="4"
        :label-width="50"
        semi>
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="handleExport">导出</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column label="序号" type="index"  width="50"></el-table-column>
        <el-table-column label="供餐点" prop="">
          <template v-slot="{ row }"><span>{{shipPoint}}</span></template>
        </el-table-column>
        <el-table-column label="端口">
          <template v-slot="{ row }"><span>{{port}}</span></template>
        </el-table-column>
        <el-table-column label="订单类型" prop="orderType"></el-table-column>
        <el-table-column label="下单用户数" prop="userNum"></el-table-column>
        <el-table-column label="已完成单数" prop="orderNum"></el-table-column>
        <el-table-column label="占总单数" prop="proportion">
          <template v-slot="{ row }"><span>{{row.proportion}}%</span></template>
        </el-table-column>
        <el-table-column label="销售额" prop="marketAmount"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import ReturnButton from '@/components/ReturnButton.vue';

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ReturnButton
  },
  created() {
    this.queryParams.shipId = this.$route.query.shipId;
    this.shipPoint = this.$route.query.shipPoint;
    this.queryParams.port = this.$route.query.port;
    this.port = {
      '10': '饮食小程序',
      '20': '糖三彩',
      '30': '数搭',
      '99': '外部',
    }[this.queryParams.port];
    if (this.$route.query.startTime) {
      this.queryParams.date = [this.$route.query.startTime, this.$route.query.endTime];
    }
    this.getList();
  },
  data() {
    return {
      shipPoint: '',
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        shipId: '',
        port: '',
      },
      port: '',
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
      ],
    };
  },
  methods: {
    searchClick() {
      this.getList();
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.format('YYYY-MM-DD');
        params.endDate = endDate.format('YYYY-MM-DD');
      }
      delete params.date;
      return params;
    },
    async getList() {
      const res = await this.$http('statistics.SalesStatistics/salesStatisticsByPort', {...this.genQueryParams()});
      this.tableData = res.obj;
    },
    async handleExport() {
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const res = await this.$http('statistics.SalesStatistics/salesStatisticsByPort', {...this.genQueryParams(), pageNo: 1,});
      const columns = [
        { label: '序号', type: 'index' },
        { label: '订单类型', prop: 'orderType' },
        { label: '下单用户数', prop: 'userNum' },
        { label: '已完成单数', prop: 'orderNum' },
        { label: '占总单数', prop: 'proportion', formatter: row => row.proportion + '%' },
        { label: '销售额', prop: 'marketAmount'},
      ]
      exportExcel({
        columns,
        filename,
        data: res.obj,
      });
    }
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>
