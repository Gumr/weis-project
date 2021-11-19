<template>
  <div class="page-container">
    <div style="margin-top: 20px;">
      <ButtonTabs
        v-model="activeTab"
        :tabs="tabs"
        @change="getList"
      />
    </div>
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
          v-for="col in activeTab == '00'? tableCol.tab1: activeTab == '01'?tableCol.tab2:tableCol.tab3"
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
import ButtonTabs from "@/components/ButtonTabs.vue";
export default {
  components: {
    QueryComponents,
    BasePageTable,
    ButtonTabs,
  },
  data() {
    return {
      activeTab: "00",
      tabs: [
        {
          label: "总体分析",
          value: "00",
        },
        {
          label: "人员分析",
          value: "01",
        },
        {
          label: "明细分析",
          value: "02",
        },
      ],
      height: window.innerHeight - 360,
      tableData: [],
      tableDataTotal: 0,
      tableCol: {
        tab1: [
          {
            label: "序号",
            type: "index",
            width: "80",
          },
          {
            label: "签到人数",
            prop: "signInNum",
          },
          {
            label: "签到次数",
            prop: "signInCount",
          },
          {
            label: "最长连续签到次数",
            prop: "longestCount",
          },
        ],
        tab2: [
          {
            label: "序号",
            type: "index",
            width: "80",
          },
          {
            label: "UID",
            prop: "uid",
          },
          {
            label: "手机号",
            prop: "phone",
          },
          {
            label: "昵称",
            prop: "name",
          },
          {
            label: "年龄(岁)",
            prop: "age",
          },
          {
            label: "性别",
            prop: "sex",
          },
          {
            label: "最近签到日期",
            prop: "recentlyDate",
          },
          {
            label: "累计签到次数",
            prop: "signInCount",
          },
          {
            label: "最长连续签到次数",
            prop: "longestCount",
          },
        ],
        tab3: [
          {
            label: "序号",
            type: "index",
            width: "80",
          },
          {
            label: "UID",
            prop: "uid",
          },
          {
            label: "手机号",
            prop: "phone",
          },
          {
            label: "昵称",
            prop: "name",
          },
          {
            label: "年龄(岁)",
            prop: "age",
          },
          {
            label: "性别",
            prop: "sex",
          },
          {
            label: "签到日期",
            prop: "singInDate",
          },
          {
            label: "维士红包额度",
            prop: "redPacketAmount",
          },
          {
            label: "维士红包状态",
            prop: "redPacketStt",
          },
          {
            label: "支付订单号",
            prop: "orderNo",
          },
        ],
      },

      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        date: [], //用户手机号
        phone: "",
        longestCount: "",
      },
      queryComps: {
        Comps1: [
          {
            component: "el-date-picker",
            key: "date",
            label: "时间",
            props: {
              type: "daterange",
              startPlaceholder: "开始日期",
              endPlaceholder: "结束日期",
              "value-format": "yyyy-MM-dd",
            },
          },
        ],
        Comps2: [
          {
            label: "手机号",
            component: "el-input",
            key: "phone",
            placeholder: "请输入手机号",
            props: {
              clearable: true,
            },
          },
          {
            label: "最长连续签到次数",
            component: "el-input",
            key: "longestCount",
            placeholder: "请输入最长连续签到次数",
            props: {
              clearable: true,
            },
          },
        ],
        Comps3: [
          {
            label: "手机号",
            component: "el-input",
            key: "phone",
            placeholder: "请输入手机号",
            props: {
              clearable: true,
            },
          },
        ],
      },
    };
  },
  computed: {
    computedQueryComps() {
      const list =
        this.activeTab == "00"
          ? [...this.queryComps.Comps1]
          : this.activeTab == "01"
          ? [...this.queryComps.Comps2]
          : [...this.queryComps.Comps3];
      return list;
    },
  },
  created() {
    // this.getList();
  },
  methods: {
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams(),
      };
      this.$store.state.vloading = true;
    
      let url = this.activeTab =='00' ? 'data.SignIn/querySignInTotality': this.activeTab =='01' ?'data.SignIn/querySignInData':'data.SignIn/querySingInRecord'
      const res = await this.$http(url, params);
      if (!res.errMsg) {
        this.tableData = this.activeTab =='00'?[res.obj]:this.activeTab =='01'?res.obj.record:res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount?res.obj.totalRecordCount:null;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      // this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.genQueryParams(),
        pageNo:1,
        pageSize: this.tableDataTotal,
      };
       let url = this.activeTab =='00' ? 'data.SignIn/querySignInTotality': this.activeTab =='01' ?'data.SignIn/querySignInData':'data.SignIn/querySingInRecord'
      const res = await this.$http(url, params);
      exportExcel({
        columns: this.activeTab == '00'? this.tableCol.tab1: this.activeTab == '01'?this.tableCol.tab2:this.tableCol.tab3,
        filename,
        data: this.activeTab =='00'?[res.obj]:this.activeTab =='01'?res.obj.record:res.obj.record
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
