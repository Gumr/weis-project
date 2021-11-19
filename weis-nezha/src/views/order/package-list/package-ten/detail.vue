<template>
  <div class="page-container">
    <div style="margin-top: 20px">
      <BasePageTable
        :data="tableData"
        :visible="false"
        border
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
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
    this.tdotShipOrder = this.$route.query.tdotShipOrder;
    this.getList();
  },
  data() {
    return {
      tdotShipOrder: '',
      tableData: [],
      tableCol: [
        { label: '序号', type: 'index', width: '80' },
        { label: '单餐订单ID', prop: 'tdotOrderId' },
        { label: '餐别', prop: 'tdotCategory', formatter: row => row.tdotCategory == '01' ? '早餐' : (row.tdotCategory == '02' ? '午餐' : '晚餐') },
        { label: '菜品', prop: 'tdotContent' },
        { label: '配送类型', prop: 'tdotShipWithCold', formatter: row => row.tdotShipWithColdDesc },
        { label: '配送频率', prop: 'tdotDeliveryFrequencyDesc'},
        { label: '取餐方式', prop: 'tdotDistributionMode', formatter: row => row.tdotDistributionModeDesc },
        { label: '收货日期', prop: 'tdotShipTime' },
        { label: '收货地址', prop: 'tdotReceivingAddress' },
        { label: '下单时间', prop: 'tdotCtime' },
        { label: '当前状态', prop: 'tdotOrderSttDesc'},
      ],
    };
  },
  methods: {
    async getList() {
      const params = {
        tdotShipOrder: this.tdotShipOrder
      };
      const res = await this.$http('comboactivity.ComboActivityOrder/queryShipOrderDetail', params);
      if (!res.errMsg) {
        this.tableData = res.obj;
        this.tableDataTotal = res.obj;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        tdotShipOrder: this.tdotShipOrder
      };
      const res = await this.$http('comboactivity.ComboActivityOrder/queryShipOrderDetail', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj
      });
    },
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.action-label {
  margin-right: 10px;
}
</style>
