<template>
  <div class="page-container">
    <!-- 基础信息 -->
    <section>
      <h3>基础信息</h3>
      <div class="section-item">
        <span class="section-label label-1">当前版本：</span>
        <span>{{ infolist.skuBean.tfsVersion + '.0' }}</span>
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
    <!-- 描述 -->
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
        <span class="section-label label-1">营养素类目：</span>
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
      <h3>描述</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品建议/描述：</span>
        <span>{{ infolist.skuBean.tfsSuggestedIntroduce }}</span>
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
        <span>{{ infolist.skuBean.tfsShelfLife }} 天</span>
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
        <span class="section-label label-1">是否参与算法：</span>
         <span>{{ infolist.skuBean.tfsJoinArithmeticStr }}</span>
      </div>
    </section>
    <!-- 建议上架类别 -->
    <section>
      <h3>建议上架类别</h3>

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
    </section>
    <section>
      <h3>历史版本</h3>
      <span class="section-label label-1">历史版本：</span>
      <el-button
        v-for="(item, index) in skuHist"
        :key="index"
        :type="infolist.skuBean.version == (index + 1) ? 'primary' : ''"
        @click="changeVersion(index)"
      >
        {{ (index + 1) + '.0' }}
      </el-button>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tfsId: "",
      tfsCid: "",
      tfsVersion: "",
      infolist: {
        skuBean: {},
        skuPreVo: {},
      },
      skuHist: [],
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
            Object.assign(this.infolist, dataPage);
            this.infolist.skuPreVo.labelVos.sort(
              (a, b) => a.integer - b.integer
            );
            this.infolist.skuPreVo.ingredientVos =
              this.infolist.skuPreVo.ingredientVos.reduce((res, item) => {
                item.tList.forEach((it) => {
                  if (it.check) {
                    res.push(it.label);
                  }
                });
                return res;
              }, []);
            this.skuHist = dataPage.skuHist;
          }
        })
      );
    },
    changeVersion(index) {
      (this.tfsId = this.skuHist[index].tfsId),
        (this.tfsCid = this.skuHist[index].tfsCid),
        (this.tfsVersion = this.skuHist[index].tfsVersion);
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
