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
            label: "用户ID",
            prop: "uid",
          },
          {
            label: "用户昵称",
            prop: "name",
          },
          {
            label: "用户手机号",
            prop: "phone",
          },
          {
            label: "注册时间",
            prop: "ctime",
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
      },
      queryComps: {

        Comps3: [
          {
            component: "el-date-picker",
            key: "date",
            label: "注册时间",
            props: {
              type: "daterange",
              startPlaceholder: "开始日期",
              endPlaceholder: "结束日期",
              "value-format": "yyyy-MM-dd",
            },
          },
          {
            label: "用户手机号",
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

      let url = "doupack.RegisterUser/queryRegisterUser";
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
    async handleExport() {
      // this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal,
      };
      let url = "doupack.RegisterUser/queryRegisterUser";
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
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.format("YYYY-MM-DD");
        params.endDate = endDate.format("YYYY-MM-DD");
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
