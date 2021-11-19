<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="6"
        :label-width="80"
        semi
      >
        <template #action>
          <el-button
            type="primary"
            @click="searchClick"
          >搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>

    </div>
    <div>
      <BasePageTable
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="searchClick"
        @size-change="searchClick"
        :columns="columns"
      >
      </BasePageTable>
    </div>
  </div>
</template>

<script lang="ts">
import exportExcel from "@/utils/export-excel";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";

export default {
  name: "product_Split",
  components: {
    QueryComponents,
    BasePageTable,
  },
  data() {
    return {
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      columns: [
        {
          type: "index",
          label: "序号",
        },
        {
          label: "配送单号",
          prop: "shipOid",
        },

        {
          label: "订单编码",
          prop: "orderId",
        },

        {
          label: "菜品",
          prop: "comboName",
        },

        {
          label: "菜品明细",
          prop: "comboDetails",
        },

        {
          label: "套餐",
          prop: "isCorp",
        },

        {
          label: "打包数量",
          prop: "packNum",
        },

        {
          label: "餐标",
          prop: "standard",
        },

        {
          label: "餐别",
          prop: "category",
        },
        {
          label: "企业类型",
          prop: "groupType",
        },
        {
          label: "加热点",
          prop: "hpName",
        },
        {
          label: "企业折扣",
          prop: "discount",
        },

        {
          label: "菜品原价格",
          prop: "foodPrice",
        },
        {
          label: "分摊餐补",
          prop: "apportionedPrice",
        },
        {
          label: "实付价格",
          prop: "actualPrice",
        },
        {
          label: "下单员工姓名",
          prop: "userName",
        },
        {
          label: "下单人手机",
          prop: "userPhone",
        },
        {
          label: "下单人角色",
          prop: "corpRole",
        },
        {
          label: "所属企业",
          prop: "groupName",
        },
        {
          label: "地址",
          prop: "groupAddr",
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
          label: "订单状态",
          prop: "orderStt",
        },
      ],
      queryParams: {
        userPhone:'',
        groupAddr: "",
        groupName: "",
        groupType: "",
        startTime: "", //开始时间 yyyy-mm-dd
        endTime: "", //结束时间 yyyy-mm-dd
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "配送时间",
          props: {
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
            type: "daterange",
            clearable: true,
          },
          listeners: {
            change: (value: Date[]) => {
              const queryParams = this.queryParams as Record<string, any>;
              queryParams.startTime = this.$day(value[0]).format("YYYYMMDD");
              queryParams.endTime = this.$day(value[1]).format("YYYYMMDD");
            },
          },
        },

        {
          component: "BaseSelect",
          key: "groupType",
          label: "企业类型",
          placeholder: "请选择类型",
          props: {
            clearable: true,
            options: [
              { label: "企业专区", value: "00" },
              { label: "幼托(2-6)岁", value: "01" },
            ],
          },
        },
        {
          component: "el-input",
          key: "userPhone",
          label: "下单人手机",
          placeholder: "请输入负责人手机",
          props: {
            clearable: true,
          },
          maxlength: 30,
        },
        {
          component: "el-input",
          key: "groupName",
          label: "所属企业",
          placeholder: "请输入企业名称",
          props: {
            clearable: true,
          },
          maxlength: 30,
        },
        {
          component: "el-input",
          key: "groupAddr",
          label: "地址",
          placeholder: "请输入地址",
          props: {
            clearable: true,
          },
          maxlength: 30,
        },
      ],
    };
  },
  methods: {
    getEvaluateConformity(page: { pageNo: number; pageSize: number }) {
      return this.$request("data.GroupOrderSplit/queryGroupOrderSplitInfo", {
        ...page,
        ...this.queryParams,
      });
    },
    searchClick() {
      this.$store.state.vloading = true;
      this.getEvaluateConformity(this.page).thenwrap((err, res) => { 
        if (!err) {
          this.tableData = res.result.record;
          this.tableDataTotal = res.result.totalRecordCount;
        } else {
          this.$message.error(err.errMsg);
        }

        this.$store.state.vloading = false;
      });
    },
    async handleExport() {
      this.$store.state.bloading = true;
      this.getEvaluateConformity({
        pageNo: 1,
        pageSize: 99999,
      })
        .thenwrap((err, res) => {
          if (!err) {
            exportExcel({
              data: res.result.record,
              columns: this.columns,
              filename: '企业订单明细(拆单)'
            });
          }
        })
        .finally(() => {
          this.$store.state.bloading = false;
        });
    },
  },
};
</script>

<style>
</style>