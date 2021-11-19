<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="4"
        :label-width="100"
        semi
      >
        <template #action>
          <el-button
            type="primary"
            @click="searchClick"
          >搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport"
          >导出</el-button>
          <el-button
            style="float:right"
            type="primary"
            @click="goEdit('add', '')"
          >新建自提点</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
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
        >
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
          <template v-slot="{ row }">
            <span
              size="small"
              style="margin-right:10px"
              class="brand-color cursor-pointer action-label"
              @click="goEdit('edit',row)"
            >编辑</span>
            <span
              size="small"
              @click="setStt(row)"
              style="margin-right:10px"
              class="brand-color cursor-pointer action-label"
            >{{row.thpsStt == '10'?'下线':'上线'}}</span>
            <span
              style="margin-right:10px"
              size="small"
              @click="del(row)"
              class="brand-color cursor-pointer action-label"
            >删除</span>
          </template>
        </el-table-column>

      </BasePageTable>
    </div>
  </div>
</template>

<script>
import BasePageTable from "@/components/BasePageTable.vue";
import exportExcel from "@/utils/export-excel";
export default {
  components: {
    BasePageTable,
    // QueryComponents
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      tableDataTotal: 0,
      queryParams: {
        name: "", // 自提点名称
        stt: "", // 状态 00下线 10 上线
      },
      tableCol: [
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "自提点名称",
          prop: "thpsName",
        },
        {
          label: "自提点ID",
          prop: "thpsId",
        },
        {
          label: "位置",
          formatter: (row) =>
            `${row.thpsAddrProvince}${row.thpsAddrCity}${row.thpsAddrArea}${row.thpsAddress}`,
        },
        {
          label: "关联门店",
          prop: "thpsPointName",
        },
        {
          label: "联系方式",
          prop: "thpsContactNumber",
        },
        {
          label: "营业状态",
          prop: "thpsSttDesc",
        },
        {
          label: "操作人",
          prop: "thpsOperator",
        },
        {
          label: "操作时间",
          prop: "thpsUtime",
        },
      ],
      queryComps: [
        {
          component: "el-input",
          key: "name",
          label: "自提点名称",
          props: {
            clearable: true,
          },
        },
        {
          component: "BaseSelect",
          key: "stt",
          label: "营业状态",
          props: {
            clearable: true,
            options: [
              {
                label: "上线",
                value: "10",
              },
              {
                label: "下线",
                value: "00",
              },
            ],
          },
        },
      ],
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    async getList() {
      //列表
      const res = await this.$http("HeatPointSubs/queryHeatPointSubsPage", {
        ...this.page,
        ...this.queryParams,
      });
      if (!res.errMsg) {
        this.tableData = res.obj.dataPage.record;
        this.tableDataTotal = res.obj.dataPage.totalRecordCount;
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    searchClick() {
      //搜索
      this.page.pageNo = 1;
      this.getList();
    },
    goEdit(type, row) {
      this.$router.push({
        path: `${this.$route.path}/edit`,
        query: {
          type,
          thpId: row.thpsId ,
        },
      });
    },
    async setStt(row) {
      const res = await this.$http("HeatPointSubs/updateHeatPointSubsStt", {
        thpsId:row.thpsId ,
        type :row.thpsStt == '10'?'00':'10'

      });
      if (!res.errMsg) {
        this.getList();
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    async del(row) {
      const res = await this.$http("HeatPointSubs/deleteHeatPointSubs", {thpsId:row.thpsId});
      if (!res.errMsg) {
        this.getList();
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    async handleExport() {
      // this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        pageNo: 1,
        pageSize: this.tableDataTotal,
      };
      let url = "HeatPointSubs/queryHeatPointSubsPage";
      const res = await this.$http(url, params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.dataPage.record,
      });
    },
  },
};
</script>

<style>
</style>