<template>
  <div class="page-container">

    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="4"
        :label-width="120"
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
          v-for="col in tableCol.tab3"
          :key="col.prop"
          v-bind="col"
          align="center"
        ></el-table-column>
         <el-table-column
          label="操作"
          align="center"
        >
          <template
            #default="{ row }"
            class="action-cell"
          >
            <span
              class="brand-color cursor-pointer action-label"
              @click="detailTagClick(row)"
            >详情</span>
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
import ButtonTabs from "@/components/ButtonTabs.vue";
export default {
  components: {
    QueryComponents,
    BasePageTable,
    ButtonTabs,
  },
  data() {
    return {
      height: window.innerHeight - 360,
      tableData: [],
      tableDataTotal: 0,
      tableCol: {
        tab3: [
          {
            label: "序号",
            type: "index",
            width: "80",
          },
          {
            label: "订单号",
            prop: "orderNo",
          },
          {
            label: "套餐包名称",
            prop: "douComboName",
          },
          {
            label: "售卖天数餐数",
             formatter: (row) => `${row.daysNum}天,每天${row.mealsNum}餐`,
          },
          {
            label: "套餐包原价",
            prop: "comboTotalPrice",
          },
          {
            label: "套餐包价格(含配送费)",
            prop: "sellPrice",
          },
          {
            label: "实付价格",
            prop: "actualPrice",
          },
          {
            label: "支付方式",
            prop: "payMode",
          },
          {
            label: "下单人手机",
            prop: "payPhone",
          },
          {
            label: "下单日期",
            prop: "payDate",
          },
          {
            label: "核销日期",
            prop: "consumeDate",
          },
          {
            label: "状态",
            prop: "stt",
          },
         
        ],
      },

      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        date: [], //用户手机号
        payPhone: "",
        longestCount: "",
        stt:'',
      },
      queryComps: {

        Comps3: [
          {
            component: "el-date-picker",
            key: "date",
            label: "下单时间",
            props: {
              type: "daterange",
              startPlaceholder: "开始日期",
              endPlaceholder: "结束日期",
              "value-format": "yyyy-MM-dd",
            },
          },
          {
            label: "下单手机号",
            component: "el-input",
            key: "payPhone",
            placeholder: "请输入手机号",
            props: {
              clearable: true,
            },
          },
         {
          component: "BaseSelect",
          key: "stt",
          label: "订单状态",
          props: {
            clearable: true,
            options: [{
              label:'待核销',
              value:'00'
            },
            {
              label:'核销中',
              value:'10'
            },
            {
              label:'已核销 ',
              value:'20'
            }
            ,{
              label:'已过期',
              value:'30'
            },{
              label:'已退款',
              value:'40'
            }],
          },
        },
        ],
      },
    };
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps.Comps3];
      return list;
    },
  },
  created() {
    this.getList();
  },
  methods: {
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams(),
      };
      this.$store.state.vloading = true;

      let url = "doupack.OrderManage/queryPayDouOrder";
      const res = await this.$http(url, params);
      if (!res.errMsg) {
        this.tableData = res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount
          ? res.obj.totalRecordCount
          : null;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    detailTagClick(row) {
       this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          recordId:row.recordId
        }
      })

    },
    async handleExport() {
      // this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal,
      };
      let url = "doupack.OrderManage/queryPayDouOrder";
      const res = await this.$http(url, params);
      exportExcel({
        columns: this.tableCol.tab3,
        filename,
        data: res.obj.record,
      });
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [sdate, edate] = transformDaterange(params.date);
        params.sdate = sdate.format("YYYYMMDD");
        params.edate = edate.format("YYYYMMDD");
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
