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
            :content="col.label=='购买人数'?'在周期内购买会员/加量包的人数':col.label=='优惠券已激活数量'?'周期内购买的会员/加量包，已激活的优惠券数量':col.label=='优惠券已使用数量'?'周期内购买的会员/加量包，已使用的优惠券数量':col.label=='优惠券已过期数量'?'周期内购买的会员/加量包，已过期的优惠券数量':''"
            v-if="col.label !='序号' &&col.label !='名称' "
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
  name: "product_coupon",
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
          label: "名称",
          prop: "description",
        },
        {
          label: "购买人数",
          prop: "buyCount",
        },
        {
          label: "优惠券已激活数量",
          prop: "activateCount",
        },
        {
          label: "优惠券已使用数量",
          prop: "useCount",
        },
        {
          label: "优惠券已过期数量",
          prop: "staleDatedCount",
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
      this.$request("data.MemberData/memberCouponAnalyse", {
        ...this.page,
        ...this.queryParams,
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$store.state.vloading = false;
            // this.tableDataTotal = res.totalRecordCount || 0;
            this.tableData = res;
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
        "data.MemberData/memberCouponAnalyse",
        params
      );

      exportExcel({
        columns: this.columns,
        filename,
        data: res.obj,
      });
    },
  },
});
</script>

<style>
</style>