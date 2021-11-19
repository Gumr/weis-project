<template>
  <div class="page-container">
    <!-- 基础信息 -->
    <section>
      <h3>基础信息</h3>
      <div class="section-item">
        <span class="section-label label-1">当前版本：</span>
        <span>{{ infolist.version + '.0' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品名称：</span>
        <span>{{ infolist.skuName }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品编码：</span>
        <span>{{ infolist.skuCid }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品规格：</span>
        <span>{{ infolist.quality + infolist.unit }}</span>
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
        <span class="section-label label-1">菜品能量：</span>
        <span>{{ infolist.energy }}Kcal</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">蛋白质：</span>
        <span>{{ infolist.protein }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">脂肪：</span>
        <span>{{ infolist.fat }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">碳水化合物：</span>
        <span>{{ infolist.carbonwater }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">烹饪用盐：</span>
        <span>{{ infolist.salt }}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">膳食纤维：</span>
        <span>{{ infolist.fiber }}g</span>
      </div>
    </section>
    <!-- 描述 -->
    <section>
      <h3>小程序上架类目</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品类目:</span>
        <span>{{ infolist.catalogFStr }}</span>
      </div>

      <div class="section-item">
        <span class="section-label label-1">营养素类目：</span>
        <span style="margin-right: 20px;">{{ infolist.catalogVStr }}</span>
      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">是否需要生产：</span>
        <span>{{infolist.skuBean.tfsNeedProd == '01' ? '需要' : '不需要'}}</span>
      </div>-->
    </section>
    <section>
      <h3>描述</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品建议/描述：</span>
        <span>{{ infolist.suggestedIntroduce }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品配料：</span>
        <span>{{ infolist.dosing }}</span>
      </div>
    </section>
    <!-- 菜品标签 -->
    <section>
      <h3>菜品标签</h3>

      <div
        v-for="(item, index) in infolist.labelVos"
        :key="index"
        class="section-item"
      >
        <span
          class="section-label label-1 "
          :class="item.integer === 1 ? 'bold-label' : ''"
        >{{ item.label }}：</span>
        <span
          v-for="(it, inx) in item.tList"
          :key="inx"
        >
          <span
            v-if="it.check"
            style="margin-right: 20px;"
          >{{ it.label }}</span>
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-1 bold-label">保质期：</span>
        <span>{{ infolist.shelfLife }} 天</span>
      </div>
    </section>
    <section v-if="infolist.ingredientStr">
      <h3>食材</h3>
      <div class="section-item">
        <span class="section-label label-1">食材：</span>
        <span style="margin-right: 20px;">{{ infolist.ingredientStr }}</span>
      </div>
    </section>

    <!-- 推荐算法 -->
    <section>
      <h3>推荐算法</h3>
      <div class="section-item">
        <span class="section-label label-1">主供营养素：</span>
        <span style="margin-right: 20px;">{{ infolist.locationStr }}</span>

      </div>
      <div class="section-item">
        <span class="section-label label-1">算法分类：</span>
        <span style="margin-right: 20px;">{{ infolist.skutagStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">是否参与算法：</span>
        <span style="margin-right: 20px;">{{ infolist.joinArithmeticStr }}</span>
      </div>
    </section>
    <!-- 建议上架类别 -->
    <section>
      <h3>建议上架类别</h3>
      <div class="section-item">
        <span class="section-label label-1">上架餐别：</span>

        <span style="margin-right: 20px;">{{ infolist.categoryStr }}</span>

      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">菜品建议上架端口：</span>

        <span style="margin-right: 20px;">{{ infolist.suggestedOpenMarketStr }}</span>

      </div> -->
    </section>
    <section>
      <!-- <h3>历史版本</h3>
      <span class="section-label label-1">历史版本：</span>
      <el-button
        v-for="(item, index) in skuHist"
        :key="index"
        :type="infolist.skuBean.version == (index + 1) ? 'primary' : ''"
        @click="changeVersion(index)"
      >
        {{ (index + 1) + '.0' }}
      </el-button> -->
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      basics: {},
      recordId: "",
      skuCid: "",
      version: "",
      infolist: {
        skuBean: {},
        skuPreVo: {},
      },
      skuHist: [],
    };
  },
  created() {
    this.recordId = this.$route.query.recordId;
    // this.skuCid = this.$route.query.skuCid
    // this.version = this.$route.query.version
    this.getInfo();
  },
  methods: {
    getInfo() {
      this.$request("sku.SkuLibrary/querySkuDieticianInfo", {
        recordId: this.recordId,
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.basics, dataPage.basics);
            Object.assign(this.infolist, dataPage.dietician);
          }
        })
      );
    },
    changeVersion(index) {
      (this.recordId = this.skuHist[index].recordId),
        (this.skuCid = this.skuHist[index].skuCid),
        (this.version = this.skuHist[index].version);
      this.getInfo();
    },
  },
};
</script>

<style lang="less" scoped>
section {
  padding-top: 30px;
}
.medium-input {
  width: 240px;
}
.medium-select {
  width: 70px;
  margin-left: 10px;
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

.btn-footer {
  text-align: center;
}
.label-1 {
  width: 160px;
  margin-right: 12px;
  text-align: right;
}
.bold-label {
  font-weight: bold;
  font-size: 18px;
}
.label-2 {
  width: 100px;
}

.label-3,
h3 {
  margin-left: 22px;
}
</style>
