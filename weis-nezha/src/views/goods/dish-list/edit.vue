<template>
  <div class="page-container">
    <section>
      <h3>基础信息</h3>
      <div
        v-if="!tfsId"
        class="section-item"
      >
        <span class="section-label label-1">选择菜品：</span>
        <el-button
          type="primary"
          @click="showDialog"
        >选择菜品</el-button>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品名称：</span>
        <el-input
          v-model="formData.tfsSkuname"
          clearable
          class="medium-input"
        ></el-input>
        <!-- <span>{{ }}</span> -->
        <!-- <el-button
          v-if="tfsId"
          style="margin-left: 10px"
          type="primary"
          @click="refresh"
        >刷新</el-button> -->
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品编码：</span>
        <span>{{ formData.tfsCid }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>菜品规格：
        </span>
        <el-input
          v-model="formData.tfsQuality"
          style="width: 80px"
        ></el-input>
        <el-select
          v-model="formData.tfsUnit"
          class="medium-select"
        >
          <el-option
            v-for="item in unitOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
    </section>
    <!-- 成分信息 -->
    <section>
      <h3>成分信息</h3>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>蛋白质：
        </span>
        <el-input
          v-model="formData.tfsProtein"
          clearable
          class="medium-input"
          placeholder="精确到小数点后一位"
          @blur="checkText('tfsProtein')"
        ></el-input>g
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>脂肪：
        </span>
        <el-input
          v-model="formData.tfsFat"
          clearable
          class="medium-input"
          placeholder="精确到小数点后一位"
          @blur="checkText('tfsFat')"
        ></el-input>g
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>碳水化合物：
        </span>
        <el-input
          v-model="formData.tfsCarbonwater"
          clearable
          class="medium-input"
          placeholder="精确到小数点后一位"
          @blur="checkText('tfsCarbonwater')"
        ></el-input>g
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>烹饪用盐：
        </span>
        <el-input
          v-model="formData.tfsSalt"
          clearable
          class="medium-input"
          placeholder="精确到小数点后一位"
          @blur="checkText('tfsSalt')"
        ></el-input>g
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>菜品能量：
        </span>
        <el-input
          v-model="formData.tfsEnergy"
          clearable
          class="medium-input"
          placeholder="请输入整数"
          @blur="checkText('tfsEnergy')"
        ></el-input>Kcal
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>膳食纤维
        </span>
        <el-input
          v-model="formData.tfsFiber"
          clearable
          class="medium-input"
          placeholder="请输入整数"
          @blur="checkText('tfsFiber')"
        ></el-input>g
      </div>
    </section>
    <!-- 小程序上架类目 -->
    <section>
      <h3>小程序上架类目</h3>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>菜品类目：
        </span>
        <el-select
          v-model="catalogF"
          @change="selectChange($event, 'catalogF')"
        >
          <el-option
            v-for="item in formData.skuPreVo.catalogF"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>营养素类目：
        </span>
        <el-select
          v-model="catalogV"
          class="small-select"
          @change="selectChange($event, 'catalogV')"
        >
          <el-option
            v-for="item in formData.skuPreVo.catalogV"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>

      <!-- <div class="section-item">
        <span class="section-label label-1"><span style="color:red">*</span>是否需要生产：</span>
        <el-radio-group v-model="formData.tfsNeedProd">
          <el-radio label="01">需要</el-radio>
          <el-radio label="00">不需要</el-radio>
        </el-radio-group>
      </div>-->
    </section>
    <!-- 描述 -->
    <section>
      <h3>描述</h3>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>菜品建议/描述：
        </span>
        <el-input
          v-model="formData.tfsSuggestedIntroduce"
          clearable
          class="medium-input"
          type="textarea"
          :rows="4"
          placeholder="描述"
        ></el-input>
      </div>
    </section>
    <section>
      <h3>菜品配料</h3>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>菜品配料：
        </span>
        <el-input
          v-model="formData.tfsDosing"
          clearable
          class="medium-input"
          type="textarea"
          :rows="4"
          placeholder="菜品配料"
        ></el-input>
      </div>
    </section>
    <!-- 菜品标签 -->
    <section>
      <h3>菜品标签</h3>

      <!-- 多选按钮 -->
      <div
        v-for="(item, index) in labelVosCheckBox"
        :key="index + 'checkbox'"
        class="section-item"
      >
        <span
          class="section-label label-1"
          :class="item.integer === 1 ? 'bold-label' : ''"
        >
          <span
            v-if="item.required"
            style="color: red"
          >*</span>
          {{ item.label }}：
        </span>
        <el-checkbox
          v-for="(child, inx) in item.tList"
          :key="inx"
          v-model="child.check"
        >{{ child.label }}</el-checkbox>
      </div>
      <!-- 单选按钮 -->
      <div
        v-for="(item, index) in labelVosRadio"
        :key="index + 'radio'"
        class="section-item"
      >
        <span class="section-label label-1">{{ item.label }}：</span>
        <el-radio-group
          v-model="lbRadio[index]"
          @change="radioChange($event, item, index)"
        >
          <el-radio
            v-for="(child, inx) in item.kvos"
            :key="inx"
            :label="child.value"
          >{{ child.label }}</el-radio>
        </el-radio-group>

      </div>
      <div class="section-item">
        <span class="section-label label-1 bold-label">
          <span style="color: red">*</span>保质期：
        </span>
        <NumberInput
          v-model="formData.tfsShelfLife"
          clearable
          class="medium-input"
          placeholder="请输入保质期"
        />天
      </div>
    </section>
    <section>
      <h3>食材</h3>
      <div class="section-item">
        <span class="section-label label-1">（必填）食材：</span>
        <div>
          <div>
            <el-button
              size="small"
              type="primary"
              @click="selectIngredientClick"
            >选择食材</el-button>
          </div>
          <div style="margin-top: 12px">
            已选：
            <el-tag
              v-for="(item, index) in ingredientSelection"
              :key="index"
              class="ing-tag"
              type="priamry"
            >{{ item.label }}</el-tag>
          </div>
        </div>
      </div>
    </section>
    <!-- 推荐算法 -->
    <section>
      <h3>推荐算法</h3>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>主供营养素：
        </span>
        <el-checkbox
          v-for="(item, index) in formData.skuPreVo.locationsVos"
          :key="index"
          v-model="item.check"
        >{{ item.label }}</el-checkbox>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>算法分类：
        </span>
        <el-select
          v-model="skuTagVos"
          class="small-select"
          @change="selectChange($event, 'skuTagVos')"
        >
          <el-option
            v-for="item in formData.skuPreVo.skuTagVos"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>是否参与算法：
        </span>
        <el-select
          v-model="formData.tfsJoinArithmetic"
          class="small-select"
        >
          <el-option
            v-for="item in joinArithmeticList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
    </section>
    <!-- 建议上架类别 -->
    <section>
      <h3>建议上架类别</h3>

      <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>上架餐别：
        </span>
        <el-checkbox
          v-for="(item, index) in formData.skuPreVo.categroyVos"
          :key="index"
          v-model="item.check"
        >{{ item.label }}</el-checkbox>
      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">
          <span style="color: red">*</span>菜品建议上架端口：
        </span>
        <el-checkbox
          v-for="(item, index) in formData.skuPreVo.openMarketVos"
          :key="index"
          v-model="item.check"
        >{{ item.label }}</el-checkbox>
      </div> -->
    </section>
    <footer class="btn-footer">
      <el-button
        type="primary"
        @click="submit"
      >提交</el-button>
      <!-- <el-button
        type="warning"
        @click="handleSubmit(10)"
      >存为草稿</el-button> -->
      <el-button
        type="danger"
        @click="cancel"
      >取消</el-button>
    </footer>
    <ConfirmDialog
      v-model="ingredient.dialog"
      align="center"
      title="选择食材"
      :close-on-click-modal="false"
      @on-confirm="handleIngredientConfirm"
    >
      <div class="display-flex">
        <div>
          <span>食材名称：</span>
          <el-input
            v-model="ingredient.query"
            class="medium-input"
            clearable
          ></el-input>
        </div>
        <el-button @click="searchIngredientClick">搜索</el-button>
      </div>
      <div
        v-for="item in ingredient.list"
        :key="item.value"
      >
        <p class="ingredient-label">{{ item.label }}：</p>
        <div>
          <el-checkbox
            v-for="tag in item.tList"
            :key="tag.value"
            v-model="tag.check"
            class="ingredient-item"
            @change="(val) => handleIngredientChange(val, tag.value)"
          >{{ tag.label }}</el-checkbox>
        </div>
      </div>
      <!-- <el-table style="margin: 12px 0;" :data="ingredient.list" border stripe>
        <el-table-column v-for="col in ingredient.columns" v-bind="col" :key="col.prop" max-height="600px" align="center">
          <template #default="{row}">
            <div v-if="row[col.prop]">
              <el-checkbox v-model="row[col.prop].check" @change="(val) => handleIngredientChange(val, col.prop, row[col.prop].value)"></el-checkbox>
              <span style="margin-left: 8px">{{ row[col.prop].label }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>-->
      <div>
        已选的：
        <el-tag
          v-for="(item, index) in currentSelectedIngredient"
          :key="index"
          class="ing-tag"
          type="priamry"
        >{{ item.label }}</el-tag>
      </div>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="hasDialog"
      title="选择菜品"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <BasePageTable
        height="600"
        empty-text="当前没有可关联菜品，请先到erp系统新建一款菜品"
        :visible="false"
        :data="tableData"
        :stripe="false"
        highlight-current-row
        border
        @current-page-change="getList"
        @size-change="getList"
        @current-change="handleCurrentChange"
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
      </BasePageTable>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from "@/components/BasePageTable.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import {
  catchNonIntKeydown,
  catchNonNumberKeydown,
} from "@/utils/event-catcher";
import { defineComponent } from "vue";
import { objectForeach } from "@/utils/common";
export default defineComponent({
  components: {
    BasePageTable,
    ConfirmDialog,
  },
  data() {
    return {
    
      joinArithmeticList: [
        {
          label: "参与",
          value: "01",
        },
        {
          label: "不参与",
          value: "00",
        },
      ],
      ingredient: {
        rawList: [],
        list: [],
        query: "",
        dialog: false,
        columns: [],
        selection: [],
      },
      // 基础信息
      tfsId: "",
      formData: {
        tfsJoinArithmetic: "",
        tfsSkuname: "",
        tfsCid: "",
        tfsKingdeeId: "",
        tfsVersion: "",
        tfsQuality: "",
        tfsUnit: "",
        tfsKingdeeUnit: "",
        tfsEnergy: "",
        tfsFiber: "",
        tfsProtein: "",
        tfsFat: "",
        tfsDosing: "",
        tfsCarbonwater: "",
        tfsSalt: "",
        tfsNeedProd: "01",
        tfsShelfLife: "",
        tfsSuggestedIntroduce: "",
        skuPreVo: {
          catalogF: [], // 所属食物分类
          skuTagVos: [], // 算法分类
          catalogV: [], // 建议上架营养素类别
          labelVos: [], // 菜品标签
          categroyVos: [], // 菜品建议上架餐别
          openMarketVos: [], // 菜品上架端口
          locationsVos: [], // 主供营养素
        },
      },
      labelVosRadio: [], // 菜品标签下单选标签
      lbRadio: [], // 单选标签
      labelVosCheckBox: [], // 菜品标签下多选标签
      catalogV: "", // 用户还原下拉框
      catalogF: "",
      skuTagVos: "",
      // 旧菜品信息，用户升级版本
      oldTfsEnergy: "",
      oldTfsProtein: "",
      oldtfsFiber: "",
      oldTfsFat: "",
      oldTfsCarbonwater: "",
      oldTfsSalt: "",
      unitOptions: [],

      // 选择菜品
      hasDialog: false,
      tableData: [],
      currentRow: "",
      tableCol: [
        {
          label: "序号",
          type: "index",
        },
        {
          label: "菜品名称",
          prop: "kingdeeName",
        },
        {
          label: "菜品ID",
          prop: "kingdeeId",
        },
        {
          label: "规格",
          prop: "kingdeeQuality",
        },
      ],
      ingredientSelection: [], // 页面显示选中的食材
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        phone: "",
      },
    };
  },
  computed: {
    currentSelectedIngredient: {
      // 编辑弹窗中选中的食材
      get() {
        const selection = [];
        this.ingredient.rawList.forEach((item) => {
          if (Array.isArray(item.tList)) {
            selection.push(...item.tList.filter((i) => i.check));
          }
        });
        return selection;
      },
      set(values) {
        values = values.map((i) => i.value);
        const { rawList } = this.ingredient;
        rawList.forEach((item) => {
          if (Array.isArray(item.tList)) {
            item.tList.forEach((i) => {
              i.check = values.includes(i.value);
            });
          }
        });
      },
    },
  },
  created() {
    this.tfsId = this.$route.query.tfsId;
    this.getUnit();
    this.getInfo();
  },
  methods: {
    catchNonNumberKeydown,
    catchNonIntKeydown,
    handleIngredientConfirm() {
      this.ingredientSelection = this.currentSelectedIngredient;
    },
    searchIngredientClick() {
      const { rawList, query } = this.ingredient;

      const source = this.$deepClone(rawList);
      if (!query) {
        this.ingredient.list = source;
      } else if (source.length > 0) {
        this.ingredient.list = source.filter((item) => {
          if (Array.isArray(item.tList)) {
            item.tList = item.tList.filter((i) => i.label.includes(query));
          }
          return item.tList.length > 0;
        });
      }
    },
    handleIngredientChange(check, value) {
      row: for (const row of this.ingredient.rawList) {
        for (const item of row.tList) {
          if (item.value === value) {
            item.check = check;
            break row;
          }
        }
      }
      // console.log(this.ingredient.rawList, 'this.ingredient.rawList', value)
      // this.ingredient.rawList[index].tList[itemIndex].check = check
    },
    selectIngredientClick() {
      this.ingredient.dialog = true;
      this.currentSelectedIngredient = this.ingredientSelection;
      this.ingredient.query = "";
      this.ingredient.list = this.$deepClone(this.ingredient.rawList);
      console.log(this.ingredient.list, "this.ingredient.list");
    },
    async getUnit() {
      const res = await this.$http("FoodUnit/getUnitList", {});
      this.unitOptions = res.obj.map((item) => ({
        label: item.tfsName,
        value: item.tfsName,
      }));
    },
    refresh() {
      this.$request("Food/queryKingdeeFoodInfo", {
        cid: this.formData.tfsCid,
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.$message({ type: "success", message: "刷新成功" });
            this.formData.tfsSkuname = dataPage.kingdeeName;
            this.formData.tfsQuality = dataPage.kingdeeQuality;
          } else {
            this.$message({ type: "error", message: err.errMsg });
          }
        })
      );
    },
    selectChange(e, type) {
      this.formData.skuPreVo[type].forEach((item) => {
        item.check = false;
        if (item.value == e) {
          item.check = true;
        }
      });
    },
    radioChange(e, item, index) {
      this.labelVosRadio[index].kvos.forEach((item) => {
        item.check = false;
        if (item.value == e) {
          item.check = true;
        }
      });
    },
    checkText(type) {
      let number = this.formData[type];
      number = isNaN(number)
        ? 0
        : Number(number) < 0
        ? Math.abs(number)
        : Number(number);
      if (type == "tfsEnergy" || type == "tfsShelfLife") {
        number = number.toFixed(0);
      } else {
        number = number.toFixed(1);
      }
      this.formData[type] = number.toString();
      if (type == "tfsShelfLife") {
        this.formData.tfsShelfLife =
          this.formData.tfsShelfLife > 5 ? 5 : this.formData.tfsShelfLife;
      } else if (type != "tfsEnergy") {
        this.formData.tfsEnergy =
          this.formData.tfsProtein * 4 +
          this.formData.tfsFat * 9 +
          this.formData.tfsCarbonwater * 4;
        this.formData.tfsEnergy = this.formData.tfsEnergy.toFixed(0);
      }
    },
    getInfo() {
      const params = {};
      if (this.tfsId) {
        params.tfsId = this.tfsId;
      }
      this.$request("Sku/querySkuDetail", params).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.formData.skuPreVo.catalogF = dataPage.skuPreVo.catalogF; // 所属食物分类
            this.formData.skuPreVo.catalogV = dataPage.skuPreVo.catalogV; // 建议上架营养素类别
            this.formData.skuPreVo.skuTagVos = dataPage.skuPreVo.skuTagVos; // 算法分类
            this.formData.skuPreVo.categroyVos = dataPage.skuPreVo.categroyVos; // 菜品建议上架餐别
            this.formData.skuPreVo.openMarketVos =
              dataPage.skuPreVo.openMarketVos; // 菜品上架端口
            this.formData.skuPreVo.locationsVos =
              dataPage.skuPreVo.locationsVos; // 主供营养素

            const { ingredientVos } = dataPage.skuPreVo;
            // const maxLength = Math.max(...ingredientVos.map(i => i.tList.length))
            // const ingredientList = []
            // for (let i = 0; i < maxLength; i++) {
            //   const item = ingredientVos.reduce((res, curr) => {
            //     res[curr.value] = curr.tList[i]
            //     return res
            //   }, {})
            //   ingredientList.push(item)
            // }
            this.ingredient.list = this.$deepClone(ingredientVos);
            this.ingredient.rawList = ingredientVos;
            this.ingredientSelection = this.currentSelectedIngredient;
            this.ingredient.columns = ingredientVos.map((i) => ({
              label: i.label,
              prop: i.value,
            }));
            // 菜品标签区分单选多选
            dataPage.skuPreVo.labelVos.forEach((item) => {
              if (item.obj == 1) {
                this.labelVosRadio.push(item);
              } else {
                item.required = !item.label.includes("选填");
                this.labelVosCheckBox.push(item);
              }
            });
            this.labelVosCheckBox = this.labelVosCheckBox.sort(
              (a, b) => a.integer - b.integer
            );
            // 编辑
            if (this.tfsId) {
              this.formData.tfsJoinArithmetic = dataPage.skuBean.tfsJoinArithmetic
              this.formData.tfsKingdeeId = dataPage.skuBean.tfsKingdeeId;
              this.formData.tfsSkuname = dataPage.skuBean.tfsSuggestedSkuname;
              this.formData.tfsCid = dataPage.skuBean.tfsCid;
              this.formData.tfsVersion = dataPage.skuBean.tfsVersion;
              this.formData.tfsQuality = dataPage.skuBean.tfsQuality;
              this.formData.tfsUnit = dataPage.skuBean.tfsUnit;
              this.formData.tfsShelfLife = dataPage.skuBean.tfsShelfLife;
              this.formData.tfsNeedProd = dataPage.skuBean.tfsNeedProd;
              this.formData.tfsKingdeeUnit = dataPage.skuBean.tfsKingdeeUnit;
              this.formData.tfsEnergy = dataPage.skuBean.tfsEnergy;
              this.formData.tfsFiber =
                dataPage.skuBean.tfsFiber == 0
                  ? "0.0"
                  : dataPage.skuBean.tfsFiber;
              this.formData.tfsProtein =
                dataPage.skuBean.tfsProtein == 0
                  ? "0.0"
                  : dataPage.skuBean.tfsProtein;
              this.formData.tfsFat =
                dataPage.skuBean.tfsFat == 0 ? "0.0" : dataPage.skuBean.tfsFat;
              this.formData.tfsCarbonwater =
                dataPage.skuBean.tfsCarbonwater == 0
                  ? "0.0"
                  : dataPage.skuBean.tfsCarbonwater;
              this.formData.tfsSalt =
                dataPage.skuBean.tfsSalt == 0
                  ? "0.0"
                  : dataPage.skuBean.tfsSalt;
              this.formData.tfsSuggestedIntroduce =
                dataPage.skuBean.tfsSuggestedIntroduce;
              this.formData.tfsDosing = dataPage.skuBean.tfsDosing;
              // 保存旧信息用于判断是否升级了版本
              this.oldTfsEnergy = dataPage.skuBean.tfsEnergy;
              this.oldTfsProtein = dataPage.skuBean.tfsProtein;
              this.oldtfsFiber = dataPage.skuBean.tfsFiber;
              this.oldTfsFat = dataPage.skuBean.tfsFat;
              this.oldTfsCarbonwater = dataPage.skuBean.tfsCarbonwater;
              this.oldTfsSalt = dataPage.skuBean.tfsSalt;

              // 还原下拉框
              const catalogF = this.formData.skuPreVo.catalogF.find(
                (item) => item.check == true
              );
              this.catalogF = catalogF ? catalogF.value : "";

              const skuTagVos = this.formData.skuPreVo.skuTagVos.find(
                (item) => item.check == true
              );
              this.skuTagVos = skuTagVos ? skuTagVos.value : "";

              const catalogV = this.formData.skuPreVo.catalogV.find(
                (item) => item.check == true
              );
              this.catalogV = catalogV ? catalogV.value : "";

              // 还原radio
              this.labelVosRadio.forEach((item, index) => {
                this.lbRadio[index] = "";
                item.kvos.forEach((it) => {
                  if (it.check) {
                    this.lbRadio[index] = it.value;
                  }
                });
              });
            }
          }
        })
      );
    },
    showDialog() {
      this.hasDialog = true;
      this.getList();
    },
    getList() {
      this.$request("Food/queryKingdeeFood", {}).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.tableData = dataPage;
          }
        })
      );
    },
    handleCurrentChange(val) {
      this.currentRow = val;
    },
    onconfirm() {
      this.formData.tfsSkuname = this.currentRow.kingdeeName;
      this.formData.tfsCid = this.currentRow.kingdeeId;
      this.formData.tfsKingdeeId = this.currentRow.kingdeeId;
      this.formData.tfsQuality = this.currentRow.kingdeeQuality;
      this.formData.tfsKingdeeUnit = this.currentRow.kingdeeUnit;
      this.hasDialog = false;
    },
    submit() {
      let message = "确认修改上述信息？";
      if (this.tfsId) {
        if (
          this.oldTfsEnergy != this.formData.tfsEnergy ||
          this.oldTfsProtein != this.formData.tfsProtein ||
          this.oldtfsFiber != this.formData.tfsFiber ||
          this.oldTfsFat != this.formData.tfsFat ||
          this.oldTfsCarbonwater != this.formData.tfsCarbonwater ||
          this.oldTfsSalt != this.formData.tfsSalt
        ) {
          message = "确认修改上述成分信息并升级版本？";
        }
      }
      this.$confirm(message, "确认修改？", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      }).then(() => {
        console.log("点击确定");
        this.handleSubmit(50);
      });
    },
    cancel() {
      this.$confirm("确定取消？", "提示？", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      })
        .then(() => {
          console.log("点击确定");
          this.$closeRoute();
        })
        .catch(() => {
          console.log("点击取消");
        });
    },
    handleSubmit(type) {
      if (!this.formData.tfsCid) {
        this.$message({ type: "error", message: "请选择菜品" });
        return;
      }
      if (!this.formData.tfsUnit) {
        this.$message({ type: "error", message: "请选择菜品规格" });
        return;
      }
      if (!this.formData.tfsEnergy) {
        this.$message({ type: "error", message: "菜品能量有误" });
        return;
      }
      if (!this.formData.tfsFiber) {
        this.$message({ type: "error", message: "菜品膳食纤维有误" });
        return;
      }

      if (!this.formData.tfsProtein) {
        this.$message({ type: "error", message: "蛋白质信息有误" });
        return;
      }
      if (!this.formData.tfsFat) {
        this.$message({ type: "error", message: "脂肪信息有误" });
        return;
      }
      if (!this.formData.tfsCarbonwater) {
        this.$message({ type: "error", message: "碳水化合物信息有误" });
        return;
      }
      if (!this.formData.tfsSalt) {
        this.$message({ type: "error", message: "烹饪用盐信息有误" });
        return;
      }
      if (!this.catalogF) {
        this.$message({ type: "error", message: "请选择食物类别" });
        return;
      }
      if (!this.formData.tfsShelfLife) {
        this.$message({ type: "error", message: "请输入保质期" });
        return;
      }
      if (!this.formData.tfsSuggestedIntroduce) {
        this.$message({ type: "error", message: "请输入菜品描述" });
        return;
      }
      if (!this.skuTagVos) {
        this.$message({ type: "error", message: "请选择算法分类" });
        return;
      }
      if (!this.catalogV) {
        this.$message({ type: "error", message: "请选择上架营养素类别" });
        return;
      }
      const params = this.$deepClone(this.formData);
      params.skuPreVo.labelVos = [
        ...this.labelVosCheckBox,
        ...this.labelVosRadio,
      ];
      params.skuPreVo.ingredientVos = this.ingredient.rawList;
      params.opType = type;
      if (this.tfsId) {
        params.tfsId = this.tfsId;
      }
      this.$request("Sku/commitSku", params).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.$message({ type: "success", message: "操作成功" });
            this.$closeRoute();
          } else {
            this.$message({ type: "error", message: err.errMsg });
          }
        })
      );
    },
  },
});
</script>

<style lang="less" scoped>
section {
  padding-top: 30px;
}
.medium-input {
  width: 240px;
  margin-right: 10px;
}
.medium-select {
  width: 70px;
  margin-left: 10px;
}
.ingredient-label {
  font-size: 16px;
  font-weight: bold;
  margin: 12px 0;
}
.rule {
  padding-left: 150px;
}
.tiny-input {
  width: 150px;
  margin: 0 20px;
}

.small-input {
  margin-left: 8px;
  width: 120px;
}
.small-select {
  margin-left: 8px;
  width: 200px;
}

.section-label {
  display: inline-block;
}

.section-item {
  margin: 20px 0;
  display: flex;
  align-items: center;
  button {
    height: 30px;
    line-height: 5px;
  }
}

.ing-tag {
  margin-right: 6px;
}

.btn-footer {
  text-align: center;
}
.bold-label {
  font-weight: bold;
  font-size: 18px;
}

.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}

.label-3,
h3 {
  margin-left: 22px;
}

.ingredient-item {
  display: inline-block;
  width: 60px;
}
</style>
