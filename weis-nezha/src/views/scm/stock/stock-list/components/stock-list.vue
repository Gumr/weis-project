<template>
  <div class>
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="5"
        :label-width="70"
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
            @click="exportClick"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>
      <el-button
        v-if="isChange == 0"
        style="float:right"
        type="primary"
        :loading="loading"
        @click="hasChange(1)"
      >减少库存</el-button>
      <!-- <el-button
        v-if="isChange == 0"
        style="float:right"
        type="warning"
        :loading="loading"
        @click="hasChange(2)"
      >端内库存转端外</el-button> -->
      <el-button
        v-if="isChange != 0"
        style="float:right"
        type="primary"
        :loading="loading"
        @click="reduce"
      >确认减少</el-button>
      <el-button
        v-if="isChange != 0"
        style="float:right"
        @click="isChange = 0"
      >取消减少</el-button>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :visible="false"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column
          label="序号"
          type="index"
          width="80"
        ></el-table-column>
        <el-table-column
          label="加热点"
          prop="heatPointName"
        ></el-table-column>
        <el-table-column
          label="菜品编码"
          prop="tfsCid"
        ></el-table-column>
        <el-table-column
          label="菜品名称"
          prop="tfsSkuname"
        ></el-table-column>
        <!-- <el-table-column label="退货库存量"  prop="insideStockRefund"></el-table-column> -->
        <el-table-column
          label="总备货量(份)"
          align="center"
        >
          <el-table-column
            label="总量"
            prop="totalStock"
          ></el-table-column>
          <!-- <el-table-column label="总消耗量" prop="totalSaled"></el-table-column>
          <el-table-column label="总库存量" prop="totalForSale"></el-table-column> -->
        </el-table-column>
        <el-table-column
          label="端内备货量(份)"
          align="center"
        >
          <el-table-column
            label="库存可现点量"
            prop="totalForSale"
          ></el-table-column>
          <!-- <el-table-column label="昨日可复用库存" prop="insideResidue"></el-table-column> -->
          <el-table-column
            label="央厨生产剩余量"
            prop="centralResidueStock"
          ></el-table-column>
          <el-table-column
            label="取消订单的库存"
            prop="cancelStock"
          ></el-table-column>
          <el-table-column
            label="端内转移量"
            prop="insideTransStock"
          ></el-table-column>
          <el-table-column
            label="门店库存调配"
            prop="storeTransStock"
          ></el-table-column>
          <!-- <el-table-column label="端内消耗量" prop="insideSaled"></el-table-column> -->
          <el-table-column
            label="小程序消耗量"
            prop="soldMini"
          ></el-table-column>
          <el-table-column
            label="美团消耗量"
            prop="soldMeituan"
          ></el-table-column>
          <el-table-column
            label="饿了么消耗量"
            prop="soldEleme"
          ></el-table-column>

          <el-table-column
            label="端内库存量"
            prop="insideForSale"
            sortable
          ></el-table-column>
        </el-table-column>
        <el-table-column
          label="库存减少量"
          prop="changeStock"
          align="center"
        >
          <el-table-column
            label="减少库存量"
            prop="changeStock"
          >
            <template
              #default="{ row }"
              class="action-cell"
            >
              <el-tooltip
                placement="top"
                effect="light"
              >
                <template #content>
                  <div
                    v-for="col in tipsList"
                    :key="col.cid"
                    style="margin-top:5px"
                  >
                    {{col.skuname}}<span style="color:#F56C6C">&nbsp; {{col.num}} </span>个, <br />
                    修改人:{{col.operator}},
                    <br />
                    修改时间：{{col.utime}},<br />
                    原因：{{col.remark}}<br />

                  </div>
                </template>
                <span @mouseenter="showTips(row)">{{row.changeStock}}</span>
              </el-tooltip>

            </template>

          </el-table-column>
          <el-table-column
            v-if="isChange == 1"
            label="减少库存量"
          >
            <template
              #default="{ row }"
              class="action-cell"
            >
              <el-input
                v-model="row.num"
                type="number"
                onkeyup="return value=value.replace(/^(0+)|[^\d]+/g, '')"
                :min="0"
              ></el-input>
            </template>
          </el-table-column>
        </el-table-column>

        <!-- <el-table-column v-if="isChange == 2" label="端内库存转移到端外库存数量">
          <template #default="{ row }" class="action-cell">
            <el-input
              v-model="row.outNum"
              type="number"
              onkeyup="return value=value.replace(/^(0+)|[^\d]+/g, '')"
              :min="0"
            ></el-input>
          </template>
        </el-table-column> -->
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="hasDialog"
      title="减少原因"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirm"
      :async-confirm="true"
    >
      <el-input
        type="textarea"
        :rows="6"
        placeholder="请填写减少原因"
        v-model="remark"
      />
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from "@/utils/export-excel";
// import { defineComponent } from "vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

export default {
  components: {
    ConfirmDialog,
  },
  data() {
    return {
      disabled: true,
      tipsList: [],
      remark: "",
      hasDialog: false,
      height: window.innerHeight - 280,
      printDate: this.$day(new Date()).format("YYYY-MM-DD"),
      isChange: 0, // 0 取消转移， 1 端外转段内， 2端内转端外
      tableData: [],
      loading: false,
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        date: this.$day().format("YYYY-MM-DD"),
        heatPointId: undefined,
        skuname: "",
      },
      queryComps: [
        {
          component: "el-date-picker",
          key: "date",
          label: "日期",
          placeholder: "选择日期",
          props: {
            type: "date",
            clearable: false,
            "value-format": "yyyy-MM-dd",
          },
        },
        {
          component: "BaseSelect",
          key: "heatPointId",
          label: "加热点",
          props: {
            options: [],
          },
        },
        {
          component: "el-input",
          key: "skuname",
          label: "菜品名称",
          placeholder: "菜品名称",
          props: {
            clearable: true,
          },
        },
      ],
    };
  },
  created() {
    this.getHeatPoint();
    // this.getList()
  },
  methods: {
    hasChange(index) {
      this.isChange = index;
      this.tableData.forEach((item) => {
        delete item.num;
      });
    },
    exportClick() {
      const col = [
        {
          label: "序号",
          type: "index",
        },
        {
          label: "加热点",
          prop: "heatPointName",
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
          label: "总量-总量",
          prop: "totalStock",
        },
        {
          label: "总量-库存可现点量",
          prop: "totalForSale",
        },
        {
          label: "总量-央厨生产剩余量",
          prop: "centralResidueStock",
        },
        {
          label: "总量-取消订单的库存",
          prop: "cancelStock",
        },
        {
          label: "端内转移量",
          prop: "insideTransStock",
        },
        {
          label: "昨日可复用库存",
          prop: "insideResidue",
        },
        {
          label: "门店库存调配",
          prop: "storeTransStock",
        },
        {
          label: "小程序消耗量",
          prop: "soldMini",
        },
        {
          label: "美团消耗量",
          prop: "soldMeituan",
        },
        {
          label: "饿了么消耗量",
          prop: "soldEleme",
        },

        {
          label: "端内库存量",
          prop: "insideForSale",
        },
        {
          label: "减少库存量",
          prop: "changeStock",
        },
      ];
      const filename = `${this.$route.meta.title}-导出(${this.printDate})`;
      exportExcel({
        filename,
        data: this.tableData,
        columns: col,
      });
    },
    searchClick() {
      this.isChange = false;
      this.printDate = this.$day(this.queryParams.date).format("YYYY-MM-DD");
      this.getList();
    },
    goPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          data: row,
        },
      });
    },
    showTips(data) {
      // if (data.changeStock<=0) {
      //   return
      // }
      const parmas = {
        heatPointId: data.heatPointId,
        date: this.printDate,
        cid: data.tfsCid,
      };
      this.$request("OrderStock/queryPointStockRecord", parmas).then(
        this.$rw((err, res) => {
          if (!err) {
            this.tipsList = res;
            this.disabled = false;
          }
        })
      );
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request("OrderStock/queryAllStock", this.queryParams).then(
        this.$rw((err, { stockVos }) => {
          if (!err) {
            this.tableData = stockVos;
            this.$store.state.vloading = false;
            this.$nt(() => {
              this.$refs.table.doLayout();
            });
          }
        })
      );
    },
    getHeatPoint() {
      this.$request("HeatingPoint/queryAllHeat").then(
        this.$rw((err, { heatVos }) => {
          if (!err) {
            this.queryComps[1].props.options = [
              {
                label: "全部供餐点",
                value: "-1",
              },
            ].concat(heatVos);
          }
        })
      );
    },
    /**减少库存 */
    onconfirm(done) {
      if (!this.remark) {
        this.$message({ type: "error", message: "请输入减少原因" });
        done();
        return;
      }
      const params = {
        skuList: this.tableData
          .filter((item) => item["num"] && item["num"] > 0)
          .map((item) => ({
            cid: item.tfsCid,
            num: item["num"].trim(),
            heatPointId: item.heatPointId,
            date: this.printDate,
          })),
        remark: this.remark,
      };
      this.$request("OrderStock/updatePointStock", params).thenwrap((err) => {
        if (!err) {
          this.hasDialog = false;
          this.isChange = 0;
          this.getList();
          setTimeout(done, 500);
        } else {
          this.$confirm(`减少失败,${err.errMsg}`, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            center: true,
          }).then(() => {
          });
          done();
          return;
        }
      });
    },
    reduce() {
      const valid = this.tableData.find((item) => item["num"]);
      if (!valid) {
        this.loading = false;
        this.$message({ type: "error", message: "请输入数量" });
        return;
      }
      this.remark = "";
      this.hasDialog = true;
    },
    /**转移库存 */
    transfer() {
      this.loading = true;
      const numKey = this.isChange === 1 ? "insideNum" : "outNum";
      const valid = this.tableData.find((item) => item[numKey]);
      if (!valid) {
        this.loading = false;
        this.$message({ type: "error", message: "请输入转移数量" });
        return;
      }
      // 端外转端内
      const params = {
        form: this.tableData
          .filter((item) => item[numKey] && item[numKey] > 0)
          .map((item) => ({
            cid: item.tfsCid,
            num: item[numKey].trim(),
            version: item.skuVersion,
            date: this.printDate,
            hpId: item.heatPointId,
          })),
      };

      const url = {
        1: "StockTransfer/externalGotoInner",
        2: "StockTransfer/externalGotoExternal",
      }[this.isChange];

      this.$request(url, params)
        .thenwrap((err) => {
          if (!err) {
            this.$message({ type: "success", message: "转移成功" });
            this.getList();
          } else {
            this.$message({ type: "error", message: "转移失败:" + err.errMsg });
          }
        })
        .finally(() => {
          this.isChange = 0;
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>
