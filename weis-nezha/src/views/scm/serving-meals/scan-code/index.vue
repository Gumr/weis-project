<template>
  <div class="page-container">
    <h1 class="page-header">二维码取餐</h1>
    <div class="display-flex scan-code-input-box">
      <el-input
        ref="input"
        v-model="code"
        placeholder="请输入取餐订单号"
        clearable
        @keyup="scanCodeKeyup"
      ></el-input>
      <el-button
        type="primary"
        icon="el-icon-search"
        @click="scanCodeConfirm"
      ></el-button>
    </div>
    <!-- <el-dialog
      :title="dialog.title"
      @close="HandleCodeDialogClose"
      v-model="dialog.visible"
      :close-on-click-modal="false"
    >
      <div class="order-title inline-center">
        <div v-if="order.orderStt === '05'">
          确认自取餐号为<span class="meal-code-text">{{
            order.takeMealCode
          }}</span
          >的订单吗?
        </div>
        <div v-else-if="order.orderStt === '10'">
          自取餐号为<span class="meal-code-text">{{ order.takeMealCode }}</span
          >的订单已经取餐
        </div>
        <div v-else>
          取餐号<span class="meal-code-text">{{ order.takeMealCode }}</span
          >订单状态：{{ orderStatusToLabel(order.orderStt) }}
        </div>
      </div>
      <p class="take-food-section-label">订单详情</p>
      <p class="take-food-section-label">取餐人昵称：{{ order.uname }}</p>
      <p class="take-food-section-label">手机：{{ order.contactNumber }}</p>
      <p class="take-food-section-label">餐别：{{ order.category }}</p>
      <div class="display-flex">
        <p class="take-food-section-label" style="margin-top: 0;">菜品：</p>
        <div>
          <div
            class="sku-item"
            v-for="sku in order.skuInfoList"
            :key="sku.label"
          >
            <span>{{ sku.label }}</span>
            <span style="margin: 0 2px">x</span>
            <span class="sku-item-total">{{ sku.value }}</span>
          </div>
        </div>
      </div>

      <template
        v-slot:footer
        v-if="order.orderStt === '05' || order.orderStt === '01'"
      >
        <div class="inline-center">
          <el-button type="success" @click="multioperationClick"
            >打印并取餐</el-button
          >
        </div>
      </template>
    </el-dialog>-->
  </div>
</template>

<script>
import CreateOneFormPage from "@/utils/pushPrint.js";

const OrderStatusMap = {
  "00": "未支付",
  "01": "已支付",
  "02": "处理中",
  "03": "已退款",
  "04": "已结算",
  "05": "待配送/待取餐",
  "06": "配送中",
  10: "已签收",
  14: "已确认收货",
  99: "已删除",
};

function convCode(code) {
  return code.replace(/#([0-9]{2})/g, (match) =>
    String.fromCharCode(match.slice(1))
  );
}

export default {
  name: "servingMeals_scan-code",
  data() {
    return {
      subStt:'',
      order: {},
      dialog: {
        title: "",
        visible: false,
      },
      code: "",
      scanCodeList: [],
    };
  },
  watch: {
    // eslint-disable-next-line
    "dialog.visible": function (visible) {
      if (!visible) {
        this.code = "";
        this.$nt(() => {
          this.input.focus();
        });
      }
    },
  },
  mounted() {
    this.input = this.$refs.input;
    this.input.focus();
  },
  methods: {
    async multioperationClick() {
      if (this.taking) {
        this.$message({
          type: "warning",
          message: "打印与取餐正在进行中请稍后再试",
        });
        return;
      }
      this.taking = true;

      const failer = () => {
        this.taking = false;
        this.code = "";
        this.input.focus();
      };

      try {
        await this.takeFoodClick();
      
        if (this.subStt && this.subStt == '00') {
           this.subStt=''
           await this.printOrderClick();

        }
       
        failer();
      } catch {
        failer();
      }
    },
   
    orderStatusToLabel(status) {
      return OrderStatusMap[status];
    },
    HandleCodeDialogClose() {
      this.dialog.visible = false;
    },
    scanCodeKeyup(evt) {
      clearTimeout(this.confirmTimer);
      if (evt.keyCode === 13 || (evt.keyCode === 229 && evt.code === "Enter")) {
        this.confirmTimer = setTimeout(this.scanCodeConfirm, 300);
      }
    },
    async comfirmTicket(shipOid ) {
       const res = await this.$http("orderprint.PrintNotice/comfirmTicket",{shipOid:shipOid});
    },
    printOrderClick() {
      return this.getOrderData().then(
        // data => printOrder(data);
        (data) => {
          CreateOneFormPage(data[0])        
         this.comfirmTicket(data[0].deliveredNum)
        }
      );
    },
    getOrderData() {
      return this.$request("ServeMealsOperation/orderData", {
        orderid: [this.order.$code],
        type: "00",
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            return res.res;
          }

          return Promise.reject(err);
        })
      );
    },
    scanCodeConfirm() {
      this.code = this.code.trim();

      if (this.code.length <= 0) {
        this.$message({
          type: "error",
          message: "请输入配送单号",
        });
        return;
      }
      const code = this.code.includes("#") ? convCode(this.code) : this.code;
      this.order.$code = code;
      // this.getScanCodeData(code).then((data) => {
      //   data.$code = code;
      //   this.order = data;

      // }).catch((err) => {
      //   this.code = '';
      //   this.$errorNotify(err);
      // });
      this.input.blur();
      this.multioperationClick();
    },
    getScanCodeData(orderNo = this.code) {
      return this.$request("ServeMealsOperation/queryOrderSelfTakeInfo", {
        orderNo,
      }).then(this.$rw((err, data) => (err ? Promise.reject(err) : data)));
    },
    takeFoodClick() {
      return this.$request("ServeMealsOperation/orderStt", {
        orderId: this.order.$code,
      }).then(
        this.$rw((err, res) => {
          if (err) {
            // this.$errorNotify(err);
            // return Promise.reject(err);
           
            this.$message({
              dangerouslyUseHTMLString: true,
              type: "error",
              message: `<h1>${err.errMsg}</h1>`,
            });
            return;
          }
          this.subStt = res.subStt
          return this.$message({
            dangerouslyUseHTMLString: true,
            type: "success",
            message: `取餐码:<br/><h1>${res.resMsg}</h1><h2>${res.subSttStr}</h2>`,
          });
        })
      );
    },
  },
};
</script>

<style lang="less" scoped>
.page-header {
  text-align: center;
}
.scan-code-input-box {
  margin: 0 10%;
}

.sku-item {
  font-size: 18px;
  margin-bottom: 12px;
}

.order-title {
  font-size: 20px;
}

.meal-code-text {
  color: #ff5959;
  font-size: 18px;
  margin: 0 4px;
}

.sku-item-total {
  font-weight: bold;
  color: #1890ff;
}

.take-food-section-label {
  margin-left: 120px;
}

.hide-input {
  opacity: 0;
  // visibility: hidden;
  width: 0;
  height: 0;
}
// .text-align-center {
//   text-align: center;
// }
</style>
