<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="4"
        :label-width="80"
        semi
      >
        <template v-slot:action>
          <el-button
            type="primary"
            @click="searchClick()"
          >搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
      <el-button
        type="primary"
        @click="toPage(1, 'edit')"
      >新建红包</el-button>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        :total="tableDataTotal"
        @current-page-change="getList"
        @size-change="getList"
        border
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
          align="center"
        ></el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
          <template
            class="action-cell"
            v-slot="{ row }"
          >
            <span
              class="brand-color cursor-pointer action-label"
              @click="toPage(row, 'edit')"
            >编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="stop(row)"
              style="margin-right: 8px;"
            >{{row.stt == '00' ? '下线' :'上线'}}</span>
            <!-- <span
              class="brand-color cursor-pointer action-label"
              @click="toPage(row, 'detail')"
            >详情</span> -->
            <span
              class="brand-color cursor-pointer action-label"
              @click="toDel(row)"
            >删除</span>
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
import BaseSelect from "@/components/BaseSelect.vue";

export default {
  components: {
    QueryComponents,
    BasePageTable,
    BaseSelect,
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    },
  },
  created() {
    this.getList();
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
          label: "名称",
          prop: "tname",
        },
        {
          label: "面额",
          prop: "amount",
        },
        {
          label: "使用金额门槛",
          prop: "restrictAmount",
        },
        {
          label: "红包有效期",
          prop: "indate",
        },
        {
          label: "红包简介",
          prop: "intro",
        },
        {
          label: "状态",
          prop: "stt",
          formatter: (row) => (row.stt == "00" ? "上线" : "下线"),
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        tname: "",
        stt: "",
      },
      queryComps: [
        {
          component: "BaseSelect",
          key: "stt",
          label: "当前状态",
          props: {
            options: [
              {
                value: "",
                label: "全部状态",
              },
              {
                value: "00",
                label: "上线",
              },
              {
                value: "01",
                label: "下线",
              },
            ],
          },
        },
        {
          component: "el-input",
          key: "tname",
          label: "红包名称",
          placeholder: "请输入红包名称",
          props: {
            clearable: true,
          },
        },
      ],
    };
  },
  methods: {
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams(),
      };
      this.$store.state.vloading = true;
      const res = await this.$http("redpacket.Template/queryTemplates", params);
      if (!res.errMsg) {
        this.tableData = res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async stop(row) {
      const url =
        row.stt == "00"
          ? "redpacket.Template/closeTemplate"
          : "redpacket.Template/openTemplate";
      const params = {
        tid: row.tid,
      };
      const res = await this.$http(url, params);
      if (!res.errMsg) {
        this.$msg("操作成功", "success");
        this.getList()
      } else {
        this.$msg(res.errMsg, "error");
      }
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
      const res = await this.$http("redpacket.Template/queryTemplates", params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record,
      });
    },
    toPage(row, type) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          tid: row.tid,
          row: JSON.stringify(row)
        },
      });
    },
    toDel(row) {
      this.$confirm(`确认删除？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      }).then(async () => {
        const res = await this.$http("redpacket.Template/delTemplate", {
          tid: row.tid,
        });
        if (!res.errMsg) {
          this.$msg("删除成功", "success");
          this.getList();
        } else {
          this.$msg(res.errMsg, "error");
        }
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
