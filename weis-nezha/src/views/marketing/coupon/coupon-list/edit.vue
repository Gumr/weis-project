<template>
  <div class="page-container">
    <h2>基础信息</h2>
    <div class="section-item">
      <span class="section-label label-1 self-start">
        <span style="color:red">*</span>券类型：
      </span>
      <div>
        <div>
          <BaseSelect
            v-model="formData.tcsType"
            class="medium-input"
            filterable
            clearable
            :options="prizeTypeOptions"
            disabled
          ></BaseSelect>
        </div>
        <div class="mrg-tp-12">
          <BaseSelect
            v-model="formData.useType"
            class="medium-input"
            filterable
            :options="useTypes"
          ></BaseSelect>
        </div>
      </div>
    </div>
    <!-- <div v-if="formData.tcsType == '02'" class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>使用门槛：
      </span>
      <el-input
        v-model="formData.tcsRestrictAmount"
        class="medium-input"
        maxlength="11"
        @blur="checkText('tcsRestrictAmount')"
      ></el-input>元
    </div>-->
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>券模板名称：
      </span>
      <el-input
        v-model="formData.tcsName"
        class="medium-input"
        maxlength="11"
      ></el-input>
    </div>
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>券模板面额：
      </span>
      <el-input
        v-model="formData.tcsAmount"
        class="medium-input"
        maxlength="11"
        @blur="checkText('tcsAmount')"
      ></el-input>元
    </div>
    <div class="section-item">
      <span class="section-label label-1">适用点餐门槛:</span>
      <el-radio-group v-model="formData.tcsOrderThreshold">
        <el-radio :label="0">无门槛</el-radio>
        <el-radio :label="1">只能预订</el-radio>
      </el-radio-group>
    </div>
    <div class="section-item">
      <span class="section-label label-1">使用金额门槛（选填）：</span>
      <NumberInput
        v-model="formData.tcsRestrictAmount"
        class="medium-input"
        mode="digit"
        :precision="2"
      />元
    </div>
    <div
      v-if="formData.useType === '02'"
      class="section-item"
    >
      <span class="section-label label-1 self-start">
        <span style="color:red">*</span>指定菜品：
      </span>
      <div>
        <el-button @click="selectSkuClick">选择菜品</el-button>
        <el-table
          class="mrg-tp-12"
          :data="formData.skuInfo"
          border
          stripe
        >
          <el-table-column
            v-for="col in skuInfoCols"
            v-bind="col"
            :key="col.label"
          ></el-table-column>
          <el-table-column
            label="操作"
            align="center"
          >
            <template #default="{ $index }">
              <span
                class="table-action-label"
                @click="deleteSkuInfoClick($index)"
              >删除</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>输入券模板有效期：
      </span>
      <el-input
        v-model="formData.tcsPeriodValid"
        class="medium-input"
        maxlength="11"
        @blur="checkText('tcsPeriodValid')"
      ></el-input>天
    </div>
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>券模板简介：
      </span>
      <el-input
        v-model="formData.tcsIntro"
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
  <ConfirmDialog
    v-model="skuDialog"
    title="选择菜品"
    @on-confirm="handleSkuDialogConfirm"
  >
    <BasePageTable
      ref="table"
      v-model:selection="skuSelection"
      max-height="500px"
      :data="skuList"
      border
      stripe
      :visible="false"
    >
      <el-table-column
        v-for="col in skuCols"
        :key="col.label"
        v-bind="col"
      ></el-table-column>
    </BasePageTable>
    <h2 class="mrg-tp-12">已选数量：{{ skuSelection.length }}</h2>
  </ConfirmDialog>
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
        tcsType: "01",
        useType: "00", // 02 菜品券 00 普通券
        // tcsRestrictAmount: '',
        tcsName: "",
        tcsAmount: "",
        tcsRestrictAmount: "", // 使用门槛金额 0则无门槛
        skuInfo: [], // 菜品列表
        tcsPeriodValid: "",
        tcsIntro: "",
        tcsOrderThreshold: 0,
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
    this.id = this.$route.query.id;
    // this.getTypeOptions()
    if (this.id) {
      this.getInfo();
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
      // const tofixed = type == 'tcsRestrictAmount' ? 2 : 0
      number = isNaN(number) ? "" : Math.abs(Number(number).toFixed(0));
      if (type == "tcsAmount") {
        number = number == 0 ? "" : number;
      }
      this.formData[type] = number;
    },
    async getInfo() {
      const res = await this.$http("coupon.Coupon/getCouponInfo", {
        tcsId: this.$route.query.id,
      });
      Object.assign(this.formData, res.obj);
      this.formData.skuInfo = res.obj.couponSys;
      this.formData.useType = res.obj.tcsUseType;
      this.formData.tcsOrderThreshold = res.obj.tcsOrderThreshold == '00'?0:1
    },
    async confirmClick() {
      if (!this.formData.tcsName) {
        this.$msg("请输入券模板名称", "error");
        return;
      }
      if (!this.formData.tcsAmount) {
        this.$msg("请输入券模板面额", "error");
        return;
      }
      if (this.formData.tcsPeriodValid === "") {
        this.$msg("请输入有效期", "error");
        return;
      }
      if (!this.formData.tcsIntro) {
        this.$msg("请输入券模板简介", "error");
        return;
      }
      if (this.formData.useType === "02" && this.formData.skuInfo.length <= 0) {
        this.$msg("请至少选择一个菜品", "error");
        return;
      }
      // if (this.formData.tcsType == '02' && (this.formData.tcsRestrictAmount <= this.formData.tcsAmount)) {
      //   this.$msg('使用门槛必须大于面额', 'error')
      //   return
      // }
      const params = this.$deepClone(this.formData);
      params.tcsOrderThreshold =  params.tcsOrderThreshold == 0 ? '00': '01'

      

      params.skuInfo =
        params.useType === "02" ? params.skuInfo.map((item) => item.skuId) : [];

      // params.tcsRestrictAmount = this.formData.tcsType == '01' ? Number(params.tcsAmount) + 0.01 : params.tcsRestrictAmount
      const url = this.id
        ? "coupon.Coupon/couponEdit"
        : "coupon.Coupon/addCoupon";
      const res = await this.$http(url, params);

      if (!res.errMsg) {
        this.$msg("操作成功", "success");
        this.$closeRoute();
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    cancelClick() {
      this.$confirm("确认取消添加券模板吗？", "提示", {
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
