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
          :width="col.label=='有效期'?'200':''"
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
          label: "红包名称",
          prop: "redpacketName",
        },
        {
          label: "活动类型",
          prop: "activityType",
        },
        {
          label: "活动名称",
          prop: "activityName",
        },
        {
          label: "有效期",
          prop: "activitySetime",
        },
        {
          label: "面额",
          prop: "amount",
        },
        {
          label: "发行量",
          prop: "issueCount",
        },
        {
          label: "已激活",
          prop: "activateCount",
        },
        {
          label: "已失效",
          prop: "loseEfficacyCount",
        },
        {
          label: "已使用",
          prop: "useCount",
        },
        {
          label: "下单转化率",
          prop: "orderTransformRate",
        },
         {
          label: "红包使用金额",
          prop: "useAmount",
        },
         {
          label: "券使用金额",
          prop: "couponAmount",
        },
        {
          label: "订单实付金额",
          prop: "orderActualAmount",
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        redpacketName:"", //用户手机号
      },
      queryComps: [

        {
          label: "红包名称",
          component: "el-input",
          key: "redpacketName",
          placeholder: "请输入红包名称",
          props: {
            clearable: true,
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
        ...this.queryParams,
      };
      this.$store.state.vloading = true;
      const res = await this.$http("data.RedPacket/getRedPacketData", params);
      if (!res.errMsg) {
    
        this.tableData = res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
    
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      // debugger
      // const params = {
      //   ...this.queryParams,
      //   ...this.page,
      //   pageSize: this.tableDataTotal,
      // };
      // const res = await this.$http("data.RedPacket/getRedPacketData", params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: this.tableData,
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
