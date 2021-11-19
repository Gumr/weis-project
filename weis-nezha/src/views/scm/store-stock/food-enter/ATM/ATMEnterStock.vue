<template>
  <div class="page-container">
    <el-row
      type="flex"
      class="row"
    >
      <el-col :span="8">
        <span>ATM名称：</span>
        <BaseSelect
          v-model="heatPointId"
          clearable
          class="txt"
          :options="mealsOptions"
          @change="getATMFoodList"
          :disabled="!hasReadOnly"
        ></BaseSelect>
        <!-- " -->
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
          @change="getATMFoodList"
           :disabled="type == 'edit' || type == 'detail'?true:false"
        ></el-date-picker>
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
          :disabled="type == 'detail'?true:false"   
        ></el-input>
      </el-col>
      <!-- <el-col :span="8">
        <span>浮动值：</span>
        <NumberInput
          v-model="tkdhRatio"
          style="width: 160px"
          :unsigned="false"
          :precision="3"
          @blur="computeStockForRadio"
        />
        <span>%</span> -->
      <!-- </el-col> -->
      <el-col :span="8">
        <el-button
          type="primary"
          :loading="loading"
          style="margin-left: 20px"
          @click="confirm"
          v-if="type != 'detail'"
        >保存</el-button>
      </el-col>
    </el-row>

    <BasePageTable
      ref="sku"
      :height="height"
      :data="tableSkuData"
      :row-class-name="tableRowClassName"
      :visible="false"
      border
    >
      <el-table-column
        key="index"
        label="序号"
        type="index"
        width="80px"
      ></el-table-column>
      <el-table-column
        key="tfsSkuname"
        label="机器名称"
        prop="machineName"
      ></el-table-column>
      <el-table-column
        key="tfsCid"
        label="货道编号"
        prop="aisleCode"
      ></el-table-column>
      <el-table-column
        key="aisleCapacity"
        label="货道最大容量"
        prop="aisleCapacity"
      >
      </el-table-column>
      <el-table-column
        key="tfsPrice"
        label="商品名称"
        prop="tfsSkuname"
      ></el-table-column>
      <el-table-column
        key="tfsPrice"
        label="商品编码"
        prop="tfsCid"
      ></el-table-column>
      <el-table-column
        key="tfsPrice"
        label="单价"
        prop="tfsPrice"
      ></el-table-column>

      <el-table-column
        key="aisleStock"
        label="备货量"
        prop="insideReserveStock"
      >
        <template #default="{ row }">

          <NumberInput
            v-model="row.insideReserveStock"
            :disabled="type == 'detail'?true:false"         
          />
        </template>
      </el-table-column>
      <!-- <el-table-column
        label="上周同期售卖数据"
        prop="lastWeekConsume"
      ></el-table-column>
      <el-table-column
        label="已知预定量"
        prop="todayReserve"
      ></el-table-column> -->
    </BasePageTable>
  </div>
</template>

<script>
import BasePageTable from "@/components/BasePageTable.vue";
import { getTargetUserList } from "@/utils/data-getter";
import { defineComponent } from "vue";
import { genStockList } from "/src/views/scm/store-stock/common";
export default defineComponent({
  name: "scm_store-stock_food-enter_ATM_ATMEnterStock",
  components: {
    BasePageTable,
  },
  data() {
    return {
      type:'',
      tkdhRatio: "",
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
      tkdhChannel: "01",
      portOptions: [
        { label: "饿了么", value: "08" },
        { label: "小程序", value: "01" },
        { label: "美团", value: "02" },
        { label: "市场活动", value: "03" },
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
      // await this.getSkuListbyId();
      this.getSkuList();
    }
    this.type = this.$route.query.type
  },
  methods: {
    async getATMFoodList() {
      const res = await this.$request("OrderStockHist/getATMFoodList", {
        heatPointId: this.heatPointId,
        date: this.date,
      });
      // debugger
      if (!res.data.errMsg) {
        this.tableSkuData = res.data.obj;
        this.tableSkuData.forEach((row) => {
          row.insideReserveStock = row.aisleCapacity;
        });
      } else {
        this.$message({ type: "error", message: res.data.errMsg });
      }
    },

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
          row.insideReserveStock = row.insideReserveStock;
        });
      }

      if (tkdhRatio > 0) {
        const radio = 1 + tkdhRatio / 100;
        tableSkuData.forEach((row) => {
          row.insideReserveStock = Math.ceil(row.insideReserveStock * radio);
        });
      }

      if (tkdhRatio < 0) {
        tableSkuData.forEach((row) => {
          const radio = (100 + tkdhRatio) / 100;

          row.insideReserveStock = Math.ceil(row.insideReserveStock * radio);
        });
      }
    },
    tableRowClassName({ row }) {
      if (Number(row.insideReserveStock) > Number(row.capacity)) {
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
            it.insideReserveStock = record.insideReserveStock;
          }
        });
      });
    },
    async getHeatPoint() {
      let params = {
        shopType: "20",
      };
      const res = await this.$request(
        "HeatingPoint/queryHeatingPointList",
        params
      );
      if (!res.data.errMsg) {
        this.mealsOptions = [].concat(res.data.obj);
      }
    },
    async getSkuList() {                               
      if (!this.heatPointId) {
        this.tableSkuData = [];
        return;
      }
      const params = {
        tkdhId: this.tkdhId,
      };
      const res = await this.$request(
        "OrderStockHist/getMachineStockHistById",
        params
      );

      if (res.data.errCode === 0) {
        const tkdhContent = this.tkdhContent; // 编辑时已存在的上次备货记录
       
        this.tkdhRemark = res.data.obj.tkdhRemark;
        // const mapper = tkdhContent
        //   ? (item) => {
        //       item.insideReserveStock = 0;
        //       const stock = tkdhContent.find((st) => st.tfsCid === item.tfsCid); // 找到sku对应之前的记录
        //       if (stock) {
        //         // 有上次备货记录的sku重新设置备货量字段
        //         item.insideReserveStock = stock.insideReserveStock
        //           ? stock.insideReserveStock
        //           : item.insideReserveStock;
        //       }

        //       return item;
        //     }
        //   : (item) => ({
        //       insideReserveStock: "",
        //       ...item,
        //     });
         
        // this.tableSkuData = res.data.obj.stockList.map(mapper);
         this.tableSkuData = res.data.obj.stockList
        if (!this.tkdhId) {
          // this.computeStockForRadio();
        }
      } else {
        this.$message.error(res.errMsg);
      }
    },
    // async getSkuListbyId() {
    //   const res = await this.$request("OrderStockHist/getStockHistById", {
    //     tkdhId: this.tkdhId,
    //     // type: "01",
    //     // tkdhTarget: this.targetValue.join(","),
    //   });
    //   if (!res.data.errMsg) {
      
    //     const { obj } = res.data;
    //     this.date = this.$day(obj.tkdhStockDate).format("YYYY-MM-DD");
    //     this.tkdhRemark = obj.tkdhRemark;
    //     this.tkdhChannel = obj.tkdhChannel == "00" ? "" : obj.tkdhChannel;
    //     this.tkdhRatio = obj.tkdhRatio == "0" ? "" : obj.tkdhRatio;
    //     this.tkdhContent = obj.tkdhContent
    //     if (obj.tkdhTarget && !this.targetValue.length)
    //       this.targetValue = obj.tkdhTarget.split(",");
    //     for (const index in this.tableSkuData) {
    //       this.tableSkuData[index].insideReserveStock = "";
    //       for (const stock of obj.tkdhContent) {
    //         if (this.tableSkuData[index].tfsCid == stock.tfsCid) {
    //           this.tableSkuData[index].outsideStock = stock.outsideStock;
    //           this.tableSkuData[index].insideReserveStock =  stock.insideReserveStock;
    //         }
    //       }
    //     }
    //   }
    // },
    confirm() {
      if (this.tkdhChannel == "05" && !this.tkdhRemark) {
        this.$msg("请填写备注信息", "error");
        return;
      }
      if (this.tkdhChannel == "01") {
        const params = this.tableSkuData.filter(
          (item) => item.insideReserveStock && item.insideReserveStock >= 0
        ); // 过滤出输入了值的项
        if (params.length <= 0) {
          this.$msg("请输入至少一项有效的备货信息", "error");
          return;
        }
        const valid = this.tableSkuData.some(
          (i) => !i.insideReserveStock || i.insideReserveStock <= 0
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
        this.tkdhChannel == "01"
          ? ["machineCode", "insideReserveStock","aisleCode"]
          : ["outsideStock"]
      );
      this.$request("OrderStockHist/updateMachineStockHist", {
        tkdhId: this.tkdhId?this.tkdhId:'',
        date: this.date,
        tkdhHpid: this.heatPointId,
        tkdhRemark: this.tkdhRemark,
        // tkdhChannel: this.tkdhChannel,
        // tkdhRatio: this.tkdhRatio,
        stockList: params,
        // tkdhTarget: this.targetValue.join(","),
        // type: "06",
      })
        .then(
          this.$rw((err) => {
            if (!err) {
              this.$message({ type: "success", message: "成功" });
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
