<template>
  <div class="page-container">
    <section>
      <h3>基础信息</h3>
      <div class="section-item">
        <span class="section-label label-1">当前版本：</span>
        <span>{{ infolist.skuBean.tfsVersion }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品名称：</span>
        <span>{{ infolist.skuBean.tfsSuggestedSkuname }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品编码：</span>
        <span>{{ infolist.skuBean.tfsCid }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品规格：</span>
        <span>{{ infolist.skuBean.tfsQuality + infolist.skuBean.tfsUnit }}</span>
      </div>
    </section>
    <!-- 成分信息 -->
    <section>
      <h3>成分信息</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品能量：</span>
        <span>{{ infolist.skuBean.tfsEnergy }}Kcal</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">蛋白质：</span>
        <span>{{ infolist.skuBean.tfsProtein }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">脂肪：</span>
        <span>{{ infolist.skuBean.tfsFat }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">碳水化合物：</span>
        <span>{{ infolist.skuBean.tfsCarbonwater }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">烹饪用盐：</span>
        <span>{{ infolist.skuBean.tfsSalt }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">膳食纤维：</span>
        <span>{{ infolist.skuBean.tfsFiber }}g</span>
      </div>
    </section>
    <!-- 菜品标签 -->
    <section>
      <h3>小程序上架类目</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品类目：</span>
        <span
          v-for="(item, index) in infolist.skuPreVo.catalogF"
          :key="index"
        >
          <span v-if="item.check">{{ item.label }}</span>
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">营养类目：</span>
        <span
          v-for="(item, index) in infolist.skuPreVo.catalogV"
          :key="index"
        >
          <span
            v-if="item.check"
            style="margin-right: 20px;"
          >{{ item.label }}</span>
        </span>
      </div>

      <!-- <div class="section-item">
        <span class="section-label label-1">是否需要生产：</span>
        <span>{{infolist.skuBean.tfsNeedProd == '01' ? '需要' : '不需要'}}</span>
      </div>-->
    </section>
    <section>
      <h3>菜品描述</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品描述：</span>
        <span>{{ infolist.skuBean.tfsIntroduce }}</span>
      </div>
    </section>
    <section>
      <h3>菜品配料</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品配料：</span>
        <span>{{ infolist.skuBean.tfsDosing }}</span>
      </div>
    </section>
    <!-- 菜品标签 -->
    <section>
      <h3>菜品标签</h3>

      <div
        v-for="(item, index) in infolist.skuPreVo.labelVos"
        :key="index"
        class="section-item"
      >
        <span
          class="section-label label-1"
          :class="item.integer === 1 ? 'bold-label' : ''"
          v-if=" item.label!='适用人群'"
        >{{ item.label }}：</span>
        <div
          v-for="(it, inx) in item.tList"
          :key="inx"
        >
          <div
            v-if="it.check && !it.exValue"
            style="margin-right: 20px;"
          >{{ it.label }}
          </div>
        </div>
      </div>
      <div class="section-item">
        <span class="section-label label-1 bold-label">保质期：</span>
        <span>{{ infolist.skuBean.tfsShelfLife }} 天</span>
      </div>
    </section>
    <section>
      <h3>适用人群</h3>
      <div
        v-for="(item, index) in formData.skuOpPreVo.labelVos"
        :key="index"
      >
        <div
          v-for="(it, inx) in item.tList"
          :key="inx"
        >
          <div
            v-if="it.check"
            style="margin-right: 20px;"
            class="section-item"
          > <span class="section-label label-1">{{ it.label }}:</span>
            <el-radio-group v-model="it.exValue">
              <el-radio :label="0">正式供餐</el-radio>
              <el-radio :label="1">灰度供餐</el-radio>
              <el-radio :label="2">不供餐</el-radio>
            </el-radio-group>
          </div>
        </div>
      </div>
    </section>
    <section v-if="infolist.skuPreVo.ingredientVos && infolist.skuPreVo.ingredientVos.length">
      <h3>食材</h3>
      <div class="section-item">
        <span class="section-label label-1">食材：</span>
        <span
          v-for="(label, index) in infolist.skuPreVo.ingredientVos"
          :key="index"
        >
          <span style="margin-right: 20px;">{{ label }}</span>
        </span>
      </div>
    </section>
    <!-- 推荐算法 -->
    <section>
      <h3>推荐算法</h3>
      <div class="section-item">
        <span class="section-label label-1">主供营养素：</span>
        <span
          v-for="(item, index) in infolist.skuPreVo.locationsVos"
          :key="index"
        >
          <span
            v-if="item.check"
            style="margin-right: 20px;"
          >{{ item.label }}</span>
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">算法分类：</span>
        <span
          v-for="(item, index) in infolist.skuPreVo.skuTagVos"
          :key="index"
        >
          <span
            v-if="item.check"
            style="margin-right: 20px;"
          >{{ item.label }}</span>
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">是否参与算法推荐：</span>
        <span>{{ infolist.skuBean.tfsJoinArithmeticStr }} </span>
      </div>
    </section>
    <!-- 建议上架类别 -->
    <section>
      <h3>建议</h3>

      <div class="section-item">
        <span class="section-label label-1">上架餐别：</span>
        <span
          v-for="(item, index) in infolist.skuPreVo.categroyVos"
          :key="index"
        >
          <span
            v-if="item.check"
            style="margin-right: 20px;"
          >{{ item.label }}</span>
        </span>
      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">菜品建议上架端口：</span>
        <span
          v-for="(item, index) in infolist.skuPreVo.openMarketVos"
          :key="index"
        >
          <span
            v-if="item.check"
            style="margin-right: 20px;"
          >{{ item.label }}</span>
        </span>
      </div> -->
      <!-- <div class="section-item">
        <span class="section-label label-1">菜品建议：</span>
        <span>{{ infolist.skuBean.tfsSuggestedIntroduce }}</span>
      </div> -->
    </section>
    <!-- 上架信息 -->
    <section>
      <h2>上架信息</h2>
      <h3>基础上架信息</h3>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>菜品上架名称：
        </span>
        <el-input
          v-model="formData.tfsSkuname"
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
          v-model="formData.tfsNormalPrice"
          clearable
          class="medium-input"
          placeholder="请输入上架价格"
          @blur="checkText('tfsNormalPrice')"
        ></el-input>
        <span>元</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>菜品实际价格：
        </span>
        <el-input
          v-model="formData.tfsPrice"
          clearable
          class="medium-input"
          placeholder="请输入上架价格"
          @blur="checkText('tfsPrice')"
        ></el-input>
        <span>元</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>供应时间：
        </span>
        <el-date-picker
          v-model="formData.tfsSalestime"
          class="medium-input"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
        <el-date-picker
          v-model="formData.tfsSaleetime"
          class="medium-input"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </div>

      <!-- <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>上架营养素类别：
        </span>
        <el-select
          v-model="catalogV"
          class="medium-select"
          @change="selectChange($event, 'catalogV')"
        >
          <el-option
            v-for="item in formData.skuOpPreVo.catalogV"
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
          v-for="(item, index) in formData.skuOpPreVo.categroyVos"
          :key="index"
          v-model="item.check"
          :label="item.value"
        >
          {{ item.label }}
        </el-checkbox>
      </div>
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>上架端口：
        </span>
        <el-checkbox
          v-for="(item, index) in formData.skuOpPreVo.openMarketVos"
          :key="index"
          v-model="item.check"
          :label="item.value"
        >
          {{ item.label }}
        </el-checkbox>
      </div> -->
      <div class="section-item">
        <span class="section-label label-1">是否ATM售卖</span>
        <el-radio-group v-model="formData.tfsSupplyAtm">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </div>
      <div class="section-item">
        <span class="section-label label-1">关联必选餐具：</span>
        <el-checkbox
          v-for="(item, index) in formData.skuOpPreVo.wareVos"
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
          v-model="formData.tfsIntroduce"
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
          v-model:file-list="formData.tfsIntroduceImg"
          :upload-data="{ flag: 'diet' }"
          :limit="1"
        />
        <!-- <span style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 160 X 160</span> -->
      </div>
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
          v-model="formData.tfsSkuTitle"
          clearable
          class="medium-input"
          maxlength="200"
          placeholder="请输入菜品封面标签"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1"> <span style="color:red">*</span> 名厨有话说：</span>
        <el-radio-group v-model="formData.haveMaster">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </div>
      <div
        class="section-item"
         v-if="formData.haveMaster"
      >
        <span class="section-label label-1">名厨：</span>
        <el-select v-model="formData.masterId">
          <el-option
            v-for="item in masterList"
            :key="item.tfmId"
            :label="item.tfmName"
            :value="item.tfmId"
          ></el-option>
        </el-select>
      </div>
      <div
        v-if="formData.haveMaster"
        class="section-item"
      >
        <span class="section-label label-1">名厨对菜品的描述：</span>
        <el-input
          v-model="formData.masterComm"
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
      >上架</el-button>
      <el-button
        type="warning"
        @click="submit(70)"
      >下架</el-button>
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
      tfsId: "",
      tfsCid: "",
      tfsVersion: "",
      infolist: {
        skuBean: {},
        skuPreVo: {},
      },
      empInfo: [],
      formData: {
        masterId: "",
        tfsSkuname: "",
        tfsNormalPrice: "",
        tfsPrice: "",
        tfsSalestime: "",
        tfsSaleetime: "",
        tfsIntroduce: "",
        tfsSkuTitle: "",
        haveMaster: false,
        istest: false,
        masterComm: "",
        tfsSupplyAtm: false,
        tfsIntroduceImg: [],
        skuOpPreVo: {
          catalogF: [],
          catalogV: [],
          categroyVos: [],
          masterVos: [],
          hpVos: [],
          openMarketVos: [],
          labelVos: [],
        },
        primaryUrl: [],
        slideUrl: [],
      },
      catalogV: "",
      catalogF: "",
      masterVos: "",
    };
  },
  created() {
    this.tfsId = this.$route.query.tfsId;
    this.tfsCid = this.$route.query.tfsCid;
    this.tfsVersion = this.$route.query.tfsVersion;
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
    checkText(type) {
      let number = this.formData[type];
      number = isNaN(number) ? 0 : Number(number) < 0 ? 0 : Number(number);
      number = number.toFixed(2);
      this.formData[type] = number.toString();
    },
    selectChange(e, type) {
      this.formData.skuOpPreVo[type].forEach((item) => {
        item.check = false;
        if (item.value == e) {
          item.check = true;
        }
      });
    },
    getInfo() {
      this.$request("Sku/querySkuDetail", {
        tfsId: this.tfsId,
        tfsCid: this.tfsCid,
        tfsVersion: this.tfsVersion,
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.infolist, dataPage);
            Object.assign(this.formData.skuOpPreVo, dataPage.skuOpPreVo);
            this.formData.skuOpPreVo.wareVos = dataPage.skuPreVo.wareVos;

            this.formData.masterId = dataPage.skuBean.masterId

            this.formData.tfsSupplyAtm =
              dataPage.skuBean.tfsSupplyAtm == "01" ? true : false;

            this.formData.skuOpPreVo.labelVos[0].tList.forEach((it) => {
              it.exValue = Number(it.exValue);
            });

            this.formData.tfsSkuname = dataPage.skuBean.tfsSkuname;
            this.formData.tfsNormalPrice =
              dataPage.skuBean.tfsNormalPrice == 0
                ? "0.00"
                : dataPage.skuBean.tfsNormalPrice;
            this.formData.tfsPrice =
              dataPage.skuBean.tfsPrice == 0
                ? "0.00"
                : dataPage.skuBean.tfsPrice;
            this.formData.tfsSalestime = dataPage.skuBean.tfsSalestime
              ? this.$day(dataPage.skuBean.tfsSalestime).format("YYYY-MM-DD")
              : "";
            this.formData.tfsSaleetime = dataPage.skuBean.tfsSaleetime
              ? this.$day(dataPage.skuBean.tfsSaleetime).format("YYYY-MM-DD")
              : "";
            this.formData.tfsIntroduce = dataPage.skuBean.tfsIntroduce;
            this.formData.tfsSkuTitle = dataPage.skuBean.tfsSkuTitle;
            this.formData.haveMaster = !!dataPage.skuBean.haveMaster;
            this.formData.masterComm = dataPage.skuBean.masterComm;
            this.formData.primaryUrl = dataPage.skuBean.primaryUrl
              ? [{ url: dataPage.skuBean.primaryUrl }]
              : [];
            this.formData.tfsIntroduceImg = dataPage.skuBean.tfsIntroduceImg
              ? [{ url: dataPage.skuBean.tfsIntroduceImg }]
              : [];

            this.formData.slideUrl = dataPage.skuBean.slideUrl.map((item) => ({
              url: item,
            }));

            // 还原下拉框
            const catalogV = this.formData.skuOpPreVo.catalogV.find(
              (item) => item.check == true
            );
            this.catalogV = catalogV ? catalogV.value : "";
            // const masterVos = this.formData.skuOpPreVo.masterVos.find((item) => item.check == true);
            this.infolist.skuPreVo.ingredientVos =
              this.infolist.skuPreVo.ingredientVos.reduce((res, item) => {
                item.tList.forEach((it) => {
                  if (it.check) {
                    res.push(it.label);
                  }
                });
                return res;
              }, []);
            this.infolist.skuPreVo.labelVos.sort(
              (a, b) => a.integer - b.integer
            );
          }
        })
      );
    },
    submit(type) {
      const mes = {
        60: "上架",
        70: "下架",
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
      if (!this.formData.tfsSkuname) {
        this.$message({ type: "error", message: "请输入菜品上架名称" });
        return;
      }
      if (!this.formData.tfsPrice) {
        this.$message({ type: "error", message: "请输入菜品价格" });
        return;
      }
      if (
        !this.formData.tfsSalestime ||
        !this.formData.tfsSaleetime ||
        new Date(this.formData.tfsSalestime) >
          new Date(this.formData.tfsSaleetime)
      ) {
        this.$message({ type: "error", message: "请选择正确的上架时间" });
        return;
      }
      // if (!this.catalogV) {
      //   this.$message({ type: "error", message: "请选择营养素类别" });
      //   return;
      // }
      if (!this.formData.tfsIntroduce) {
        this.$message({ type: "error", message: "请输入菜品描述" });
        return;
      }
      if (this.formData.haveMaster) {
        if (!this.formData.masterComm) {
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

      if (params.tfsIntroduceImg.length > 0) {
        params.tfsIntroduceImg = params.tfsIntroduceImg[0].response
          ? params.tfsIntroduceImg[0].response.obj.imageUrl
          : params.tfsIntroduceImg[0].url;
      } else {
        params.tfsIntroduceImg = "";
      }

      params.slideUrl = [];
      this.formData.slideUrl.forEach((item) => {
        const img = item.response ? item.response.obj.imageUrl : item.url;
        params.slideUrl.push(img);
      });
      params.optype = type;
      params.tfsId = this.tfsId;
      params.tfsCid = this.tfsCid;
      params.tfsVersion = this.tfsVersion;
      params.tfsStt = this.infolist.skuBean.tfsStt;
      params.tfsSupplyAtm = params.tfsSupplyAtm == true ? "01" : "00";
      this.$request("Sku/editSkuOpInfo", params).then(
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
