<template>
  <div class="page-container">
    <section>
      <h3>基础信息</h3>
      <div
        v-if="!recordId"
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
        <span>{{ formData.skuName }}</span>
        <!-- <el-button
          v-if="recordId"
          style="margin-left: 10px;"
          type="primary"
          @click="refresh"
        >刷新</el-button> -->
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品编码：</span>
        <span>{{ formData.skuCid }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>菜品规格：
        </span>
        <el-input
          v-model="formData.quality"
          style="width: 80px;"
        ></el-input>
        <el-select
          v-model="formData.unit"
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
      <div class="section-item">
        <span class="section-label label-1">ERP菜品分类:</span>
        <span>{{ basics.foodCategoryStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">主食材:</span>
        <span>{{ basics.mainIngredientTypeStr }} -- {{basics.mainIngredientStr}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">所属菜系:</span>
        <span>{{ basics.skuStyleStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品性质:</span>
        <span>{{ basics.natureStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">烹饪方式:</span>
        <span>{{ basics.cookingMethodStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">味型:</span>
        <span>{{ basics.smellStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">混杂性:</span>
        <span>{{ basics.mixStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">品相:</span>
        <span>{{ basics.appearanceStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">季节性:</span>
        <span>{{ basics.seasonStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">厨房售价:</span>
        <span>{{ basics.kitchenPrice }}</span>
      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">食材:</span>
        <span>{{ basics.foodMaterials }}</span>
      </div>
       <div class="section-item">
        <span class="section-label label-1">附件:</span>
        <el-image :src="basics.accessoryImg" style="width: 200px"  v-if="basics.accessoryImg"></el-image>
      </div> -->
    </section>
    <!-- 成分信息 -->
    <section>
      <h3>成分信息</h3>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>蛋白质：
        </span>
        <el-input
          v-model="formData.protein"
          clearable
          class="medium-input"
          placeholder="精确到小数点后一位"
          @blur="checkText('protein')"
        ></el-input>g
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>脂肪：
        </span>
        <el-input
          v-model="formData.fat"
          clearable
          class="medium-input"
          placeholder="精确到小数点后一位"
          @blur="checkText('fat')"
        ></el-input>g
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>碳水化合物：
        </span>
        <el-input
          v-model="formData.carbonwater"
          clearable
          class="medium-input"
          placeholder="精确到小数点后一位"
          @blur="checkText('carbonwater')"
        ></el-input>g
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>烹饪用盐：
        </span>
        <el-input
          v-model="formData.salt"
          clearable
          class="medium-input"
          placeholder="精确到小数点后一位"
          @blur="checkText('salt')"
        ></el-input>g
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>菜品能量：
        </span>
        <el-input
          v-model="formData.energy"
          clearable
          class="medium-input"
          placeholder="请输入整数"
          @blur="checkText('energy')"
        ></el-input>Kcal
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>膳食纤维
        </span>
        <el-input
          v-model="formData.fiber"
          clearable
          class="medium-input"
          placeholder="请输入整数"
          @blur="checkText('fiber')"
        ></el-input>g
      </div>
    </section>
    <!-- 小程序上架类目 -->
    <section>
      <h3>小程序上架类目</h3>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>菜品类目:
        </span>
        <el-select
          v-model="catalogF"
          @change="selectChange($event, 'catalogF')"
        >
          <el-option
            v-for="item in formData.catalogF"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>营养素类目：
        </span>
        <el-select
          v-model="catalogV"
          class="small-select"
          @change="selectChange($event, 'catalogV')"
        >
          <el-option
            v-for="item in formData.catalogV"
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
          <span style="color:red">*</span>菜品建议/描述：
        </span>
        <el-input
          v-model="formData.suggestedIntroduce"
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
          <span style="color:red">*</span>菜品配料：
        </span>
        <el-input
          v-model="formData.dosing"
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
            style="color:red"
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
          <span style="color:red">*</span>保质期：
        </span>
        <NumberInput
          v-model="formData.shelfLife"
          clearable
          class="medium-input"
          placeholder="请输入保质期"
        />天
      </div>
    </section>
    <section>
      <h3>食材</h3>
      <div class="section-item">
        <span class="section-label label-1">(必填)食材：</span>
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
          <span style="color:red">*</span>主供营养素：
        </span>
        <el-checkbox
          v-for="(item, index) in formData.location"
          :key="index"
          v-model="item.check"
        >{{ item.label }}</el-checkbox>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>算法分类：
        </span>
        <el-select
          v-model="skutag"
          class="small-select"
          @change="selectChange($event, 'skutag')"
        >
          <el-option
            v-for="item in formData.skutag"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
           <span style="color:red">*</span>是否参与算法：
        </span>
        <el-select
          v-model="joinArithmetic"
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
          <span style="color:red">*</span>上架餐别：
        </span>
        <el-checkbox
          v-for="(item, index) in formData.category"
          :key="index"
          v-model="item.check"
        >{{ item.label }}</el-checkbox>
      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>菜品建议上架端口：
        </span>
        <el-checkbox
          v-for="(item, index) in formData.suggestedOpenMarket"
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
      <el-button
        type="warning"
        @click="handleSubmit(10)"
      >保存</el-button>
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
        v-for="(item, index) in ingredient.list"
        :key="item.value"
      >
        <p class="ingredient-label">{{ item.label }}：</p>
        <div>
          <el-checkbox
            v-for="(tag, tagIndex) in item.tList"
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
      </el-table> -->
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
  name: "kitchen_foodAdministration_foodList_dietitianEdit",
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
      basics: {},
      ingredient: {
        rawList: [],
        list: [],
        query: "",
        dialog: false,
        columns: [],
        selection: [],
      },
      // 基础信息
      recordId: "",
      joinArithmetic: "",
      formData: {
        skuName: "",
        skuCid: "",
        tfsKingdeeId: "",
        version: "",
        quality: "",
        unit: "",
        tfsKingdeeUnit: "",
        energy: "",
        fiber: "",
        protein: "",
        fat: "",
        dosing: "",
        carbonwater: "",
        salt: "",
        tfsNeedProd: "01",
        shelfLife: "",
        suggestedIntroduce: "",
        catalogF: [], // 所属食物分类
        skutag: [], // 算法分类
        catalogV: [], // 建议上架营养素类别
        category: [], // 菜品建议上架餐别
        suggestedOpenMarket: [], // 菜品上架端口
        labelVos: [], // 菜品标签
        location: [],
      },
      labelVosRadio: [], // 菜品标签下单选标签
      lbRadio: [], // 单选标签
      labelVosCheckBox: [], // 菜品标签下多选标签
      catalogV: "", // 用户还原下拉框
      catalogF: "",
      skutag: "",
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
        this.ingredient;
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
    this.recordId = this.$route.query.recordId;
    this.initialDataList();
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
    async initialDataList() {
      const res = await this.$http("sku.SkuLibrary/initialData", {});
      this.unitOptions = res.obj.unit.map((item) => ({
        label: item.label,
        value: item.label,
      }));
      this.formData.catalogF = res.obj.catalogF;
      this.formData.skutag = res.obj.skutag;
      this.formData.catalogV = res.obj.catalogV;
      this.formData.suggestedOpenMarket = res.obj.openMarket;
      this.formData.category = res.obj.category;
      this.formData.location = res.obj.location;
    },
    refresh() {
      this.$request("Food/queryKingdeeFoodInfo", {
        cid: this.formData.skuCid,
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.$message({ type: "success", message: "刷新成功" });
            this.formData.skuName = dataPage.kingdeeName;
            this.formData.quality = dataPage.kingdeeQuality;
          } else {
            this.$message({ type: "error", message: err.errMsg });
          }
        })
      );
    },
    selectChange(e, type) {
      this.formData[type].forEach((item) => {
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
      if (type == "energy" || type == "shelfLife") {
        number = number.toFixed(0);
      } else {
        number = number.toFixed(1);
      }
      this.formData[type] = number.toString();
      if (type == "shelfLife") {
        this.formData.shelfLife =
          this.formData.shelfLife > 5 ? 5 : this.formData.shelfLife;
      } else if (type != "energy") {
        this.formData.energy =
          this.formData.protein * 4 +
          this.formData.fat * 9 +
          this.formData.carbonwater * 4;
        this.formData.energy = this.formData.energy.toFixed(0);
      }
    },
    getInfo() {
      const params = {};
      if (this.recordId) {
        params.recordId = this.recordId;
      }
      this.$request("sku.SkuLibrary/querySkuDieticianInfo", params).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.basics, dataPage.basics);
            this.catalogF = dataPage.dietician.catalogF;
            this.skutag = dataPage.dietician.skutag;
            this.catalogV = dataPage.dietician.catalogV; // 建议上架营养素类别

            // this.formData.skuPreVo.suggestedOpenMarket =
            //   dataPage.suggestedOpenMarket; // 菜品上架端口
            // this.formData.skuPreVo.locationsVos =
            //   dataPage.skuPreVo.locationsVos; // 主供营养素

            const ingredientVos = dataPage.dietician.ingredient;

            this.ingredient.list = this.$deepClone(ingredientVos);
            this.ingredient.rawList = ingredientVos;
            this.ingredientSelection = this.currentSelectedIngredient;
            this.ingredient.columns = ingredientVos.map((i) => ({
              label: i.label,
              prop: i.value,
            }));

            // 菜品标签区分单选多选
            dataPage.dietician.labelVos.forEach((item) => {
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

            if (this.recordId) {
              // this.formData.tfsKingdeeId = dataPage.skuBean.tfsKingdeeId;
              this.formData.skuName = dataPage.dietician.skuName;
              this.formData.skuCid = dataPage.dietician.skuCid;
              this.formData.version = dataPage.dietician.version;
              this.formData.quality = dataPage.dietician.quality;
              this.formData.unit = dataPage.dietician.unit;
              this.formData.shelfLife = dataPage.dietician.shelfLife;
              // this.formData.tfsNeedProd = dataPage.tfsNeedProd;
              // this.formData.tfsKingdeeUnit = dataPage.skuBean.tfsKingdeeUnit;
              this.formData.energy = dataPage.dietician.energy;
              this.formData.fiber =
                dataPage.dietician.fiber == 0
                  ? "0.0"
                  : dataPage.dietician.fiber;
              this.formData.protein =
                dataPage.dietician.protein == 0
                  ? "0.0"
                  : dataPage.dietician.protein;
              this.formData.fat =
                dataPage.dietician.fat == 0 ? "0.0" : dataPage.dietician.fat;
              this.formData.carbonwater =
                dataPage.dietician.carbonwater == 0
                  ? "0.0"
                  : dataPage.dietician.carbonwater;
              this.formData.salt =
                dataPage.dietician.salt == 0 ? "0.0" : dataPage.dietician.salt;
              this.formData.suggestedIntroduce =
                dataPage.dietician.suggestedIntroduce;
              this.formData.dosing = dataPage.dietician.dosing;
              // 保存旧信息用于判断是否升级了版本
              this.oldTfsEnergy = dataPage.dietician.energy;
              this.oldTfsProtein = dataPage.dietician.protein;
              this.oldtfsFiber = dataPage.dietician.fiber;
              this.oldTfsFat = dataPage.dietician.fat;
              this.oldTfsCarbonwater = dataPage.dietician.carbonwater;
              this.oldTfsSalt = dataPage.dietician.salt;
              this.joinArithmetic = dataPage.dietician.joinArithmetic

              // const skutag = this.formData.skuPreVo.skutag.find(
              //   (item) => item.check == true
              // );
              // this.skutag = skutag ? skutag.value : "";

              // const suggestedCatalogV =
              //   this.formData.category.find(
              //     (item) => item.check == true
              //   );
              dataPage.dietician.category.forEach((item, index) => {
                this.formData.category.find((item2) => {
                  if (item == item2.value) {
                    item2.check = true;
                  }
                });
              });
              // dataPage.dietician.suggestedOpenMarket.forEach((item, index) => {
              //   this.formData.suggestedOpenMarket.find((item2) => {
              //     if (item == item2.value) {
              //       item2.check = true;
              //     }
              //   });
              // });
              // debugger
              dataPage.dietician.location.forEach((item, index) => {
                this.formData.location.find((item2) => {
                  if (item == item2.value) {
                    item2.check = true;
                  }
                });
              });

              // this.suggestedCatalogV = suggestedCatalogV
              //   ? suggestedCatalogV.value
              //   : "";

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
      this.formData.skuName = this.currentRow.kingdeeName;
      this.formData.skuCid = this.currentRow.kingdeeId;
      this.formData.tfsKingdeeId = this.currentRow.kingdeeId;
      this.formData.quality = this.currentRow.kingdeeQuality;
      this.formData.tfsKingdeeUnit = this.currentRow.kingdeeUnit;
      this.hasDialog = false;
    },
    submit() {
      let message = "确认修改上述信息？";
      // if (this.recordId) {
      //   if (
      //     this.oldTfsEnergy != this.formData.energy ||
      //     this.oldTfsProtein != this.formData.protein ||
      //     this.oldtfsFiber != this.formData.fiber ||
      //     this.oldTfsFat != this.formData.fat ||
      //     this.oldTfsCarbonwater != this.formData.carbonwater ||
      //     this.oldTfsSalt != this.formData.salt
      //   ) {
      //     message = "确认修改上述成分信息并升级版本？";
      //   }
      // }
      this.$confirm(message, "确认修改？", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      }).then(() => {
        // console.log("点击确定");
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
      if (!this.formData.skuCid) {
        this.$message({ type: "error", message: "请选择菜品" });
        return;
      }
      if (!this.formData.quality) {
        this.$message({ type: "error", message: "请输入菜品规格" });
        return;
      }
      if (!this.formData.unit) {
        this.$message({ type: "error", message: "请选择菜品规格单位" });
        return;
      }
      if (!this.formData.energy) {
        this.$message({ type: "error", message: "菜品能量有误" });
        return;
      }
      if (!this.formData.fiber) {
        this.$message({ type: "error", message: "菜品膳食纤维有误" });
        return;
      }

      if (!this.formData.protein) {
        this.$message({ type: "error", message: "蛋白质信息有误" });
        return;
      }
      if (!this.formData.fat) {
        this.$message({ type: "error", message: "脂肪信息有误" });
        return;
      }
      if (!this.formData.carbonwater) {
        this.$message({ type: "error", message: "碳水化合物信息有误" });
        return;
      }
      if (!this.formData.salt) {
        this.$message({ type: "error", message: "烹饪用盐信息有误" });
        return;
      }
      if (!this.catalogF) {
        this.$message({ type: "error", message: "请选择菜品类目" });
        return;
      }
      if (!this.formData.shelfLife) {
        this.$message({ type: "error", message: "请输入保质期" });
        return;
      }
    
       if (this.ingredientSelection.length<=0) {
        this.$message({ type: "error", message: "请选择食材" });
        return;
      }
      
      if (!this.formData.suggestedIntroduce) {
        this.$message({ type: "error", message: "请输入菜品描述" });
        return;
      }
      if (!this.skutag) {
        this.$message({ type: "error", message: "请选择算法分类" });
        return;
      }
      if (!this.catalogV) {
        this.$message({ type: "error", message: "请选择营养素类目" });
        return;
      }

      const params = this.$deepClone(this.formData);
      params.labelVos = [...this.labelVosCheckBox, ...this.labelVosRadio];
      // params.skuPreVo.ingredientVos = this.ingredient.rawList;
      params.recordId = this.recordId;
      params.catalogF = this.catalogF;
      params.skutag = this.skutag;
      params.suggestedCatalogV = this.catalogV;
      const category = [];
      params.category.map((i) => {
        if (i.check) {
          category.push(i.value);
        }
      });
      params.category = category;

      const suggestedOpenMarket = [];
      params.suggestedOpenMarket.map((i) => {
        if (i.check) {
          suggestedOpenMarket.push(i.value);
        }
      });
      params.suggestedOpenMarket = suggestedOpenMarket;

      if (params.category.length == 0) {
        this.$message({ type: "error", message: "请选择上架餐别" });
        return;
      }
      // if (params.suggestedOpenMarket.length == 0) {
      //   this.$message({ type: "error", message: "请选择上架端口" });
      //   return;
      // }

      const location = [];
      params.location.map((i) => {
        if (i.check) {
          location.push(i.value);
        }
      });
      params.location = location;

      if (params.location.length == 0) {
        this.$message({ type: "error", message: "请选择主供营养素" });
        return;
      }

      // const catalogV = [];
      // params.catalogV.map((i) => {
      //   if (i.check) {
      //     catalogV.push(i.value);
      //   }
      // });
      params.catalogV = this.catalogV;

      params.ingredient = this.ingredient.rawList;

      params.joinArithmetic = this.joinArithmetic;
      //营养师保存
      this.$request("sku.SkuLibrary/dieticianAuditSave", params).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            if (type == 10) {
              this.$message({ type: "success", message: "操作成功" });
              this.$closeRoute();
            } else {
              // 营养师审核
              this.$request("sku.SkuLibrary/dieticianAudit", {
                recordId: this.recordId,
              }).then(
                this.$rw((err, dataPage) => {
                  if (!err) {
                    this.$message({ type: "success", message: "操作成功" });
                    this.$closeRoute();
                  } else {
                    this.$message({ type: "error", message: err.errMsg });
                  }
                })
              );
            }
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
