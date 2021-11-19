<template>
  <div class="page-container">
    <div style="margin-top: 20px;">
      <ButtonTabs
        v-model="activeTab"
        :tabs="tabs"
        @change="changes"
      />
    </div>
    <div
      style="margin-top: 20px;"
      v-if="activeTab === '00'"
    >
      <ButtonTabs
        v-model="activeTab2"
        :tabs="tabs2"
        @change="changes2"
      />
    </div>
    <div v-if="activeTab2 == '00' && activeTab == '00'">

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
              :content="col.label=='新增会员数'?'在周期内第一次开通会员的人数':col.label=='留存会员数'?'在周期内会员未到期的人数（未过期+过期续费）':col.label=='续费会员人数'?'在周期内续会员费至少1次的人数（未过期续费+过期续费）':col.label=='流失会员人数'?'在周期内会员到期，且当前没有继续续费的人数':col.label=='新增会员费金额总计'?'在周期内【新增会员数】*会员费':col.label=='会员订单数总计'?'在周期内【留存会员】的有效用餐订单数':'在周期内【留存会员】有效用餐订单的实付金额'"
              v-if="col.label !='序号'"
            >
              <template #reference>
                <span class="el-icon-question"></span>
              </template>
            </el-popover>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <div v-if="activeTab2 == '01' && activeTab == '00'">
      <counpon />
    </div>
    <div v-if="activeTab == '01'">
      <route />
    </div>
    <div v-if="activeTab == '02'">
      <memberdata />
    </div>

  </div>
</template>

<script  lang="ts">
import { defineComponent } from "vue";
import exportExcel from "@/utils/export-excel";
import ButtonTabs from "@/components/ButtonTabs.vue";
import counpon from "./coupon.vue";
import route from "./route.vue";
import memberdata from "./memberData.vue";

export default defineComponent({
  name: "product_memberList",
  components: {
    ButtonTabs,
    counpon,
    route,
    memberdata,
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
        date: [new Date(Date.now()),new Date(Date.now())],
       
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
          label: "新增会员数",
          prop: "firstTransactionCount",
        },
        {
          label: "留存会员数",
          prop: "presentCount",
        },
        {
          label: "续费会员人数",
          prop: "renewCount",
        },
        {
          label: "流失会员人数",
          prop: "wastageCount",
        },
        {
          label: "新增会员费金额总计",
          prop: "firstTransactionPrice",
        },
        {
          label: "会员订单数总计",
          prop: "memberOrderCount",
        },
        {
          label: "会员实付金额总计",
          prop: "memberOrderPrice",
        },
      ],
      tabs: [
        {
          label: "总体分析",
          value: "00",
        },
        {
          label: "路径分析",
          value: "01",
        },
        {
          label: "会员列表",
          value: "02",
        },
      ],
      activeTab2: "00",
      tabs2: [
        {
          label: "会员分析",
          value: "00",
        },
        {
          label: "优惠券分析",
          value: "01",
        },
      ],
    };
  },
  created() {
    // this.getList();
  },
  methods: {
    getList() {
    
      this.$store.state.vloading = true;
      this.$request("data.MemberData/memberAnalyse", {
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
      const res = await this.$http(
        "data.MemberData/memberAnalyse",
        params
      );
    
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