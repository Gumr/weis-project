<template>
  <div>
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="7"
        :label-width="60"
        semi
      >
        <template #action>
          <el-button
            type="primary"
            @click="searchClick"
          >搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >
            {{ $store.state.bloading ? '导出中' : '导出' }}
          </el-button>
          <el-button
            type="primary"
            @click="showDialog()"
          >盘点录入</el-button>
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
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="300"
        >
          <template #default="{ row }">
            <el-button
              v-if="row.tkdhState == 10"
              size="small"
              @click="edit(row)"
            >编辑</el-button>
            <el-button
              v-if="row.tkdhState == 20"
              size="small"
              @click="detailClick(row)"
            >详情</el-button>
            <el-button
              v-if="row.tkdhState == 10"
              size="small"
              @click="residueStockSync(row)"
            >同步</el-button>
            <el-button
              v-if="row.tkdhState == 10"
              size="small"
              @click="deleteClick(row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="editDialogVisible"
      title="剩余库存录入"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="onconfirm"
    >
      <el-form
        :model="current"
        label-width="150px"
      >
        <el-form-item label="供餐点筛选">
          <BaseSelect
            v-model="heatPointId"
            clearable
            :options="mealsOptions"
            :disabled="!hasReadOnly"
            @change="getSkuList"
          ></BaseSelect>
        </el-form-item>
        <el-form-item label="复用库存使用日期">
          <el-date-picker
            v-model="date"
            value-format="yyyy-MM-dd"
            disabled
            @change="getSkuList"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="tkdhRemark"
            class="txt"
          ></el-input>
        </el-form-item>
        <BasePageTable
          ref="sku"
          v-model:current-page="page.pageNo"
          v-model:page-size="page.pageSize"
          height="500"
          :data="tableSkuData.filter(data => !search || data.tfsSkuname.toLowerCase().includes(search.toLowerCase()))"
          :total="tableDataTotal"
          :visible="false"
          border
          @current-page-change="searchSku"
          @size-change="searchSku"
        >
          <el-table-column
            label="序号"
            type="index"
            width="80px"
          ></el-table-column>
          <el-table-column
            label="SKU"
            prop="tfsSkuname"
            width="160px"
            align="center"
          >
            <template #header>
              sku
              <el-input
                v-model="search"
                size="mini"
                placeholder="输入关键字筛选"
                clearable
              />
            </template>

          </el-table-column>
          <el-table-column
            label="编码"
            prop="tfsCid"
          ></el-table-column>
          <el-table-column label="规格">
            <template
              #default="{ row }"
              class="action-cell"
            >
              <span>{{ row.tfsQuality }}g/份</span>
            </template>
          </el-table-column>
          <el-table-column
            label="单价"
            prop="tfsPrice"
          ></el-table-column>
          <el-table-column
            label="保质期"
            prop="tfsShelfLife"
          ></el-table-column>
          <el-table-column
            label="剩余库存量"
            prop="residueAllStock"
          >
            <template
              #default="{ row }"
              class="action-cell"
            >
              <el-input
                v-model="row.residueAllStock"
                :min="0"
                @keydown="catchNonIntKeydown"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column label="可复用库存">
            <template
              #default="{ row }"
              class="action-cell"
            >
              <el-input
                v-model="row.residueStock"
                :min="0"
                @keydown="catchNonIntKeydown"
              ></el-input>
            </template>
          </el-table-column>

        </BasePageTable>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import { catchNonIntKeydown } from "@/utils/event-catcher";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import exportExcel from "@/utils/export-excel";

export default {
  components: {
    ConfirmDialog,
    QueryComponents,
    BasePageTable,
  },
  data() {
    return {
      search: "",
      height: window.innerHeight - 330,
      count: 0,
      current: {},
      disableTodayOptions: {
        disabledDate: (d) => d < Date.now(),
      },
      editDialogVisible: false,
      queryParams: {
        cdate: this.$day(new Date(Date.now())).format("YYYY-MM-DD"),
        heatPointId: "",
      },
      date: this.$day(new Date(Date.now() + 86400000)).format("YYYY-MM-DD"),
      tkdhId: "",
      hasReadOnly: false,
      heatPointId: "",
      queryComps: [
        {
          component: "el-date-picker",
          key: "cdate",
          label: "盘点日期",
          placeholder: "选择日期",
          props: {
            type: "date",
            "value-format": "yyyy-MM-dd",
            clearable: false,
          },
        },
        {
          component: "BaseSelect",
          key: "heatPointId",
          label: "供餐点",
          props: {
            options: [],
          },
        },
      ],
      tableCol: [
        {
          label: "序号",
          type: "index",
        },
        {
          label: "供餐点",
          prop: "tkdhHpName",
        },
        {
          label: "今日剩余库存",
          prop: "tkdhResidueAllTotal",
        },
        {
          label: "今日可复用库存",
          prop: "tkdhResidueTotal",
        },
        {
          label: "今日报损量",
          prop: "tkdhWastageTotal",
        },
        {
          label: "盘点日期",
          prop: "tkdhCtime",
          formatter: (row) => row.tkdhCtime.substring(0, 10),
        },
        {
          label: "复用库存使用日期",
          prop: "tkdhStockDate",
        },
        {
          label: "操作时间",
          prop: "tkdhUtime",
        },
        {
          label: "操作人",
          prop: "tkdhUname",
        },
        {
          label: "备注",
          prop: "tkdhRemark",
        },
      ],
      tableData: [],
      tableSkuData: [],
      tableSkuDataTotal: 0,
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      mealsOptions: [],
      tkdhRemark: "",
    };
  },
  created() {
    this.getHeatPoint();
    this.getList();
  },
  methods: {
    catchNonIntKeydown,
    changeResidueStock() {
      this.tableSkuData.forEach((item) => {
        if (item.tfsShelfLife >= 2) {
          // item.residueStock = item.residueAllStock;
        }
      });
    },
    showDialog() {
      if (!this.queryParams.cdate) {
        this.$message({ type: "error", message: "未选择日期！" });
        return;
      }
      this.hasReadOnly = true;
      this.count = 0;
      this.tkdhBatchID = "";
      this.tkdhId = "";
      this.editDialogVisible = true;
      this.tkdhRemark = "";
      this.heatPointId = "";
      if (!this.heatPointId) {
        this.tableSkuData = [];
        return;
      }
      this.tableSkuData = [];
      this.getSkuList().then(() => {
        this.$nt(() => {
          this.$refs.sku.doLayout();
        });
      });
    },
    detailClick(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          id: row.tkdhId,
          type: "02",
        },
      });
    },
    deleteClick(row) {
      this.$request("OrderStockHist/deleteStockHist", {
        tkdhId: row.tkdhId,
        type: "02",
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.$message({ type: "success", message: "删除成功" });
            this.getList();
          } else {
            this.$message({ type: "success", message: err.errMsg });
          }
        })
      );
    },
    edit(row) {
      this.hasReadOnly = false;
      this.tkdhId = row.tkdhId;
      this.heatPointId = row.tkdhHpid;
      this.editDialogVisible = true;
      this.tableSkuData = [];
      this.search = "";
      this.getSkuList().then(() => {
        this.getSkuListbyId();
      });
    },
    getSkuListbyId() {
      this.$request("OrderStockHist/getStockHistById", {
        tkdhId: this.tkdhId,
        type: "02",
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.date = this.$day(dataPage.tkdhStockDate).format("YYYY-MM-DD");
            this.tkdhRemark = dataPage.tkdhRemark;
            for (const sku of this.tableSkuData) {
              for (const stock of dataPage.tkdhContent) {
                if (sku.tfsCid == stock.tfsCid) {
                  sku.residueAllStock = stock.residueAllStock;
                  sku.residueStock = stock.residueStock;
                }
              }
            }
          }
        })
      );
    },
    refresh() {
      setTimeout(() => {
        if (this.editDialogVisible) {
          this.count += 1;
          if (this.count === 600) {
            this.getSkuList();
          }
        }
        this.refresh();
      }, 1000);
    },
    searchClick() {
      this.date = this.$day(
        Date.parse(this.queryParams.cdate) + 86400000
      ).format("YYYY-MM-DD");
      this.getList();
    },
    searchSku() {
      this.getSkuList();
    },
    getHeatPoint() {
      this.$request("HeatingPoint/queryEnabledHeat").then(
        this.$rw((err, { heatVos }) => {
          if (!err) {
            this.queryComps[1].props.options = [
              {
                label: "全部供餐点",
                value: "",
              },
            ].concat(heatVos);
            this.mealsOptions = [].concat(heatVos);
          }
        })
      );
    },
    getSkuList() {
      if (!this.heatPointId) {
        this.tableSkuData = [];
        return;
      }
      return this.$request("OrderStock/getSkuListByHpId", {
        heatPointId: this.heatPointId,
        date: this.date,
        type: "02",
      }).then(
        this.$rw((err, { skuInfoVos }) => {
          if (!err) {
            this.tableSkuData = skuInfoVos.map((item) => ({
              residueStock: item.residueStock,
              residueAllStock: item.residueAllStock,
              ...item,
            }));
          }
          this.$nt(() => {
            this.$refs.sku.doLayout();
          });
        })
      );
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request("OrderStockHist/queryStockHistList", {
        ...this.page,
        ...this.queryParams,
        type: "02",
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
            this.$store.state.vloading = false;
            this.$nt(() => {
              this.$refs.table.doLayout();
            });
          }
        })
      );
    },
    onconfirm(done) {
      if (!this.heatPointId) {
        this.$message({
          type: "error",
          message: "请选择供餐点",
        });
        return;
      }
      let params = this.tableSkuData.filter(
        (item) =>
          (item.residueAllStock && item.residueAllStock >= 0) ||
          (item.residueStock && item.residueStock >= 0)
      ); // 过滤出输入了值的项

      if (params.length <= 0) {
        this.$message({
          type: "error",
          message: "请输入至少一项有效的备货信息",
        });
        done();
        return;
      }
      for (const item of params) {
        if (item.residueStock && !item.residueAllStock) {
          console.log(item.residueStock, item.residueAllStock);
          this.$msg("剩余库存量不能为空", "error");
          done();
          return;
        }
      }
      params = params.map((item) => {
        const ret = {
          tfsCid: item.tfsCid,
          tfsVersion: item.tfsVersion,
          residueAllStock: item.residueAllStock,
          tfsShelfLife: item.tfsShelfLife,
        };

        if (item.residueStock && item.residueStock >= 0)
          ret.residueStock = item.residueStock;
        return ret;
      });

      this.$request("OrderStockHist/updateStockHist", {
        tkdhId: this.tkdhId,
        date: this.date,
        tkdhHpid: this.heatPointId,
        tkdhRemark: this.tkdhRemark,
        stockList: params,
        type: "02",
      }).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({ type: "success", message: "添加成功" });
            this.editDialogVisible = false;
            this.$nt(() => {
              setTimeout(done, 500);
            });
            this.getList();
          } else {
            this.$message({ type: "error", message: err.errMsg });
            done();
          }
        })
      );
    },
    handleExport() {
      this.$store.state.bloading = true;
      const filename = `${this.$route.meta.title}-导出(${this.date})`;
      this.reqAllUserData().then(
        this.$rw((err, res) => {
          this.$store.state.bloading = false;
          exportExcel({
            columns: this.tableCol,
            filename,
            data: res.dataPage.record,
          });
        })
      );
    },
    reqAllUserData() {
      return this.$request("OrderStockHist/queryStockHistList", {
        ...this.queryParams,
        pageSize: 999,
        pageNo: 1,
        type: "02",
      });
    },
    residueStockSync(row) {
      this.$request("OrderStockHist/residueStockSync", {
        tkdhId: row.tkdhId,
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.$message({ type: "success", message: "同步成功" });
            this.getList();
          } else {
            this.$confirm(err.errMsg || "同步失败", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
              center: true,
            }).then(() => {});
          }
        })
      );
    },
  },
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0;
}
.txt {
  width: 300px;
}
.food-cover {
  max-height: 100%;
  max-width: 100%;
}
</style>
