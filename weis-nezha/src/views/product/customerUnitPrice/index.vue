<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="4"
        :label-width="100"
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
        </template>
      </QueryComponents>
    </div>
    <div>
      <el-table
        style="width: 100%;"
        :data="tableData"
        border
        ref="report-table"
      >
        <el-table-column
          label="序号"
          width="80"
          type="index"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="shipTime"
          label="日期"
          align="center"
        > </el-table-column>
        <el-table-column
          label="早餐"
          align="center"
        >
          <el-table-column
            prop="breakfastNum"
            label="餐单数"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="breakfastPrice"
            label="实付本金总计"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="breakfastUnitPrice"
            label="客单价"
            align="center"
          > </el-table-column>
        </el-table-column>
        <el-table-column
          label="午餐"
          align="center"
        >
          <el-table-column
            prop="lunchNum"
            label="餐单数"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="lunchPrice"
            label="实付本金总计"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="lunchUnitPrice"
            label="客单价"
            align="center"
          > </el-table-column>
        </el-table-column>
        <el-table-column
          label="晚餐"
          align="center"
        >
          <el-table-column
            prop="dinnerNum"
            label="餐单数"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="dinnerPrice"
            label="实付本金总计"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="dinnerUnitPrice"
            label="客单价"
            align="center"
          > </el-table-column>
        </el-table-column>
        <el-table-column
          label="加餐"
          align="center"
        >
          <el-table-column
            prop="addfoodNum"
            label="餐单数"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="addfoodPrice"
            label="实付本金总计"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="addfoodUnitPrice"
            label="客单价"
            align="center"
          > </el-table-column>
        </el-table-column>
        <el-table-column
          label="总计"
          align="center"
        >
          <el-table-column
            prop="totalNum"
            label="餐单数"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="totalPrice"
            label="实付本金总计"
            align="center"
          > </el-table-column>
          <el-table-column
            prop="totalUnitPrice"
            label="客单价"
            align="center"
          > </el-table-column>
        </el-table-column>

      </el-table>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// import exportExcel from "@/utils/export-excel";
import { saveAs } from "file-saver";
import XLSX from "@/utils/xlsx";

export default defineComponent({
  name: "product_toC-MealOrderList",
  data() {
    return {
      isshow: false,
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },

      queryParams: {
        form: "",
        cycleType: "",
        startDate: "", //开始时间 yyyy-mm-dd
        endDate: "", //结束时间 yyyy-mm-dd
      },

      queryComps: [
        {
          component: "BaseSelect",
          key: "form",
          label: "分析项目",
          props: {
            options: [
              {
                label: "预订单",
                value: "01",
              },
              {
                label: "早中晚餐别",
                value: "02",
              },
              {
                label: "配送自取",
                value: "03",
              },
              {
                label: "点餐入口",
                value: "04",
              },
              {
                label: "注册来源",
                value: "05",
              },
              {
                label: "性别年龄",
                value: "06",
              },
              {
                label: "吃法",
                value: "07",
              },
              {
                label: "门店分析",
                value: "08",
              },
              // {
              //   label: '新老用户',
              //   value: '09'
              // }
              {
                label: "首单复购分析",
                value: "10",
              },
            ],
            clearable: true,
          },
          listeners: {
            change: (val) => {
              this.tableData = [];
            },
          },
        },

        {
          component: "BaseSelect",
          key: "cycleType",
          label: "分析周期",
          props: {
            options: [
              {
                label: "日分析",
                value: "01",
              },
              {
                label: "周分析",
                value: "02",
              },
              {
                label: "月分析",
                value: "03",
              },
            ],
            clearable: true,
          },
          listeners: {
            change: (val) => {
              const item = this.queryComps.find(
                (it) => it.label === "日期区间"
              );
              if (val === "03") {
                item.props.type = "monthrange";
              } else {
                item.props.type = "daterange";
              }
              this.queryParams.date = [];
              this.queryParams.startDate = "";
              this.queryParams.endDate = "";
            },
          },
        },
        {
          component: "el-date-picker",
          key: "date",
          label: "日期区间",
          props: {
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
            type: "daterange",
            clearable: true,
          },
          listeners: {
            change: (value: Date[]) => {
              const queryParams = this.queryParams as Record<string, any>;
              queryParams.startDate = this.$day(value[0]).format("YYYYMMDD");
              queryParams.endDate = this.$day(value[1]).format("YYYYMMDD");
            },
          },
        },
      ],
    };
  },
  created() {
    // this.getList()
  },
  methods: {
    getEvaluateConformity(page: { pageNo: number; pageSize: number }) {
      let path = "data.MultiAnalysis/pricepreunitAnalysis";
      return this.$request(path, {
        ...page,
        ...this.queryParams,
      });
    },
    getList() {
      if (!this.queryParams.form) {
        this.$message.error("请选择分析项目");
        return;
      } else if (!this.queryParams.cycleType) {
        this.$message.error("请选择分析周期");
        return;
      } else if (!this.queryParams.date) {
        this.$message.error("请选择日期");
        return;
      } else {
        this.$store.state.vloading = true;
        this.isshow = true;
        this.getEvaluateConformity(this.page).thenwrap((err, res) => {
          if (!err) {
            this.tableData = res.result;
            this.tableDataTotal = res.totalRecordCount || 0;
          } else {
            this.$message.error(err.errMsg);
          }

          this.$store.state.vloading = false;
        });
      }
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const $e = this.$refs["report-table"].$el;
      let $table = $e.querySelector(".el-table__fixed");
      if (!$table) {
        $table = $e;
      }
      const wb = XLSX.utils.table_to_book($table, { raw: true });
      const wbout = XLSX.write(wb, {
        bookType: "xlsx",
        bookSST: true,
        type: "array",
      },);
      saveAs(
        new Blob([wbout], {
          type: "application/octet-stream",
        }),
        `360客单价分析.xlsx`
      );
      this.$store.state.bloading = false;
    },
  },
});
</script>

<style>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>
