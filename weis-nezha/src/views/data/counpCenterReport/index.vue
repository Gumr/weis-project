<template>
  <div class="page-container">
    <div style="margin-top: 20px;">
      <ButtonTabs
        size="small"
        v-model="activeTab"
        :tabs="tabs"
      />
    </div>

    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="3"
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
          >导出</el-button>
        </template>
      </QueryComponents>
    </div>
    <div v-if="activeTab == 0">
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
        :visible="false"
      >
        <el-table-column
          v-for="col in tableCol.tab1"
          :key="col.prop"
          v-bind="col"
          align="center"
        ></el-table-column>
      </BasePageTable>
    </div>
    <div v-if="activeTab == 1">
      <div
        v-for="item in detailData"
        :key="item.time"
        class="section-item"
      >
        {{item.time}}
        <BasePageTable
          ref="table"
          v-model:current-page="page.pageNo"
          v-model:page-size="page.pageSize"
          v-loading="$store.state.vloading"
          :data="item.data"
          :total="tableDataTotal"
          border
          @current-page-change="getList"
          @size-change="getList"
          :visible="false"
        >
          <el-table-column
            v-for="col in tableCol.tab2"
            :key="col.prop"
            v-bind="col"
            align="center"
          ></el-table-column>
        </BasePageTable>
      </div>

    </div>
  </div>
</template>

<script>
import exportExcel from "@/utils/export-excel";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import ButtonTabs from "@/components/ButtonTabs.vue";
// import { transformDaterange } from '@/utils/transform'

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ButtonTabs,
  },
  data() {
    return {
      detailData: {},
      activeTab: 0,
      tableData: [],
      tableDataTotal: 0,
      tabs: [
        {
          label: "总体分析",
          value: "0",
        },
        {
          label: "明细分析",
          value: "1",
        },
      ],
      tableCol: {
        tab1: [
          {
            label: "序号",
            type: "index",
            width: "80",
          },
          {
            label: "券名称",
            prop: "couponName",
          },
          {
            label: "发行量",
            prop: "issueNum",
          },
          {
            label: "已激活",
            prop: "activateNum",
          },
          {
            label: "已使用",
            prop: "useNum",
          },
          {
            label: "已失效",
            prop: "pastDueNum",
          },
        ],
        tab2: [
          {
            label: "序号",
            type: "index",
            width: "80",
          },
          {
            label: "券名称",
            prop: "couponName",
          },
          {
            label: "发行量",
            prop: "issueNum",
          },
          {
            label: "已激活",
            prop: "activateNum",
          },
          {
            label: "已使用",
            prop: "useNum",
          },
          {
            label: "已失效",
            prop: "pastDueNum",
          },
        ],
      },

      page: {
        pageNo: 1,
        pageSize: 50,
      },
      queryParams: {
        activityId: "", //时间
        activityDate: "", //地址
      },
      queryComps: [
        {
          component: "BaseSelect",
          key: "activityId",
          label: "活动名称",
          placeholder: "请选择活动名称",
          props: {
            options: [],
            clearable: true,
          },
          listeners: {
            change: (id) => {
              if (!id) {
                this.queryParams.activityDate = "";
                this.queryComps[1].props.options = [];
              } else {
                this.queryCouponCentreNameDate(id);
              }
            },
          },
        },
        {
          component: "BaseSelect",
          key: "activityDate",
          label: "活动日期",
          placeholder: "请选择活动日期",
          props: {
            options: [],
            clearable: true,
          },
        },
      ],
    };
  },
  created() {
    // this.queryParams.corpId = this.$route.query.id
    // this.getList()
    // this.getCorpAddress()
    this.queryCouponCentreName();
  },
  methods: {
    getList(page) {
      const params = {
        ...this.page,
        ...page,
        ...this.genQueryParams(),
      };
      if (!params.activityId) {
        this.$message.error("请选择活动名称");
        return;
      }
      this.$store.state.vloading = true;
      if (this.activeTab == 0) {
        return this.$http("data.CouponData/queryCouponCentre", params).thenwrap(
          (err, data) => {
            if (!err) {
              this.tableData = data;
              // this.tableDataTotal = data;
            } else {
              this.$message.error(err.errMsg);
            }

            return err ? [] : data;
          }
        );
      } else {
        return this.$http(
          "data.CouponData/queryCouponCentreInfo",
          params
        ).thenwrap((err, data) => {
          if (!err) {
            this.detailData = data;
            // this.tableDataTotal = data;
          } else {
            this.$message.error(err.errMsg);
          }

          return err ? {} : data;
        });
      }
    },
    queryCouponCentreName() {
      this.$request("data.CouponData/queryCouponCentreName", {}).thenwrap(
        (err, data) => {
          if (!err) {
            const result = data.map((item) => ({
              label: item.activityName,
              value: item.activityId,
            }));
            this.queryComps[0].props.options = result;
          }
        }
      );
    },
    queryCouponCentreNameDate(activityId) {
      this.$request("data.CouponData/queryCouponCentreNameDate", {
        activityId,
      }).thenwrap((err, data) => {
        if (!err) {
          const result = data.map((item) => ({
            label: item,
            value: item,
          }));
          this.queryComps[1].props.options = result;
        }
      });
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    handleExport() {
      const filename = `${this.$route.meta.title}-导出(${date})`
      this.getList({
        pageNo: 1,
        pageSize: 999,
      }).then((data) => {
        exportExcel({
          columns: this.tableCol.tab1,
          filename,
          data,
        });
      });
    },
    goDetail(type, row) {
      this.$router.push({
        path: `/business/fast-foods/order-list/${type}`,
        query: {
          id: row.orderId,
        },
      });
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.shipDate)
        params.shipDate = this.$day(params.shipDate).format("YYYY-MM-DD");
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
