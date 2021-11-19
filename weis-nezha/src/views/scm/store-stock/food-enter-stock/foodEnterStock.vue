<template>
  <div class="page-container">
    <el-row
      type="flex"
      class="row"
    >
      <el-col :span="8">
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
      <el-col :span="8">
        <span>备货售卖时间：</span>
        <el-date-picker
          v-model="date"
          class="txt"
          value-format="yyyy-MM-dd"
          :clearable="false"
          :editable="false"
          :disabled-date="disabledDate"
          @change="dateChange"
          disabled
        ></el-date-picker>
      </el-col>
    </el-row>
    <el-row
      type="flex"
      class="row"
    >
      <el-col
        :span="8"
        class="display-flex flex-items-center"
      >
        <span>用户人群：</span>
        <el-checkbox-group v-model="targetValue">
          <el-checkbox
            v-for="it in targetOptions"
            :key="it.label"
            :label="it.value"
          >{{ it.label }}</el-checkbox>
        </el-checkbox-group>
      </el-col>
      <el-col :span="8">
        <span>备货用途：</span>
        <BaseSelect
          v-model="tkdhChannel"
          class="txt"
          :options="portOptions"
          @change="getSkuList"
        ></BaseSelect>
      </el-col>
    </el-row>
    <el-row
      type="flex"
      class="row"
    >
      <el-col :span="8">
        <span>备注：</span>
        <el-input
          v-model="tkdhRemark"
          class="txt"
        ></el-input>
      </el-col>
      <el-col :span="8">
        <span>同比上周调整：</span>
        <NumberInput
          v-model="tkdhRatio"
          style="width: 160px"
          :unsigned="false"
          :precision="3"
          @blur="computeStockForRadio"
        />
        <span>%</span>
      </el-col>
      <el-col :span="8">
        <el-button
          type="primary"
          :loading="loading"
          style="margin-left: 20px"
          @click="confirm"
        >保存</el-button>
      </el-col>
    </el-row>
    <!-- <el-form :model="current" label-width="100px" style="width: 100%;">
        <el-form-item label="供餐点筛选">
          <BaseSelect
            clearable
            class="txt"
            v-model="heatPointId"
            :options="mealsOptions"
            :disabled="!hasReadOnly"
            @change="getSkuList"
          ></BaseSelect>
        </el-form-item>
        <el-form-item label="备货使用时间">
          <el-date-picker
            v-model="date"
            class="txt"
            value-format="yyyy-MM-dd"
            :disabled="!hasReadOnly"
            @change="getSkuList"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="备货用途">
          <BaseSelect
            clearable
            class="txt"
            v-model="tkdhChannel"
            :options="portOptions"
            @change="changePort"
          ></BaseSelect>
        </el-form-item>
        <el-form-item label="备注"></el-form-item>
    </el-form>-->
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
        key="tfsSkuname"
        label="小程序现点备货量"
        prop="tfsMiniStockTotal"
      ></el-table-column>
      <el-table-column
        key="tfsSkuname"
        label="小程序预订备货量"
        prop="tfsReserveStockTotal"
      ></el-table-column>
      <el-table-column
        key="tfsSkuname"
        label="美团备货量"
        prop="tfsMeituanStockTotal"
      ></el-table-column>
      <el-table-column
        key="tfsSkuname"
        label="饿了么备货量"
        prop="tfsElemeStockTotal"
      ></el-table-column>
      <el-table-column
        v-if="tkdhChannel != '10'"
        key="increaseRate"
        label="上周同比增长率"
        prop="increaseRate"
      >
        <template
          #default="{ row }"
          class="action-cell"
        >
          <span>{{ row.increaseRate ? row.increaseRate + '%' : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="tkdhChannel != '10'"
        key="increase"
        label="建议备货量"
        prop="increase"
      >
        <template
          #default="{ row }"
          class="action-cell"
        >
          <span>{{ row.increase || '无' }}</span>
        </template>
      </el-table-column>

      <el-table-column
        v-if="tkdhChannel == '10'"
        key="insideStock"
        label="补备货量"
        prop="insideStock"
      >
        <template #default="{ row }">
          <NumberInput v-model="row.insideStock" />
        </template>
      </el-table-column>
      <!-- <el-table-column v-if="tkdhChannel == '01'" key="insideReserveStock" label="预定单备货量" prop="insideReserveStock">
        <template #default="{row}">
          <NumberInput
            :key="Number(row.insideReserveStock) < Number(row.tfsTodayReserve) ? 'red' : ''"
            v-model="row.insideReserveStock"
            :class="Number(row.insideReserveStock) < Number(row.tfsTodayReserve) ? 'red' : ''"
          />
        </template>
      </el-table-column>-->
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
      <!-- <el-table-column v-if="tkdhChannel == '01'" label="已知预定量" prop="tfsTodayReserve"></el-table-column> -->
      <!-- <el-table-column
        label="今日端内消耗"
        prop="tfsTodayConsume"
        key="tfsTodayConsume"
        v-if="tkdhChannel == '01'"
      ></el-table-column>
      <el-table-column
        label="今日端内剩余"
        prop="tfsTodayResidue"
        key="tfsTodayResidue"
        v-if="tkdhChannel == '01'"
      ></el-table-column>
      <el-table-column label="端内备货量" key="insideStock" v-if="tkdhChannel == '01'">
        <template class="action-cell" v-slot="{ row }">
          <el-input
            v-model="row.insideStock"
            onkeyup="return value=value.replace(/^(0+)|[^\d]+/g, '')"
            :min="0"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column label="端外备货量" key="outsideStock" v-if="tkdhChannel != '01'">
        <template class="action-cell" v-slot="{ row }">
          <el-input
            v-model="row.outsideStock"
            onkeyup="return value=value.replace(/^(0+)|[^\d]+/g, '')"
            :min="0"
          ></el-input>
        </template>
      </el-table-column>-->
      <!-- <el-table-column key="tfsShelfLife" label="保质期" prop="tfsShelfLife"></el-table-column> -->
    </BasePageTable>
  </div>
</template>

<script>
import BasePageTable from "@/components/BasePageTable.vue";
import { getTargetUserList } from "@/utils/data-getter";
import { defineComponent } from "vue";
import { genStockList } from "../common";
export default defineComponent({
  name: "scm_store-stock__food-enter-stock_foodEnterStock",
  components: {
    BasePageTable,
  },
  data() {
    return {
      tkdhRatio: "",
      height: window.innerHeight - 400,
      loading: false,
      tkdhId: "",
      date: this.$day(Date.now() + 86400000).format("YYYY-MM-DD"),
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
        // { label: '饿了么', value: '08' },
        { label: "小程序+美团+饿了么", value: "10" },
        // { label: '美团', value: '02' },
        { label: "市场活动", value: "03" },
        { label: "质检留样", value: "04" },
        { label: "其他", value: "05" },
      ],
    };
  },
  created() {
    this.getHeatPoint();
    getTargetUserList().then((data) => {
      this.targetOptions = data;
    });
    this.tkdhId = this.$route.query.tkdhId;
    if (this.tkdhId) {
      this.hasReadOnly = false;
      this.heatPointId = this.$route.query.heatPointId;
      this.tableSkuData = [];
      this.getSkuList();
    }
  },
  methods: {
    disabledDate(d) {
      return d < Date.now();
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
    computeStockForRadio() {
      const tkdhRatio = Number(this.tkdhRatio);

      const { tableSkuData } = this;

      if (tkdhRatio === 0) {
        tableSkuData.forEach((row) => {
          row.insideStock = row.tfsLastWeekConsume;
          row.insideReserveStock = row.tfsLastWeekReserve;
        });
      }

      if (tkdhRatio > 0) {
        const radio = 1 + tkdhRatio / 100;
        tableSkuData.forEach((row) => {
          row.insideStock = Math.ceil(row.tfsLastWeekConsume * radio);
          row.insideReserveStock = Math.ceil(row.tfsLastWeekReserve * radio);
        });
      }

      if (tkdhRatio < 0) {
        tableSkuData.forEach((row) => {
          const radio = (100 + tkdhRatio) / 100;
          row.insideStock = Math.ceil(row.tfsLastWeekConsume * radio);
          row.insideReserveStock = Math.ceil(row.tfsLastWeekReserve * radio);
        });
      }
    },
    tableRowClassName({ row }) {
      if (row.isBreakage == 1) {
        return "warning-row";
      }
      return "";
    },
    targetValueChange() {
      if (!this.heatPointId) return;

      const stockRecords = this.tableSkuData
        .filter((it) => it.insideStock > 0)
        .map((it) => ({
          tfsCid: it.tfsCid,
          insideStock: it.insideStock,
        }));

      this.getSkuList().then(() => {
        this.tableSkuData.forEach((it) => {
          const record = stockRecords.find((rd) => rd.tfsCid === it.tfsCid);
          if (record) {
            it.insideStock = record.insideStock;
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
        type: "01",
        target: this.targetValue.join(","),
      };
      const res = await this.$request(
        "OrderStockHist/getStockSkuListByHpId",
        params
      );
      if (!res.data.errMsg) {
        this.tableSkuData = res.data.obj.skuInfoVos.map((item) => ({
          outsideStock: "",
          insideStock: "",
          insideReserveStock: "",
          ...item,
        }));
        this.computeStockForRadio();
      }
      this.$nt(() => {
        this.$refs.sku.doLayout();
      });
      if (this.tkdhId) {
        this.getSkuListbyId();
      }
    },
    async getSkuListbyId() {
      const res = await this.$request("OrderStockHist/getStockHistById", {
        tkdhId: this.tkdhId,
        type: "01",
        tkdhTarget: this.targetValue.join(","),
      });
      if (!res.data.errMsg) {
        const { obj } = res.data;
        this.date = this.$day(obj.tkdhStockDate).format("YYYY-MM-DD");
        this.tkdhRemark = obj.tkdhRemark;
        this.tkdhChannel = obj.tkdhChannel == "00" ? "" : obj.tkdhChannel;
        this.tkdhRatio = obj.tkdhRatio;
        if (obj.tkdhTarget && !this.targetValue.length)
          this.targetValue = obj.tkdhTarget.split(",");
        for (const index in this.tableSkuData) {
          this.tableSkuData[index].insideStock = "";
          this.tableSkuData[index].insideReserveStock = "";
          for (const stock of obj.tkdhContent) {
            if (this.tableSkuData[index].tfsCid == stock.tfsCid) {
              this.tableSkuData[index].insideStock = stock.insideStock;
              this.tableSkuData[index].outsideStock = stock.outsideStock;
              // this.tableSkuData[index].insideReserveStock = ''
            }
          }
        }
      }
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
          (item) => item.insideStock && item.insideStock >= 0
        ); // 过滤出输入了值的项
        if (params.length <= 0) {
          this.$msg("请输入至少一项有效的备货信息", "error");
          return;
        }

        const valid = this.tableSkuData.some(
          (i) => !i.insideStock || i.insideStock <= 0
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
        this.tkdhChannel == "10" ? ["insideStock"] : ["outsideStock"]
      );

      this.$request("OrderStockHist/updateStockHist", {
        tkdhId: this.tkdhId,
        date: this.date,
        tkdhHpid: this.heatPointId,
        tkdhRemark: this.tkdhRemark,
        tkdhChannel: this.tkdhChannel,
        tkdhRatio: this.tkdhRatio,
        stockList: params,
        tkdhTarget: this.targetValue.join(","),
        type: "01",
      })
        .then(
          this.$rw((err) => {
            if (!err) {
              this.$message({ type: "success", message: "添加成功" });
              // this.$pushRoute('/scm/store-stock/food-enter')
              this.$router.back();
            } else {
              this.$message({ type: "error", message: err.errMsg });
            }
          })
        )
        .finally(() => {
          this.loading = false;
        });
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
