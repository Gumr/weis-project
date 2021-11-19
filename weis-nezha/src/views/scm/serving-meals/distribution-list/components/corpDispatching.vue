<template>
  <div>
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="6"
        :label-width="80"
        semi
      >
        <template #batch>
          <el-button
            size="small"
            type="primary"
            @click="searchClick"
          >搜索</el-button>
          <el-button
            size="small"
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
          <el-button
            size="small"
            :type="tableSelection.length <= 0 ? 'info' : 'primary'"
            :disabled="tableSelection.length <= 0"
            @click="dispatchClick"
          >发起配送</el-button>
        </template>
        <template #action>
          <el-button
            size="small"
            type="warning"
            @click="batchPrintClick"
          >批量打印</el-button>
          <el-button
            size="small"
            type="warning"
            @click="batchOperate"
          >批量完成</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:selection="tableSelection"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        border
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        @sort-change="sortChange"
          @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="100"
          fixed="right"
        >
          <template
            #default="{ row }"
            class="action-cell"
          >
            <span
              class="brand-color cursor-pointer action-label"
              @click="toPrint(row)"
            >打印</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="toOperate(row)"
            >已完成</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="goDetail(row)"
            >详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="dispatchDialogVisible"
      title="发起配送"
      center
      async-confirm
      @on-confirm="handleDispatchConfirm"
    >
      <FormItem
        class="form-item"
        label="配送服务商"
        semi
      >
        <el-select v-model="currentDispatch.shipServe">
          <el-option
            value="40"
            label="美团快送"
          ></el-option>
          <el-option
            value="50"
            label="顺丰专送"
          ></el-option>
          <el-option
            value="20"
            label="顺丰同城"
          ></el-option>
        </el-select>
      </FormItem>
      <FormItem
        class="form-item"
        label="配送餐别"
        semi
      >{{ currentDispatchInfo.category }}</FormItem>
      <FormItem
        class="form-item"
        label="收货人"
        semi
      >
        <el-tag type="primary">{{ currentDispatchInfo.orders[0].name }}</el-tag>
        <span
          v-for="item in currentDispatchInfo.orders.slice(1)"
          :key="item.name"
          style="margin-left: 8px"
        >{{ item.name }}</span>
      </FormItem>
      <FormItem
        class="form-item"
        label="收货电话"
        semi
      >
        <el-tag type="primary">{{ currentDispatchInfo.orders[0].phone }}</el-tag>
        <span
          v-for="item in currentDispatchInfo.orders.slice(1)"
          :key="item.phone"
          style="margin-left: 8px"
        >{{ item.phone }}</span>
      </FormItem>
      <FormItem
        class="form-item"
        label="收货地址"
        semi
      >
        <div>
          <el-tag type="primary">{{ currentDispatchInfo.address[0] }}</el-tag>
        </div>
        <div
          v-for="item in currentDispatchInfo.address.slice(1)"
          :key="item"
        >{{ item }}</div>
      </FormItem>
      <FormItem
        class="form-item"
        label="预计送达时间"
        semi
      >
        <el-time-select
          v-model="currentDispatch.shipTime"
          step="00:01"
          start="00:00"
          end="24:00"
          :clearable="false"
        ></el-time-select>
      </FormItem>
      <FormItem
        class="form-item"
        label="发送订单"
        semi
      >{{ currentDispatchInfo.orders.length }}单</FormItem>
      <FormItem
        class="form-item"
        label="包装箱数"
        semi
      >
        <NumberInput
          v-model="currentDispatch.boxNum"
          style="width: 100px"
          mode="int"
        />
        <span>箱子</span>
      </FormItem>
      <FormItem
        class="form-item"
        label="配送工具"
        semi
      >
        <el-select v-model="currentDispatch.shipTool">
          <el-option
            value="00"
            label="二轮小电驴"
          ></el-option>
          <el-option
            value="01"
            label="四轮汽车"
          ></el-option>
        </el-select>
      </FormItem>
      <FormItem
        class="form-item"
        label="封签号(多个封签号请用逗号隔开)"
        semi
      >
        <el-input
          type="textarea"
          v-model="currentDispatch.packagingNum"
          placeholder="请输入8位正整数"
          style="width: 200px"
          mode="int"
        />
      </FormItem>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from "@/utils/export-excel";
import { getLodop } from "@/utils/LodopFuncs.js";
import { transformDaterange } from "@/utils/transform";
import {
  orderStatusOptions,
  orderStatusMap,
  categoryMap,
} from "@/utils/data-map";
import { getHeadPointList } from "@/utils/data-getter";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import FormItem from "@/components/FormItem.vue";
import { defineComponent } from "vue";
function initDispatch() {
  return {
    shipOid: [], //配送单号
    shipTime: "",
    primaryShipId: "",
    packagingNum: "",
    boxNum: "0", //箱子数量
    shipServe: "50", //配送服务商 40:美团快送,50:顺丰专送
    shipTool: "00", //配送工具 00:二轮小电驴 01 四轮车
  };
}

const component = defineComponent({
  components: {
    ConfirmDialog,
    FormItem,
  },
  data() {
    return {
      currentDispatch: initDispatch(),
      currentDispatchInfo: {
        orders: [],
        address: [],
        category: "",
      },
      // dispatchOrders: [],
      dispatchDialogVisible: false,
      height: window.innerHeight - 400,
      tableSelection: [],
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          width: "50",
          type: "selection",
        },
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "配送单编码",
          prop: "tdotShipOid",
        },
        {
          label: "供餐点",
          prop: "thpName",
        },
        {
          label: "企业名称",
          prop: "tdotGroupCorpName",
        },
        {
          label: "企业部门",
          prop: "tdotGroupCorpOrgName",
        },
        {
          label: "收货人",
          prop: "tdotConsignee",
        },
        {
          label: "联系方式",
          prop: "tdotContactNumber",
        },
        {
          label: "餐别",
          prop: "tdotCategory",
          formatter: (row) =>
            ({ "01": "早餐", "02": "午餐", "03": "晚餐" }[row.tdotCategory]),
        },
        {
          label: "菜品",
          prop: "tdotContent",
        },
        {
          label: "菜品数量",
          prop: "tdodnum",
        },
        {
          label: "订单金额",
          prop: "tdotOrderPrice",
        },
        {
          label: "取餐方式",
          prop: "tdotDistributionMode",
        },
        {
          label: "配送日期",
          prop: "tdotDate",
        },
        {
          label: "时间",
          prop: "tdotMealTakingTime",
        },
        {
          label: "配送地址",
          prop: "tdotReceivingAddress",
        },
        {
          label: "餐号",
          prop: "tdotTakeMealCode",
          sortable: true,
        },
        {
          label: "状态",
          prop: "tdotOrderStt",
          formatter: (row) => this.formatOrderStatus(row.tdotOrderStt),
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        // shipTimes: [],
        tgcaId: [],
        phone: "",
        codeSortType: "1",
        receiverPhone: "",
        takeCode: "",
        state: "",
        heatPointId: "",
        category: "",
        date: [new Date(), new Date()],
        corpId: "",
        skuName: "",
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "日期",
          props: {
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
          key: "corpId",
          label: "企业名称",
          props: {
            clearable: true,
            filterable: true,
            options: [],
          },
          listeners: {
            change: (val) => {
              this.queryParams.tgcaId = [];
              if (val) {
                this.queryCorpAdderss(val);
              } else {
                const item = this.queryComps.find(
                  (item) => item.label === "企业地址"
                );
                if (item) {
                  item.props.options = [];
                }
              }
            },
          },
        },
        {
          component: "BaseSelect",
          key: "tgcaId",
          label: "企业地址",
          props: {
            multiple: true,
            props: {
              value: "tgcaId",
              label: "tgcaName",
            },
            // clearable: true,
            // filterable: true,
            options: [],
          },
        },
        // {
        //   component: 'el-time-picker',
        //   key: 'shipTimes',
        //   label: '配送时间',
        //   props: {
        //     format: 'HH:mm',
        //     startPlaceholder: '开始时间',
        //     endPlaceholder: '结束时间',
        //     rangeSeparator: '至',
        //     isRange: true,
        //     clearable: true,
        //     disabledSeconds: () => ({ includes: () => true })
        //   }
        // },
        {
          slot: "batch",
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
    this.queryShopLeader().then(() => {
      if (this.queryComps[8].props.options.length <= 0) {
        this.getCompany();
      }
    });
    this.getList();
  },
  methods: {
    queryCorpAdderss(tgcId) {
      this.$request("ServeMealsOperation/queryCorpAdderss", {
        tgcId,
      }).thenwrap((err, data) => {
        if (!err) {
          const addressQuery = this.queryComps.find(
            (i) => i.label === "企业地址"
          );
          addressQuery.props.options = data;
        }
      });
    },
    async sortChange(e) {
      this.queryParams.codeSortType = e.order == "descending" ? "0" : "1";
      this.getList();
    },
    handleDispatchConfirm(done) {
      if (!this.currentDispatch.boxNum) {
        this.$message.error("请输入箱子数！");
        done();
        return;
      }
      // if (!this.currentDispatch.packagingNum) {
      //    this.$message.error('请输入封签号！')
      //   done()
      //   return

      // }
      let inputNum = this.currentDispatch.packagingNum.split(",");
      inputNum.forEach((item, index) => {
        if (!Number(item)) {
          this.$message.error("第" + (index + 1) + "个封签号应为8位正整数！");
          done();
          return;
        }
        if (item.length < 8 || item.length > 8) {
          this.$message.error("第" + (index + 1) + "个封签号应为8位正整数！");
          done();
          return;
        }
      });
      this.$request("groupmeal.CorpShip/submitShip", this.currentDispatch)
        .thenwrap((err) => {
          if (!err) {
            this.$message.success("发起配送成功");
            this.getList();
            this.dispatchDialogVisible = false;
          } else {
            this.$message.error(err.errMsg);
          }
        })
        .finally(done);
    },
    dispatchClick() {
      const todayStr = this.$day().format("YYYYMMDD");
      for (const item of this.tableSelection) {
        if (item.tdotDate !== todayStr) {
          this.$message.error(
            `配送单编号：${item.tdotShipOid}，不是当天的订单无法发起配送`
          );
          return;
        }
      }

      this.tableSelection.sort(
        (a, b) => Number(a.shipTime) - Number(b.shipTime)
      );
      this.currentDispatchInfo.orders = this.tableSelection.map((item) => ({
        phone: item.tdotContactNumber,
        name: item.tdotConsignee,
        address: item.tdotReceivingAddress,
      }));
      this.currentDispatchInfo.address = [
        ...new Set(
          this.tableSelection.map((item) => item.tdotReceivingAddress)
        ),
      ];
      this.currentDispatchInfo.category = [
        ...new Set(
          this.tableSelection.map((item) => categoryMap[item.tdotCategory])
        ),
      ].join(",");

      this.currentDispatch = initDispatch();
      this.currentDispatch.shipTime =
        this.tableSelection[0].tdotMealTakingTime.split("-")[0];

      const shipOid = this.tableSelection.map((item) => item.tdotShipOid);
      this.currentDispatch.shipOid = shipOid;
      this.currentDispatch.primaryShipId = shipOid[0];
      this.dispatchDialogVisible = true;
    },
    async queryShopLeader() {
      const res = (await this.$http("ServeMealsOperation/queryShopLeader", {}))
        .obj;
      if (res.corp && res.corp.length > 0) {
        this.queryComps[8].props.options = res.corp.map((item) => ({
          label: item.tgcName,
          value: item.tgcId,
        }));
      }
    },
    async getCompany() {
      const res = await this.$http("groupmeal.Corp/queryCorpAllList", {});
      this.queryComps[8].props.options = res.obj.map((item) => ({
        label: item.tgcName,
        value: item.tgcId,
      }));
    },
    getHeatPointOptions() {
      const heatPointItem = this.queryComps.find(
        (item) => item.label === "供餐点"
      );
      getHeadPointList().then((res) => {
        const list = res.heatList;
        heatPointItem.props.options = [{ label: "全部", value: "-1" }, ...list];
      });
    },
    formatOrderStatus(status) {
      return orderStatusMap[status];
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.format("YYYY-MM-DD");
        params.endDate = endDate.format("YYYY-MM-DD");
      }
      // if (params.shipTimes && params.shipTimes.length > 0) {
      //   params.shipStaDate = this.$day(params.shipTimes[0]).format('HH:mm')
      //   params.shipEndDate = this.$day(params.shipTimes[1]).format('HH:mm')
      // }
      // delete params.shipTimes
      delete params.date;
      return params;
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http(
        "ServeMealsOperation/getCorpDispatchingList",
        params
      );
      const col = this.$deepClone(this.tableCol);
      col.shift();
      const data = this.$deepClone(res.obj.dataPage.record);
      data.forEach((item) => {
        item.tdotOrderStt = this.formatOrderStatus(item.tdotOrderStt);
        // item.tdotCategory = { '01': '早餐', '02': '午餐', '03': '晚餐' }[item.tdotCategory];
      });
      exportExcel({
        columns: col,
        filename,
        data,
      });
    },
    async batchPrintClick() {
      if (!this.tableSelection.length) {
        this.$msg("请勾选打印标签", "error");
        return;
      }

      const shipOid = this.tableSelection.map((item) => item.tdotShipOid);
      const res = await this.$http("ServeMealsOperation/corpOrderData", {
        tdotShipOid: shipOid,
      });

      if (res.errMsg) {
        this.$msg(res.errMsg, "error");
        return;
      }
      this.$confirm("是否批量打印订单？", "提示", {
        confirmButtonText: "打印订单",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        for (const item of res.obj) {
          this.CreateOneFormPage(item);
        }
      });
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams(),
      };
      this.$store.state.vloading = true;
      const res = await this.$http(
        "ServeMealsOperation/getCorpDispatchingList",
        params
      );
      this.tableData = res.obj.dataPage.record;
      this.tableDataTotal = res.obj.dataPage.totalRecordCount;
      this.$nt(() => {
        this.$refs.table.doLayout();
      });
    },
    async batchOperate() {
      if (!this.tableSelection.length) {
        this.$msg("请勾选至少一项", "error");
        return;
      }
      const res = await this.$http("ServeMealsOperation/corpOrderSuccess", {
        tdotShipOid: this.tableSelection.map((item) => item.tdotShipOid),
      });
      const errMsg = res.errMsg || res.obj.msg;
      if (!errMsg) {
        this.$msg("操作成功", "success");
        this.getList();
      } else {
        this.$msg(errMsg, "error");
      }
    },
    async toOperate(row) {
      const res = await this.$http("ServeMealsOperation/corpOrderSuccess", {
        tdotShipOid: [row.tdotShipOid],
      });
      const errMsg = res.errMsg || res.obj.msg;
      if (!errMsg) {
        this.$msg("操作成功", "success");
        this.getList();
      } else {
        this.$msg(errMsg, "error");
      }
    },
    goDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/corpDetail`,
        query: {
          id: row.tdotShipOid,
        },
      });
    },
    async toPrint(row) {
      const res = await this.$http("ServeMealsOperation/corpOrderData", {
        tdotShipOid: [row.tdotShipOid],
      });
      if (res.errMsg) {
        this.$msg(res.errMsg, "error");
        return;
      }
      for (const item of res.obj) {
        this.CreateOneFormPage(item);
      }
    },
    // 打印小票
    CreateOneFormPage(dish) {
      let height = 0;
      dish.detailInfo.sort((a, b) => a.isTableware - b.isTableware);

      const LODOP = getLodop();
      LODOP.PRINT_INIT("");
      LODOP.SET_PRINT_PAGESIZE(0, 0, 0, "");
      LODOP.ADD_PRINT_TEXT(`${height}mm`, "14mm", "60mm", "34mm", "weis");
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 30);
      LODOP.SET_PRINT_STYLEA(0, "FontName", "微软雅黑");
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);

      height += 15;
      LODOP.ADD_PRINT_TEXT(
        `${height}mm`,
        "4mm",
        "60mm",
        "34mm",
        "合理膳食 健康基石"
      );
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

      height += 5;
      LODOP.ADD_PRINT_TEXT(
        `${height}mm`,
        "0mm",
        "60mm",
        "34mm",
        "配送单编码："
      );
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);

      height += 5;
      LODOP.ADD_PRINT_TEXT(
        `${height}mm`,
        "0mm",
        "60mm",
        "34mm",
        `${dish.tdotShipOid}`
      );
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

      height += 5;
      LODOP.ADD_PRINT_TEXT(
        `${height}mm`,
        "0mm",
        "60mm",
        "34mm",
        `取餐号:${dish.tdotTakeMealCode}`
      );
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 14);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);

      height += 7;
      LODOP.ADD_PRINT_TEXT(
        `${height}mm`,
        "0mm",
        "60mm",
        "34mm",
        `配送时间：${dish.tdotShipTime.substring(0, 16)}`
      );
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

      height += 5;
      LODOP.ADD_PRINT_TEXT(`${height}mm`, "0mm", "60mm", "34mm", "订单号：");
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

      height += 5;
      LODOP.ADD_PRINT_TEXT(
        `${height}mm`,
        "0mm",
        "60mm",
        "34mm",
        dish.tdotOrderId
      );
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

      height += 3;
      LODOP.ADD_PRINT_TEXT(
        `${height}mm`,
        "0mm",
        "60mm",
        "34mm",
        "***************************"
      );
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

      let tdodNum = 0;
      for (const list of dish.detailInfo) {
        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "54mm",
          "34mm",
          `${list.tdodSkuname}`
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
        LODOP.SET_PRINT_STYLEA(0, "Bold", 1);

        height += 4;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "14mm",
          "40mm",
          "34mm",
          `${list.tdodQuality ? list.tdodQuality : ""}${
            list.tdodUnit ? list.tdodUnit : ""
          } * ${list.tdodNum}`
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 11);
        LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
        // tdotCorpRole == 00 接口人，01 员工
        if (dish.showAmountFlag) {
          if (dish.tdotCorpRole == "01" && list.tdodTotalPrice) {
            LODOP.ADD_PRINT_TEXT(
              `${height}mm`,
              "34mm",
              "30mm",
              "34mm",
              `￥${list.tdodTotalPrice}`
            );
            LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
          }
        }
        if (list.tdodIsCombo == "1") {
          for (const item of list.comboInfo) {
            height += 4;
            LODOP.ADD_PRINT_TEXT(
              `${height}mm`,
              "5mm",
              "60mm",
              "34mm",
              `${item.tdodComboSkuname} * ${
                Number(item.tdodComboNum) * Number(list.tdodNum)
              }`
            );
            LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

            // if (dish.tdotCorpRole == '01') {
            //   LODOP.ADD_PRINT_TEXT(`${height}mm`, '38mm', '40mm', '34mm', `￥${item.tdodComboTotalPrice}`);
            //   LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10);
            // }
          }
        }
        if (list.comboInfo) {
          tdodNum += list.comboInfo.length * list.tdodNum;
        } else if (!list.isTableware) {
          tdodNum += Number(list.tdodNum);
        }
      }

      if (dish.showAmountFlag) {
        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          "---------------------------"
        );

        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          `合计：${tdodNum}`
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 11);
        LODOP.SET_PRINT_STYLEA(0, "Bold", 1);

        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          `制作日期：${this.$day(new Date()).format("YYYY/MM/DD HH:mm")}`
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          "***************************"
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          `订单金额：${dish.tdotOrderPrice || 0}元`
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          `折扣：${dish.discountAmount}元`
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          `优惠券：${dish.couponAmount || 0}元`
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          `配送费：${dish.tdotFoodDeliveryPrice || 0}元`
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          `实际支付：${dish.tdotActualPrice || 0}元`
        );
        LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 11);
      }

      height += 5;
      LODOP.ADD_PRINT_TEXT(
        `${height}mm`,
        "0mm",
        "60mm",
        "34mm",
        "***************************"
      );
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

      height += 5;
      LODOP.ADD_PRINT_TEXT(
        `${height}mm`,
        "0mm",
        "60mm",
        "34mm",
        `收货人：${dish.tdotConsignee}`
      );
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

      height += 5;
      LODOP.ADD_PRINT_TEXT(
        `${height}mm`,
        "0mm",
        "60mm",
        "34mm",
        `下单人手机：${dish.tdotContactNumber.slice(
          0,
          3
        )}****${dish.tdotContactNumber.slice(7)}`
      );
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);

      height += 5;
      LODOP.ADD_PRINT_TEXT(
        `${height}mm`,
        "0mm",
        "50mm",
        "34mm",
        `收货地址：${dish.tdotReceivingAddress}`
      );
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

      height += 20;
      LODOP.ADD_PRINT_TEXT(
        `${height}mm`,
        "0mm",
        "60mm",
        "34mm",
        "有任何问题请及时联系我们呦"
      );
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      height += 5;
      LODOP.ADD_PRINT_BARCODE(
        `${height}mm`,
        `10mm`,
        `40mm`,
        `40mm`,
        "QRCode",
        "https://work.weixin.qq.com/ct/wcde67d92a24cadbad2bee749643f405740b"
      );
      height += 30;
      LODOP.ADD_PRINT_TEXT(
        `${height}mm`,
        "10mm",
        "60mm",
        "34mm",
        `TEL：${dish.shopPhone}`
      );
      LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

      // height += 10;
      // LODOP.ADD_PRINT_TEXT(
      //   `${height}mm`,
      //   "0mm",
      //   "52mm",
      //   "34mm",
      //   "为保证新鲜，请答应我，再忙也要尽快食用哦"
      // );
      height += 20;
      LODOP.ADD_PRINT_TEXT(
        `${height}mm`,
        "0mm",
        "60mm",
        "34mm",
        "---------------------------"
      );

      if (dish.sortingInfo) {
        height += 30;
        LODOP.ADD_PRINT_TEXT(`${height}mm`, "12mm", "60mm", "34mm", "分拣单");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 16);
        LODOP.SET_PRINT_STYLEA(0, "FontName", "微软雅黑");
        LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
        height += 8;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          "配送单编码："
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);

        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          `${dish.tdotShipOid}`
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          `取餐号:${dish.tdotTakeMealCode}`
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 14);
        LODOP.SET_PRINT_STYLEA(0, "Bold", 1);

        height += 7;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          `配送时间：${dish.tdotShipTime.substring(0, 16)}`
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

        height += 5;
        LODOP.ADD_PRINT_TEXT(`${height}mm`, "0mm", "60mm", "34mm", "订单号：");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          dish.tdotOrderId
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

        height += 3;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          "***************************"
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
        // debugger
        // for (const order of dish.sortingInfo) {
        if (dish.sortingInfo.tdodSkuname) {
          height += 5;
          LODOP.ADD_PRINT_TEXT(
            `${height}mm`,
            "0mm",
            "45mm",
            "34mm",
            `${dish.sortingInfo.tdodSkuname}`
          );
          LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
          LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
        }
        // debugger
        dish.sortingInfo.sortingInfo.forEach((sku) => {
          height += 14;
          LODOP.ADD_PRINT_TEXT(
            `${height}mm`,
            "0mm",
            "45mm",
            "34mm",
            `${sku.skuname} `
          );
          LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
          LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
          height += 5;
          LODOP.ADD_PRINT_TEXT(`${height}mm`, "0mm", "45mm", "34mm", sku.speci);
          LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

          height += 5;
          LODOP.ADD_PRINT_TEXT(
            `${height}mm`,
            "0mm",
            "45mm",
            "34mm",
            sku.aisleCode
          );
          LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
          // if (type == '02') LODOP.ADD_PRINT_LINE(`${height + 2}mm`, 0, `${height + 2}mm`, '30mm', 0, 1)
        });

        // }
        height += 10;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          "***************************"
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          `收货人：${dish.tdotConsignee}`
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);

        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          `下单人手机：${dish.tdotContactNumber.slice(
            0,
            3
          )}****${dish.tdotContactNumber.slice(7)}`
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
        LODOP.SET_PRINT_STYLEA(0, "Bold", 1);

        height += 5;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "50mm",
          "34mm",
          `收货地址：${dish.tdotReceivingAddress}`
        );
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
        height += 20;
        LODOP.ADD_PRINT_TEXT(
          `${height}mm`,
          "0mm",
          "60mm",
          "34mm",
          "---------------------------"
        );
      }

      LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
      LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
      // LODOP.PREVIEW()
      LODOP.PRINT();
      // return LODOP;
    },
  },
});

export default component;
</script>

<style lang="less" scoped>
@import "../../../../../styles/base.less";

.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}

.form-item {
  margin: 12px 0;
}
.action-label {
  display: block;
  width: 100px;
  /* margin-right: 10px; */
}
</style>
