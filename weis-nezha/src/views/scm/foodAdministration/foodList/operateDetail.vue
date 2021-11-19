<template>
  <div class="page-container">
    <section>
      <section>
        <!-- <h3>历史版本</h3> -->
        <!-- <span class="section-label label-1">历史版本：</span>
        <el-button
          v-for="(item, index) in formData.skuHist"
          :key="index"
          :type="formData.operation.skuVersion == (index + 1) ? 'primary' : ''"
          @click="changeVersion(index)"
        >
          {{ (index + 1) + '.0' }}
        </el-button> -->
      </section>
      <h3>基础信息</h3>
      <div class="section-item">
        <span class="section-label label-1">当前版本：</span>
        <span>{{ formData.operation.skuVersion }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品名称：</span>
        <span>{{ formData.dietician.skuName }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品编码：</span>
        <span>{{ formData.dietician.skuCid }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品规格：</span>
        <span>{{ formData.dietician.quality + formData.dietician.unit }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">ERP菜品分类:</span>
        <span>{{ formData.basics.foodCategoryStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">主食材:</span>
        <span>{{ formData.basics.mainIngredientTypeStr }} -- {{formData.basics.mainIngredientStr}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">所属菜系:</span>
        <span>{{ formData.basics.skuStyleStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品性质:</span>
        <span>{{ formData.basics.natureStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">烹饪方式:</span>
        <span>{{ formData.basics.cookingMethodStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">味型:</span>
        <span>{{ formData.basics.smellStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">混杂性:</span>
        <span>{{ formData.basics.mixStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">品相:</span>
        <span>{{ formData.basics.appearanceStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">季节性:</span>
        <span>{{ formData.basics.seasonStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">厨房售价:</span>
        <span>{{ formData.basics.kitchenPrice }}</span>
      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">食材:</span>
        <span>{{ formData.basics.foodMaterials }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">附件:</span>
        <el-image
          :src="formData.basics.accessoryImg"
          style="width: 200px"
          v-if="formData.basics.accessoryImg"
        ></el-image>
      </div> -->

    </section>
    <!-- 成分信息 -->
    <section>
      <h3>成分信息</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品能量：</span>
        <span>{{ formData.dietician.energy }}Kcal</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">蛋白质：</span>
        <span>{{ formData.dietician.protein }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">碳水化合物：</span>
        <span>{{ formData.dietician.carbonwater }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">脂肪：</span>
        <span>{{ formData.dietician.fat }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">烹饪用盐：</span>
        <span>{{ formData.dietician.salt }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">膳食纤维：</span>
        <span>{{ formData.dietician.fiber }}g</span>
      </div>
    </section>
    <!-- 菜品标签 -->
    <section>
      <h3>小程序上架类目</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品类目：</span>

        <span>{{ formData.dietician.catalogFStr }}</span>

      </div>
      <div class="section-item">
        <span class="section-label label-1">营养素类目：</span>
        <span style="margin-right: 20px;">{{ formData.dietician.catalogVStr }}</span>
      </div>
     
      <!-- <div class="section-item">
        <span class="section-label label-1">是否需要生产：</span>
        <span>{{formData.dietician.tfsNeedProd == '01' ? '需要' : '不需要'}}</span>
      </div>-->
    </section>

    <section>
      <h3>菜品描述：</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品描述：</span>
        <span>{{ formData.dietician.suggestedIntroduce }}</span>
      </div>
    </section>
      <section>
      <h3>菜品配料：</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品配料：</span>
        <span>{{  formData.dietician.dosing  }}</span>
      </div>
    </section>

    <!-- 菜品标签 -->
    <section>
      <h3>菜品标签</h3>
     
      <div
        v-for="(item, index) in formData.dietician.labelVos"
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
        <span>{{ formData.dietician.shelfLife }} 天</span>
      </div>
    </section>
    <section>
      <h3>食材</h3>
      <div class="section-item">
        <span class="section-label label-1">食材：</span>
        <span style="margin-right: 20px;">{{ formData.dietician.ingredientStr }}</span>

      </div>
    </section>
    <!-- 推荐算法 -->
    <section>
      <h3>推荐算法</h3>
       <div class="section-item">
        <span class="section-label label-1">主供营养素：</span>

        <span style="margin-right: 20px;">{{ formData.dietician.locationStr }}</span>

      </div>

      <div class="section-item">
        <span class="section-label label-1">算法分类：</span>

        <span style="margin-right: 20px;">{{  formData.dietician.skutagStr }}</span>

      </div>
       <div class="section-item">
        <span class="section-label label-1">是否参与算法推荐：</span>

        <span style="margin-right: 20px;">{{  formData.dietician.joinArithmeticStr }}</span>

      </div>
    </section>
    <!-- 建议上架类别 -->
    <section>
      <h3>建议上架类别</h3>
      
      <div class="section-item">
        <span class="section-label label-1">菜品建议上架餐别：</span>

        <span style="margin-right: 20px;">{{ formData.dietician.categoryStr }}</span>

      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">菜品建议上架端口：</span>

        <span style="margin-right: 20px;">{{  formData.dietician.suggestedOpenMarketStr }}</span>

      </div> -->
    </section>
    <!-- 上架信息 -->
    <section v-if="formData.dietician.tfsStt != 50">
      <h2>上架信息</h2>
      <h3>基础上架信息</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品上架名称：</span>
        <span>{{ formData.dietician.skuName }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品制定价格：</span>
        <span style="margin-left: 10px;">{{ formData.operation.normalPrice }}元</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品实际价格：</span>
        <span style="margin-left: 10px;">{{ formData.operation.skuActualPrice }}元</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">供应时间：</span>
        <span style="margin-left: 10px;">{{ formData.operation.supplyStartDate }} 至</span>
        <span style="margin-left: 10px;">{{ formData.operation.supplyEndDate }}</span>
      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">供餐类型：</span>
        <span style="margin-left: 10px;">{{ formData.dietician.istest ? '正式供餐' : '测试供餐' }}</span>
      </div> -->

      <div class="section-item">
        <span class="section-label label-1">营养素类目：</span>

        <span style="margin-right: 20px;">{{ formData.operation.catalogVStr }}</span>

      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">上架餐别：</span>

        <span style="margin-right: 20px;">{{ formData.operation.categoryStr }}</span>

      </div>
      <div class="section-item">
        <span class="section-label label-1">上架端口：</span>

        <span style="margin-right: 20px;">{{ formData.operation.openMarketStr }}</span>

      </div> -->
      <div class="section-item">
        <span class="section-label label-1">是否ATM售卖：</span>
        <span>{{formData.operation.supplyAtmStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">关联必选餐具：</span>

        <span style="margin-right: 20px;">{{ formData.operation.tablewareStr }}</span>

      </div>

      <div class="section-item">
        <span class="section-label label-1">菜品描述图片：</span>
        <el-image
          :src="formData.operation.introduceImg[0]"
          style="width: 200px"
          v-if="formData.operation.introduceImg"
        ></el-image>
      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">菜品配料：</span>
        <span style="margin-left: 10px;">{{ formData.dietician.dosing }}</span>
      </div> -->
    </section>
    <!-- <section  v-if="formData.dietician.tfsStt != 50">
      <h3>供餐点信息</h3>
      <div class="section-item" v-for="(item, index) in formData.skuOpPreVo.hpVos" :key="index + 'radio'">
        <span class="section-label label-1">{{item.label}}:</span>
        <span v-for="(child, inx) in item.kvos" :key="inx" :label="child.value" style="margin-right: 10px;">
          <span v-if="child.check">{{child.label}}</span>
        </span>
      </div>
    </section>-->
    <section v-if="formData.operation.tfsStt != 50">
      <h3>运营信息</h3>
      <div class="section-item">
        <span class="section-label label-1">（选填）菜品封面标签：</span>
        <span style="margin-left: 10px;">{{ formData.operation.skuTitle }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1"> 名厨有话说：</span>
        <span style="margin-left: 10px;">{{ formData.operation.foodMasterStr }}</span>
      </div>
       <div
        v-if="formData.operation.foodMaster == 1"
        class="section-item"
      >
        <span class="section-label label-1">名厨：</span>
        <span style="margin-left: 10px;">{{ formData.operation.masterName }}</span>
      </div>

      <div
        v-if="formData.operation.foodMaster"
        class="section-item"
      >
        <span class="section-label label-1">名厨对菜品的描述：</span>
        <span style="margin-left: 10px;">{{ formData.operation.foodMasterDescribe }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品封面图片：</span>
        <el-image
          v-for="(url, inx) in formData.primaryUrl"
          :key="inx"
          style="width: 200px"
          :src="url"
          :preview-src-list="[url]"
        ></el-image>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品详情图片：</span>
        <el-image
          v-for="(url, inx) in formData.slideUrl"
          :key="inx"
          style="width: 200px"
          :src="url"
          :preview-src-list="[url]"
        ></el-image>
      </div>
    </section>
  </div>
</template>

<script>
// import ImageUpload from "@/components/ImageUpload.vue";
// import ConfirmDialog from "@/components/ConfirmDialog.vue";

export default {
  // components: {
  //   ImageUpload,
  //   ConfirmDialog
  // },
  data() {
    return {
      type: "",
      recordId: "",
      tfsCid: "",
      skuVersion: "",
      formData: {
        dietician: {},
        operation: {},
        primaryUrl: [],
        slideUrl: [],
        basics: {},
      },
    };
  },
  created() {
    this.recordId = this.$route.query.recordId;
    this.type = this.$route.query.type;
    // this.tfsCid = this.$route.query.tfsCid;
    // this.skuVersion = this.$route.query.skuVersion;
    this.getInfo();
  },
  methods: {
    getInfo() {
      let url = this.type
        ? "sku.SkuLibrary/skuInfo"
        : "sku.SkuLibrary/querySkuOperation";
      this.$request(url, {
        recordId: this.recordId,
        // tfsCid: this.tfsCid,
        // skuVersion: this.skuVersion,
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(
              this.formData.dietician,
              dataPage.dietician.dietician
            );
            Object.assign(
              this.formData.basics,
              dataPage.basics ? dataPage.basics : dataPage.basic
            );
            Object.assign(this.formData.operation, dataPage.operation);
            // this.formData.dietician.supplyStartDate = this.$day(
            //   this.formData.dietician.tfsSalestime
            // ).format("YYYY-MM-DD");
            // this.formData.dietician.tfsSaleetime = this.$day(
            //   this.formData.dietician.tfsSaleetime
            // ).format("YYYY-MM-DD");
            // // this.formData.dietician.istest = true;

            this.formData.primaryUrl = dataPage.operation.primaryUrl
              ? [dataPage.operation.primaryUrl]
              : [];
            //   this.formData.slideUrl = dataPage.operation.slideUrl
            // ? [ dataPage.operation.slideUrl]
            // : [];
            this.formData.slideUrl = dataPage.operation.slideUrl;
            // this.formData.operation.ingredientVos =
            //   this.formData.operation.ingredientVos.reduce((res, item) => {
            //     item.tList.forEach((it) => {
            //       if (it.check) {
            //         res.push(it.label);
            //       }
            //     });
            //     return res;
            //   }, []);
            // this.formData.dietician.tfsSalestime = dataPage.dietician.tfsSalestime
            //   ? this.$day(dataPage.dietician.tfsSalestime).format("YYYY-MM-DD")
            //   : "";
            // this.formData.dietician.tfsSaleetime = dataPage.dietician.tfsSaleetime
            //   ? this.$day(dataPage.dietician.tfsSaleetime).format("YYYY-MM-DD")
            //   : "";
            // this.formData.operation.labelVos.sort(
            //   (a, b) => a.integer - b.integer
            // );
            // this.formData.dietician.istest = true;
          }
        })
      );
    },
    changeVersion(index) {
      (this.recordId = this.formData.skuHist[index].recordId),
        (this.tfsCid = this.formData.skuHist[index].tfsCid),
        (this.skuVersion = this.formData.skuHist[index].skuVersion);
      this.getInfo();
    },
  },
};
</script>

<style lang="less" scoped>
.btn-footer {
  text-align: center;
}
.bold-label {
  font-weight: bold;
  font-size: 18px;
}
.label-1 {
  width: 150px;
  margin-right: 12px;
  text-align: right;
}
</style>
