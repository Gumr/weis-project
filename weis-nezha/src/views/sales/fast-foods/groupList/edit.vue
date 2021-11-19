<template>
  <div class="page-container">
    <section>
      <div class="section-item">
        <span class="section-label label-1">套餐名称：</span>
        <el-input
          v-model="comboName"
          clearable
          class="medium-input"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">套餐分类:</span>
        <el-select
          v-model="classify"
          class="medium-input"
          placeholder="请选择"
        >
          <el-option
            label="基础套餐"
            value="01"
          ></el-option>
          <el-option
            label="定制套餐"
            value="02"
          ></el-option>
        </el-select>
      </div>
      <div class="section-item">
        <span class="section-label label-1">套餐类型：</span>
        <BaseSelect
          v-model="category"
          class="medium-input"
          :options="setMealCategoryOptions"
          :props="{ label: 'tgccName', value: 'tgccId' }"
        ></BaseSelect>
      </div>
      <div class="section-item">
        <span class="section-label label-1">售卖时间：</span>
        <el-date-picker
          v-model="tgcSaleTime"
          type="daterange"
          start-placeholder="售卖开始日期"
          end-placeholder="售卖结束日期"
        ></el-date-picker>
      </div>
      <div class="section-item">
        <span class="section-label label-1">套餐菜品：</span>
        <el-button
          type="primary"
          @click="showDialog"
        >选择菜品</el-button>
      </div>
      <div class="section-item">
        <span class="section-label label-1"></span>
        <BasePageTable
          height="600"
          :data="tableData"
          :visible="false"
          border
        >
          <el-table-column
            v-for="col in tableCol"
            :key="col.prop"
            v-bind="col"
          ></el-table-column>

          <el-table-column
            label="供应时间"
            align="center"
            width="420px"
          >
            <template
              #default="{ row }"
              class="action-cell"
            >
              <el-date-picker
                clearable
                type="date"
                style="width: 180px;"
                v-model="row.tfsSalestime"
              ></el-date-picker> --
              <el-date-picker
                clearable
                type="date"
                style="width: 180px;"
                v-model="row.tfsSaleetime"
              ></el-date-picker>
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            align="center"
            width="120px"
          >
            <template
              #default="{ row }"
              class="action-cell"
            >
              <span
                class="brand-color cursor-pointer action-label"
                @click="remove(row)"
              >移除</span>
            </template>
          </el-table-column>
        </BasePageTable>
      </div>
      <div
        v-if="tableData.length"
        class="section-item"
      >
        <h3>营养素合计</h3>
        <span class="section-label label-1">热量：</span>
        <span> {{ tfsEnergy }} kcal</span>
        <span class="section-label label-1">蛋白质：</span>
        <span> {{ tfsProtein }} g,{{PotainA}}%</span>
        <span class="section-label label-1">碳水：</span>
        <span> {{ tfsCarbonwater }}g，{{PotainB}}% </span>
        <span class="section-label label-1">脂肪：</span>
        <span> {{ tfsFat }} g,{{PotainC}}%</span>
        <span class="section-label label-1">盐量</span>
        <span> {{ tfsSalt }} g</span>
        <span class="section-label label-1">膳食纤维：</span>
        <span> {{ tfsFiber }} g</span>

        <span class="section-label label-1">菜品数量：</span>
        <span> * {{ dishTotal }}</span>

        <span class="section-label label-1">菜品总价：</span>
        <span>{{ priceTotal }} 元</span>

      </div>
      <div class="section-item">
        <span class="section-label label-1">套餐价格：</span>
        <el-input
          v-model="comboPrice"
          clearable
          class="medium-input"
          @blur="checkText2"
        ></el-input>元
      </div>
      <div class="section-item">
        <span class="section-label label-1">套餐图片（选填）：</span>
        <UploadImage v-model="comboImg" />
      </div>
      <div class="section-item">
        <span class="section-label label-1">适用人群：</span>
        <el-checkbox-group v-model="apply">
          <el-checkbox
            v-for="it in userTargetOptions"
            :key="it.value"
            :label="it.value"
          >{{ it.label }}</el-checkbox>
        </el-checkbox-group>
      </div>

      <div class="section-item">
        <span class="section-label label-1">编码（选填）：</span>
        <el-input
          v-model="comboCode"
          placeholder="输入编码"
          style="width: 200px"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">营养小贴士（选填）</span>
        <el-input
          v-model="nutritionTips"
          style="width: 400px"
          type="textarea"
          :rows="4"
          placeholder="营养小贴士"
        />
      </div>
    </section>
    <footer class="btn-footer">
      <el-button
        type="primary"
        :loading="loading"
        @click="submit"
      >确认</el-button>

      <el-button
        @click="submit('commit')"
        v-if="type=='00'"
        :loading="loading"
        type="primary"
      >提交</el-button>

      <el-button @click="cancel">取消</el-button>

    </footer>
    <ConfirmDialog
      v-model="hasDialog"
      title="选择菜品"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <BasePageTable
        ref="dishTable"
        height="600"
        empty-text="当前没有可关联菜品，请先到erp系统新建一款菜品"
        :visible="false"
        :data="dishData"
        border
      >
        <el-table-column
          v-for="col in dishTable"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column
          label="数量"
          align="center"
        >
          <template
            #default="{ row }"
            class="action-cell"
          >
            <el-input
              v-model="row.tfsNum"
              @keydown="catchNonNumberKeydown"
              @blur="checkText(row)"
            ></el-input>
          </template>
        </el-table-column>
      </BasePageTable>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from "@/components/BasePageTable.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { transformDaterange } from "@/utils/transform";
import {
  catchNonIntKeydown,
  catchNonNumberKeydown,
} from "@/utils/event-catcher";
import UploadImage from "@/components/UploadImage";
import { getTargetUserList, getSetMealTypeOptions } from "@/utils/data-getter";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    BasePageTable,
    UploadImage,
    ConfirmDialog,
  },
  data() {
    return {
      PotainA: 0,
      PotainB: 0,
      PotainC: 0,
      tfsEnergy: 0, //菜品能量
      tfsCarbonwater: 0, //碳水
      tfsProtein: 0, //蛋白质
      tfsFat: 0, //脂肪
      tfsSalt: 0, //盐含量
      tfsFiber: 0, //膳食纤维

      loading: false,
      hasDialog: false,
      tableData: [],
      dishTotal: 0,
      priceTotal: 0,
      tgcSaleTime: [],
      comboCode: "",
      category: "",
      setMealCategoryOptions: [],
      tableCol: [
        { label: "序号", type: "index", width: "80" },
        { label: "菜品编码", prop: "tfsCid", width: "120" },
        { label: "菜品名称", prop: "tfsSkuname", width: "120" },
        { label: "菜品单价", prop: "tfsPrice", width: "120" },
        { label: "营养素", prop: "nutrient", width: "120" },
        { label: "数量", prop: "tfsNum", width: "120" },
        { label: "销售状态", prop: "tfsSttDesc", width: "120" },
      ],
      dishData: [],
      dishTable: [
        { label: "序号", type: "index" },
        { label: "菜品编码", prop: "tfsCid" },
        { label: "菜品名称", prop: "tfsSkuname" },
        { label: "菜品单价", prop: "tfsPrice" },
        { label: "营养素", prop: "nutrient" },
        { label: "最近售卖时间", prop: "tfsSaleetime" },
        { label: "销售状态", prop: "tfsSttDesc" },
      ],
      tgcId: "",
      comboName: "",
      classify: "",
      comboPrice: "",
      comboImg: "", // 套餐图片 <br>
      apply: [], // 适用人群 <br>
      nutritionTips: "", // 营养小贴士 <br>
      userTargetOptions: [],
      skuInfo: [],
      type: "",
    };
  },
  async created() {
    const { tgcId, corpId, type } = this.$route.query;
    this.tgcId = tgcId;
    this.corpId = corpId;
    this.type = type;

    getTargetUserList().then((data) => {
      this.userTargetOptions = data;
    });

    try {
      if (tgcId && status !== "create") {
        await this.getInfo();
      }
    } finally {
      this.queryComboCategoryList();
    }
  },
  methods: {
    catchNonNumberKeydown,
    catchNonIntKeydown,
    queryComboCategoryList() {
      getSetMealTypeOptions().then((data) => {
        this.setMealCategoryOptions = data;
      });
    },
    checkText(row) {
      row.tfsNum = isNaN(row.tfsNum) ? 0 : row.tfsNum;
      row.tfsNum = Number(Math.abs(row.tfsNum)).toFixed(0);
      row.tfsNum = row.tfsNum == 0 ? "" : row.tfsNum;
    },
    checkText2() {
      this.comboPrice = isNaN(this.comboPrice) ? 0 : this.comboPrice;
      this.comboPrice = Number(Math.abs(this.comboPrice)).toFixed(2);
    },
    showDialog() {
      this.hasDialog = true;
      this.getList();
    },
    computedPrice() {
      this.dishTotal = 0;
      this.priceTotal = 0;

      (this.tfsEnergy = 0), //菜品能量
        (this.tfsCarbonwater = 0), //碳水
        (this.tfsProtein = 0), //蛋白质
        (this.tfsFat = 0), //脂肪
        (this.tfsSalt = 0), //盐含量
        (this.tfsFiber = 0), //膳食纤维
        (this.PotainA = 0),
        (this.PotainB = 0),
        (this.PotainC = 0),
        this.tableData.forEach((item) => {
          
          this.dishTotal += Number(item.tfsNum);
          this.priceTotal += Number(item.tfsNum) * Number(item.tfsPrice);
          (this.tfsEnergy += Number(item.tfsEnergy) * Number(item.tfsNum)), //菜品能量
        
            (this.tfsCarbonwater +=
              Number(item.tfsCarbonwater) * Number(item.tfsNum)); //碳水
          this.tfsProtein += Number(item.tfsProtein) * Number(item.tfsNum); //蛋白质
          this.tfsFat += Number(item.tfsFat) * Number(item.tfsNum); //脂肪
          this.tfsSalt += Number(item.tfsSalt) * Number(item.tfsNum); //盐含量
          this.tfsFiber += Number(item.tfsFiber) * Number(item.tfsNum); //膳食纤维
        });
      this.priceTotal = this.priceTotal.toFixed(2);
      this.tfsEnergy = this.tfsEnergy.toFixed(2); //菜品能量
      this.tfsCarbonwater = this.tfsCarbonwater.toFixed(2); //碳水
      this.tfsProtein = this.tfsProtein.toFixed(2); //蛋白质
      this.tfsFat = this.tfsFat.toFixed(2); //脂肪
      this.tfsSalt = this.tfsSalt.toFixed(2); //盐含量
      this.tfsFiber = this.tfsFiber.toFixed(2); //膳食纤维


        this.PotainA = (((this.tfsProtein *4) /this.tfsEnergy)*100).toFixed(2);
        this.PotainB = (((this.tfsCarbonwater *4) /this.tfsEnergy)*100).toFixed(2);
        this.PotainC = (((this.tfsFat *9) /this.tfsEnergy)*100).toFixed(2);

    },
    async getInfo() {
      const res = await this.$http("groupmeal.Combo/queryComboById", {
        tgcId: this.tgcId,
      });

      this.comboName = res.obj.tgcName;
      this.classify = res.obj.tgcClassify;
      this.comboPrice = res.obj.tgcAmount;
      this.tableData = res.obj.skuInfo;
      this.comboImg = res.obj.tgcImgUrl ? res.obj.tgcImgUrl[0].imgUrl : "";
      (this.apply =
        res.obj.tgcCrowd.length > 0
          ? res.obj.tgcCrowd.map((item) => {
              return item + "";
            })
          : []),
        (this.nutritionTips = res.obj.tgcRemark);

      this.category = res.obj.tgcCategoryId;
      const { tgcSaleTime } = res.obj;
      this.tgcSaleTime = tgcSaleTime
        ? tgcSaleTime
            .split("-")
            .map((d) => d && new Date(this.$day(d).valueOf()))
        : "";
      this.comboCode = res.obj.tgcCode;
      this.computedPrice();
    },
    async getList() {
      const res = await this.$http("dietician.Combo/queryLibrarySku", {});
      if (!res.err) {
        this.dishData = res.obj;
        this.dishData.forEach((item) => {
          item.tfsNum = "";
        });
        this.tableData.forEach((item) => {
          this.dishData.forEach((child) => {
            if (item.tfsCid == child.tfsCid) {
              child.tfsNum = item.tfsNum;
            }
          });
        });
        this.$nt(() => {
          this.$refs.dishTable.doLayout();
        });
      }
    },
    onconfirm() {
      const data = this.dishData.filter(
        (item) => item.tfsNum && item.tfsNum > 0
      );
      if (!data.length) {
        this.$msg("请输入菜品数量", "error");
        return;
      }
      let sellBeginDates = "";
      let sellEndDates = "";
      if (this.tgcSaleTime && this.tgcSaleTime.filter(Boolean).length > 0) {
        const [sellBeginDate, sellEndDate] = transformDaterange(
          this.tgcSaleTime
        );
        sellBeginDates = sellBeginDate.format("YYYYMMDD");
        sellEndDates = sellEndDate.format("YYYYMMDD");
      }

      data.map((item, index) => {
        if (item.tfsStt == "70" || item.tfsStt == "50") {
          item.tfsSalestime = sellBeginDates;
          item.tfsSaleetime = sellEndDates;
        } else {
          item.tfsSalestime = item.tfsSalestime;
          item.tfsSaleetime = item.tfsSaleetime;
        }
      });
      this.tableData = [];
      this.tableData = data;
      this.computedPrice();
      this.hasDialog = false;
    },
    remove(row) {
      this.tableData = this.tableData.filter(
        (item) => item.tfsCid != row.tfsCid
      );
      this.computedPrice();
    },
    cancel() {
      this.$confirm("确认取消？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      }).then(() => {
        this.$closeRoute();
      });
    },
    submit(type) {
      if (!this.comboName) {
        this.$msg("请输入套餐名称", "error");
        return;
      }
      if (!this.classify) {
        this.$msg("请选择套餐分类", "error");
        return;
      }
      // if (!this.comboPrice) {
      //   this.$msg("请输入金额", "error");
      //   return;
      // }
      if (!this.tableData.length) {
        this.$msg("请选择菜品", "error");
        return;
      }
      if (!this.comboPrice || this.comboPrice == 0) {
        this.$msg("套餐价格不为0", "error");
        return;
      }
      if (!this.apply.length) {
        this.$msg("请选择适用人群", "error");
        return;
      }
      if (!this.category) {
        this.$msg("请选择套餐类型", "error");
        return;
      }
      this.$confirm("确认以上信息并提交？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      }).then(() => {
        this.handleSubmit(type);
      });
    },
    async handleSubmit(type) {
      this.loading = true;
      this.type;
      const params = {
        category: this.category,
        comboName: this.comboName,
        comboPrice: this.comboPrice,
        classify: this.classify,
        comboImg: this.comboImg,
        apply: this.apply,
        nutritionTips: this.nutritionTips,
        comboCode: this.comboCode,
        opType:
          type == "commit"
            ? 20
            : this.type == "00" && this.tgcId
            ? 40
            : this.type == "01" && this.tgcId
            ? 30
            : 10, //10:存草稿, 20:提交, 30:编辑 40 草稿箱保存
        comboId: this.tgcId ? this.tgcId : undefined,
      };
      let comboSkuInfo = [...this.tableData];
      comboSkuInfo.map((item, index) => {
        item.skuCid = item.tfsCid;
        item.skuNum = item.tfsNum;
        item.sellBeginDate = this.$day(item.tfsSalestime).format("YYYYMMDD");
        item.sellEndDate = this.$day(item.tfsSaleetime).format("YYYYMMDD");
      });

      params.comboSkuInfo = comboSkuInfo;
      if (this.tgcSaleTime && this.tgcSaleTime.filter(Boolean).length > 0) {
        const [sellBeginDate, sellEndDate] = transformDaterange(
          this.tgcSaleTime
        );
        params.sellBeginDate = sellBeginDate.format("YYYY-MM-DD");
        params.sellEndDate = sellEndDate.format("YYYY-MM-DD");
      }
      delete params.date;
      try {
        const res = await this.$http("dietician.Combo/opCombo", params);

        if (!res.errMsg) {
          this.$msg("成功", "success");
          this.$closeRoute();
        } else {
          this.$msg(res.errMsg, "error");
        }
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>

<style lang="less" scoped>
.label-1 {
  width: 100px;
  margin-right: 12px;
  text-align: right;
}
</style>
