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
        @click="showAdd"
      >添加菜品</el-button>
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
              @click="toDel(row)"
            >移除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="showSel"
      title="选择菜品"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <BasePageTable
        ref="table"
        v-model:selection="tableSelection"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData2"
        :total="tableDataTotal2"
        border
        @current-page-change="getOrderList"
        @size-change="getOrderList"
        :columns="tableCol2"
        :visible="false"
      >
      </BasePageTable>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from "@/utils/export-excel";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import { transformDaterange } from "@/utils/transform";
import BaseSelect from "@/components/BaseSelect.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
export default {
  components: {
    QueryComponents,
    BasePageTable,
    BaseSelect,
    ConfirmDialog,
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
      tableSelection: [],
      showSel: false,
      height: window.innerHeight - 280,
      tableData: [],
      tableData2: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "菜品编码",
          prop: "tfsCid",
        },
        {
          label: "菜品名称",
          prop: "tfsSkuname",
        },
        {
          label: "菜品单价",
          prop: "tfsPrice",
        },
      ],
      tableCol2: [
        {
          type: "selection",
        },
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "菜品编码",
          prop: "tfsId",
        },
        {
          label: "菜品名称",
          prop: "tfsSkuname",
        },
        {
          label: "菜品单价",
          prop: "tfsPrice",
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        skuName: "",
      },
      queryComps: [
        {
          component: "el-input",
          key: "skuName",
          label: "菜品名称",
          placeholder: "请输入菜品名称",
          props: {
            clearable: true,
          },
        },
      ],
    };
  },
  methods: {
    async showAdd() {
      this.showSel = true;
      const res = await this.$http("sku.NoDiscount/queryInDiscountList");
      if (!res.errMsg) {
        this.tableData2 = res.obj;
      }
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.queryParams,
      };
      this.$store.state.vloading = true;
      const res = await this.$http(
        "sku.NoDiscount/queryNoDiscountList",
        params
      );
      if (!res.errMsg) {
        this.tableData = res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async onconfirm() {
      if (this.tableSelection.length == 0) {
        this.$msg("请选择菜品", "error");
        return;
      } else {
        const tfsIds = this.tableSelection.map((val) => Number(val.tfsId));
        const parmas = {
          tfsIds,
          opType: 10,
        };
        const res = await this.$http("sku.NoDiscount/updateNoDiscount", parmas);
        if (!res.errMsg) {
          this.$msg("操作成功", "success");
          this.showSel = false;
          this.getList();
        } else {
          this.$msg(res.errMsg, "error");
        }
      }
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
      const res = await this.$http("sku.NoDiscount/queryNoDiscountList", params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record,
      });
    },

    toDel(row) {
      this.$confirm(`确认移除该菜品？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      }).then(async () => {
        const res = await this.$http("sku.NoDiscount/updateNoDiscount", {
          tfsIds : [row.tfsId],
          opType: 20,
        });
        if (!res.errMsg) {
          this.$msg("移除成功", "success");
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
