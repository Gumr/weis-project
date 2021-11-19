<template>
  <div class>
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="5"
        :label-width="80"
      >
        <template #action>
          <el-button
            type="primary"
            @click="searchClick"
          >搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >
            {{ $store.state.bloading ? '导出中' : '导出' }}
          </el-button>
          <el-button
            type="primary"
            @click="batchPrintClick"
          >批量打印</el-button>
          <el-button
            type="danger"
            @click="timingPrint"
          >一键打印预订单</el-button>
          <span style="margin-left:10px">(预订单：00：00前支付的订单)</span>

        </template>

      </QueryComponents>

    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:selection="tableSelection"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :data="tableData"
        :total="tableDataTotal"
        :row-class-name="tableRowClassName"
        @current-page-change="getList"
        @size-change="getList"
        @sort-change="sortChange"
      >
        <el-table-column
          key="icon"
          width="45"
          align="center"
          prop="icon"
        >
          <template #default="{ row }">
            <img
              v-if="row.warnLevel == '11'"
              src="/images/danger.png"
              style="width: 20px;margin-top: 5px;"
            />
            <img
              v-if="row.warnLevel == '12'"
              src="/images/warn.png"
              style="width: 20px;margin-top: 5px;"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        />
        <el-table-column
          label="操作"
          align="center"
          fixed="right"
        >
          <template
            #default="{ row }"
            class="action-cell"
          >
            <span
              v-if="(row.thpId === '100039' || row.thpId === '100038')
              && todayStr === row.tdotShipTime
              && row.mergeStt !== '00'
              && (row.tdotOrderStt == '05' || row.tdotOrderStt == '01')"
              class="brand-color cursor-pointer action-label"
              @click="finishOrder(row)"
            >订单完成</span>
            <span
              v-if="row.mergeStt !== '00'"
              class="brand-color cursor-pointer action-label"
              @click="goPrint(row)"
            >打印</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="goDetail(row)"
            >详情</span>
            <el-popover
              v-if="row.tdotOrderStt == '06'"
              placement="left"
              title
              trigger="hover"
            >
              <div class="section-item">
                <span
                  v-if="content.length"
                  class="section-label"
                >{{ content[content.length-1].createTime + '\xa0\xa0\xa0\xa0\xa0' + content[content.length-1].content }}</span>
              </div>
              <div class="section-item">
                <span class="section-label">
                  已上为最新追踪信息
                  <span
                    style="color:#409EFF;cursor: pointer;"
                    @click="goDetail(row)"
                  >查看全部</span>
                </span>
              </div>
              <template #reference>
                <span
                  class="brand-color cursor-pointer optr-label"
                  @mouseenter="distriStatus(row)"
                >物流信息</span>
              </template>
            </el-popover>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import exportExcel from "@/utils/export-excel";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import { transformDaterange } from "@/utils/transform";
import { printSpellOrder, printOrder } from "@/utils/pushPrint.js";
import { orderStatusMap, orderStatusOptions } from "@/utils/data-map";
import { defineComponent } from "vue";
export default defineComponent({
  name: "order_ship-list",
  components: {
    QueryComponents,
    BasePageTable,
  },
  data() {
    return {
      todayStr: this.$day().format("YYYYMMDD"),
      printing: false,
      content: [],
      tableData: [],
      tableDataTotal: 0,
      tableSelection: [],
      tableCol: [
        {
          label: "/",
          type: "selection",
        },
        {
          label: "序号",
          type: "index",
        },
        {
          label: "配送单编码",
          prop: "tdotOrderId",
        },
        {
          label: "供餐点名称",
          prop: "thpName",
        },
        {
          label: "收货人",
          prop: "uname",
        },
        {
          label: "收货人手机",
          prop: "tdotContactNumber",
        },
        {
          label: "下单人手机",
          prop: "receiverPhone",
        },
        {
          label: "餐别",
          prop: "tdotCategory",
        },
        {
          label: "配送方式",
          prop: "shipWithCold",
          formatter: (row) => (row.shipWithCold == "00" ? "热食" : "冷食"),
        },
        {
          label: "取餐方式",
          prop: "tdotDistributionMode",
        },
        {
          label: "菜品",
          prop: "skuname",
          formatter: (row) =>
            row.skuname
              ? row.skuname.length > 20
                ? `${row.skuname.substring(0, 20)}...`
                : row.skuname
              : "",
        },
        {
          label: "菜品总数",
          prop: "tdodnum",
        },
        {
          label: "订单金额",
          prop: "tdotOrderPrice",
        },
        {
          label: "配送费",
          prop: "tdotFoodDeliveryPrice",
        },
        {
          label: "配送地址",
          prop: "tdotReceivingAddress",
        },
        {
          label: "配送日期",
          prop: "tdotCtime",
        },
        {
          label: "配送时间",
          prop: "tdotMealTakingTime",
        },
        {
          label: "餐号",
          prop: "tdotTakeMealCode",
          formatter: (row) =>
            row.mergeFlag === "10"
              ? `${row.tdotTakeMealCode}(拼${row.mergeOrderNum})`
              : row.tdotTakeMealCode,
          sortable: true,
        },
        {
          label: "订单状态",
          prop: "tdotOrderStt",
          formatter: (row) => {
            return orderStatusMap[row.tdotOrderStt] || row.tdotOrderStt;
          },
        },
        {
          label: "出票状态",
          prop: "subSttStr",
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        date: [new Date(), new Date()],
        shipdate: [],
        shipTimes: [],
        shipOrderId: "",
        phone: "",
        shipType: "",
        mergeFlag: "",
        distributionMode: "0",
        skuName: "",
        codeSortType: "1",
        subStt: "",
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "日期",
          props: {
            clearable: false,
            type: "daterange",
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
          },
        },
        {
          component: "BaseSelect",
          key: "state",
          label: "配送状态",
          placeholder: "请选择菜品状态",
          props: {
            clearable: true,
            options: orderStatusOptions,
          },
        },
        {
          component: "BaseSelect",
          key: "heatPointId",
          label: "供餐点",
          placeholder: "请选择供餐点",
          props: {
            clearable: true,
            options: [],
          },
        },
        {
          component: "el-input",
          key: "takeCode",
          label: "取餐码",
          placeholder: "请输入取餐码",
          props: {
            clearable: true,
          },
        },
        {
          component: "el-input",
          key: "phone",
          label: "下单人手机",
          placeholder: "请输入下单人手机号",
          props: {
            clearable: true,
          },
        },
        {
          component: "el-input",
          key: "receiverPhone",
          label: "收货人手机",
          placeholder: "请输入收货人手机号",
          props: {
            clearable: true,
          },
        },
        {
          component: "el-input",
          key: "skuName",
          label: "菜品名称",
          placeholder: "请输入菜品名称",
          props: {
            clearable: true,
          },
        },
        {
          component: "BaseSelect",
          key: "category",
          label: "餐别",
          props: {
            clearable: true,
            options: [
              {
                label: "早餐",
                value: "01",
              },
              {
                label: "午餐",
                value: "02",
              },
              {
                label: "晚餐",
                value: "03",
              },
            ],
          },
        },
        {
          component: "BaseSelect",
          key: "shipWithCold",
          label: "配送方式",
          props: {
            clearable: true,
            options: [
              {
                label: "冷链",
                value: "01",
              },
              {
                label: "热食",
                value: "00",
              },
            ],
          },
        },
        {
          component: "el-time-picker",
          key: "shipTimes",
          label: "配送时间",
          props: {
            format: "HH:mm",
            startPlaceholder: "开始时间",
            endPlaceholder: "结束时间",
            rangeSeparator: "至",
            isRange: true,
            clearable: true,
            disabledSeconds: () => ({ includes: () => true }),
          },
        },
        {
          component: "BaseSelect",
          key: "mergeFlag",
          label: "是否拼单",
          props: {
            clearable: true,
            options: [
              {
                label: "拼单",
                value: "10",
              },
              {
                label: "普通单",
                value: "00",
              },
            ],
          },
        },
        {
          component: "BaseSelect",
          key: "subStt",
          label: "出票状态",
          props: {
            clearable: true,
            options: [
              {
                label: "未出票",
                value: "00",
              },
              {
                label: "已出票",
                value: "10",
              },
              {
                label: "打包可取餐",
                value: "20",
              },
            ],
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
    this.getHeatPointOptions();
    this.getList();
  },
  methods: {
    finishOrder(row) {
      this.$http("ServeMealsOperation/orderStt", {
        orderId: row.tdotOrderId,
      }).thenwrap((err) => {
        if (!err) {
          this.$message.success("订单已完成");
          this.getList();
        } else {
          this.$message.error(err.errMsg);
        }
      });
    },
    tableRowClassName({ row }) {
      if (row.mergeStt === "00") {
        return "warning-row";
      }
      return "";
    },
    checkSelectable(row, index) {
      return row.isPrint == "0";
    },
    async comfirmTicket(shipOid) {
      const res = await this.$http("orderprint.PrintNotice/comfirmTicket", {
        shipOid: shipOid,
      });
    },
    async getHeatPointOptions() {
      const heatPointItem = this.queryComps.find(
        (item) => item.label === "供餐点"
      );
      const res = await this.$http("ServeMealsOperation/queryAllHeatInfo");
      heatPointItem.props.options = [
        { label: "全部", value: "-1" },
        ...res.obj.heatList,
      ];
    },
    async distriStatus(row) {
      const res = await this.$http("ServeMealsOperation/shipRecord", {
        tsoId: row.tdotTradeNo,
      });
      this.content = res.obj.sttRecords;
    },
    async sortChange(e) {
      this.queryParams.codeSortType = e.order == "descending" ? "0" : "1";
      this.getList();
    },
    async getList() {
      this.$store.state.vloading = true;
      const res = await this.$http("ServeMealsOperation/getDispatchingList", {
        ...this.page,
        ...this.genQueryParams(),
      });
      this.tableData = res.obj.dispatchinglist.record;
      this.tableDataTotal = res.obj.dispatchinglist.totalRecordCount;
      this.$nt(() => {
        this.$refs.table.doLayout();
      });
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const res = await this.$http("ServeMealsOperation/getDispatchingList", {
        pageNo: 1,
        pageSize: this.tableDataTotal,
        ...this.genQueryParams(),
      });
      const columns = this.$deepClone(this.tableCol);
      columns.shift();
      columns.find((col) => col.prop === "skuname").formatter = undefined;
      for (const item of res.obj.dispatchinglist.record) {
        item.tdotOrderStt = orderStatusMap[item.tdotOrderStt];
        // item.shipWithCold = item.shipWithCold == '00' ? '热食' : '冷食';
      }
      exportExcel({
        columns,
        filename,
        data: res.obj.dispatchinglist.record,
      });
    },
    goDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          id: row.tdotOrderId,
          type: "distribution",
        },
      });
    },
    goPrint(row) {
      this.print([row.tdotOrderId]);
    },
    async print(shipOid) {
      if (this.printing) return;
      this.printing = true;
      try {
        const res = await this.$http("orderprint.OrderPrint/getOrderPrint", {
          shipOid,
        });
        if (!res.errMsg) {
          for (const data of res.obj) {
            if (data.mergeFlag === "10") printSpellOrder(data);
            if (data.mergeFlag === "00") printOrder(data);
            this.comfirmTicket(data.shipOid);
          }
          this.getList();
        } else {
          this.$msg(res.errMsg, "error");
        }
      } catch (e) {
        console.log(e);
      }
      this.printing = false;
    },
    async timingPrint() {
      this.$confirm("确定一键打印？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      }).then(async () => {
        const res = await this.$http("orderprint.OrderPrint/timingPrint", {
          type: "00",
        });
        if (!res.errMsg) {
          for (const data of res.obj) {
            // printOrder(data);
            if (data.mergeFlag === "10") printSpellOrder(data);
            if (data.mergeFlag === "00") printOrder(data);
            this.comfirmTicket(data.shipOid);
          }
          this.getList();
        } else {
          this.$msg(res.errMsg, "error");
        }
      });
    },
    async batchPrintClick() {
      const { tableSelection } = this;
      if (tableSelection.length <= 0) {
        this.$message({ message: "请至少选择一个打印项", type: "warning" });
        return;
      }
      if (tableSelection.findIndex((row) => row.mergeStt === "00") !== -1) {
        this.$confirm(
          "批量打印订单中含有未完成拼单，未完成拼单无法打印，是否打印其余订单？",
          "提示",
          {
            confirmButtonText: "打印其余订单",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          const list = tableSelection.filter((row) => row.mergeStt !== "00");
          if (list.length) {
            this.print(list.map((i) => i.tdotOrderId));
          }
        });
        return;
      }
      this.$confirm("是否批量打印订单？", "提示", {
        confirmButtonText: "打印订单",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.print(tableSelection.map((i) => i.tdotOrderId));
      });
    },

    // async print(orderIds) {
    //   if (this.printing) return;
    //   this.printing = true;
    //   const res = await this.$http('ServeMealsOperation/orderData', { orderid: orderIds });
    //   if (!res.errMsg) {
    //     for (const dish of res.obj.res) {
    //       CreateOneFormPage(dish);
    //     }
    //   } else {
    //     this.$msg(res.errMsg, 'error');
    //   }
    //   this.printing = false;
    // },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.staDate = startDate.format("YYYY-MM-DD");
        params.endDate = endDate.format("YYYY-MM-DD");
      }
      if (params.shipdate && params.shipdate.length > 0) {
        const [startShipDate, endShipDate] = transformDaterange(
          params.shipdate
        );
        params.startShipDate = startShipDate.format("YYYY-MM-DD");
        params.endShipDate = endShipDate.format("YYYY-MM-DD");
      }
      if (params.shipTimes && params.shipTimes.length > 0) {
        params.shipStaDate = this.$day(params.shipTimes[0]).format("HH:mm");
        params.shipEndDate = this.$day(params.shipTimes[1]).format("HH:mm");
      }
      delete params.shipTimes;
      delete params.date;
      delete params.shipdate;
      return params;
    },
  },
});
</script>

<style lang="less" scoped>
:deep(.query-actions) {
  width: 50% !important;
}
:deep(.el-table .warning-row td) {
  background: oldlace !important;
}

:deep(.el-table .warning-row:hover td) {
  background: oldlace;
}

.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.action-label {
  display: block;
}
</style>
