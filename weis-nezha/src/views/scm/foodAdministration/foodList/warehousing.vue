<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="6"
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
              @click="toPage(row,'operateDetail')"
            >详情</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="toDel(row)"
              v-if="row.sellStt == '50' || row.sellStt == '70' "
            >淘汰</span>

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
    this.initialDataList();
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
          label: "菜品热量",
          prop: "energy",
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
          label: "销售售价",
          prop: "sellPrice",
        },
        {
          label: "销售状态",
          prop: "sellSttStr",
        },

        {
          label: "菜品状态",
          prop: "librarySttStr",
        },
        {
          label: "适用人群",
          prop: "apply",
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
          label: "菜品热量",
          prop: "energy",
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
          label: "销售售价",
          prop: "sellPrice",
        },
        {
          label: "销售状态",
          prop: "sellSttStr",
        },

        {
          label: "菜品状态",
          prop: "librarySttStr",
        },
        {
          label: "适用人群",
          prop: "apply",
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
        libraryStt: "30",
        date: [],
        foodCategory: "",
        skuName: "",
        sellStt: "",
        apply: "",
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
          component: "BaseSelect",
          key: "sellStt",
          label: "菜品状态",
          placeholder: "请选择菜品状态",
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
        {
          component: "BaseSelect",
          key: "apply",
          label: "适用人群",
          placeholder: "请选择菜品状态",
          props: {
            clearable: true,
            options: [],
          },
        },
      ],
    };
  },
  methods: {
    initialDataList() {
      this.$request("sku.SkuLibrary/initialData", {}).thenwrap((err, data) => {
        if (!err) {
          this.queryComps[1].props.options = data.foodCategory;
          this.queryComps[2].props.options = data.sellStt;
          this.queryComps[4].props.options = data.apply;
        }
      });
    },
    showAdd() {
      this.showSel = true;
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
    toPage(row, type) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          recordId: row.recordId,
          type: "00",
          // row: JSON.stringify(row),
        },
      });
    },
    toDel(row) {
      this.$confirm(`确认淘汰？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      }).then(async () => {
        const res = await this.$http("sku.SkuLibrary/weedOutSku", {
          recordId: row.recordId,
        });
        if (!res.errMsg) {
          this.$msg("成功", "success");
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
