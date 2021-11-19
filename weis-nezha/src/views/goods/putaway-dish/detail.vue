<template>
  <div class="page-container">
    <section>
      <section>
        <h3>历史版本</h3>
        <span class="section-label label-1">历史版本：</span>
        <el-button
          v-for="(item, index) in formData.skuHist"
          :key="index"
          :type="formData.skuBean.tfsVersion == (index + 1) ? 'primary' : ''"
          @click="changeVersion(index)"
        >
          {{ (index + 1) + '.0' }}
        </el-button>
      </section>
      <h3>基础信息</h3>
      <div class="section-item">
        <span class="section-label label-1">当前版本：</span>
        <span>{{ formData.skuBean.tfsVersion }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品名称：</span>
        <span>{{ formData.skuBean.tfsSuggestedSkuname }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品编码：</span>
        <span>{{ formData.skuBean.tfsCid }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品规格：</span>
        <span>{{ formData.skuBean.tfsQuality + formData.skuBean.tfsUnit }}</span>
      </div>
    </section>
    <!-- 成分信息 -->
    <section>
      <h3>成分信息</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品能量：</span>
        <span>{{ formData.skuBean.tfsEnergy }}Kcal</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">蛋白质：</span>
        <span>{{ formData.skuBean.tfsProtein }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">碳水化合物：</span>
        <span>{{ formData.skuBean.tfsCarbonwater }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">脂肪：</span>
        <span>{{ formData.skuBean.tfsFat }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">烹饪用盐：</span>
        <span>{{ formData.skuBean.tfsSalt }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">膳食纤维：</span>
        <span>{{ formData.skuBean.tfsFiber }}g</span>
      </div>
    </section>
    <!-- 菜品标签 -->
    <section>
      <h3>小程序上架类目</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品类目：</span>
        <span
          v-for="(item, index) in formData.skuPreVo.catalogF"
          :key="index"
        >
          <span v-if="item.check">{{ item.label }}</span>
        </span>
      </div>
            <div class="section-item">
        <span class="section-label label-1">营养类目：</span>
        <span
          v-for="(item, index) in formData.skuPreVo.catalogV"
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
        <span>{{formData.skuBean.tfsNeedProd == '01' ? '需要' : '不需要'}}</span>
      </div>-->
    </section>

    <section>
      <h3>菜品描述</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品描述：</span>
        <span>{{ formData.skuBean.tfsIntroduce }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品描述图片：</span>
        <el-image
          :src="formData.skuBean.tfsIntroduceImg"
          style="width: 200px"
          v-if="formData.skuBean.tfsIntroduceImg"
        ></el-image>
      </div>
    </section>
    <section>
      <h3>菜品配料</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品配料：</span>
        <span>{{ formData.skuBean.tfsDosing }}</span>
      </div>
    </section>

    <!-- 菜品标签 -->
    <section>
      <h3>菜品标签</h3>

      <div
        v-for="(item, index) in formData.skuPreVo.labelVos"
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
      <div class="section-item ">
        <span class="section-label label-1 bold-label">保质期：</span>
        <span>{{ formData.skuBean.tfsShelfLife }} 天</span>
      </div>
    </section>
    <section v-if="formData.skuPreVo.ingredientVos && formData.skuPreVo.ingredientVos.length">
      <h3>食材</h3>
      <div class="section-item">
        <span class="section-label label-1">食材：</span>
        <span
          v-for="(label, index) in formData.skuPreVo.ingredientVos"
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
          v-for="(item, index) in formData.skuPreVo.locationsVos"
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
          v-for="(item, index) in formData.skuPreVo.skuTagVos"
          :key="index"
        >
          <span
            v-if="item.check"
            style="margin-right: 20px;"
          >{{ item.label }}</span>
        </span>
      </div>
       <div class="section-item">
        <span class="section-label label-1">是否参与算法：</span>
        <span>{{ formData.skuBean.tfsJoinArithmeticStr }}</span>
       </div>
    </section>
    <!-- 建议上架类别 -->
    <section>
      <h3>建议上架类别</h3>

      <div class="section-item">
        <span class="section-label label-1">菜品建议上架餐别：</span>
        <span
          v-for="(item, index) in formData.skuPreVo.categroyVos"
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
          v-for="(item, index) in formData.skuPreVo.openMarketVos"
          :key="index"
        >
          <span
            v-if="item.check"
            style="margin-right: 20px;"
          >{{ item.label }}</span>
        </span>
      </div> -->
    </section>
    <!-- 上架信息 -->
    <section v-if="formData.skuBean.tfsStt != 50">
      <h2>上架信息</h2>
      <h3>基础上架信息</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品上架名称：</span>
        <span>{{ formData.skuBean.tfsSkuname }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品制定价格：</span>
        <span style="margin-left: 10px;">{{ formData.skuBean.tfsNormalPrice }}元</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品实际价格：</span>
        <span style="margin-left: 10px;">{{ formData.skuBean.tfsPrice }}元</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">供应时间：</span>
        <span style="margin-left: 10px;">{{ formData.skuBean.tfsSalestime }} 至</span>
        <span style="margin-left: 10px;">{{ formData.skuBean.tfsSaleetime }}</span>
      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">供餐类型：</span>
        <span style="margin-left: 10px;">{{ formData.skuBean.istest ? '正式供餐' : '测试供餐' }}</span>
      </div> -->

      <div class="section-item">
        <span class="section-label label-1">上架营养素类别：</span>
        <span
          v-for="(item, index) in formData.skuOpPreVo.catalogV"
          :key="index"
        >
          <span
            v-if="item.check"
            style="margin-right: 20px;"
          >{{ item.label }}</span>
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">上架餐别：</span>
        <span
          v-for="(item, index) in formData.skuOpPreVo.categroyVos"
          :key="index"
        >
          <span
            v-if="item.check"
            style="margin-right: 20px;"
          >{{ item.label }}</span>
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">上架端口：</span>
        <span
          v-for="(item, index) in formData.skuOpPreVo.openMarketVos"
          :key="index"
        >
          <span
            v-if="item.check"
            style="margin-right: 20px;"
          >{{ item.label }}</span>
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">是否ATM售卖：</span>
        <span>{{formData.skuBean.tfsSupplyAtm == '00' ?'否':'是'}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">关联必选餐具：</span>
        <span
          v-for="(item, index) in formData.skuPreVo.wareVos"
          :key="index"
        >
          <span
            v-if="item.check"
            style="margin-right: 20px;"
          >{{ item.label }}</span>
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品描述：</span>
        <span style="margin-left: 10px;">{{ formData.skuBean.tfsIntroduce }}</span>
      </div>
    </section>
    <!-- <section  v-if="formData.skuBean.tfsStt != 50">
      <h3>供餐点信息</h3>
      <div class="section-item" v-for="(item, index) in formData.skuOpPreVo.hpVos" :key="index + 'radio'">
        <span class="section-label label-1">{{item.label}}:</span>
        <span v-for="(child, inx) in item.kvos" :key="inx" :label="child.value" style="margin-right: 10px;">
          <span v-if="child.check">{{child.label}}</span>
        </span>
      </div>
    </section>-->
    <section v-if="formData.skuBean.tfsStt != 50">
      <h3>运营信息</h3>
      <div class="section-item">
        <span class="section-label label-1">（选填）菜品封面标签：</span>
        <span style="margin-left: 10px;">{{ formData.skuBean.tfsSkuTitle }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">  名厨有话说：</span>
        <span style="margin-left: 10px;">{{ formData.skuBean.haveMaster ? '是' : '否' }}</span>
      </div>
       <div class="section-item">
        <span class="section-label label-1">  名厨：</span>
        <span style="margin-left: 10px;">{{ formData.skuBean.masterName }}</span>
      </div>
      <div
        v-if="formData.skuBean.haveMaster"
        class="section-item"
      >
        <span class="section-label label-1">名厨对菜品的描述：</span>
        <span style="margin-left: 10px;">{{ formData.skuBean.masterComm }}</span>
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
      tfsId: "",
      tfsCid: "",
      tfsVersion: "",
      formData: {
        skuBean: {},
        skuPreVo: {},
        primaryUrl: [],
        slideUrl: [],
        skuOpPreVo: {},
      },
    };
  },
  created() {
    this.tfsId = this.$route.query.tfsId;
    this.tfsCid = this.$route.query.tfsCid;
    this.tfsVersion = this.$route.query.tfsVersion;
    this.getInfo();
  },
  methods: {
    getInfo() {
      this.$request("Sku/querySkuDetail", {
        tfsId: this.tfsId,
        tfsCid: this.tfsCid,
        tfsVersion: this.tfsVersion,
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.formData, dataPage);
            this.formData.skuBean.tfsSalestime = this.$day(
              this.formData.skuBean.tfsSalestime
            ).format("YYYY-MM-DD");
            this.formData.skuBean.tfsSaleetime = this.$day(
              this.formData.skuBean.tfsSaleetime
            ).format("YYYY-MM-DD");
            // this.formData.skuBean.istest = true;
            this.formData.primaryUrl = dataPage.skuBean.primaryUrl
              ? [dataPage.skuBean.primaryUrl]
              : [];
            this.formData.slideUrl = dataPage.skuBean.slideUrl;
            this.formData.skuPreVo.ingredientVos =
              this.formData.skuPreVo.ingredientVos.reduce((res, item) => {
                item.tList.forEach((it) => {
                  if (it.check) {
                    res.push(it.label);
                  }
                });
                return res;
              }, []);
            this.formData.skuBean.tfsSalestime = dataPage.skuBean.tfsSalestime
              ? this.$day(dataPage.skuBean.tfsSalestime).format("YYYY-MM-DD")
              : "";
            this.formData.skuBean.tfsSaleetime = dataPage.skuBean.tfsSaleetime
              ? this.$day(dataPage.skuBean.tfsSaleetime).format("YYYY-MM-DD")
              : "";
            this.formData.skuPreVo.labelVos.sort(
              (a, b) => a.integer - b.integer
            );
            // this.formData.skuBean.istest = true;
          }
        })
      );
    },
    changeVersion(index) {
      (this.tfsId = this.formData.skuHist[index].tfsId),
        (this.tfsCid = this.formData.skuHist[index].tfsCid),
        (this.tfsVersion = this.formData.skuHist[index].tfsVersion);
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
