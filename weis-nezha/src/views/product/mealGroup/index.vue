<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :span="5"
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
      :visible="false"
    >
      <el-table-column
        v-for="col in columns"
        :key="col.label"
        v-bind="col"
        align="center"
      >
      </el-table-column>
      <el-table-column
        label="成员"
        align="center"
        width="300"
      >
        <template #default="{ row }">
          <label style="white-space: pre-wrap;">{{row.membersNames}}</label>
        </template>
      </el-table-column>
      <el-table-column
        v-for="col in columns2"
        :key="col.label"
        v-bind="col"
        align="center"
      >
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
      >
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="editClick(row)"
          >下载</el-button>
        </template>
      </el-table-column>
    </BasePageTable>
  </div>

</template>

<script   lang="ts">
import { defineComponent } from "vue";
import exportExcel from "@/utils/export-excel";
export default defineComponent({
  name: "product_MealGroup",
  components: {},
  data() {
    return {
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        riceballsName: "",
        colonelPhone: "",
        membersPhone: "",
        startTime: "",
        endTime: "",
      },
      columns: [
        {
          type: "index",
          label: "序号",
        },
        {
          label: "报名时间",
          prop: "riceballsTime",
        },
        {
          label: "开始时间",
          prop: "riceballsBtime",
        },
        {
          label: "结束时间",
          prop: "riceballsEtime",
        },
        {
          label: "饭团名称",
          prop: "riceballsName",
        },
        {
          label: "积分",
          prop: "riceballsOpscore",
        },
        {
          label: "折扣",
          prop: "riceballsDiscount",
        },
        {
          label: "团长",
          prop: "colonelName",
        },
        {
          label: "团长手机号",
          prop: "colonelPhone",
        },
      ],
      // {
      //   label: "成员",
      //   prop: "membersNames",
      // },
      columns2: [
        {
          label: "团员人数量",
          prop: "membersNum",
        },
        {
          label: "总餐单",
          prop: "orderNum",
        },
        {
          label: "实付总金额",
          prop: "actualPrice",
        },
        {
          label: "状态",
          prop: "riceballsStt",
        },
      ],
      exportCoulms: [
        {
          type: "index",
          label: "序号",
        },
        {
          label: "报名时间",
          prop: "riceballsTime",
        },
        {
          label: "开始时间",
          prop: "riceballsBtime",
        },
        {
          label: "结束时间",
          prop: "riceballsEtime",
        },
        {
          label: "饭团名称",
          prop: "riceballsName",
        },
        {
          label: "积分",
          prop: "riceballsOpscore",
        },
        {
          label: "折扣",
          prop: "riceballsDiscount",
        },
        {
          label: "团长",
          prop: "colonelName",
        },
        {
          label: "团长手机号",
          prop: "colonelPhone",
        },
        {
          label: "成员",
          prop: "membersNames",
        },
        {
          label: "团员人数量",
          prop: "membersNum",
        },
        {
          label: "总餐单",
          prop: "orderNum",
        },
        {
          label: "实付总金额",
          prop: "actualPrice",
        },
        {
          label: "状态",
          prop: "riceballsStt",
        },
      ],
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
              if (value != null) {
                queryParams.startTime = this.$day(value[0]).format("YYYYMMDD");
                queryParams.endTime = this.$day(value[1]).format("YYYYMMDD");
              } else {
                queryParams.startTime = "";
                queryParams.endTime = "";
              }
            },
          },
        },
        {
          component: "el-input",
          key: "riceballsName",
          label: "饭团名称",
          props: {
            clearable: true,
          },
        },
        {
          component: "el-input",
          key: "colonelPhone",
          label: "团长手机",
          props: {
            clearable: true,
          },
        },
        {
          component: "el-input",
          key: "membersPhone",
          label: "成员手机",
          props: {
            clearable: true,
          },
        },
      ],
      downloadColumns: [
        {
          type: "index",
          label: "序号",
        },
        {
          label: "餐单编码",
          prop: "orderId",
        },
        {
          label: "配送单编码",
          prop: "shipOid",
        },
        {
          label: "大订单编码",
          prop: "soid",
        },
        {
          label: "支付方式",
          prop: "payWay",
        },
        {
          label: "供餐点",
          prop: "hpName",
        },
        {
          label: "昵称",
          prop: "uname",
        },
        {
          label: "用户手机",
          prop: "phone",
        },
        {
          label: "收货人手机",
          prop: "contactNumber",
        },
        {
          label: "性别",
          prop: "sex",
        },
        {
          label: "身高",
          prop: "height",
        },
        {
          label: "年龄",
          prop: "age",
        },
        {
          label: "体重",
          prop: "weight",
        },
        // {
        //   label: "总单量",
        //   prop: "finalStatementNum",
        // },
        {
          label: "餐别",
          prop: "orderCategory",
        },
        {
          label: "下单时间",
          prop: "ctime",
        },
        {
          label: "配送时间",
          prop: "shipTime",
        },
        {
          label: "取餐方式",
          prop: "takemealWay",
        },
        {
          label: "点餐方式",
          prop: "ordermealWay",
        },
        {
          label: "配送方式",
          prop: "deliveryWay",
        },
        {
          label: "渠道",
          prop: "channelType",
        },
        {
          label: "订单类型",
          prop: "ordermealInlet",
        },
        {
          label: "来源",
          prop: "market",
        },
        {
          label: "订单金额",
          prop: "orderPrice",
        },

        {
          label: "优惠券抵扣",
          prop: "couponAmount",
        },
        {
          label: "实付金额",
          prop: "actualPrice",
        },
        {
          label: "本金支付",
          prop: "paidPrincipal",
        },

        {
          label: "赠送金支付",
          prop: "paidGiftPrice",
        },
        {
          label: "配送金额",
          prop: "freightPrice",
        },
        {
          label: "客户经理",
          prop: "counselorName",
        },
        {
          label: "客户经理手机",
          prop: "counselorPhone",
        },
        {
          label: "订单状态",
          prop: "orderStt",
        },
        {
          label: "是否拼单",
          prop: "mergeFlag",
        },
        {
          label: "是否套餐",
          prop: "isCorp",
        },
        {
          label: "菜品",
          prop: "foodDetails",
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
      this.$request("data.Riceballs/queryRiceballs", {
        ...this.page,
        ...this.queryParams,
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$store.state.vloading = false;

            // this.tableDataTotal = res.totalRecordCount || 0;

            this.tableData = res.result;
          }
        })
      );
    },
    async editClick(row) {
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const res = await this.$http("data.Riceballs/queryRiceballsDetails", {
        riceballsId: row.riceballsId,
      });
      debugger;
      exportExcel({
        columns: this.downloadColumns,
        filename,
        data: res.obj.result,
      });
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
      const res = await this.$http("data.Riceballs/queryRiceballs", params);
      exportExcel({
        columns: this.exportCoulms,
        filename,
        data: res.obj.result,
      });
    },
  },
});
</script>

<style>
</style>