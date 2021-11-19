<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :span="3"
        :label-width="80"
        semi
      >
        <template v-slot:action>
          <el-button
            type="primary"
            @click="getList"
          >搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
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
    >
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        v-bind="col"
        align="center"
      >
        <template #header>
          {{col.label}}
          <el-popover
            placement="top-start"
            trigger="hover"
            :content="col.label=='新增会员数'?'在周期内第一次开通会员的人数':'在周期内续会员费至少1次的人数（未过期续费+过期续费）'"
            v-if="col.label =='新增会员数' || col.label =='续费会员数'"
          >
            <template #reference>
              <span class="el-icon-question"></span>
            </template>
          </el-popover>
        </template>
      </el-table-column>

    </BasePageTable>
  </div>
</template>

<script  lang="ts">
import { defineComponent } from "vue";
import exportExcel from "@/utils/export-excel";
import ButtonTabs from "@/components/ButtonTabs.vue";
export default defineComponent({
  name: "product_route",
  components: {
    ButtonTabs,
  },
  data() {
    return {
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      activeTab: "00",
      queryParams: {
        date: [new Date(Date.now()), new Date(Date.now())],
        startDate: new Date(Date.now()), //开始时间 yyyymmdd
        endDate: new Date(Date.now()), //结束时间 yyyymmdd
      },
      queryComps: [
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
      columns: [
        {
          type: "index",
          label: "序号",
        },
        {
          label: "结算页会员入口曝光人数",
          prop: "finalStatementNum",
        },
        {
          label: "结算页会员入口曝光次数",
          prop: "finalStatementCount",
        },
        {
          label: "结算页入口点击人数",
          prop: "finalStatementClickNum",
        },
        {
          label: "结算页入口点击次数",
          prop: "finalStatementClickCount",
        },
        {
          label: "我的会员入口曝光人数",
          prop: "myMemberEntranceNum",
        },
        {
          label: "我的入口点击人数",
          prop: "myMemberEntranceClickNum",
        },

        {
          label: "【开通/续费会员】按钮点击人数",
          prop: "transactionNum",
        },
        {
          label: "【开通/续费会员】按钮点击次数",
          prop: "transactionCount",
        },
        {
          label: "新增会员数",
          prop: "first",
        },
        {
          label: "续费会员数",
          prop: "renew",
        },
      ],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      
      this.$store.state.vloading = true;
      this.$request("data.MemberData/memberUrlAnalyse", {
        ...this.page,
        ...this.queryParams,
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$store.state.vloading = false;
            // this.tableDataTotal = res.totalRecordCount || 0;
            this.tableData = [res];
          }
        })
      );
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.page,
        ...this.queryParams,
        // pageSize: this.tableDataTotal,
      };
      const res = await this.$http("data.MemberData/memberUrlAnalyse", params);

      exportExcel({
        columns: this.columns,
        filename,
        data: [res.obj],
      });
    },
  },
});
</script>

<style>
</style>