<template>
  <div class="page-container">
    <div style="padding-top: 20px;">
      <BasePageTable
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        :visible="false"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
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
import BasePageTable from "@/components/BasePageTable.vue";
import { catchNonNumberKeydown } from "@/utils/event-catcher";
import exportExcel from "@/utils/export-excel";

export default {
  components: {
    BasePageTable,
  },
  data() {
    return {
      count: 0,
      current: {},
      tkdhId: "",
      disableTodayOptions: {
        disabledDate: (d) => d < Date.now(),
      },
      editDialogVisible: false,
      queryParams: {
        date: "",
        heatPointId: "",
      },
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      // date: '',
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: "序号",
          type: "index",
        },
        {
          label: "SKU",
          prop: "tkdhSkuName",
        },
        {
          label: "编码",
          prop: "tkdhCid",
        },
        {
          label: "规格",
          prop: "tfsQuality",
          formatter: (row) => `${row.tkdhQuality}${row.tkdhUnit}`,
        },
        {
          label: "供餐点",
          prop: "tkdhHpName",
        },
        {
          label: "总量",
          prop: "tkdhTotal",
        },
        {
          label: "现点备货量",
          prop: "tkdhMiniStockTotal",
        },
        {
          label: "预定备货量",
          prop: "tkdhReserveStockTotal",
        },
        {
          label: "美团备货量",
          prop: "tkdhMeituanStockTotal",
        },
        {
          label: "饿了么备货量",
          prop: "tkdhElemeStockTotal",
        },
         {
          label: '端外备货量',
          prop: 'tkdhOutTotal'
        },
        {
          label: "补备货量",
          formatter: (row) =>
            row.tkdhInnerTotal ? row.tkdhInnerTotal : row.tkdhTotal,
        },
        // {
        //   label: '端内预定备货量',
        //   prop: 'tkdhReserveStockTotal'
        // },
       
      ],
    };
  },
  created() {
    this.tkdhId = this.$route.query.id;
    if (!this.tkdhId) {
      this.queryParams.date = this.$day().format("YYYY-MM-DD");
    }
    this.getList();
  },
  methods: {
    catchNonNumberKeydown,
    getList() {
      this.$request("OrderStockHist/queryStockHistDetailList", {
        tkdhId: this.tkdhId,
        type: "02",
      }).then(
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
        data: this.tableData,
      });
    },
  },
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
