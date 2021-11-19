<template>
  <div class="page-container">
    <QueryComponents
      v-model="tableQuery"
      style="margin: 20px 0;"
      :query-list="queryComps"
      :span="4"
      :label-width="90"
      semi
    >
      <template #action>
        <el-button
          type="primary"
          @click="searchClick"
        >搜索</el-button>
        <el-button
          type="primary"
        
          @click="exportClick"
        >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
      </template>
    </QueryComponents>
    <BasePageTable
      ref="table"
      v-model:current-page="table.page.pageNo"
      v-model:page-size="table.page.pageSize"
      v-loading="$store.state.vloading"
      :height="height"
      :data="table.data"
      :total="table.total"
      @current-page-change="getTableData"
      @size-change="getTableData"
    >
      <el-table-column
        v-for="col in table.col"
        v-bind="col"
        :key="col.prop"
        align="center"
      ></el-table-column>
    </BasePageTable>
  </div>
</template>

<script>
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import exportExcel from "@/utils/export-excel";
import { transformDaterange } from "@/utils/transform";

// const CouponStatusMap = {
//   '01': '已激活',
//   '02': '已兑换',
//   '03': '已核销',
//   '04': '已失效'
// };

// const CouponTypeMap = {
//   '00': '未激活', '01': '已激活', '02': '已兑换', '03': '已核销', '04': '已失效'
// };

export default {
  name: "marketing_recharge-card_coupon_receive-coupon-list",
  components: {
    QueryComponents,
    BasePageTable,
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableQuery: {
        sellDate: "",
        name: "",
      },
      table: {
        data: [],
        col: [
          {
            label: "序号",
            type: "index",
            width: 80,
          },
          {
            label: "企业",
            prop: "groupName",
          },
          {
            label: "售卖时间",
            prop: "sellDate",
          },
          {
            label: "套餐类型",
            prop: "comboCategory",
          },
          {
            label: "套餐名称",
            prop: "comboName",
          },
        ],
        total: 0,
        page: {
          pageNo: 1,
          pageSize: 10,
        },
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "sellDate",
          label: "售卖时间",
          props: {
            type: "date",
          },
        },
        {
          component: "BaseSelect",
          key: "name",
          label: "企业名称",
          props: {
            clearable: true,
            filterable: true,
            options: [],
          },
        },
      ],
    };
  },
  created() {
    this.getRelevantInfo();
    this.getTableData();
  },
  methods: {
    async getRelevantInfo() {
      const res = await this.$http("groupmeal.Combo/queryCorp", {});
      this.queryComps[1].props.options = res.obj.map((val) => ({
        label: `${val.tgcName}`,
        value: val.tgcName,
      }));
    },
    searchClick() {
      this.table.page.pageNo = 1;
      this.getTableData();
    },

    async exportClick() {
    
    
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        pageNo:1,
        pageSize:99999,
        ...this.tableQuery,
      };
      const res = await this.$http("groupmeal.Combo/querySellGroupCombo", params);
      exportExcel({
        columns: this.table.col,
        filename,
        data: res.obj.record,
      });
    },

    getTableData() {
      const handler = (err, res) => {
        if (!err) {
          this.table.data = res.record;
          this.table.total = res.totalRecordCount;
        }
      };
      this.$request("groupmeal.Combo/querySellGroupCombo", {
        ...this.table.page,
        ...this.tableQuery,
      }).then(this.$rw(handler));
    },
    genQueryParams() {
      const params = { ...this.tableQuery };
      if (params.date && params.date.length > 0) {
        const [startTime, endTime] = transformDaterange(params.date);
        params.startTime = startTime.format("YYYY-MM-DD");
        params.endTime = endTime.format("YYYY-MM-DD");
      }
      delete params.date;
      return params;
    },
  },
};
</script>
