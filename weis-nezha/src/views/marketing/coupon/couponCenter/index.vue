<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="100"
        :span="4"
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
          >导出</el-button>
        </template>
      </QueryComponents>
      <el-button
        style="float: right"
        type="success"
        @click="goDetail('add', '')"
      >新建活动</el-button>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :data="tableData"
        :total="tableDataTotal"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        @current-page-change="getList"
        @size-change="getList"
        border
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
          align="center"
        ></el-table-column>
        <el-table-column
          label="状态"
          align="center"
        >
          <template
            class="action-cell"
            v-slot="{ row }"
          >
           <span>
            {{row.stt == 0?'未开始':row.stt == 1?'进行中':'已结束'}}
          </span>
          </template>
         
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
          <template
            class="action-cell"
            v-slot="{ row }"
          >
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 8px"
              @click="toDetail(row)"
             v-if="row.stt == 0"
            >编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="goList(row)"
              style="margin-right: 8px"
           
            >详情</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="stop(row)"
              style="margin-right: 8px;color:red"
              v-if="row.stt == 1"
            >立即结束</span>

            <span
              class="brand-color cursor-pointer action-label"
              @click="del(row)"
              style="margin-right: 8px;color:red"
              v-if="row.stt == 0"
            >删除</span>

          </template>
        </el-table-column>
      </BasePageTable>
    </div>

  </div>

</template>

<script>
import exportExcel from "@/utils/export-excel";
import QueryComponents from "@/components/QueryComponents.vue";
import { transformDaterange } from "@/utils/transform";

export default {
  components: {
    QueryComponents,
  },
  data() {
    return {
      queryParams: {
        date: [],
        // stt: "",
      },
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      tableCol: [
        {
          label: "序号",
          type: "index",
          width: 50,
        },
        {
          label: "活动名称",
          prop: "activityName",
        },
        {
          label: "活动周期",
          prop: "activityDate",
        },
        // {
        //   label: "状态",
        //   prop: "activityShowId",
        // },
      ],
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "活动时间",
          props: {
            type: "daterange",
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
          },
        },
        // {
        //   label: "状态",
        //   key: "stt",
        //   component: "BaseSelect",
        //   placholder: "请选择状态",
        //   props: {
        //     clearable: true,
        //     options: [
        //       {
        //         label: "未开始",
        //         value: "00",
        //       },
        //       {
        //         label: "进行中",
        //         value: "01",
        //       },
        //       {
        //         label: "已结束",
        //         value: "01",
        //       },
        //     ],
        //   },
        // },
      ],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    goDetail() {
      this.$router.push({
        path: `${this.$route.path}/add`,
        query: {
          // id: row.tkdhId
        },
      });
    },
    toDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/edit`,
        query: {
          id: row.activityId,
        },
      });
    },
    goList(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          id: row.activityId,
        },
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
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams(),
      };
      this.$store.state.vloading = true;
      const res = await this.$http("coupon.Hotlist/getGetCouponCentre", params);
      const date = Date.parse(new Date()); // 当前日期
      if (!res.errMsg) {
        this.tableData = res.obj.record;
        this.tableData.forEach((item) => {
          if (date < Number(item.startDate)) {
            // 未开始
            item.stt = 0;
          } else if (
            date > Number(item.startDate) &&
            date < Number(item.endDate)
          ) {
            //进行中
            item.stt = 1;
          } else {
            // 结束
            item.stt = 2;
          }
        });
        this.tableDataTotal = res.obj.totalRecordCount;
        this.$nt(() => {
          this.$refs.table.doLayout();
        });
      }
    },
    async stop(row) {
      const params = {
        activityId: row.activityId,
      };
      const res = await this.$http("coupon.Hotlist/pause", params);
      if (!res.errMsg) {
        this.$msg("暂停成功", "success");
        this.getList()
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    async del(row) {
      const params = {
        activityId: row.activityId,
      };
      const res = await this.$http("coupon.Hotlist/del", params);
      if (!res.errMsg) {
        this.$msg("删除成功", "success");
        this.getList();
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    handleExport() {
      this.$store.state.bloading = true;
      const filename = `${this.$route.meta.title}-导出(${this.date})`;
      exportExcel({
        columns: this.tableCol,
        filename,
        data: this.tableData,
      });
    },
  },
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 44px 0;
}
.query-item {
  width: 30%;
}
</style>