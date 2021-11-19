<template>
  <div class="page-container">
    <div>状态: {{ currentStatusText }}</div>
    <div class="reject-box"></div>
    <section>
      <p class="section-title">基本信息</p>
      <div class="display-flex detail-item">
        <span class="item-label">食物图片：</span>
        <el-image
          class="food-image"
          v-for="(image, index) in food.images"
          :key="index"
          :preview-src-list="[image.image]"
          :src="image.image"
        />
      </div>
      <div class="display-flex detail-item">
        <span class="item-label">食物名称：</span>
        <span>{{ food.tduuName }}</span>
      </div>
      <div class="display-flex detail-item">
        <span class="item-label">食物ID：</span>
        <span>{{ food.tduuId }}</span>
      </div>
      <div class="display-flex detail-item">
        <span class="item-label">品牌：</span>
        <span>{{ food.tduuBrand }}</span>
      </div>
      <!-- <div class="display-flex detail-item">
        <span class="item-label">口味：</span>
        <span></span>
      </div> -->
    </section>
    <section class="material-section display-flex" v-if="food.tduuStt === '12'">
      <div>
        <p class="section-title">主要食材</p>
        <div v-for="(item, index) in mainMaterialList" :key="index">
          <div class="display-flex detail-item">
            <span class="item-label">食材名称：</span>
            <div class="display-flex align-center">
              <span class="detail-input">{{ item.name }}</span>
            </div>
          </div>
          <div class="display-flex detail-item">
            <span class="item-label">重量：</span>
            <div class="display-flex align-center">
              <span class="detail-input">{{ item.weight }}</span>
              <span>g</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="food.tduuStt === '12'">
      <p class="section-title">对应营养元素</p>
      <div class="display-flex detail-item">
        <span class="item-label">能量：</span>
        <div class="display-flex  align-center">
          <span class="detail-input">{{ nutrition.calory }}</span>
          <span>kcal</span>
        </div>
      </div>
      <div class="display-flex detail-item">
        <span class="item-label">蛋白质：</span>
        <div class="display-flex  align-center">
          <span class="detail-input">{{ nutrition.protein }}</span>
          <span>g</span>
        </div>
      </div>
      <div class="display-flex detail-item">
        <span class="item-label">脂肪：</span>
        <div class="display-flex  align-center">
          <span class="detail-input">{{ nutrition.fat }}</span>
          <span>g</span>
        </div>
      </div>
      <div class="display-flex detail-item">
        <span class="item-label">碳水化合物：</span>
        <div class="display-flex  align-center">
          <span class="detail-input">{{ nutrition.carbohydrate }}</span>
          <span>g</span>
        </div>
      </div>
    </section>
    <!-- <section class="add-form-btn-box">
      <el-button size="small" type="primary" @click="submitClick"
        >上线</el-button
      >
      <el-button size="small" type="success">保存</el-button>
      <el-button size="small" type="warning">取消</el-button>
    </section> -->
  </div>
</template>

<script>


const StatusMap = {
  12: '已上线',
  10: '已通过',
  11: '已驳回',
  '00': '待审核'
};

export default {
  components: {
    // ConfirmDialog
  },
  data() {
    return {
      food: {
        images: []
      },
      nutrition: {
        protein: '', // 蛋白质
        fat: '', // 脂肪
        carbohydrate: '', // 碳水化合物
        calory: '' // 卡路里
      },
      currentStatusText: '待审核',
      mainMaterialList: [],
      materialNameOpts: [],
      queryNameLoading: false,
    };
  },
  methods: {
    getFoodDetail(id) {
      this.$request('Diet/getDietUserUploadInfo', {
        tduuid: id
      }).then(({ data }) => {
        if (data.errCode === 0) {
          const detail = data.obj;

          this.food = detail;
          this.currentStatusText = StatusMap[detail.tduuStt];
          // foodlibName;
          this.mainMaterialList = detail.foodLibrary.map(item => ({
            name: item.foodlibName,
            weight: item.tflrWeight
          }));

          this.nutrition = {
            protein: detail.tduuProteinTotal,
            fat: detail.tduuFatTotal,
            carbohydrate: detail.tduuCarbohydrateTotal,
            calory: detail.tduuTotalKcal
          };
        }
      });
    },

  },
  created() {
    if (this.$route.query.id) this.getFoodDetail(this.$route.query.id);
  }
};
</script>

<style lang="less" scoped>
.section-title {
  font-size: 20px;
}

.align-center {
  align-items: center;
}

.detail-item {
  margin: 14px 0;
}

.food-image {
  max-width: 240px;
  max-height: 240px;
}

.detail-input {
  margin-right: 8px;
}

.add-form-btn-box {
  text-align: center;
}

.item-label {
  display: inline-block;
  width: 120px;
  text-align: right;
}
</style>
