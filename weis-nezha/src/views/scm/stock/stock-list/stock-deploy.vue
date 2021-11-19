<template>
  <div class="page-container">
    <ReturnButton back />
    <div class="tree-select-wrap display-flex">
      <div class="tree-select-section">
        <div style="margin: 20px 0;">
          <span style="margin-right: 10px;">转出供餐点：</span>
          <BaseSelect
            class="medium-input"
            filterable
            clearable
            :options="heatPointOptions"
            v-model="outHeatPointId"
            @change="queryShopStockList"
          ></BaseSelect>
        </div>
        <div class="tree-box">
          <BasePageTable
            ref="leftTable"
            :height="tableHeight"
            :data="leftTable"
            :visible="false"
            border
          >
            <el-table-column
              v-for="col in tableCol"
              :key="col.prop"
              v-bind="col"
            ></el-table-column>
            <el-table-column
              label="转出库存"
              align="center"
            >
              <template
                class="action-cell"
                v-slot="scope"
              >
                <el-input
                  v-model="scope.row.outStock"
                  @blur="checkText(scope)"
                ></el-input>
              </template>
            </el-table-column>
          </BasePageTable>
        </div>
      </div>
      <div class="tree-select-control">
        <div class="display-flex">
          <el-button
            class="btn"
            type="primary"
            @click="transfer"
          >转移</el-button>
        </div>
      </div>
      <div class="tree-select-section">
        <div style="margin: 20px 0;">
          <span style="margin-right: 10px;">转入供餐点：</span>
          <BaseSelect
            class="medium-input"
            filterable
            clearable
            v-model="innerHeatPointId"
            :options="heatPointOptions"
            @change="queryShopStockList2"
          ></BaseSelect>
        </div>
        <div class="tree-box">
          <BasePageTable
            ref="rightTable"
            :height="tableHeight"
            :data="rightTable"
            :visible="false"
            border
          >
            <el-table-column
              v-for="col in tableCol"
              :key="col.prop"
              v-bind="col"
            ></el-table-column>
            <el-table-column
              label="转入库存"
              prop="outStock"
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
                  @click="remove(row)"
                >移除</span>
              </template>
            </el-table-column>
          </BasePageTable>
        </div>
      </div>
    </div>
    <footer
      class="inline-center"
      style="margin-top: 24px;"
    >
      <el-button
        type="primary"
        @click="confirm"
        :loading="loading"
      >确认</el-button>
      <el-button @click="() => $router.back()">取消</el-button>
    </footer>
  </div>
</template>

<script>
import ReturnButton from "@/components/ReturnButton.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import BaseSelect from "@/components/BaseSelect.vue";

export default {
  components: {
    BasePageTable,
    ConfirmDialog,
    BaseSelect,
    ReturnButton,
  },
  computed: {},
  data() {
    return {
      loading: false,
      tableHeight: 0,
      leftTable: [],
      rightTable: [],
      outHeatPointId: "",
      innerHeatPointId: "",
      tableCol: [
        {
          label: "序号",
          type: "index",
          width: "50",
        },
        {
          label: "供餐点",
          prop: "heatPointName",
        },
        {
          label: "菜品名称",
          prop: "skuname",
        },
        {
          label: "编码",
          prop: "cid",
        },
        {
          label: "现有库存",
          prop: "stock",
        },
      ],
      heatPointOptions: [],
    };
  },
  created() {
    const height = window.innerHeight;
    this.tableHeight = `${height - 420}px`;
    this.getHeatPoint();
  },
  methods: {
    async getHeatPoint() {
      const res = await this.$request("HeatingPoint/queryEnabledHeat");
      this.heatPointOptions = res.data.obj.heatVos;
    },
    async queryShopStockList(e) {
      if (!e) {
        this.leftTable = [];
        return;
      }
      const res = await this.$http("stock.ShopOrderStock/queryShopStockList", {
        heatPointId: e,
      });
      this.leftTable = res.obj;
      this.leftTable.forEach((item) => {
        item.outStock = "";
      });
      this.$nt(() => {
        this.$refs.leftTable.doLayout();
      });
    },
    async queryShopStockList2(e) {
      if (!e) {
        this.rightTable = [];
        return;
      }
      const res = await this.$http("stock.ShopOrderStock/queryShopStockList", {
        heatPointId: e,
      });
      this.rightTable = res.obj;
      this.rightTable.forEach((item) => {
        item.outStock = "";
      });
      this.$nt(() => {
        this.$refs.rightTable.doLayout();
      });
    },
    remove(row) {
      const litem = this.leftTable.find((item) => item.cid == row.cid);
      litem.outStock = "";
      const ritem = this.rightTable.find((item) => item.cid == row.cid);
      ritem.outStock = "";
      this.rightTable = this.rightTable.filter(
        (item) => item.stock || item.outStock
      );
    },
    transfer() {
      const tranTable = this.leftTable.filter((item) => item.outStock);
      if (!tranTable.length) {
        this.$msg("请输入库存转移数量", "error");
        return;
      }
      for (const item of tranTable) {
        if (Number(item.outStock) > Number(item.stock)) {
          this.$msg("请输入正确的库存转移数量", "error");
          return;
        }
      }
      if (!this.innerHeatPointId) {
        this.$msg("请选择转入供餐点", "error");
        return;
      }
      const heatPointName = this.heatPointOptions.find(
        (item) => item.value == this.innerHeatPointId
      );
      for (const item of tranTable) {
        const temp = this.rightTable.find((ritem) => ritem.cid == item.cid);
        if (temp) {
          temp.oldStock = item.stock;
          temp.outStock = item.outStock;
        } else {
          this.rightTable.push({
            heatPointName: heatPointName.label,
            skuname: item.skuname,
            cid: item.cid,
            oldStock: item.stock,
            stock: 0,
            outStock: item.outStock,
          });
        }
      }
    },
    async confirm() {
      if (this.outHeatPointId == this.innerHeatPointId) {
        this.$msg("不能转移至相同加热点", "error");
        return;
      }
      const rightTable = this.rightTable.filter((item) => item.outStock);
      if (!rightTable.length) {
        this.$msg("没有要转移的库存", "error");
        return;
      }
      const stockList = rightTable.map((item) => ({
        cid: item.cid,
        stock: item.oldStock,
        outStock: item.outStock,
      }));
      const params = {
        outHeatPointId: this.outHeatPointId,
        innerHeatPointId: this.innerHeatPointId,
        stockList,
      };
      this.loading = true;
      const res = await this.$http(
        "stock.ShopOrderStock/shopStockTransfer",
        params
      );
      if (!res.errMsg) {
        this.$msg("转移成功", "success");
        this.$router.go(-1);
        this.loading = false;
      } else {
        this.$confirm(res.errMsg, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true,
        }).then(() => {
        });

        this.loading = false;
      }
    },
    checkText(scope) {
      const index = scope.$index;
      let txt = this.leftTable[index].outStock;
      if (txt == 0) {
        this.leftTable[index].outStock = "";
        return;
      }
      txt = isNaN(txt)
        ? ""
        : txt === ""
        ? ""
        : Number(Math.abs(txt)).toFixed(0);
      this.leftTable[index].outStock = txt;
    },
  },
};
</script>

<style lang="less" scoped>
.page-container {
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
}
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.name-bar {
  align-items: center;
  .name-label {
    flex-shrink: 0;
  }
  .name-input {
    width: 260px;
  }
}

.tree-select-wrap {
  justify-content: space-between;
  .tree-select-section {
    flex-grow: 1;
    width: 40%;
  }
  .tree-select-control {
    width: 200px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }
}

.tree-box {
  padding: 16px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  box-sizing: border-box;
}
.btn {
  margin-top: 20px;
  width: 150px;
}
.txtDiv {
  width: 100%;
  margin: 0;
}
.txt {
  width: 300px;
  margin-bottom: 20px;
  margin-right: 20px;
}
.label {
  width: 100%;
  padding-left: 5px;
  height: 40px;
  color: #666666;
}
.action-label {
  margin-right: 10px;
}
.display-flex {
  flex-wrap: wrap;
  justify-content: center;
}
</style>
