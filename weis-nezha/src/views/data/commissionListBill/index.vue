<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="4"
        :label-width="120"
      >
        <template #action>
          <el-button
            type="primary"
            @click="searchClick()"
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
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :height="height"
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

export default {
  components: {
    QueryComponents,
    BasePageTable,
  },
  data() {
    return {
      height: window.innerHeight - 400,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "订单号",
          prop: "orderId",
        },
        {
          label: "实付金额",
          prop: "actualPrice",
        },
        {
          label: "本金",
          prop: "paidPrincipal",
        },
        {
          label: "赠送金",
          prop: "paidGiftPrice",
        },
        {
          label: "下单时间",
          prop: "ctime",
        },
        {
          label: "配送时间",
          prop: "shipTime",
        },
        {
          label: "支付方式",
          prop: "payWay",
        },
        {
          label: "用户昵称",
          prop: "userName",
        },
        {
          label: "下单手机号",
          prop: "userPhone",
        },
        {
          label: "餐单类型",
          prop: "saleType",
        },
        {
          label: "提成类型",
          prop: "profitType",
        },

        {
          label: "直接提成人员名称",
          prop: "semName",
        },
        {
          label: "直接提成角色",
          prop: "roleName",
        },
        {
          label: "直接提成人员手机号",
          prop: "semPhone",
        },
        {
          label: "直接提成比例",
          prop: "profitRatio",
        },

        {
          label: "直接提成金额",
          prop: "totalProfit",
        },
        {
          label: "维士销售名称",
          prop: "sexName",
        },

        {
          label: "维士销售手机号",
          prop: "sexPhone",
        },
        {
          label: "维士销售角色",
          prop: "sexRoleName",
        },
        {
          label: "提成状态",
          prop: "profitStatus",
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        startTime: "", //配送开始日期
        endTime: "", //配送结束日期
        userPhone: "", //下单人手机号
        semPhone: "", //企业名称
        profitStatus: "", //提成状态00待确认 10已失效 20已确认
        saleType: "", //餐单类型01:2B,02:2C
        profitType: "", //提成类型:01企业02客户经理03注册来源04其他
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "配送时间",
          props: {
            type: "daterange",
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
            "value-format": "yyyy-MM-dd",
          },
        },
        {
          label: "下单人手机号",
          component: "el-input",
          key: "userPhone",
          placeholder: "请输入手机号",
          props: {
            clearable: true,
          },
        },
        {
          label: "直接提成人员手机号",
          component: "el-input",
          key: "semPhone",
          placeholder: "请输入手机号",
          props: {
            clearable: true,
          },
        },

        {
          component: "BaseSelect",
          key: "profitStatus",
          label: "提成状态",
          placeholder: "请选择提成状态",
          props: {
            clearable: true,
            options: [
              { label: "待确认", value: "00" },
              // { label: "已失效", value: "10" },
              { label: "已确认", value: "20" },
            ],
          },
        },
        {
          component: "BaseSelect",
          key: "saleType",
          label: "餐单类型",
          placeholder: "请选择餐单类型",
          props: {
            clearable: true,
            options: [
              { label: "2B", value: "01" },
              { label: "2C", value: "02" },
            ],
          },
        },
        {
          component: "BaseSelect",
          key: "profitType",
          label: "提成类型",
          placeholder: "请选择提成类型",
          props: {
            clearable: true,
            options: [
              { label: "企业", value: "01" },
              { label: "客户经理", value: "02" },
              { label: "注册来源", value: "03" },
              { label: "其他", value: "04" },
            ],
          },
        },
      ],
    };
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    },
  },
  created() {
    // this.getList();
  },
  methods: {
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams(),
      };
      this.$store.state.vloading = true;
      const res = await this.$http("data.ProfitRecord/queryProfitRecord", params);
      if (!res.errMsg) {
        this.tableData = res.obj.result.record;
        this.tableDataTotal = res.obj.result.totalRecordCount;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http("data.ProfitRecord/queryProfitRecord", params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.result.record,
      });
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startTime, endTime] = transformDaterange(params.date);
        params.startTime = startTime.format("YYYYMMDD");
        params.endTime = endTime.format("YYYYMMDD");
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
