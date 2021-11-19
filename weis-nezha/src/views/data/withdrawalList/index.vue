<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="4"
        :label-width="80"
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
      height: window.innerHeight - 280,
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
          prop: "orderNo",
        },
        {
          label: "提现金额",
          prop: "price",
        },
        {
          label: "提现类型",
          prop: "way",
        },
        {
          label: "提现人昵称",
          prop: "userName",
        },
        {
          label: "提现人角色",
          prop: "roleName",
        },
        {
          label: "提现人手机号",
          prop: "userPhone",
        },
        {
          label: "提现时间",
          prop: "submitTime",
        },
        {
          label: "到账时间",
          prop: "toaccountTime",
        },
        {
          label: "提现状态",
          prop: "orderStatus",
        },
        {
          label: "失败原因",
          prop: "statusMessage",
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        date: [],
        userPhone: "", //用户手机号
        orderStatus: "", //状态
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "提现时间",
          props: {
            type: "daterange",
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
            "value-format": "yyyy-MM-dd",
          },
        },
        {
          label: "提现人手机号",
          component: "el-input",
          key: "userPhone",
          placeholder: "请输入提现人手机号",
          props: {
            clearable: true,
          },
        },
        {
          component: "BaseSelect",
          key: "orderStatus",
          label: "提现状态",
          placeholder: "请选择状态",
          props: {
            clearable: true,
            options: [
              { label: "已提现", value: "02" },
              { label: "提现中", value: "01" },
              { label: "提现失败", value: "03" },
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
      const res = await this.$http("data.WithdrawalsWater/queryWithdrawalsWater", params);
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
      const res = await this.$http("data.WithdrawalsWater/queryWithdrawalsWater", params);
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
