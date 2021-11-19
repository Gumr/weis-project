<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="5"
        :label-width="60"
        semi
      >
        <template v-slot:action>
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
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        @current-page-change="getList"
        @size-change="getList"
        border
      >
        <el-table-column
          v-for="col in table.col"
          :key="col.prop"
          v-bind="col"
        >
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="150"
        >
          <template
            class="action-cell"
            v-slot="{ row }"
          >
            <el-button
              size="small"
              @click="refund(row)"
              :type="row.orderState == '01'?'primary':''"
            >{{row.orderState == '01'?'失效':'已失效'}}</el-button>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="hasDialog"
      title="会员退款"
      :close-on-click-modal="false"
      @on-confirm="onconfirm"
    >
      <div>可退款: <span style="color:blue">{{refundPrice}}元</span></div>
      <div style="margin-top:10px;margin-bottom:10px">退款金额:
        <el-input
          type="number"
          placeholder="不可超过剩余可退金额"
          v-model="price"
          class="medium-input"
        />元
        <span style="color:#F56C6C">*金额原路退回用户支付账户</span>
      </div>
      <div>失效内容: {{counpType}}</div>
    </ConfirmDialog>
  </div>
</template>

<script>
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import { transformDaterange } from "@/utils/transform";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import exportExcel from "@/utils/export-excel";

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    exportExcel
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    },
  },
  data() {
    return {
      tradeNo: "",
      refundPrice: 0,
      price: '',
      counpType: "",
      hasDialog: false,
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        date: [],
        phone: "",
        vipType: "",
        orderState: "",
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "购买日期",
          props: {
            type: "daterange",
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
          },
        },
        {
          component: "el-input",
          key: "phone",
          maxlength: "30",
          label: "手机号",
          placeholder: "请输入手机号",
          props: {
            clearable: true,
          },
        },
        {
          component: "BaseSelect",
          key: "vipType",
          label: "订单类型",
          props: {
            clearable: true,
            options: [
              {
                label: "会员",
                value: "01",
              },
              {
                label: "续费",
                value: "02",
              },
              {
                label: "加量包",
                value: "03",
              },
            ],
          },
        },
        {
          component: "BaseSelect",
          key: "orderState",
          label: "订单状态",
          props: {
            clearable: true,
            options: [
              {
                label: "未失效",
                value: "01",
              },
              {
                label: "已失效",
                value: "02",
              },
            ],
          },
        },
      ],
      table: {
        col: [
          {
            type: "index",
            label: "序号",
          },
          {
            label: "微信交易单号",
            prop: "thirdNo",
          },
          {
            label: "微信商户单号",
            prop: "vipOrder",
          },
          {
            label: "订单类型",
            prop: "vipType",
            formatter: (row) =>
              row.vipType == "01"
                ? "会员"
                : row.vipType == "02"
                ? "续费会员"
                : "加量包",
          },
          {
            label: "订单名称",
            prop:'vipPackageType'
          },
          {
            label: "用户昵称",
            prop: "uname",
          },
          {
            label: "用户手机号",
            prop: "uPhone",
          },
          {
            label: "券总张数",
            prop: "totalCouponNum",
          },
          {
            label: "券已用张数",
            prop: "useCouponNum",
          },
          {
            label: "订单金额",
            prop: "originalPrice",
          },
          {
            label: "实付金额",
            prop: "payPrice",
          },
          {
            label: "已退款金额",
            prop: "refundMoney",
          },
          {
            label: "购买日期",
            prop: "payTime",
            formatter: (row) =>
            this.$day(Number(row.payTime)).format("YYYY-MM-DD HH:mm:ss"),
          },
          {
            label: "有效期",

            formatter: (row) =>
            this.$day(row.vipBeginTime).format("YYYY.MM.DD ") +'-' + this.$day(row.vipEndTime).format("YYYY.MM.DD "),
          },
          {
            label: "订单状态",
            prop: "orderState",
            formatter: (row) => (row.orderState == "01" ? "未失效" : "已失效"),
          },
          {
            label: "退款状态",
            formatter: (row) =>
              row.orderState == "01"
                ? "已支付"
                : row.orderState == "02"
                ? "退款中"
                : "已退款",
          },
          {
            label: "操作人",
            prop: "operator",
          },
          {
            label: "操作时间",
            prop: "utime",
             formatter: (row) =>
            row.orderState!='01' ? this.$day(row.utime).format("YYYY-MM-DD HH:mm:ss"):'',
          },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    refund(row) {
      if (row.orderState != "01") {
        return;
      }
      this.refundPrice = row.payPrice;
      this.counpType =
        row.vipType == "01"
          ? "剩余的会员券"
          : row.vipType == "02"
          ? "剩余的续费会员券"
          : "剩余的加量包券";
      this.tradeNo = row.vipOrder;
      // this.price = row.payPrice;
      this.hasDialog = true;
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    onconfirm() {
      if (Number(this.price) === NaN) {
        this.$message({ type: "error", message: "请输入正确的退款金额！" });
        return;
      }
      if (Number(this.price) > this.refundPrice) {
        this.$message({
          type: "error",
          message: "退款金额不可超过订单实付金额！",
        });
        return;
      }
      this.$request("refund.Refund/refundVipOrder", {
        tradeNo: this.tradeNo,
        refundPrice: this.price,
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$message({
              type: "success",
              message: "退款成功",
            });
            this.hasDialog = false;
            this.getList();
          } else {
            this.$message({
              type: "error",
              message: err.errMsg,
            });
          }
        })
      );
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request("refund.Refund/queryVipOrder", {
        ...this.page,
        ...this.genQueryParams(),
      }).then(
        this.$rw((err, dataPage) => {
          this.$store.state.vloading = false;
          if (!err) {
            this.tableData = dataPage.vipOrderVODataPage.record;
            this.tableDataTotal = dataPage.vipOrderVODataPage.totalRecordCount;
            this.$nt(() => {
              this.$refs.table.doLayout();
            });
          }
        })
      );
    },
    async HandleExport() {
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      this.$store.state.bloading = true;
      const params = {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal,
      };
      let url = "refund.Refund/queryVipOrder";
      const res = await this.$http(url, params);

      exportExcel({
        columns: this.table.col,
        filename,
        data: res.obj.vipOrderVODataPage.record,
      });
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [beginTime, endTime] = transformDaterange(params.date);
        params.beginTime = beginTime.format("YYYYMMDD");
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
</style>
