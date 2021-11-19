<template>
  <div>
    <div class="page-container">
      <div class="query-bar">
        <QueryComponents
          v-model="queryParams"
          :query-list="queryComps"
          :span="4"
          :label-width="120"
          semi
        >
          <template #action>
            <el-button
              type="primary"
              @click="getList"
            >搜索</el-button>
            <el-button
              type="primary"
              :loading="$store.state.bloading"
              @click="handleExport"
            >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
            <el-button
              type="primary"
              style="float:right"
              @click="toEnter('add')"
            >备货录入</el-button>

          </template>
        </QueryComponents>

      </div>
      <BasePageTable
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
        :visible="false"
      >
        <el-table-column
          v-for="col in columns"
          :key="col.label"
          v-bind="col"
          align="center"
        >
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
          <template
            #default="{ row }"
            class="action-cell"
          >
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="toEnter(row,'edit')"
              v-if="row.tkdhState === '10'"
            >编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="toEnter(row,'detail')"
            >详情</span>
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="exportdata(row)"
            >导出</span>
            <span
              v-if=" row.tkdhState === '10'"
              class="brand-color cursor-pointer action-label"
              size="small"
              @click="deleteClick(row)"
              style="margin-right: 10px"
            >删除</span>
            <span
              class="brand-color cursor-pointer action-label"
              v-if="row.tkdhState === '10'"
              size="small"
              @click="syncClick(row)"
            >同步</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import exportExcel from '@/utils/export-excel';
import QueryComponents from "@/components/QueryComponents.vue";
export default defineComponent({
  // name: "scm_store-stock_food-enter",
  components: {
    // ConfirmDialog,
    QueryComponents,
  },
  data() {
    return {
      columns: [
        {
          type: "index",
          label: "序号",
        },
        {
          label: "ATM名称",
          prop: "tkdhHpName",
        },
        {
          label: "总备货量",
          prop: "tkdhTotal",
        },
        {
          label: "备货用途",
          prop: "tkdhChannelDesc",
        },
        {
          label: "售卖日期",
          prop: "tkdhStockDate",
        },
        {
          label: "操作人",
          prop: "tkdhUname",
        },
        {
          label: "操作时间",
          prop: "tkdhUtime",
        },
      ],
       exportColumns: [
        {
          type: "index",
          label: "序号",
        },
        {
          label: "机器名称",
          prop: "machineName",
        },
        {
          label: "货道编号",
          prop: "aisleCode",
        },
        {
          label: "货道最大容量",
          prop: "aisleCapacity",
        },
        {
          label: "商品名称",
          prop: "tfsSkuname",
        },
        {
          label: "商品编码",
          prop: "tfsCid",
        },
        {
          label: "单价",
          prop: "tfsPrice",
        },
         {
          label: "备货量",
          prop: "insideReserveStock",
        },
      ],
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        date: this.$day(new Date(Date.now() + 86400000 * 2)).format(
          "YYYY-MM-DD"
        ),
        heatPointId: "",
        shopType: "20", //机器
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "售卖日期",
          placeholder: "选择日期",
          props: {
            type: "date",
            "value-format": "yyyy-MM-dd",
          },
        },
        {
          component: "BaseSelect",
          key: "heatPointId",
          label: "ATM名称",
          props: {
            options: [],
          },
        },
      ],
    };
  },
  created() {
    this.getList();
    this.queryHeatingPointList();
  },
  methods: {
    syncClick(row) {
      this.stockHistSync([row.tkdhId]);
    },
    stockHistSync(tkdhIds) {
      if (this.syncing) return;
      this.syncing = true;
      this.$request("OrderStockHist/stockHistSync", {
        tkdhIds,
      })
        .thenwrap((err) => {
          if (!err) {
            this.$msg("同步成功", "success");
            this.getList();
          } else {
            this.$msg(err.errMsg, "error");
          }
        })
        .finally(() => {
          this.syncing = false;
        });
    },
    deleteClick(row) {
      this.$request("OrderStockHist/deleteStockHist", {
        tkdhId: row.tkdhId,
        type: "06",
      }).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({ type: "success", message: "删除成功" });
            this.getList();
          } else {
            this.$message({ type: "success", message: err.errMsg });
          }
        })
      );
    },
    async queryHeatingPointList() {
      let params = {
        shopType: "20",
      };
      const res = await this.$request(
        "HeatingPoint/queryHeatingPointList",
        params
      );
      if (!res.data.errMsg) {
        this.queryComps[1].props.options = [
          {
            label: "全部ATM",
            value: "",
          },
        ].concat(res.data.obj);
      }
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request("OrderStockHist/queryStockHistList", {
        ...this.page,
        ...this.queryParams,
        type: "06",
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.$store.state.vloading = false;
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
            this.$nt(() => {
              this.$refs.table.doLayout();
            });
          }
        })
      );
    },
     async exportdata(row) { // 导出备货明细
     const res = await this.$http('OrderStockHist/getMachineStockHistById', {pageNo: 1, pageSize: 99999,  tkdhId: row.tkdhId});
     const tabledata = res.obj.stockList
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      exportExcel({
        columns: this.exportColumns,
        filename,
        data: tabledata
      });

    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const res = await this.$http('OrderStockHist/queryStockHistList', {pageNo: 1, pageSize: this.tableDataTotal, ...this.queryParams});
      exportExcel({
        columns: this.columns,
        filename,
        data: res.obj.dataPage.record
      });
    },
    toEnter(row,type) {
     
      this.$router.push({
        path: `/scm/store-stock/food-enter/ATM/ATMEnterStock`,
        query: {
          tkdhId: row.tkdhId,
          date: row.tkdhStockDate,
          heatPointId: row.tkdhHpid,
          type:type,
        },
      });
    },
  },
});
</script>

<style>
</style>