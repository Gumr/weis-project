<template>
  <div class="page-container">
    <div style="padding-top: 20px;">
      <BasePageTable
        :visible="false"
        :data="tableData"
        :total="tableDataTotal"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        @current-page-change="getList"
        @size-change="getList"
        border
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column label="保质期(天)" prop="tkdhShelfLife" v-if="type == '02'"></el-table-column>
        <el-table-column label="今日剩余库存(份)" prop="tkdhResidueAllTotal" v-if="type == '02'"></el-table-column>
        <el-table-column label="今日可复用库存(份)" prop="tkdhResidueTotal" v-if="type == '02'"></el-table-column>
        <el-table-column label="计划出库量" prop="tkdhStockTotal" v-if="type == '03'"></el-table-column>
        <el-table-column label="实际出库量" prop="tkdhOutStockTotal" v-if="type == '03'"></el-table-column>
        <el-table-column label="实际入库量" prop="tkdhInnerStockTotal" v-if="type == '03'"></el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import { catchNonNumberKeydown } from '@/utils/event-catcher';
import exportExcel from '@/utils/export-excel';

export default {
  components: {
    BasePageTable
  },
  data() {
    return {
      type: '',
      count: 0,
      current: {},
      tkdhId: '',
      disableTodayOptions: {
        disabledDate: d => d < Date.now()
      },
      editDialogVisible: false,
      queryParams: {
        date: this.$day().format('YYYY-MM-DD'),
        heatPointId: '',
      },
      page: {
        pageNo: 1,
        pageSize: 10
      },
      date: new Date(Date.now() + 86400000),
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '供餐点',
          prop: 'tkdhHpName'
        },
        {
          label: 'SKU',
          prop: 'tkdhSkuName'
        },
        {
          label: '编码',
          prop: 'tkdhCid'
        },
        {
          label: '规格',
          prop: 'tfsQuality',
          formatter: row => `${row.tkdhQuality}${row.tkdhUnit}`
        }
      ],
    };
  },
  created() {
    this.tkdhId  = this.$route.query.id;
    this.type = this.$route.query.type;
    this.getList();
  },
  methods: {
    catchNonNumberKeydown,
    getList() {
      this.$request('OrderStockHist/queryStockHistDetailList', {tkdhId: this.tkdhId, type: this.type}).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.tableData = dataPage;
          }
        })
      );
    },
    handleExport() {
      const filename = `${this.$route.meta.title}-导出`;

      exportExcel({
        columns: this.tableCol,
        filename,
        data: this.tableData
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

.food-cover {
  max-height: 100%;
  max-width: 100%;
}
</style>
