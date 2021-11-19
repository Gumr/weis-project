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
          <span style="margin-left:10px;">(预订单：00：00前支付的订单)</span>
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
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
        @sort-change="sortChange"
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        >
          <template
            #default="{ row }"
            class="action-cell"
            v-if="col.prop == 'skuname'"
          >
            <span>{{row.skuname.length>10?row.skuname.substring(0,20)+'...':row.skuname}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              class="brand-color cursor-pointer"
              @click="goPrint(row)"
            > &nbsp;&nbsp;打印&nbsp;&nbsp;&nbsp;&nbsp;</el-button>
            <el-button
              style="margin-top:10px;margin-left:0!important"
              class="brand-color cursor-pointer "
              @click="goDetail(row)"
            > &nbsp;&nbsp;详情&nbsp;&nbsp;&nbsp;</el-button>
            <el-button
              style="margin-top:10px;margin-left:0!important"
              class="brand-color"
              @click="orderStt(row)"
              v-if="(row.tdotOrderStt == '05' || row.tdotOrderStt == '01')"
            >订单完成</el-button>
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
import { orderStatusOptions, orderStatusMap } from "@/utils/data-map";
import CreateOneFormPage from "@/utils/pushPrint.js";
import { defineComponent } from "vue";
import { printOrder } from "@/utils/pushPrint.js";
export default defineComponent({
  name: "order_ship-list",
  components: {
    QueryComponents,
    BasePageTable,
  },
  data() {
    return {
      height: window.innerHeight - 400,
      printing: false,
      tableData: [],
      tableDataTotal: 0,
      tableSelection: [],
      tableCol: [
        {
          label: "/",
          type: "selection",
          // selectable: this.checkSelectable
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
          label: "用户手机",
          prop: "tdotContactNumber",
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
        },
        {
          label: "菜品总数",
          prop: "tdodnum",
        },
        {
          label: "订单金额",
          prop: "tdotOrderPrice",
        },
        // {
        //   label: '配送费',
        //   prop: 'tdotFoodDeliveryPrice'
        // },
        {
          label: "自取地址",
          prop: "thpShopAddress",
        },
        {
          label: "自取日期",
          prop: "tdotCtime",
        },
        {
          label: "自取时间",
          prop: "tdotMealTakingTime",
        },
        {
          label: "餐号",
          prop: "tdotTakeMealCode",
          sortable: true,
        },
        {
          label: "订单状态",
          prop: "tdotOrderSttStr",
          // formatter: (row) => orderStatusMap[row.tdotOrderStt],
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
        distributionMode: "1",
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
    checkSelectable(row) {
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
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.dispatchinglist.record,
      });
    },
    goDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          id: row.tdotOrderId,
          type: "take",
        },
      });
    },
    //订单完成
    async orderStt(row) {
      const res = await this.$http("ServeMealsOperation/orderStt", {
        orderId: row.tdotOrderId,
      });
      if (!res.errMsg) {
        this.getList();
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    async goPrint(row) {
      // const res = await this.$http("ServeMealsOperation/orderStt", {
      //   orderId: row.tdotOrderId,
      // });
      // if (!res.errMsg) {
      const printData = await this.$http("ServeMealsOperation/orderData", {
        orderid: [row.tdotOrderId],
      });
      if (!printData.errMsg) {
        const dish = printData.obj.res[0];
        CreateOneFormPage(dish);
        this.comfirmTicket(dish.deliveredNum);
        this.getList();
      }
      // }
      else {
        this.$msg(printData.errMsg, "error");
      }
    },
    async batchPrintClick() {
      if (this.tableSelection.length <= 0) {
        this.$message({ message: "请至少选择一个打印项", type: "warning" });
        return;
      }
      const sortList = this.tableSelection.map((item) => item.tdotOrderId);
      const printData = await this.$http("ServeMealsOperation/orderData", {
        orderid: sortList,
      });
      this.$confirm("是否批量打印订单？", "提示", {
        confirmButtonText: "打印订单",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        for (const dish of printData.obj.res) {
          CreateOneFormPage(dish);
          this.comfirmTicket(dish.deliveredNum);
        }
        this.getList();
      });
    },
    async timingPrint() {
      this.$confirm("确定一键打印？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      }).then(async () => {
        const res = await this.$http("orderprint.OrderPrint/timingPrint", {
          type: "01",
        });
        if (!res.errMsg) {
          for (const data of res.obj) {
            printOrder(data);
            this.comfirmTicket(data.shipOid);
          }
        } else {
          this.$msg(res.errMsg, "error");
        }
      });
    },
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
        params.staShipDate = startShipDate.format("YYYY-MM-DD");
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
  width: 60% !important;
}
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.action-label {
  display: block;
}
</style>
