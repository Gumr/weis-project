<template>
  <div>
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="5"
        :label-width="60"
        semi
        :action="false"
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
            @click="checkClick"
          >盘点录入</el-button>
        </template>
        <template #supply>
          <el-button
            type="warning"
            @click="supplyCheckClick"
          >补营业盘点录入</el-button>
        </template>
      </QueryComponents>
    </div>
    <el-image-viewer
      v-if="showViewer"
      :url-list="urlList"
      @close="closeViewer"
    />
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
        label="签收单"
        align="center"
      >
        <template #default="{ row }">
          <span
            style="color:#409EFF;cursor: pointer;"
            @click="onPreview(row)"
            v-if="row.tkdhSignImg"
          >签收单</span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="签收单" align="center">
        <template #default="{ row }">
          <span style="color:#409EFF;cursor: pointer;" @click="onPreview(row)">签收单</span>
        </template>
      </el-table-column> -->
      <el-table-column
        label="盘点类型"
        align="center"
        prop="tkdhTypeDesc"
      ></el-table-column>
      <el-table-column
        label="盘点时间"
        align="center"
        prop="tkdhUtime"
      ></el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="300"
      >
        <template #default="{ row }">
          <span
            v-if="row.tkdhState == 10 && hasEdit"
            class="span"
            @click="edit(row)"
          >编辑</span>
          <span
            v-if="row.tkdhState == 10 && hasEdit"
            class="span"
            @click="handleOperate(row)"
          >同步</span>
          <span
            v-if="row.tkdhState == 10 && hasEdit"
            class="span"
            @click="deleteClick(row)"
          >删除</span>
          <span
            v-if="row.tkdhState == 20 || !hasEdit"
            class="span"
            @click="detailClick(row)"
          >详情</span>
        </template>
      </el-table-column>
    </BasePageTable>
    <ConfirmDialog
      v-model="editDialogVisible"
      :title="tkdhChannel === '01' ? '补门店营业盘点' : '门店营业盘点'"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="onconfirm"
    >
      <el-form label-width="130px">
        <el-form-item label="供餐点筛选">
          <BaseSelect
            v-model="heatPointId"
            clearable
            :options="mealsOptions"
            :disabled="!hasReadOnly"
            @change="getSkuList"
          ></BaseSelect>
        </el-form-item>
        <el-form-item label="盘点日期">
          <el-date-picker
            v-model="date"
            value-format="yyyy-MM-dd"
            disabled
            @change="getSkuList"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="签收单">
          <ImageUpload
            v-model:file-list="tkdhSignImg"
            :upload-data="{ flag: 'stock' }"
            :limit="5"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="tkdhRemark"
            class="txt"
          ></el-input>
        </el-form-item>
        <BasePageTable
          ref="sku"
          height="500"
          :data="tableSkuData"
          :visible="false"
          border
          :row-class-name="tableRowClassName"
        >
          <el-table-column
            v-for="col in checkColumns"
            :key="col.prop"
            v-bind="col"
          ></el-table-column>
          <el-table-column :label="tkdhChannel === '01' ? '补录入库量' : '实际入库量'">
            <template
              #default="{ row }"
              class="action-cell"
            >
              <input
                v-model="row.innerStockTotal"
                :class="['input', row.innerStockTotal == row.tfsOutStockTotal ? '' : 'red']"
                @blur="checkText(row.index)"
              />
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
import { defineComponent } from "vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import exportExcel from "@/utils/export-excel";
import ImageUpload from "@/components/ImageUpload.vue";
import { ElImageViewer } from "element-plus";

export default defineComponent({
  components: {
    ConfirmDialog,
    QueryComponents,
    BasePageTable,
    ImageUpload,
    ElImageViewer,
  },
  data() {
    return {
      height: window.innerHeight - 330,
      tkdhId: "",
      hasEdit: true,
      showViewer: false,
      urlList: [],
      queryParams: {
        date: this.$day(new Date(Date.now())).format("YYYY-MM-DD"),
        heatPointId: "",
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
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
        {
          slot: "action",
        },
        {
          slot: "supply",
        },
      ],
      tableData: [],
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
          label: "计划出库量",
          prop: "tkdhStockTotal",
        },
        {
          label: "实际出库量",
          prop: "tkdhOutStockTotal",
        },
        {
          label: "实际入库量",
          prop: "tkdhInnerStockTotal",
        },
        {
          label: "盘点人",
          prop: "tkdhUname",
        },
      ],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      // 弹窗
      editDialogVisible: false,
      tkdhSignImg: [],
      heatPointId: "",
      mealsOptions: [],
      hasReadOnly: false,
      date: this.$day(new Date(Date.now())).format("YYYY-MM-DD"),
      tkdhRemark: "",
      tkdhChannel: "", // 01代表是补营页盘点
      tableSkuData: [],
    };
  },
  computed: {
    checkColumns() {
      const cols = [
        {
          label: "序号",
          type: "index",
          width: "80px",
        },
        {
          label: "SKU",
          prop: "tfsSkuname",
        },
        {
          label: "编码",
          prop: "tfsCid",
        },
        {
          label: "规格",
          prop: "tfsQuality",
          formatter: (row) => `${row.tfsQuality}g/份`,
        },
        {
          label: "单价",
          prop: "tfsPrice",
        },
      ];
      return this.tkdhChannel === "01"
        ? cols
        : cols.concat([
            {
              label: "计划出库量",
              prop: "tfsStockTotal",
            },
            {
              label: "实际出库量",
              prop: "tfsOutStockTotal",
            },
          ]);
    },
  },
  created() {
    this.handleDate();
    this.getHeatPoint();
  },
  methods: {
    tableRowClassName({ row, rowIndex }) {
      row.index = rowIndex;
    },
    checkText(index) {
      let num = this.tableSkuData[index].innerStockTotal;
      num = isNaN(num) ? "" : Number(Math.abs(num)).toFixed(0);
      this.tableSkuData[index].innerStockTotal = num;
    },
    handleDate() {
      const hour = this.$day().hour();
      const date = this.$day(this.queryParams.date).format("YYYY-MM-DD");
      const nowdate = this.$day(new Date(Date.now())).format("YYYY-MM-DD");
      const day = this.$day(date).diff(nowdate, "day");
      if (day == 0) {
        this.hasEdit = true;
      } else {
        this.hasEdit = false;
      }
    },
    onPreview(row) {
      this.urlList = [];
      const url = JSON.parse(row.tkdhSignImg);
      url.forEach((item) => {
        this.urlList.push(item);
      });
      this.showViewer = true;
    },
    closeViewer() {
      this.showViewer = false;
    },
    searchClick() {
      this.handleDate();
      this.getList();
    },
    async handleExport() {
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.queryParams,
        pageNo: 1,
        pageSize: this.tableDataTotal,
        type: "04",
      };
      const columns = [
        {
          label: "序号",
          type: "index",
        },
        {
          label: "供餐点",
          prop: "tkdhHpName",
        },
        {
          label: "计划出库量",
          prop: "tkdhStockTotal",
        },
        {
          label: "实际出库量",
          prop: "tkdhOutStockTotal",
        },
        {
          label: "实际入库量",
          prop: "tkdhInnerStockTotal",
        },
        {
          label: "盘点人",
          prop: "tkdhUname",
        },
        {
          label: "盘点类型",
          prop: "tkdhTypeDesc",
        },
        {
          label: "盘点时间",
          prop: "tkdhUtime",
        },
      ];
      this.$store.state.bloading = true;
      const res = await this.$http("OrderStockHist/queryStockHistList", params);
      exportExcel({
        columns,
        filename,
        data: res.obj.dataPage.record,
      });
    },
    supplyCheckClick() {
      this.tkdhChannel = "01";
      this.showDialog();
    },
    checkClick() {
      this.tkdhChannel = "";
      this.showDialog();
    },
    showDialog() {
      this.editDialogVisible = true;
      this.hasReadOnly = true;
      this.tkdhId = "";
      this.heatPointId = "";
      this.tkdhSignImg = [];
      this.tableSkuData = [];
      this.date = this.$day(new Date(Date.now())).format("YYYY-MM-DD");
      this.queryPointList();
      this.getSkuList();
    },
    edit(row) {
      this.tkdhChannel = row.tkdhChannel;
      this.hasReadOnly = false;
      this.tkdhId = row.tkdhId;
      this.heatPointId = row.tkdhHpid;
      this.editDialogVisible = true;
      this.tkdhSignImg = [];
      this.tableSkuData = [];
      this.getSkuList();
    },
    deleteClick(row) {
      this.$request("OrderStockHist/deleteStockHist", {
        tkdhId: row.tkdhId,
        type: "04",
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
    detailClick(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          id: row.tkdhId,
          type: "03",
        },
      });
    },
    async handleOperate(row) {
      const res = await this.$http("OrderStockHist/operationStockSync", {
        tkdhId: row.tkdhId,
      });
      if (res.errCode === 0) {
        this.$msg("同步成功", "success");
        this.getList();
      } else {
        this.$confirm(res.errMsg || "同步失败", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true,
        }).then(() => {});
      }
    },
    async getHeatPoint() {
      const res = await this.$request("HeatingPoint/queryEnabledHeat");
      if (!res.data.errMsg) {
        this.queryComps[1].props.options = [
          {
            label: "全部供餐点",
            value: "",
          },
        ].concat(res.data.obj.heatVos);
        this.mealsOptions = [].concat(res.data.obj.heatVos);
        this.getList();
      }
    },
    async queryPointList() {
      const res = await this.$request("HeatingPoint/queryPointList", {
        shopType: "10",
      });
      if (!res.data.errMsg) {
        let storeNames = [];
        storeNames = res.data.obj.map((item) => {
          return {
            label: item.thpName,
            value: item.thpId,
          };
        });
        res.data.obj.forEach((item) => {
          if (item.isLeader === true) {
            this.heatPointId = item.thpId;
          }
        });

        this.mealsOptions = [].concat(storeNames);
        this.getSkuList();
      }
    },

    async getList() {
      this.$store.state.vloading = true;
      const res = await this.$http("OrderStockHist/queryStockHistList", {
        ...this.page,
        ...this.queryParams,
        type: "04",
      });
      if (!res.errMsg) {
        this.tableData = res.obj.dataPage.record;
        this.tableDataTotal = res.obj.dataPage.totalRecordCount;
        this.$nt(() => {
          this.$refs.table.doLayout();
        });
      }
    },
    async getSkuList() {
      if (!this.heatPointId) {
        this.tableSkuData = [];
        return;
      }
      const res = await this.$http("OrderStockHist/getOperationSkuListByHpId", {
        heatPointId: this.heatPointId,
        date: this.date,
      });
      if (!res.errMsg) {
        this.tableSkuData = res.obj.skuInfoVos.map((item) => ({
          innerStockTotal:
            this.tkdhChannel === "01" ? 0 : item.tfsOutStockTotal,
          ...item,
        }));
      }
      if (this.tkdhId) {
        this.getSkuListbyId();
      }
      this.$nt(() => {
        this.$refs.sku.doLayout();
      });
    },
    getSkuListbyId() {
      this.$request("OrderStockHist/getStockHistById", {
        tkdhId: this.tkdhId,
        type: "04",
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.date = this.$day(dataPage.tkdhStockDate).format("YYYY-MM-DD");
            if (dataPage.tkdhSignImg) {
              const tkdhSignImg = JSON.parse(dataPage.tkdhSignImg);
              tkdhSignImg.forEach((item) => {
                this.tkdhSignImg.push({ url: item });
              });
            }
            this.tkdhRemark = dataPage.tkdhRemark;
            for (const sku of this.tableSkuData) {
              for (const stock of dataPage.tkdhContent) {
                if (sku.tfsCid == stock.tfsCid) {
                  sku.innerStockTotal = stock.innerStockTotal;
                }
              }
            }
          }
        })
      );
    },
    async onconfirm(done) {
      if (!this.heatPointId) {
        this.$msg("请选择供餐点", "error");
        done();
        return;
      }
      // if (!this.tkdhSignImg.length) {
      //   this.$msg('请上传签收单', 'error');
      //   done();
      //   return;
      // }
      if (!this.date) {
        this.$msg("请选择日期", "error");
        done();
        return;
      }
      const item = this.tableSkuData.filter(
        (item) => item.innerStockTotal && item.innerStockTotal >= 0
      ); // 过滤出输入了值的项
      if (item.length <= 0) {
        this.$msg("请输入至少一项有效的备货信息", "error");
        done();
        return;
      }
      const params = this.tableSkuData
        .filter((item) => Boolean(item.innerStockTotal))
        .map((item) => {
          const ret = {
            tfsCid: item.tfsCid,
            tfsVersion: item.tfsVersion,
          };

          if (this.tkdhChannel !== "01") {
            ret.outStockTotal = item.tfsOutStockTotal;
            ret.stockTotal = item.tfsStockTotal;
          }
          if (item.innerStockTotal && item.innerStockTotal >= 0)
            ret.innerStockTotal = item.innerStockTotal;
          return ret;
        });
      const reqParams = {
        tkdhId: this.tkdhId,
        date: this.date,
        tkdhHpid: this.heatPointId,
        tkdhRemark: this.tkdhRemark,
        tkdhChannel: this.tkdhChannel,
        stockList: params,
        type: "04",
      };
      if (this.tkdhSignImg.length) {
        reqParams.tkdhSignImg = [];
        this.tkdhSignImg.forEach((item) => {
          const img = item.response ? item.response.obj.imageUrl : item.url;
          reqParams.tkdhSignImg.push(img);
        });
      }
      const res = await this.$http("OrderStockHist/updateStockHist", reqParams);
      if (!res.errMsg) {
        this.$message({ type: "success", message: "添加成功" });
        this.editDialogVisible = false;
        this.getList();
        this.$nt(() => {
          setTimeout(() => {
            done();
          }, 500);
        });
      } else {
        this.$message({ type: "error", message: res.errMsg });
        done();
      }
    },
  },
});
</script>

<style lang="less" scoped>
.input {
  box-sizing: border-box;
  width: 95%;
  padding: 0 10px;
  height: 40px;
  display: inline-block;
  font-size: inherit;
  outline: 0;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
}
.red {
  color: red !important;
}
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
.span {
  color: #409eff;
  margin-right: 10px;
  cursor: pointer;
}
</style>
