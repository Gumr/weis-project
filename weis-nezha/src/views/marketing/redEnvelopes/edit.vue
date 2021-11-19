<template>
  <div class="page-container">
    <h2>基础信息</h2>

    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>名称：
      </span>
      <el-input
        v-model="formData.tname"
        class="medium-input"
        maxlength="11"
      ></el-input>
    </div>
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>面额：
      </span>
      <el-input
        v-model="formData.amount"
        class="medium-input"
        maxlength="11"
        @blur="checkText('amount')"
      ></el-input>元
    </div>
    <div class="section-item">
      <span class="section-label label-1">使用金额门槛（选填）：</span>
      <NumberInput
        v-model="formData.restrictAmount"
        class="medium-input"
        mode="digit"
        :precision="2"
      />元
    </div>
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>红包有效期：
      </span>
      <el-input
        v-model="formData.indate"
        class="medium-input"
        maxlength="11"
        @blur="checkText('indate')"
      ></el-input>天
    </div>
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>红包简介：
      </span>
      <el-input
        v-model="formData.intro"
        class="medium-input"
        type="textarea"
        :rows="6"
      ></el-input>
    </div>
    <footer class="inline-center">
      <el-button
        type="primary"
        @click="confirmClick"
      >确认</el-button>
      <el-button @click="cancelClick">取消</el-button>
    </footer>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

export default defineComponent({
  components: {
    ConfirmDialog,
  },
  data() {
    return {
      id: "",
      skuDialog: false,
      prizeTypeOptions: [{ value: "01", label: "现金券" }],
      skuList: [],
      skuSelection: [],
      useTypes: [
        { value: "00", label: "普通券" },
        { value: "02", label: "菜品门槛券" },
      ],
      formData: {
        tname: "",
        amount: "",
        restrictAmount: "",
        indate: "",
        intro: "",
        type: "",
      },
      skuInfoCols: [
        { type: "index", label: "序号", width: 80, align: "center" },
        {
          label: "菜品编码",
          prop: "skuCid",
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
      skuCols: [
        {
          label: "选择",
          type: "selection",
        },
        {
          label: "菜品编码",
          prop: "skuCid",
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
    };
  },
  created() {
    this.tid = this.$route.query.tid;
    // this.getTypeOptions()
    if (this.tid) {
     this.formData = JSON.parse(this.$route.query.row)
    }
  },
  methods: {
    deleteSkuInfoClick(index) {
      this.formData.skuInfo.splice(index, 1);
    },
    async selectSkuClick() {
      if (this.skuList.length <= 0) {
        await this.queryCouponSysInfo();
      }
      // this.skuSelection = [...]
      this.skuDialog = true;
      this.$nextTick(() => {
        const { skuInfo } = this.formData;
        const skuList = this.skuList.filter(
          (item) =>
            Array.isArray(skuInfo) &&
            skuInfo.findIndex((it) => it.skuCid === item.skuCid) !== -1
        );
        this.$refs.table.setSelection(skuList);
      });
    },
    handleSkuDialogConfirm() {
      this.formData.skuInfo = this.skuSelection;
    },
    queryCouponSysInfo() {
      return this.$request("coupon.Coupon/queryCouponSysInfo", {
        pageNo: 1,
        pageSize: 999,
      }).thenwrap((err, data) => {
        if (!err) {
          this.skuList = data.record;
        }
      });
    },
    async getTypeOptions() {
      const res = await this.$http("coupon.Coupon/getStateInfo", {});
      this.prizeTypeOptions = res.obj.coupontype;
    },
    checkText(type) {
      let number = this.formData[type];
      const tofixed = type == 'amount' ? 2 : 0
      number = isNaN(number) ? "" : Math.abs(Number(number).toFixed(tofixed));
      if (type == "tcsAmount") {
        number = number == 0 ? "" : number;
      }
      this.formData[type] = number;
    },
    async getInfo() {
      const res = await this.$http("coupon.Coupon/getCouponInfo", {
        tcsId: this.$route.query.tid,
      });
      Object.assign(this.formData, res.obj);
      this.formData.skuInfo = res.obj.couponSys;
      this.formData.useType = res.obj.tcsUseType;
      this.formData.tcsOrderThreshold =
        res.obj.tcsOrderThreshold == "00" ? 0 : 1;
    },
    async confirmClick() {
      if (!this.formData.tname) {
        this.$msg("请输入红包名称", "error");
        return;
      }
      if (!this.formData.amount) {
        this.$msg("请输入红包面额", "error");
        return;
      }
      if (this.formData.indate === "") {
        this.$msg("请输入有效期", "error");
        return;
      }
      if (!this.formData.intro) {
        this.$msg("请输入红包简介", "error");
        return;
      }
      // if (this.formData.useType === "02" && this.formData.skuInfo.length <= 0) {
      //   this.$msg("请至少选择一个菜品", "error");
      //   return;
      // }
      // if (this.formData.tcsType == '02' && (this.formData.tcsRestrictAmount <= this.formData.tcsAmount)) {
      //   this.$msg('使用门槛必须大于面额', 'error')
      //   return
      // }
      const params = this.$deepClone(this.formData);
      params.tid = this.tid ? this.tid : undefined;

      // params.skuInfo =
      //   params.useType === "02" ? params.skuInfo.map((item) => item.skuId) : [];

      // params.tcsRestrictAmount = this.formData.tcsType == '01' ? Number(params.tcsAmount) + 0.01 : params.tcsRestrictAmount
      const url = this.tid
        ? "redpacket.Template/editTemplate"
        : "redpacket.Template/addTemplate";
      const res = await this.$http(url, params);

      if (!res.errMsg) {
        this.$msg("操作成功", "success");
        this.$closeRoute();
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    cancelClick() {
      this.$confirm("确认取消添加红包吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.$closeRoute();
      });
    },
  },
});
</script>

<style scoped>
.medium-input {
  width: 250px;
}
.mrg-tp-12 {
  margin-top: 12px;
}
.self-start {
  align-self: flex-start;
}
</style>
