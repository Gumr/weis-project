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
        <el-table-column label="订单类型" prop="orderType"></el-table-column>
        <el-table-column label="下单用户数" prop="userNum"></el-table-column>
        <el-table-column label="已完成单数" prop="orderNum"></el-table-column>
        <el-table-column label="销售额(已完成订单)" prop="marketAmount"></el-table-column>
        <el-table-column label="占总销售额(已完成)" prop="proportion">
          <template v-slot="{ row }"><span>{{row.proportion}}%</span></template>
        </el-table-column>
        <el-table-column label="饮食小程序" align="center">
          <el-table-column label="饮食单数" prop="dietOrderNum"></el-table-column>
          <el-table-column label="饮食销售额" prop="dietMarketAmount"></el-table-column>
          <el-table-column label="销售额占比" prop="dietProportion">
            <template v-slot="{ row }"><span>{{row.dietProportion}}%</span></template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="数搭小程序" align="center">
          <el-table-column label="数搭单数" prop="soDoOrderNum"></el-table-column>
          <el-table-column label="数搭销售额" prop="soDoMarketAmount"></el-table-column>
          <el-table-column label="销售额占比" prop="soDoProportion">
            <template v-slot="{ row }"><span>{{row.soDoProportion}}%</span></template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="糖三彩" align="center">
          <el-table-column label="糖三彩单数" prop="mbOrderNum"></el-table-column>
          <el-table-column label="糖三彩销售额" prop="mbMarketAmount"></el-table-column>
          <el-table-column label="销售额占比" prop="mbProportion">
            <template v-slot="{ row }"><span>{{row.mbProportion}}%</span></template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="外部订单（手录）" align="center">
          <el-table-column label="外部单数" prop="externalOrderNum"></el-table-column>
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
        date: [],
        shipId: '',
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
      const res = await this.$http('statistics.SalesStatistics/salesStatisticsByShipPoint', {...this.genQueryParams()});
      this.tableData = res.obj;
    },
    toDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/portDetail`,
        query: {
          shipId: row.shipId
        }
      });
    },
    async handleExport() {
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const res = await this.$http('statistics.SalesStatistics/salesStatisticsByShipPoint', {...this.genQueryParams(), pageNo: 1,});
      const columns = [
        { label: '序号', type: 'index' },
        { label: '订单类型', prop: 'shipPoint' },
        { label: '下单用户数', prop: 'userNum' },
        { label: '已完成单数', prop: 'orderNum' },
        { label: '销售额', prop: 'marketAmount' },
        { label: '占销售额数', prop: 'proportion', formatter: row => row.proportion + '%' },
        { label: '饮食单数', prop: 'dietOrderNum' },
        { label: '饮食销售额', prop: 'dietMarketAmount' },
        { label: '销售额占比', prop: 'dietProportion', formatter: row => row.dietProportion + '%' },
        { label: '数搭单数', prop: 'soDoOrderNum' },
        { label: '数搭销售额', prop: 'soDoMarketAmount' },
        { label: '销售额占比', prop: 'soDoProportion', formatter: row => row.soDoProportion + '%' },
        { label: '糖三彩单数', prop: 'mbOrderNum' },
        { label: '糖三彩销售额', prop: 'mbMarketAmount' },
        { label: '销售额占比', prop: 'mbProportion', formatter: row => row.mbProportion + '%' },
        { label: '外部单数', prop: 'externalOrderNum' },
        { label: '外部销售额', prop: 'externalMarketAmount' },
        { label: '销售额占比', prop: 'externalProportion', formatter: row => row.externalProportion + '%' },
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
