<template>
  <div class="">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :span="7"
        :label-width="60"
        semi
      >
        <template v-slot:action>
          <el-button
            type="primary"
            @click="searchClick"
          >搜索</el-button>
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
        border
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
          align="center"
        ></el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import exportExcel from "@/utils/export-excel";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import { transformDaterange } from "@/utils/transform";
import { mapMutations, mapGetters } from "vuex";

export default {
  components: {
    QueryComponents,
    BasePageTable,
  },
  computed: {
    ...mapGetters(["userData"]),
  },
  async created() {
    await this.getHeatPoint();
    await this.getFoodType();
    if (this.userData.heatedPoint.length) {
      this.queryParams.heatedPoint = this.userData.heatedPoint[0].value;
    }
    this.getList();
  },
  data() {
    return {
      height: window.innerHeight - 330,
      tableData: [],
      tableCol: [
        {
          label: "序号",
          type: "index",
        },
        {
          label: "供餐点",
          prop: "heatPointName",
        },
        {
          label: "食物类别",
          prop: "catalogV",
        },
        {
          label: "菜品名称",
          prop: "skuName",
        },
        {
          label: "合计",
          prop: "",
          formatter: (row) =>
            row.timeQuantumForOne +
            row.timeQuantumForTwo +
            row.timeQuantumForThree +
            row.timeQuantumForFour +
            row.timeQuantumForFive +
            row.timeQuantumForSix,
        },
        {
          label: "配送时间9点前",
          prop: "timeQuantumForOne",
        },
        {
          label: "配送时间9:00~10:59",
          prop: "timeQuantumForTwo",
        },
        {
          label: "配送时间11:00~12:59",
          prop: "timeQuantumForThree",
        },
        {
          label: "配送时间13:00~14:59",
          prop: "timeQuantumForFour",
        },
        {
          label: "配送时间15:00-16：59",
          prop: "timeQuantumForFive",
        },
        {
          label: "配送时间17:00-19：30",
          prop: "timeQuantumForSix",
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 99999,
      },
      queryParams: {
        skuName: "",
        date: this.$day(new Date()).format("YYYY-MM-DD"),
        heatedPoint: "",
        foodType: "",
        distributionMode: "",
        dataType: "",
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "日期",
          props: {
            type: "date",
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
            "value-format": "yyyy-MM-dd",
            clearable: false,
          },
        },
        {
          component: "el-input",
          key: "skuName",
          label: "菜品名称",
          placeholder: "请输入菜品名称",
          props: {
            clearable: true,
          },
          maxlength: 30,
        },
        {
          component: "BaseSelect",
          key: "heatedPoint",
          label: "供餐点",
          props: {
            options: [],
            clearable: true,
          },
        },
        {
          component: "BaseSelect",
          key: "foodType",
          label: "食物类别",
          props: {
            options: [],
            clearable: true,
          },
        },
        {
          component: "BaseSelect",
          key: "distributionMode",
          label: "配送方式",
          props: {
            options: [],
            clearable: true,
          },
        },
        {
          component: "BaseSelect",
          key: "dataType",
          label: "数据分类",
          props: {
            options: [
              {
                label: "全部",
                value: "",
              },
              {
                label: "2B复热单（对公企业幼托）",
                value: "00",
              },
              {
                label: "2C复热单（非对公企业幼托）",
                value: "01",
              },
            ],
            clearable: true,
          },
        },
      ],
    };
  },
  methods: {
    async getHeatPoint() {
      const res = await this.$request("HeatingPoint/queryEnabledHeat");
      this.queryComps[2].props.options = res.data.obj.heatVos;
    },
    async getFoodType() {
      const res = await this.$http(
        "ServeMealsOperation/calefactionFoodAktionsInfo",
        {}
      );
      this.queryComps[3].props.options = res.obj.foodType;
      this.queryComps[4].props.options = res.obj.distributionMode;
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.queryParams,
      };
      this.$store.state.vloading = true;
      const res = await this.$http(
        "ServeMealsOperation/calefactionFood",
        params
      );
      if (!res.errMsg) {
        this.tableData = res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount;
        this.$nt(() => {
          this.$refs.table.doLayout();
        });
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.page,
        ...this.queryParams,
        pageSize: this.tableDataTotal,
      };
      this.$store.state.bloading = true;
      const res = await this.$http(
        "ServeMealsOperation/calefactionFood",
        params
      );
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record,
      });
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.format("YYYY-MM-DD");
        params.endDate = endDate.format("YYYY-MM-DD");
      }
      delete params.date;
      return params;
    },
  },
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>
