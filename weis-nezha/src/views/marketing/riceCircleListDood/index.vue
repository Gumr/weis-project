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
      >新建活动</el-button>
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
              @click="toDetail(row)"
            >编辑</span>
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
          label: "活动周期",
          prop: "tfsCid",
           formatter: row => row.beginDate +'--'+ row.endDate
        },
        {
          label: "菜品数量",
          prop: "count",
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
          placeholder: "菜品名称",
          props: {
            clearable: true,
          },
        },
      ],
    };
  },
  methods: {
    showAdd() {
      this.$router.push({
        path: `${this.$route.path}/add`,
      });
    },
    toDetail(row){
      this.$router.push({
        path: `${this.$route.path}/add`,
        query:{
          batchNo:row.batchNo
        }
      });

    },

    async getList() {
      const params = {
        ...this.page,
        ...this.queryParams,
      };
      this.$store.state.vloading = true;
      const res = await this.$http(
        "mealcircle.MealCircleSku/queryMealCircleSku",
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
      const res = await this.$http(
        "mealcircle.MealCircleSku/queryMealCircleSku",
        params
      );
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record,
      });
    },

    toDel(row) {
      this.$confirm(`确认删除该？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      }).then(async () => {
        const res = await this.$http("mealcircle.MealCircleSku/delActivity", {
          batchNo: row.batchNo,     
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
