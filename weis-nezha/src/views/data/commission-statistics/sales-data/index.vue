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
        <el-table-column label="供餐点" prop="shipPoint"></el-table-column>
        <el-table-column label="下单用户数" prop="userNum"></el-table-column>
        <el-table-column label="已完成单数" prop="orderNum">
          <template v-slot="{ row }"><span style="color:#66b1ff;cursor: pointer;" @click="toDetail(row, 'heatpointDetail')">{{row.orderNum}}</span></template>
        </el-table-column>
        <el-table-column label="销售额(已完成订单)" prop="marketAmount"></el-table-column>
        <el-table-column label="占总销售额" prop="proportion">
          <template v-slot="{ row }"><span>{{row.proportion}}%</span></template>
        </el-table-column>
        <el-table-column label="饮食小程序" align="center">
          <el-table-column label="饮食单数" prop="dietOrderNum">
            <template v-slot="{ row }"><span style="color:#66b1ff;cursor: pointer;" @click="toDetail(row, 'portDetail', '10')">{{row.dietOrderNum}}</span></template>
          </el-table-column>
          <el-table-column label="饮食销售额" prop="dietMarketAmount"></el-table-column>
          <el-table-column label="销售额占比" prop="dietProportion">
            <template v-slot="{ row }"><span>{{row.dietProportion}}%</span></template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="数搭小程序" align="center">
          <el-table-column label="数搭单数" prop="soDoOrderNum">
            <template v-slot="{ row }"><span style="color:#66b1ff;cursor: pointer;" @click="toDetail(row, 'portDetail', '30')">{{row.soDoOrderNum}}</span></template>
          </el-table-column>
          <el-table-column label="数搭销售额" prop="soDoMarketAmount"></el-table-column>
          <el-table-column label="销售额占比" prop="soDoProportion">
            <template v-slot="{ row }"><span>{{row.soDoProportion}}%</span></template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="糖三彩" align="center">
          <el-table-column label="糖三彩单数" prop="mbOrderNum">
            <template v-slot="{ row }"><span style="color:#66b1ff;cursor: pointer;" @click="toDetail(row, 'portDetail', '20')">{{row.mbOrderNum}}</span></template>
          </el-table-column>
          <el-table-column label="糖三彩销售额" prop="mbMarketAmount"></el-table-column>
          <el-table-column label="销售额占比" prop="mbProportion">
            <template v-slot="{ row }"><span>{{row.mbProportion}}%</span></template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="外部订单（手录）" align="center">
          <el-table-column label="外部单数" prop="externalOrderNum">
            <template v-slot="{ row }"><span style="color:#66b1ff;cursor: pointer;" @click="toDetail(row, 'portDetail', '99')">{{row.externalOrderNum}}</span></template>
          </el-table-column>
          <el-table-column label="外部销售额" prop="externalMarketAmount"></el-table-column>
          <el-table-column label="销售额占比" prop="externalProportion">
            <template v-slot="{ row }"><span>{{row.externalProportion}}%</span></template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';

export default {
  components: {
    QueryComponents,
    BasePageTable,
  },
  created() {
    this.getList();
  },
  data() {
    return {
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
      ],
      searchDate: [],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
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
            endPlaceholder: '结束日期'
          }
        },
      ],
    };
  },
  methods: {
    searchClick() {
      this.searchDate = this.$deepClone(this.queryParams.date);
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
      const res = await this.$http('statistics.SalesStatistics/allSalesStatistics', { ...this.genQueryParams() });
      this.tableData = res.obj;
    },
    toDetail(row, type, port) {
      const date = {};
      if (this.searchDate && this.searchDate.length) {
        date.startTime = this.$day(this.searchDate[0]).format('YYYY-MM-DD'),
        date.endTime = this.$day(this.searchDate[1]).format('YYYY-MM-DD');
      }
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          shipId: row.shipId,
          port,
          shipPoint: row.shipPoint,
          ...date
        }
      });
    },
    async handleExport() {
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const res = await this.$http('statistics.SalesStatistics/allSalesStatistics', { ...this.genQueryParams(), pageNo: 1, });
      const columns = [
        { label: '序号', type: 'index' },
        { label: '供餐点', prop: 'shipPoint' },
        { label: '下单用户数', prop: 'userNum' },
        { label: '已完成单数', prop: 'orderNum' },
        { label: '销售额', prop: 'marketAmount' },
        { label: '占销售额数', prop: 'proportion', formatter: row => `${row.proportion}%` },
        { label: '饮食单数', prop: 'dietOrderNum' },
        { label: '饮食销售额', prop: 'dietMarketAmount' },
        { label: '销售额占比', prop: 'dietProportion', formatter: row => `${row.dietProportion}%` },
        { label: '数搭单数', prop: 'soDoOrderNum' },
        { label: '数搭销售额', prop: 'soDoMarketAmount' },
        { label: '销售额占比', prop: 'soDoProportion', formatter: row => `${row.soDoProportion}%` },
        { label: '糖三彩单数', prop: 'mbOrderNum' },
        { label: '糖三彩销售额', prop: 'mbMarketAmount' },
        { label: '销售额占比', prop: 'mbProportion', formatter: row => `${row.mbProportion}%` },
        { label: '外部单数', prop: 'externalOrderNum' },
        { label: '外部销售额', prop: 'externalMarketAmount' },
        { label: '销售额占比', prop: 'externalProportion', formatter: row => `${row.externalProportion}%` },
      ];
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
