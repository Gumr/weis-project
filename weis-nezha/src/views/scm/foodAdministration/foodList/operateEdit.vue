<template>
  <div class="page-container">
    <section>
      <h2>基础信息</h2>
      <div class="section-item">
        <span class="section-label label-1">当前版本：</span>
        <span>{{ basics.version + '.0' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品名称：</span>
        <span>{{ basics.skuName }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品编码：</span>
        <span>{{ basics.skuCid }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品规格：</span>
        <span>{{ basics.quality + basics.unit }}</span>
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
        <el-image
          :src="basics.accessoryImg"
          style="width: 200px"
          v-if="basics.accessoryImg"
        ></el-image>
      </div> -->
    </section>
    <!-- 成分信息 -->
    <section>
      <h3>成分信息</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品能量：</span>
        <span>{{dietician.energy }}Kcal</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">蛋白质：</span>
        <span>{{ dietician.protein }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">碳水化合物：</span>
        <span>{{ dietician.carbonwater }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">脂肪：</span>
        <span>{{ dietician.fat }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">烹饪用盐：</span>
        <span>{{dietician.salt }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">膳食纤维：</span>
        <span>{{ dietician.fiber }}g</span>
      </div>
    </section>
    <!-- 菜品标签 -->
    <section>
      <h3>小程序上架类目</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品类目：</span>
        <span>{{ dietician.catalogFStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">营养素类目：</span>
        <span style="margin-right: 20px;">{{ dietician.catalogVStr }}</span>
      </div>

    </section>
    <section>
      <h3>菜品描述</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品描述：</span>
        <span>{{ dietician.suggestedIntroduce }}</span>
      </div>
    </section>
    <section>
      <h3>菜品配料</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品配料：</span>
        <span>{{ dietician.dosing }}</span>
      </div>
    </section>
    <section>
      <h3>菜品标签</h3>

      <div
        v-for="(item, index) in dietician.labelVos"
        :key="index"
        class="section-item"
      >
        <span
          class="section-label label-1"
          :class="item.integer === 1 ? 'bold-label' : ''"
        >{{ item.label }}：</span>
        <span
          v-for="(it, inx) in item.tList"
          :key="inx"
        >
          <span
            v-if="it.check"
            style="margin-right: 20px;"
          >{{ it.label }} <span
              style="color:blue"
              v-if="it.exValue"
            >{{it.exValue =='0'?'正式供餐':'灰度供餐'}}</span> </span>
        </span>

      </div>
      <div class="section-item">
        <span class="section-label label-1 bold-label">保质期：</span>
        <span>{{ dietician.shelfLife }} 天</span>
      </div>
    </section>
    <section>
      <h3>食材</h3>
      <div class="section-item">
        <span class="section-label label-1">食材：</span>
        <span style="margin-right: 20px;">{{ dietician.ingredientStr }}</span>

      </div>
    </section>
    <!-- 推荐算法 -->
    <section>
      <h3>推荐算法</h3>
      <div class="section-item">
        <span class="section-label label-1">主供营养素：</span>
        <span style="margin-right: 20px;">{{ dietician.locationStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">算法分类：</span>
        <span style="margin-right: 20px;">{{  dietician.skutagStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">是否参与算法：</span>
        <span style="margin-right: 20px;">{{  dietician.joinArithmeticStr }}</span>
      </div>
    </section>

    <!-- 建议上架类别 -->
    <section>
      <h3>建议上架类别</h3>

      <div class="section-item">
        <span class="section-label label-1">菜品建议上架餐别：</span>

        <span style="margin-right: 20px;">{{ dietician.categoryStr }}</span>

      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">菜品建议上架端口：</span>

        <span style="margin-right: 20px;">{{  dietician.suggestedOpenMarketStr }}</span>

      </div> -->
    </section>

    <section>
      <h2>上架信息</h2>
      <!-- 基础信息 -->
      <h3>基础上架信息</h3>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>菜品上架名称：
        </span>
        <el-input
          v-model="formData.skuName"
          clearable
          class="medium-input"
          placeholder="请输入上架名称"
          disabled
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red"></span>菜品制定价格：
        </span>
        <el-input
          v-model="formData.normalPrice"
          clearable
          class="medium-input"
          placeholder="请输入上架价格"
          @blur="checkText('normalPrice')"
        ></el-input>
        <span>元</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>菜品实际价格：
        </span>
        <el-input
          v-model="formData.skuActualPrice"
          clearable
          class="medium-input"
          placeholder="请输入上架价格"
          @blur="checkText('skuActualPrice')"
        ></el-input>
        <span>元</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          供应时间：
        </span>
        <el-date-picker
          v-model="formData.supplyStartDate"
          class="medium-input"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
        <el-date-picker
          v-model="formData.supplyEndDate"
          class="medium-input"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </div>

      <!-- <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>营养素类目：
        </span>
        <el-select
          v-model="catalogV"
          class="medium-select"
          @change="selectChange($event, 'catalogV')"
        >
          <el-option
            v-for="item in formData.catalogV"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div> -->
      <!-- <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>上架餐别：
        </span>
        <el-checkbox
          v-for="(item, index) in formData.category"
          :key="index"
          v-model="item.check"
          :label="item.value"
        >
          {{ item.label }}
        </el-checkbox>
      </div> -->
      <!-- <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>上架端口：
        </span>
        <el-checkbox
          v-for="(item, index) in formData.openMarket"
          :key="index"
          v-model="item.check"
          :label="item.value"
        >
          {{ item.label }}
        </el-checkbox>
      </div> -->
      <div class="section-item">
        <span class="section-label label-1">是否ATM售卖</span>
        <el-radio-group v-model="formData.supplyAtm">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </div>
      <div class="section-item">
        <span class="section-label label-1">关联必选餐具：</span>
        <el-checkbox
          v-for="(item, index) in formData.tableware"
          :key="index"
          v-model="item.check"
          :label="item.value"
        >
          {{ item.label }}
        </el-checkbox>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>菜品描述：
        </span>
        <el-input
          v-model="formData.introduce"
          clearable
          class="medium-input"
          type="textarea"
          row="6"
          maxlength="300"
          placeholder="描述"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <!-- <span style="color:red">*</span> -->
          菜品描述图片：
        </span>
        <ImageUpload
          v-model:file-list="formData.introduceImg"
          :upload-data="{ flag: 'diet' }"
          :limit="1"
        />
        <!-- <span style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 160 X 160</span> -->
      </div>
      <!-- <section>
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
      </section> -->
    </section>
    <!-- <section>
      <h3><span style="color:red">*</span>供餐点选择</h3>
      <div class="section-item" v-for="(item, index) in formData.skuOpPreVo.hpVos" :key="index + 'radio'">
        <span class="section-label label-1">{{item.label}}：</span>
        <el-checkbox v-for="(child, inx) in item.kvos" :key="inx" :label="child.value" v-model="child.check">{{child.label}}</el-checkbox>
      </div>
    </section>-->
    <section>
      <h3>运营信息</h3>
      <div class="section-item">
        <span class="section-label label-1">（选填）菜品封面标签：</span>
        <el-input
          v-model="formData.skuTitle"
          clearable
          class="medium-input"
          maxlength="200"
          placeholder="请输入菜品封面标签"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1"> <span style="color:red">*</span> 名厨有话说：</span>
        <el-radio-group v-model="formData.foodMaster">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </div>
      <div
        v-if="formData.foodMaster"
        class="section-item"
        
      >
       <span class="section-label label-1">名厨：</span>
        <el-select
          v-model="formData.masterId"
        >
          <el-option
            v-for="item in masterList"
            :key="item.tfmId"
            :label="item.tfmName"
            :value="item.tfmId"
          ></el-option>
        </el-select>
      </div>
      <div
        v-if="formData.foodMaster"
        class="section-item"
      >
        <span class="section-label label-1">名厨对菜品的描述：</span>
        <el-input
          v-model="formData.foodMasterDescribe"
          clearable
          class="medium-input"
          type="textarea"
          :row="6"
          maxlength="300"
          placeholder="描述"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>菜品封面图片：
        </span>
        <ImageUpload
          v-model:file-list="formData.primaryUrl"
          :upload-data="{ flag: 'diet' }"
          :limit="1"
        />
        <span style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 160 X 160</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>菜品详情图片：
        </span>
        <ImageUpload
          v-model:file-list="formData.slideUrl"
          :upload-data="{ flag: 'diet' }"
          :limit="6"
        />
        <span style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 750 X 560</span>
      </div>
    </section>
    <footer class="btn-footer">
      <el-button
        type="primary"
        @click="submit(60)"
      >操作入库</el-button>
      <el-button
        type="warning"
        @click="submit(70)"
      >保存信息</el-button>
      <el-button
        type="danger"
        @click="cancel"
      >取消</el-button>
    </footer>
  </div>
</template>

<script>
// import ReturnButton from "@/components/ReturnButton.vue";
import ImageUpload from "@/components/ImageUpload.vue";
import { defineComponent } from "vue";
// import ConfirmDialog from "@/components/ConfirmDialog.vue";
import exportExcel from "@/utils/export-excel";
import XLSX from "@/utils/xlsx";

export default defineComponent({
  components: {
    // ReturnButton,
    ImageUpload,
    // ConfirmDialog
  },
  data() {
    return {
      masterList: [], //大师
      dietician: {},
      basics: {},
      recordId: "",
      tfsCid: "",
      tfsVersion: "",
      operation: {},
      infolist: {
        operation: {},
        skuPreVo: {},
      },
      empInfo: [],
      formData: {
        masterId:'',
        // dosing: "",
        supplyAtm: false,
        skuName: "",
        normalPrice: "",
        skuActualPrice: "",
        supplyStartDate: "",
        supplyEndDate: "",
        introduce: "",
        skuTitle: "",
        foodMaster: false,
        istest: false,
        foodMasterDescribe: "",
        catalogV: [],
        category: [],
        openMarket: [],
        labelVos: [],
        primaryUrl: [],
        slideUrl: [],
        introduceImg: [],
      },
      catalogV: "",
    };
  },
  created() {
    this.recordId = this.$route.query.recordId;
    // this.tfsCid = this.$route.query.tfsCid;
    // this.tfsVersion = this.$route.query.tfsVersion;
    this.initialDataList();
    this.getInfo();
    this.queryAllMaster();
  },
  // mounted() {
  //   this.$refs.upload.addEventListener("change", (e) => {
  //     // 绑定监听表格导入事件
  //     this.readExcel(e);
  //   });
  // },
  methods: {
    checkText(type) {
      let number = this.formData[type];
      number = isNaN(number) ? 0 : Number(number) < 0 ? 0 : Number(number);
      number = number.toFixed(2);
      this.formData[type] = number.toString();
    },
    selectChange(e, type) {
      this.formData[type].forEach((item) => {
        item.check = false;
        if (item.value == e) {
          item.check = true;
        }
      });
    },
    queryAllMaster() {
      //查询大师
      this.$request("FoodMaster/queryAllMaster", {
        status: "01",
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.masterList = dataPage.record;
          }
        })
      );
    },
    async initialDataList() {
      const res = await this.$http("sku.SkuLibrary/initialData", {});
      // this.formData.catalogF = res.obj.foodCategory;
      // this.formData.skutag = res.obj.skutag;
      this.formData.catalogV = res.obj.catalogV;
      this.formData.openMarket = res.obj.openMarket;
      this.formData.tableware = res.obj.tableware;
      this.formData.category = res.obj.category;
    },
    getInfo() {
      this.$request("sku.SkuLibrary/querySkuOperation", {
        recordId: this.recordId,
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.infolist, dataPage);
            Object.assign(this.basics, dataPage.basics);
            Object.assign(this.dietician, dataPage.dietician.dietician);
            Object.assign(this.basics, dataPage.operation);

            // Object.assign(this.formData, dataPage.skuOpPreVo);
            // this.formData.skuOpPreVo.tableware = dataPage.operation.tableware;

            this.catalogV = dataPage.dietician.dietician.suggestedCatalogV;

            this.formData.supplyAtm =
              dataPage.operation.supplyAtm == "01" ? true : false;

            // this.formData.skuOpPreVo.labelVos[0].tList.forEach((it) => {
            //   it.exValue = Number(it.exValue);
            // });
            // this.formData.dosing = dataPage.dietician.dietician.dosing;

            this.formData.skuName = dataPage.dietician.dietician.skuName;
            this.formData.normalPrice =
              dataPage.operation.normalPrice == 0
                ? "0.00"
                : dataPage.operation.normalPrice;
            this.formData.skuActualPrice =
              dataPage.operation.skuActualPrice == 0
                ? "0.00"
                : dataPage.operation.skuActualPrice;
            this.formData.supplyStartDate = dataPage.operation.supplyStartDate
              ? this.$day(dataPage.operation.supplyStartDate).format(
                  "YYYY-MM-DD"
                )
              : "";
            this.formData.supplyEndDate = dataPage.operation.supplyEndDate
              ? this.$day(dataPage.operation.supplyEndDate).format("YYYY-MM-DD")
              : "";
            this.formData.introduce =
              dataPage.dietician.dietician.suggestedIntroduce;
            this.formData.skuTitle = dataPage.operation.skuTitle;
            this.formData.foodMaster =
              dataPage.operation.foodMaster == "0" ? false : true;
            this.formData.foodMasterDescribe =
              dataPage.operation.foodMasterDescribe;
            this.formData.primaryUrl = dataPage.operation.primaryUrl
              ? [{ url: dataPage.operation.primaryUrl }]
              : [];
            this.formData.introduceImg = dataPage.operation.introduceImg
              ? [{ url: dataPage.operation.introduceImg[0] }]
              : [];
            this.formData.slideUrl = dataPage.operation.slideUrl.map(
              (item) => ({
                url: item,
              })
            );
            this.formData.masterId =dataPage.operation.masterId? dataPage.operation.masterId+'':''

            dataPage.dietician.dietician.suggestedCategory.forEach(
              (item, index) => {
                this.formData.category.find((item2) => {
                  if (item == item2.value) {
                    item2.check = true;
                  }
                });
              }
            );

            dataPage.operation.openMarket.forEach((item, index) => {
              this.formData.openMarket.find((item2) => {
                if (item == item2.value) {
                  item2.check = true;
                }
              });
            });

            dataPage.operation.tableware.forEach((item, index) => {
              this.formData.tableware.find((item2) => {
                if (item == item2.value) {
                  item2.check = true;
                }
              });
            });

            // // 还原下拉框
            // const catalogV = this.formData.skuOpPreVo.catalogV.find(
            //   (item) => item.check == true
            // );
            // this.catalogV = catalogV ? catalogV.value : "";
            // const masterVos = this.formData.skuOpPreVo.masterVos.find((item) => item.check == true);
            // this.infolist.skuPreVo.ingredientVos =
            //   this.infolist.skuPreVo.ingredientVos.reduce((res, item) => {
            //     item.tList.forEach((it) => {
            //       if (it.check) {
            //         res.push(it.label);
            //       }
            //     });
            //     return res;
            //   }, []);
            this.infolist.skuPreVo.labelVos.sort(
              (a, b) => a.integer - b.integer
            );
          }
        })
      );
    },
    submit(type) {
      const mes = {
        60: "入库",
        70: "保存",
      }[type];
      this.$confirm(`确定${mes}？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      })
        .then(() => {
          console.log("点击确定");
          this.handleSubmit(type);
        })
        .catch(() => {
          console.log("点击取消");
        });
    },
    addEmpInfo() {
      this.empInfo.push({ tgeName: "", tgePhone: "", isEdit: true });
    },
    cancel() {
      this.$confirm("确定取消？", "提示", {
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
      if (!this.formData.skuName) {
        this.$message({ type: "error", message: "请输入菜品上架名称" });
        return;
      }
      if (!this.formData.skuActualPrice) {
        this.$message({ type: "error", message: "请输入菜品价格" });
        return;
      }
      // if (
      //   !this.formData.supplyStartDate ||
      //   !this.formData.supplyEndDate ||
      //   new Date(this.formData.supplyStartDate) >
      //     new Date(this.formData.supplyEndDate)
      // ) {
      //   this.$message({ type: "error", message: "请选择正确的上架时间" });
      //   return;
      // }
      // if (!this.catalogV) {
      //   this.$message({ type: "error", message: "请选择营养素类别" });
      //   return;
      // }
      if (!this.formData.introduce) {
        this.$message({ type: "error", message: "请输入菜品描述" });
        return;
      }
      if (this.formData.foodMaster) {
        if (!this.formData.foodMasterDescribe) {
          this.$message({ type: "error", message: "请输入名厨对菜品的描述" });
          return;
        }
      }
      if (!this.formData.primaryUrl.length) {
        this.$message({ type: "error", message: "请上传菜品封面图" });
        return;
      }
      if (!this.formData.slideUrl.length) {
        this.$message({ type: "error", message: "请上传菜品详情图" });
        return;
      }
      const params = this.$deepClone(this.formData);

      params.primaryUrl = params.primaryUrl[0].response
        ? params.primaryUrl[0].response.obj.imageUrl
        : params.primaryUrl[0].url;
      // debugger;
      if (params.introduceImg.length > 0) {
        params.introduceImg = params.introduceImg[0].response
          ? params.introduceImg[0].response.obj.imageUrl
          : params.introduceImg[0].url;
      } else {
        params.introduceImg = [];
      }

      params.foodMaster = params.foodMaster ? "1" : "0";

      params.slideUrl = [];
      this.formData.slideUrl.forEach((item) => {
        const img = item.response ? item.response.obj.imageUrl : item.url;
        params.slideUrl.push(img);
      });
      params.optype = type;
      params.recordId = this.recordId;
      params.tfsCid = this.tfsCid;
      params.tfsVersion = this.tfsVersion;
      params.tfsStt = this.infolist.operation.tfsStt;
      params.supplyAtm = params.supplyAtm == true ? "01" : "00";
      params.catalogV = this.catalogV;

      const category = [];
      params.category.map((i) => {
        if (i.check) {
          category.push(i.value);
        }
      });
      params.category = category;

      const openMarket = [];
      params.openMarket.map((i) => {
        if (i.check) {
          openMarket.push(i.value);
        }
      });
      params.openMarket = openMarket;

      const tableware = [];
      params.tableware.map((i) => {
        if (i.check) {
          tableware.push(i.value);
        }
      });
      params.tableware = tableware;

      this.$request("sku.SkuLibrary/skuOperationAuditSave", params).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            if (type == 70) {
              this.$message({ type: "success", message: "操作成功" });
              this.$closeRoute();
            } else {
              this.$request("sku.SkuLibrary/skuOperationAudit", {
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
    tableRowClassName({ row, rowIndex }) {
      row.index = rowIndex;
    },
    empConfirm(index) {
      const item = this.empInfo[index];
      if (!item.tgeName || !/^1[3456789]\d{9}$/.test(item.tgePhone)) {
        this.$msg("请填写正确的信息", "error");
        return;
      }
      this.empInfo[index].isEdit = false;
    },
    empEdit(index) {
      this.empInfo[index].isEdit = true;
    },
    empDel(index) {
      this.empInfo.splice(index, 1);
    },
    choiceUpload() {
      this.$refs.upload.dispatchEvent(new MouseEvent("click"));
    },
    readExcel(e) {
      const files = e.target.files;
      if (files.length <= 0) {
        this.$message({ type: "error", message: "没有文件名" });
        return;
      }
      if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
        this.$message({
          type: "error",
          message: "上传格式不正确，请上传xls或者xlsx格式",
        });
        return;
      }
      const fileReader = new FileReader();
      fileReader.onload = (ev) => {
        try {
          const data = ev.target.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const wsname = workbook.SheetNames[0]; // 取第一张表
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]); // 生成json表格内容
          const outputs = ws.map((item) => ({
            tgeName: item["姓名"],
            tgePhone: item["微信绑定手机号"],
            isEdit: false,
          }));
          this.empInfo = this.empInfo.concat(outputs);
          this.$refs.upload.value = "";
          this.$nt(() => {
            this.$refs.empTable.doLayout();
          });
        } catch (e) {
          this.$message({ type: "error", message: e });
        }
      };
      fileReader.readAsBinaryString(files[0]);
    },
  },
});
</script>

<style lang="less" scoped>
:deep(.el-textarea__inner) {
  line-height: 3 !important;
}
section {
  padding-top: 0px;
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
.download {
  margin-left: 20px;
  color: #409eff;
  cursor: pointer;
}
</style>
