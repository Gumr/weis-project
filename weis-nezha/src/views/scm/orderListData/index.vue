<template>
  <div class="page-container">
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
            @click="searchClick()"
          >搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
          align="center"
        ></el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import exportExcel from "@/utils/export-excel";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import { transformDaterange } from "@/utils/transform";

export default {
  components: {
    QueryComponents,
    BasePageTable,
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "加热点名称",
          prop: "thpName",
        },
        {
          label: "订单号",
          prop: "tsoTdotOid",
        },
        {
          label: "发第三方订单号",
          prop: "tsoSendOid",
        },
        {
          label: "配送日期",
          prop: "tsoTdotDate",
        },
        {
          label: "期望送达时间",
          prop: "tdotDatetime",
        },
        {
          label: "订单推送时间",
          prop: "tsoPushTime",
        },
        {
          label: "接单时间",
          prop: "tsoReciveTime",
        },
        {
          label: "接单耗时",
          prop: "pushReciveTime",
        },
        {
          label: "顺丰预计送达时间",
          prop: "tsoFinishExpect",
        },
        {
          label: "实际完成时间",
          prop: "tsoFinishTime",
        },
        {
          label: "配送耗时",
          prop: "reciveFinishTime",
        },
        {
          label: "完成耗时",
          prop: "pushFinishTime",
        },
        {
          label: "小哥超时",
          prop: "finishExpectTime",
        },
        {
          label: "预计配送距离(米)",
          prop: "tsoShipDistance",
        },
        {
          label: "实际配送距离(米)",
          prop: "tsoActualDistance",
        },
        {
          label: "配送金额（元）",
          prop: "tsoShipFee",
        },
        {
          label: "配送单状态",
          prop: "tsoDataStt",
        },
        {
          label: "收货手机",
          prop: "tsoUserPhone",
        },
        {
          label: "配送地址",
          prop: "tsoUserAddress",
        },
        {
          label: "配送方式",
          prop: "tsoShipType",
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        hpId:'',
        date: [
          dayjs(new Date()).format("YYYYMMDD"),
          dayjs(new Date()).format("YYYYMMDD"),
        ],
        userPhone: "", //用户手机号
        shipOid: "", //状态
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "配送日期",
          props: {
            type: "daterange",
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
            "value-format": "yyyy-MM-dd",
          },
        },
        {
          component: "BaseSelect",
          key: "hpId",
          label: "加热点名称",
          placeholder: "加热点名称",
          props: {
            clearable: true,
            filterable: true,
            options: [],
          },
        },
        {
          label: "订单号",
          component: "el-input",
          key: "shipOid",
          
          props: {
            clearable: true,
          },
        },
        {
          label: "手机号",
          component: "el-input",
          key: "userPhone",
         
          props: {
            clearable: true,
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
    // this.getList();
    this.getHeatPoint();
  },
  methods: {
    getHeatPoint() {
      this.$request("HeatingPoint/queryAllHeat").then(
        this.$rw((err, { heatVos }) => {
          if (!err) {
            this.queryComps[1].props.options = [
              {
                label: "全部供餐点",
                value: "-1",
              },
            ].concat(heatVos);
          }
        })
      );
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams(),
      };
      this.$store.state.vloading = true;
      const res = await this.$http(
        "data.ShipData/queryShipData",
        params
      );
      if (!res.errMsg) {
      
        this.tableData = res.obj.result.record;
        this.tableDataTotal = res.obj.result.totalRecordCount;
      }
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
        ...this.page,
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http(
        "data.ShipData/queryShipData",
        params
      );
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.result.record,
      });
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.format("YYYYMMDD");
        params.endDate = endDate.format("YYYYMMDD");
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
.medium-input {
  width: 250px;
  margin-right: 20px;
}

.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}
.action-label {
  margin-right: 10px;
}
</style>
