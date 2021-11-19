<template>
  <div class="page-container">
    <el-row
      type="flex"
      class="row"
    >
      <el-col :span="6">
        <span>供餐点筛选：</span>
        <BaseSelect
          v-model="heatPointId"
          clearable
          class="txt"
          :options="mealsOptions"
          :disabled="!hasReadOnly"
          @change="getSkuList"
        ></BaseSelect>
      </el-col>
      <el-col :span="6">
        <span>备货售卖时间：</span>
        <el-date-picker
          v-model="date"
          class="txt"
          value-format="yyyy-MM-dd"
          :disabled="!hasReadOnly"
          :disabled-date="disabledDate"
          @change="dateChange"
        ></el-date-picker>
      </el-col>
      <el-col
        :span="8"
        class="display-flex flex-items-center"
      >
        <span>用户人群：</span>
        <el-checkbox-group
          v-model="targetValue"
          @change="targetValueChange"
        >
          <el-checkbox
            v-for="it in targetOptions"
            :key="it.label"
            :label="it.value"
          >{{ it.label }}</el-checkbox>
        </el-checkbox-group>
      </el-col>
      <el-col
        :span="6"
        style="margin-top:15px"
      >
        <span>小程序同比上周调整：</span>
        <NumberInput
          v-model="tkdhRatio"
          style="width: 160px"
          :unsigned="false"
          :precision="3"
          @blur="computeStockForRadio('tkdhRatio')"
        />
        <span>%</span>
      </el-col>
      <el-col
        :span="6"
        style="margin-top:15px"
      >
        <span>美团同比上周调整：</span>
        <NumberInput
          v-model="mtRatio"
          style="width: 160px"
          :unsigned="false"
          :precision="3"
          @blur="computeStockForRadio('mtRatio')"
        />
        <span>%</span>
      </el-col>
      <el-col
        :span="6"
        style="margin-top:15px"
      >
        <span>饿了么同比上周调整：</span>
        <NumberInput
          v-model="elmRatio"
          style="width: 160px"
          :unsigned="false"
          :precision="3"
          @blur="computeStockForRadio('elmRatio')"
        />
        <span>%</span>
      </el-col>

      <el-col
        :span="6"
        style="margin-top:15px"
      >
        <span>备货用途：</span>
        <BaseSelect
          v-model="tkdhChannel"
          class="txt"
          :options="portOptions"
          @change="changePort"
        ></BaseSelect>
      </el-col>

      <el-col
        :span="6"
        style="margin-top:15px"
      >
        <span>备注：</span>
        <el-input
          v-model="tkdhRemark"
          class="txt"
        ></el-input>
      </el-col>

      <el-col
        :span="6"
        style="margin-top:15px"
      >
        <el-button
          type="primary"
          :loading="loading"
          style="margin-left: 20px"
          @click="confirm"
        >保存</el-button>
      </el-col>
    </el-row>
    <h3>备货量总和：{{countNum}}</h3>
    <BasePageTable
      ref="sku"
      :height="height"
      :data="tableSkuData"
      :row-class-name="tableRowClassName"
      :visible="false"
      border
    >
      <el-table-column
        key="icon"
        width="45"
        align="center"
        prop="icon"
      >
        <template #default="{ row }">
          <img
            v-if="row.isBreakage == '1'"
            src="/images/danger.png"
            style="width: 20px;margin-top: 5px;"
          />
          <img
            v-if="row.isWarning"
            src="/images/warn.png"
            style="width: 20px;margin-top: 5px;"
          />
        </template>
      </el-table-column>
      <el-table-column
        key="index"
        label="序号"
        type="index"
        width="80px"
      ></el-table-column>
      <el-table-column
        key="tfsSkuname"
        label="SKU"
        prop="tfsSkuname"
      ></el-table-column>
      <el-table-column
        key="tfsCid"
        label="编码"
        prop="tfsCid"
      ></el-table-column>
      <el-table-column
        key="tfsLastWeekMiniConsume"
        label="小程序同期现点量"
        prop="tfsLastWeekMiniConsume"
         v-if="tkdhChannel == '10'"
      >
      </el-table-column>
      <el-table-column
        key="tfsLastWeekReserve"
        label="小程序同期预定量"
        prop="tfsLastWeekReserve"
         v-if="tkdhChannel == '10'"
      >
      </el-table-column>
      <el-table-column
        label="小程序已预定量"
        prop="tfsTodayReserve"
         v-if="tkdhChannel == '10'"
      ></el-table-column>
      <el-table-column label="小程序现点备货量" v-if="tkdhChannel == '10'">
        <template #default="{ row }">
          <NumberInput
            v-model="row.miniStock"
            @blur="sumTotal()"
          />
        </template>
      </el-table-column>
      <el-table-column
        key="insideReserveStock"
        label="小程序预定备货量"
        prop="insideReserveStock"
         v-if="tkdhChannel == '10'"
      >
        <template #default="{ row }">
          <NumberInput
            v-model="row.insideReserveStock"
            @blur="sumTotal()"
          />
        </template>
      </el-table-column>
      <el-table-column
        key="tfsLastWeekMeituanConsume"
        label="美团同期售卖量"
        prop="tfsLastWeekMeituanConsume"
         v-if="tkdhChannel == '10'"
      >
      </el-table-column>

      <el-table-column
        key="meituanStock"
        label="美团备货量"
        prop="meituanStock"
         v-if="tkdhChannel == '10'"
      >
        <template #default="{ row }">
          <NumberInput
            v-model="row.meituanStock"
            @blur="sumTotal()"
          />
        </template>
      </el-table-column>

      <el-table-column
        key="tfsLastWeekElemeConsume"
        label="饿了么同期售卖量"
        prop="tfsLastWeekElemeConsume"
         v-if="tkdhChannel == '10'"
      >
      </el-table-column>

      <el-table-column
        key="elemeStock"
        label="饿了么备货量"
        prop="elemeStock"
         v-if="tkdhChannel == '10'"
      >
        <template #default="{ row }">
          <NumberInput
            v-model="row.elemeStock"
            @blur="sumTotal()"
          />
        </template>
      </el-table-column>

      <el-table-column
         prop="tfsYesterdayResidue"
        label="今日剩余库存"
        key="tfsYesterdayResidue"
      >
      </el-table-column>
      
      <el-table-column
        v-if="tkdhChannel != '10'"
        key="outsideStock"
        label="端外备货量"
      >
        <template
          #default="{ row }"
          class="action-cell"
        >
          <el-input
            v-model="row.outsideStock"
            onkeyup="return value=value.replace(/^(0+)|[^\d]+/g, '')"
            :min="0"
          ></el-input>
        </template>
      </el-table-column>

    </BasePageTable>
  </div>
</template>

<script>
import BasePageTable from "@/components/BasePageTable.vue";
import { getTargetUserList } from "@/utils/data-getter";
import { defineComponent } from "vue";
import { getSaleDate, genStockList } from "../common";
export default defineComponent({
  components: {
    BasePageTable,
  },
  data() {
    return {
      countNum: 0,
      isWarning: false,
      tkdhRatio: "",
      mtRatio: "",
      elmRatio: "",
      height: window.innerHeight - 400,
      loading: false,
      tkdhId: "",
      date: this.$day(new Date(Date.now() + 86400000 * 2)).format("YYYY-MM-DD"),
      tkdhRemark: "",
      hasReadOnly: true,
      heatPointId: "",
      mealsOptions: [],
      current: {},
      tableData: [],
      tableSkuData: [],
      targetOptions: [],
      targetValue: ["100044", "100043"],
      tkdhChannel: "10",
      portOptions: [
        // { label: "饿了么", value: "08" },
        // { label: "小程序", value: "01" },
        // { label: "美团", value: "02" },
        { label: "小程序+美团+饿了么", value: "10" },
        { label: "市场活动", value: "03" },
        // { label: "市场活动", value: "03" },
        { label: "质检留样", value: "04" },
        { label: "其他", value: "05" },
      ],
    };
  },
  async created() {
    this.getHeatPoint();
    getTargetUserList().then((data) => {
      this.targetOptions = data;
    });
    this.tkdhId = this.$route.query.tkdhId;
    if (this.tkdhId) {
      this.hasReadOnly = false;
      this.heatPointId = this.$route.query.heatPointId;
      this.tableSkuData = [];
      await this.getSkuListbyId();
      this.getSkuList();
    }
  },
  methods: {
    disabledDate(d) {
      return d < getSaleDate(1);
    },
    getTomorrowTimes() {
      return this.$day().add(1, "day").startOf("day").valueOf();
    },
    dateChange(val) {
      if (this.getTomorrowTimes() === val.valueOf()) {
        this.$msgbox({
          title: "提示",
          message: "备货选择明天,需要生成“补生产单”",
          showCancelButton: false,
          confirmButtonText: "确定",
        });
      }
      this.getSkuList();
    },
    sumTotal() {
      this.countNum = 0;
      this.tableSkuData.forEach((row) => {
        this.countNum +=
          Number(row.miniStock) +
          Number(row.insideReserveStock) +
          Number(row.meituanStock) +
          Number(row.elemeStock);
      });
    },
    /**按比例调整计算备货量 */
    computeStockForRadio(type) {
      const Ratio =
        type == "tkdhRatio"
          ? Number(this.tkdhRatio)
          : type == "mtRatio"
          ? Number(this.mtRatio)
          : Number(this.elmRatio);
      const { tableSkuData } = this;

      if (Ratio === 0) {
        tableSkuData.forEach((row) => {
          if (type == "tkdhRatio") {
            //小程序
            row.miniStock = row.tfsLastWeekMiniConsume; //现点
            row.insideReserveStock = row.tfsLastWeekReserve; //预订
          } else if (type == "mtRatio") {
            //美团
            row.meituanStock = row.tfsLastWeekMeituanConsume;
          } else {
            // 饿了么
            row.elemeStock = row.tfsLastWeekElemeConsume;
          }
        });
      }

      if (Ratio > 0) {
        const radio = 1 + Ratio / 100;
        tableSkuData.forEach((row) => {
          if (type == "tkdhRatio") {
            row.miniStock = Math.ceil(
              Number(row.tfsLastWeekMiniConsume) * radio
            );
            row.insideReserveStock = Math.ceil(
              Number(row.tfsLastWeekReserve) * radio
            );
          } else if (type == "mtRatio") {
            //美团
            row.meituanStock = Math.ceil(row.tfsLastWeekMeituanConsume * radio);
          } else {
            // 饿了么
            row.elemeStock = Math.ceil(row.tfsLastWeekElemeConsume * radio);
          }
        });
      }

      if (Ratio < 0) {
        tableSkuData.forEach((row) => {
          const radio = (100 + Ratio) / 100;
          if (type == "tkdhRatio") {
            row.miniStock = Math.ceil(row.tfsLastWeekMiniConsume * radio);
            row.insideReserveStock = Math.ceil(row.tfsLastWeekReserve * radio);
          } else if (type == "mtRatio") {
            //美团
            row.meituanStock = Math.ceil(row.tfsLastWeekMeituanConsume * radio);
          } else {
            // 饿了么
            row.elemeStock = Math.ceil(row.tfsLastWeekElemeConsume * radio);
          }
        });
      }
    },
    tableRowClassName({ row }) {
      let Anum = (
        Number(row.tfsLastWeekMiniConsume) +
        Number(row.insideReserveStock) +
        (Number(row.tfsLastWeekMiniConsume) + Number(row.insideReserveStock)) *
          0.3
      ).toFixed(0);

      let warnimg =
        Number(row.miniStock) + Number(row.insideReserveStock) > Number(Anum)
          ? true
          : false; // 当日菜品备货量（现点备货量+预定备货量）与上周同期相比，如果总备货量超过30%则提示预警
      if (row.isBreakage == 1 || warnimg) {
        if (warnimg) {
          row.isWarning = true;
        } else {
          row.isWarning = false;
        }
        return "warning-row";
      } else {
        row.isWarning = false;
      }
      return "";
    },
    targetValueChange() {
      if (!this.heatPointId) return;

      const stockRecords = this.tableSkuData
        .filter((it) => it.miniStock > 0)
        .map((it) => ({
          tfsCid: it.tfsCid,
          miniStock: it.miniStock,
        }));

      this.getSkuList().then(() => {
        this.tableSkuData.forEach((it) => {
          const record = stockRecords.find((rd) => rd.tfsCid === it.tfsCid);
          if (record) {
            it.miniStock = record.miniStock;
          }
        });
      });
    },
    async getHeatPoint() {
      const res = await this.$request("HeatingPoint/queryEnabledHeat");
      if (!res.data.errMsg) {
        this.mealsOptions = [].concat(res.data.obj.heatVos);
      }
    },
    async getSkuList() {
      if (!this.heatPointId) {
        this.tableSkuData = [];
        return;
      }
      const params = {
        heatPointId: this.heatPointId,
        date: this.date,
        type: "06",
        target: this.targetValue.join(","),
      };
      const res = (
        await this.$request("OrderStockHist/getStockSkuListByHpId", params)
      ).data;

      if (res.errCode === 0) {
        const tkdhContent = this.tkdhContent; // 编辑时已存在的上次备货记录

        const mapper = tkdhContent
          ? (item) => {
              item.miniStock = 0;
              item.insideReserveStock = 0;
              item.meituanStock = 0;
              item.elemeStock = 0;
              const stock = tkdhContent.find((st) => st.tfsCid === item.tfsCid); // 找到sku对应之前的记录
              if (stock) {
                
                // 有上次备货记录的sku重新设置备货量字段
                item.miniStock = stock.miniStock
                  ? stock.miniStock
                  : item.miniStock;
                item.insideReserveStock = stock.insideReserveStock
                  ? stock.insideReserveStock
                  : item.insideReserveStock;
                item.meituanStock = stock.meituanStock
                  ? stock.meituanStock
                  : item.meituanStock;
                item.elemeStock = stock.elemeStock
                  ? stock.elemeStock
                  : item.elemeStock;              
                  item.outsideStock = stock.outsideStock?stock.outsideStock:item.outsideStock
              }

              return item;
            }
          : (item) => ({
              outsideStock: "",
              miniStock: "",
              insideReserveStock: "",
              ...item,
            });
        this.tableSkuData = res.obj.skuInfoVos.map(mapper);
        if (!this.tkdhId) {
          this.computeStockForRadio("tkdhRatio");
          this.computeStockForRadio("mtRatio");
          this.computeStockForRadio("elmRatio");
        }
      } else {
        this.$message.error(res.errMsg);
      }
      this.sumTotal();
      // if (this.tkdhId) {
      //   this.getSkuListbyId()
      // }
    },
    async getSkuListbyId() {
      const res = await this.$request("OrderStockHist/getStockHistById", {
        tkdhId: this.tkdhId,
        type: "06",
        tkdhTarget: this.targetValue.join(","),
      });
      const { obj } = res.data;
      if (!res.data.errMsg) {
        this.date = this.$day(obj.tkdhStockDate).format("YYYY-MM-DD");
        this.tkdhRemark = obj.tkdhRemark;
        this.tkdhChannel = obj.tkdhChannel == "00" ? "" : obj.tkdhChannel;
        // this.tkdhRatio = obj.tkdhRatio;
        this.tkdhContent = obj.tkdhContent;

        if (obj.tkdhTarget) {
          this.targetValue = obj.tkdhTarget.split(",");
        }
      }
      // return !res.data.errMsg ? obj.tkdhContent : []
    },
    confirm() {
      if (!this.tkdhChannel) {
        this.$msg("请选择一个用途", "error");
        return;
      }
      if (this.tkdhChannel == "05" && !this.tkdhRemark) {
        this.$msg("请填写备注信息", "error");
        return;
      }

      if (this.tkdhChannel == "10") {
        const params = this.tableSkuData.filter(
          (item) => item.miniStock && Number(item.miniStock) >= 0
        ); // 过滤出输入了值的项
        if (params.length <= 0) {
          this.$msg("请输入至少一项有效的备货信息", "error");
          return;
        }
        // 判断是否有一项备货未填或者为0
        const valid = this.tableSkuData.some(
          (i) =>
            !i.miniStock ||
            Number(i.miniStock) <= 0 ||
            !i.insideReserveStock ||
            Number(i.insideReserveStock) <= 0 ||
            !i.meituanStock ||
            Number(i.meituanStock) <= 0 ||
            !i.elemeStock ||
            Number(i.elemeStock) <= 0
        );
        if (valid) {
          this.$confirm("备货项尚有一项备货为0, 是否保存？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }).then(this.updateStockHist);
          return;
        }
      } else {
        const params = this.tableSkuData.filter(
          (item) => item.outsideStock && item.outsideStock >= 0
        ); // 过滤出输入了值的项
        if (params.length <= 0) {
          this.$msg("请输入至少一项有效的备货信息", "error");
          return;
        }
      }
      this.updateStockHist();
    },
    updateStockHist() {
      this.loading = true;
      const params = genStockList(
        this.tableSkuData,
        this.tkdhChannel == "10"
          ? ["miniStock", "insideReserveStock", "meituanStock", "elemeStock"]
          : ["outsideStock"]
      );

      this.$request("OrderStockHist/updateStockHist", {
        tkdhId: this.tkdhId,
        date: this.date,
        tkdhHpid: this.heatPointId,
        tkdhRemark: this.tkdhRemark,
        tkdhChannel: this.tkdhChannel,
        // tkdhRatio: this.tkdhRatio,
        stockList: params,
        tkdhTarget: this.targetValue.join(","),
        type: "06",
      }).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({ type: "success", message: "添加成功" });
            this.$router.go(-1);
          } else {
            this.$message({ type: "error", message: err.errMsg });
            this.loading = false;
          }
        })
      );
    },
  },
});
</script>
<style>
.warning-row {
  color: red !important;
}
</style>
<style lang="less" scoped>
:deep(.red > .el-input__inner) {
  color: red;
}

.row {
  margin: 12px 0;
}
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.txt {
  width: 250px;
}
.food-cover {
  max-height: 100%;
  max-width: 100%;
}
.el-form-item {
  padding: 0;
}
</style>
