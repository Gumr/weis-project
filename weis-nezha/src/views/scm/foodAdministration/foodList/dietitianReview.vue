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
              @click="goDishPage(row,'dietitianEdit')"
            >编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="goDishPage(row,'dietitianDetail')"
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
          label: "菜品名称",
          prop: "skuName",
        },
        {
          label: "菜品ID",
          prop: "skuCid",
        },
        {
          label: "ERP菜品分类",
          prop: "foodCategory",
        },
        {
          label: "主食材",
          prop: "mainIngredient",
        },
        {
          label: "规格",
          prop: "quality",
        },
        {
          label: "性质",
          prop: "nature",
        },
        {
          label: "菜系",
          prop: "skuStyle",
        },
        {
          label: "烹饪方式",
          prop: "cookingMethod",
        },
        {
          label: "味型",
          prop: "smell",
        },
        {
          label: "厨房售价",
          prop: "kitchenPrice",
        },
        {
          label: "菜品能量",
          prop: "energy",
        },
        {
          label: "菜品状态",
          prop: "librarySttStr",
        },
        {
          label: "操作人",
          prop: "operator",
        },
        {
          label: "操作时间",
          prop: "utime",
        },
      ],
       tableCol2: [
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "菜品名称",
          prop: "skuName",
        },
        {
          label: "菜品ID",
          prop: "skuCid",
        },
        {
          label: "ERP菜品分类",
          prop: "foodCategory",
        },
        {
          label: "主食材",
          prop: "mainIngredient",
        },
        {
          label: "规格",
          prop: "quality",
        },
        {
          label: "性质",
          prop: "nature",
        },
        {
          label: "菜系",
          prop: "skuStyle",
        },
        {
          label: "烹饪方式",
          prop: "cookingMethod",
        },
        {
          label: "味型",
          prop: "smell",
        },
        {
          label: "混杂性",
          prop: "mix",
        },
        {
          label: "品相",
          prop: "appearance",
        },
        {
          label: "季节性",
          prop: "season",
        },

        {
          label: "厨房售价",
          prop: "kitchenPrice",
        },
        {
          label: "菜品能量",
          prop: "energy",
        },
        {
          label: "菜品状态",
          prop: "librarySttStr",
        },
        {
          label: "操作人",
          prop: "operator",
        },
        {
          label: "操作时间",
          prop: "utime",
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        libraryStt: "10",
        date: [],
        foodCategory: "",
        skuName: "",
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "日期",
          props: {
            clearable: true,
            type: "daterange",
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
          },
        },
        {
          component: "BaseSelect",
          key: "foodCategory",
          label: "种类",
          placeholder: "请选择种类",
          props: {
            clearable: true,
            options: [],
          },
        },
        {
          component: "el-input",
          key: "skuName",
          label: "菜品品名",
          placeholder: "请输入菜品名称",
          props: {
            clearable: true,
          },
        },
      ],
    };
  },
  watch: {
    $route() {
      if (this.$mounted) {
        this.getList();
      }
    },
  },
  mounted() {
    this.$mounted = true;
    this.initialDataList();
    this.getList();
  },
  created() {},
  methods: {
    initialDataList() {
      this.$request("sku.SkuLibrary/initialData", {}).thenwrap((err, data) => {
        if (!err) {
          this.queryComps[1].props.options = data.foodCategory;
        }
      });
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams(),
      };
      this.$store.state.vloading = true;
      const res = await this.$http("sku.SkuLibrary/querySkuLibrarys", params);
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
        this.getList();
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

      const res = await this.$http("sku.SkuLibrary/querySkuLibrarys", params);
      exportExcel({
        columns: this.tableCol2,
        filename,
        data: res.obj.record,
      });
    },
    goDishPage(row, type) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          recordId: row.recordId,
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
        const [startDate , endDate] = transformDaterange(params.date);
        params.startDate  = startDate .format("YYYY-MM-DD");
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
