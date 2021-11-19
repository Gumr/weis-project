<template>
  <div class="page-container">
    <QueryComponents
      v-model="tableQuery"
      style="margin: 14px 0;"
      :span="7"
      :label-width="60"
      :query-list="queryComps"
      semi
    >
      <template #action>
        <el-button
          type="primary"
          @click="searchClick"
        >搜索</el-button>
        <el-button
          type="primary"
          :loading="$store.state.bloading"
          @click="HandleExport"
        >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
      </template>
    </QueryComponents>
    <BasePageTable
      ref="table"
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      v-loading="$store.state.vloading"
      :height="height"
      :data="table.data"
      :total="table.total"
      border
      @current-page-change="getTableData"
      @size-change="getTableData"
    >
      <el-table-column
        v-for="col in table.col"
        :key="col.prop"
        v-bind="col"
      >
        <template
          #default="{ row }"
          class="action-cell"
          v-if="col.prop == 'torlRemarks'"
        >
          <span>{{row.torlRemarks.length>10?row.torlRemarks.substring(0,10)+'...':row.torlRemarks}}</span>
        </template>

      </el-table-column>
      <el-table-column
        label="操作"
        width="160"
      >
        <template #default="{ row }">
          <!-- v-if="row.torlHandleStt === '02' && row.refundType === '02'" -->
          <el-button
            v-if="row.torlAuditSttStr === '待审核'"
            size="small"
            type="warning"
            @click="rowReviewClick(row)"
          >
            审核
          </el-button>
          <el-button
            size="small"
            type="info"
            @click="rowDetailClick(row)"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </BasePageTable>
  </div>
</template>

<script>
import BasePageTable from "@/components/BasePageTable.vue";
import QueryComponents from "@/components/QueryComponents.vue";
import { validArray } from "@/utils/common";
import { transformDaterange } from "@/utils/transform";
import exportExcel from "@/utils/export-excel";
import {
  categoryOptions,
  categoryMap,
  optionsToMap,
  returnTypeOptions as RefundTypeOpts,
} from "@/utils/data-map";

const RefundTypeMap = optionsToMap(RefundTypeOpts);

const HandleStatusMap = {
  "02": "处理中",
  "03": "退款完成",
  "04": "已结算",
  11: "已关闭",
  12: "已通过",
  13: "入账中",
  20: "驳回",
};

const auditSttOptions = [
  {
    label: "待审核",
    value: "00",
  },
  {
    label: "审核通过",
    value: "10",
  },
  {
    label: "已驳回",
    value: "20",
  },
];

export default {
  components: {
    BasePageTable,
    QueryComponents,
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableQuery: {
        date: [],
        category: "",
        refundType: "",
        phone: "",
        auditStt: "",
      },
      queryComps: [
        {
          label: "日期",
          component: "el-date-picker",
          key: "date",
          props: {
            type: "daterange",
            clearable: true,
          },
        },
        {
          label: "退单类型",
          component: "BaseSelect",
          key: "refundType",
          props: {
            options: [
              {
                label: "取消订单",
                value: "01",
              },
              {
                label: "申请售后",
                value: "02",
              },
              {
                label: "店长退款",
                value: "11",
              },
            ],
            clearable: true,
          },
        },
        {
          label: "餐别",
          key: "category",
          component: "BaseSelect",
          props: {
            options: categoryOptions,
            clearable: true,
          },
        },
        {
          label: "状态",
          key: "auditStt",
          component: "BaseSelect",
          props: {
            options: auditSttOptions,
            clearable: true,
          },
        },
        {
          label: "手机号",
          key: "phone",
          component: "el-input",
          props: {
            clearable: true,
          },
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      table: {
        data: [],
        col: [
          {
            type: "index",
            label: "序号",
          },
          {
            label: "退单号",
            prop: "torlId",
          },
          {
            label: "原订单编码",
            prop: "torlSid",
          },
          {
            label: "申请时间",
            prop: "torlCtime",
          },
          {
            label: "所属加热点",
            prop: "heatingPoint",
          },
          {
            label: "端口",
            prop: "torlAppidDesc",
          },
          {
            label: "退单人",
            prop: "uname",
          },
          {
            label: "退单人手机",
            prop: "phone",
          },
          {
            label: "支付类型",
            prop: "torlPayWay",
          },
          {
            label: "退单类型",
            prop: "refundType",
            formatter: (row) => RefundTypeMap[row.refundType],
          },
          {
            label: "退单原因",
            prop: "torlApplicationReason",
          },
          // {
          //   label: '餐别',
          //   prop: 'category',
          //   formatter: row => categoryMap[row.category]
          // },
          {
            label: "应退金额",
            prop: "amount",
          },
          {
            label: "实退金额",
            prop: "actualAmount",
          },
          {
            label: "退款状态",
            formatter: (row) =>
              ({
                "01": "处理完成",
                "02": "处理中",
                "03": "退款完成",
              }[row.torlHandleStt]),
          },
          {
            label: "审核状态",
            prop: "torlAuditSttStr",
          },
          {
            label: "备注",
            prop: "torlRemarks",
          },
        ],
        total: 0,
      },
    };
  },
  created() {
    this.getTableData();
  },
  methods: {
    rowReviewClick(row) {
      this.$pushRoute("after-sales", {
        query: {
          id: row.torlId,
          status: 1,
          type: row.refundType,
        },
      });
    },
    rowDetailClick(row) {
      this.$pushRoute("after-sales", {
        query: {
          id: row.torlId,
          status: 0,
          type: row.refundType,
        },
      });
      // if (row.refundType === '02') {
      //   this.$pushRoute('after-sales', {
      //     query: {
      //       id: row.torlId,
      //       status: 0,
      //       type: row.refundType
      //     }
      //   });
      // } else {
      //   this.$pushRoute('detail', {
      //     query: {
      //       id: row.torlId,
      //       type: row.refundType
      //     }
      //   });
      // }
    },
    deletePolicyClick(id) {
      this.deletePolicy(id).then(({ data }) => {
        if (data.errCode === 0) {
          this.$message({
            type: "error",
            message: "删除政策成功！",
          });

          this.getTableData();
        }
      });
    },
    deletePolicy(policyId) {
      return this.$request("Channel/deletePolicy", {
        policyId,
      });
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getTableData();
    },
    policyStatusFormatter(row) {
      return {
        "00": "无效",
        "01": "正常",
      }[row.state];
    },
    getTableQuery() {
      const query = { ...this.tableQuery };
      if (validArray(query.date)) {
        const [startDate, endDate] = transformDaterange(query.date);
        query.startDate = startDate.format("YYYY-MM-DD");
        query.endDate = endDate.format("YYYY-MM-DD");
      }
      delete query.date;
      return query;
    },
    getTableData() {
      this.$request("refund.Refund/queryAllRefund", {
        ...this.page,
        ...this.getTableQuery(),
      }).then(({ data }) => {
        if (data.errCode === 0) {
          data = data.obj && data.obj.dataPage;
          this.table.total = data.totalRecordCount;
          this.table.data = data.record;
        }
      });
    },
    goDetail(id) {
      this.$pushRoute("detail", {
        query: {
          id,
        },
      });
    },
    HandleExport() {
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      this.$store.state.bloading = true;
      this.reqAllUserData().then(
        this.$rw((err, res) => {
          exportExcel({
            columns: this.table.col,
            filename,
            data: res.dataPage.record,
          });
          this.$store.state.bloading = false;
        })
      );
    },
    reqAllUserData() {
      return this.$request("refund.Refund/queryAllRefund", {
        ...this.getTableQuery(),
        pageNo: 1,
        pageSize: this.table.total,
      });
    },
  },
};
</script>
