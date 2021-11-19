<template>
  <div class="page-container">
    <h2>基本信息</h2>
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>活动周期：
      </span>
      <el-date-picker
        class="medium-input"
        type="daterange"
        v-model="data.date"
      ></el-date-picker>
    </div>
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>菜品：
      </span>
      <el-button
        type="primary"
        @click="showAdd"
      >选择菜品</el-button>
      <BasePageTable
      
        :data="data.skuData"
        :visible="false"
        style="margin-top:40px"
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="120px"
        >
          <template
            #default="{ $index }"
            class="action-cell"
          >
            <span
              class="brand-color cursor-pointer action-label"
              @click="remove($index)"
            >移除</span>
          </template>
        </el-table-column>

      </BasePageTable>
    </div>
    <footer class="btn-footer">
      <el-button
        type="primary"
        :loading="loading"
        @click="submit"
      >确定</el-button>
      <el-button
        type="danger"
        @click="cancel"
      >取消</el-button>
    </footer>
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
    this.getFood();
    this.batchNo = this.$route.query.batchNo;
    if (this.batchNo) {
      this.queryMealCircleSkuInfo();
    }
  },
  data() {
    return {
      batchNo: "",
      data: {
        date: [],
        skuData: [],
      },
      isShow: false,
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
          prop: "cid",
        },
        {
          label: "菜品名称",
          prop: "skuName",
        },
        {
          label: "菜品单价",
          prop: "price",
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
          prop: "cid",
        },
        {
          label: "菜品名称",
          prop: "skuName",
        },
        {
          label: "菜品单价",
          prop: "price",
        },
      ],

      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        skuName: "",
      },
    };
  },
  methods: {
    cancel() {
      this.$closeRoute();
    },
    async getFood() {
      const res = await this.$http(
        "mealcircle.MealCircleSku/querySkuByNotPutaway",
        {}
      );
      if (!res.errMsg) {
        this.tableData2 = res.obj;
      }
    },
    async queryMealCircleSkuInfo() {
      const res = await this.$http(
        "mealcircle.MealCircleSku/queryMealCircleSkuInfo",
        { batchNo: this.batchNo }
      );
      if (!res.errMsg) {
        this.data.date = [res.obj.beginDate, res.obj.endDate];
        this.data.skuData = res.obj.skuData;
      }
    },
    showAdd() {
      this.showSel = true;
      this.$nextTick(() => {
        const { skuData } = this.data;
        const skuList = this.tableData2.filter(
          (item) =>
            Array.isArray(skuData) &&
            skuData.findIndex((it) => it.cid === item.cid) !== -1
        );
        this.$refs.table.setSelection(skuList);
      });
    },
    onconfirm() {
      this.showSel = false;
      this.data.skuData = this.tableSelection;
    },
    remove(index) {
      this.data.skuData.splice(index, 1);
    },
    async submit() {
      if (this.data.date.length == 0) {
        this.$message({ type: "error", message: "请选择活动周期！" });
        return;
      }
      if (this.data.skuData.length == 0) {
        this.$message({ type: "error", message: "请选择菜品！" });
        return;
      }
       const params = { ...this.data };
      const [beginDate, endDate] = transformDaterange(params.date);

      params.beginDate = beginDate.format("YYYY-MM-DD");
      params.endDate = endDate.format("YYYY-MM-DD");

      params.skuData = params.skuData.map((val) => val.cid);
      delete params.date;
      params.batchNo= this.batchNo?this.batchNo:''

      const res = await this.$http(
        "mealcircle.MealCircleSku/opMealCircleSku",
        params
      );
      if (!res.errMsg) {
        this.$message({ type: "success", message: "添加成功" });
        this.$closeRoute();
      } else {
        this.$message({ type: "error", message: res.errMsg });
      }
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
