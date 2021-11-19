<template>
  <div class="page-container">
    <section>
      <p class="section-title">基本信息</p>
      <div class="display-flex detail-item">
        <span class="item-label">食物图片： </span>
        <el-image
          v-for="(image, index) in food.images"
          :key="index"
          class="food-image"
          :src="image.image"
        ></el-image>
      </div>
      <div class="display-flex detail-item">
        <span class="item-label">食物名称：</span>
        <span>{{ food.tduuName }}</span>
      </div>
      <div class="display-flex detail-item">
        <span class="item-label">食物ID：</span>
        <span>{{ food.tduuId }}</span>
      </div>
      <!-- <div class="display-flex detail-item">
        <span class="item-label">菜系：</span>
        <span></span>
      </div> -->
      <div class="display-flex detail-item">
        <span class="item-label">品牌：</span>
        <span>{{ food.tduuBrand }}</span>
      </div>
      <!-- <div class="display-flex detail-item">
        <span class="item-label">口味：</span>
        <span></span>
      </div> -->
    </section>
    <section class="material-section display-flex">
      <div>
        <p class="section-title">主要食材</p>
        <div v-for="(item, index) in mainMaterialList" :key="index">
          <div class="display-flex detail-item">
            <span class="item-label">食材名称：</span>
            <div class="display-flex align-center">
              <BaseSelect
                v-model="item.tflrCid"
                class="detail-input"
                :options="item.opts"
                :remote-method="query => remoteQueryName(query, index)"
                :loading="queryNameLoading"
                remote
                filterable
                @change="recountNutritionData"
              ></BaseSelect>
              <el-button
                size="small"
                type="danger"
                @click="delMaterialClick(index)"
              >
                删除
              </el-button>
              <!-- <el-button size="small" type="info">详情</el-button> -->
            </div>
          </div>
          <div class="display-flex detail-item">
            <span class="item-label">重量：</span>
            <div class="display-flex align-center">
              <el-input
                v-model="item.tflrWeight"
                class="detail-input"
                @change="recountNutritionData"
              ></el-input>
              <span>g</span>
            </div>
          </div>
        </div>
        <div class="add-form-btn-box">
          <el-button
            size="small"
            @click="addMaterialClick"
          >
            添加食材
          </el-button>
        </div>
      </div>
    </section>
    <section>
      <p class="section-title">对应营养元素</p>
      <div class="display-flex detail-item">
        <span class="item-label">能量：</span>
        <div class="display-flex  align-center">
          <el-input
            v-model="nutrition.calory"
            class="detail-input"
          ></el-input>
          <span>kcal</span>
        </div>
      </div>
      <div class="display-flex detail-item">
        <span class="item-label">蛋白质：</span>
        <div class="display-flex  align-center">
          <el-input
            v-model="nutrition.protein"
            class="detail-input"
          ></el-input>
          <span>g</span>
        </div>
      </div>
      <div class="display-flex detail-item">
        <span class="item-label">脂肪：</span>
        <div class="display-flex  align-center">
          <el-input
            v-model="nutrition.fat"
            class="detail-input"
          ></el-input>
          <span>g</span>
        </div>
      </div>
      <div class="display-flex detail-item">
        <span class="item-label">碳水化合物：</span>
        <div class="display-flex  align-center">
          <el-input
            v-model="nutrition.carbohydrate"
            class="detail-input"
          ></el-input>
          <span>g</span>
        </div>
      </div>
    </section>
    <section class="add-form-btn-box">
      <el-button
        size="small"
        type="primary"
        @click="submitClick"
      >
        上线
      </el-button>
      <el-button
        size="small"
        type="success"
        @click="saveClick"
      >
        保存
      </el-button>
      <el-button
        size="small"
        type="warning"
        @click="backPage"
      >
        取消
      </el-button>
    </section>
  </div>
</template>

<script>
import { round } from '@/utils/common';
// import ConfirmDialog from '@/components/ConfirmDialog.vue';

class MainMateria {
  constructor(opt = {
    id: '', weight: '', opts: []
  }) {
    this.tflrCid = opt.id;
    this.tflrWeight = opt.weight;
    this.opts = opt.opts;
  }
}

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
      mainMaterialList: [],
      materialNameOpts: [],
      queryNameLoading: false,
    };
  },
  created() {
    if (this.$route.query.id) this.getFoodDetail(this.$route.query.id);
  },
  methods: {
    backPage() {
      this.$router.back();
    },
    addMaterialClick() {
      this.mainMaterialList.push(new MainMateria());
    },
    delMaterialClick(idx) {
      this.mainMaterialList.splice(idx, 1);
      this.recountNutritionData();
    },
    recountNutritionData() {
      const list = this.mainMaterialList.filter(({ tflrCid, tflrWeight }) => tflrCid && tflrWeight);
      if (list.length) {
        this.nutrition = list.reduce((res, mainMateria) => {
          const materia = mainMateria.opts.find(item => item.value === mainMateria.tflrCid);
          const radio = mainMateria.tflrWeight / materia.weight;

          res.protein = round(res.protein + materia.protein * radio, 2);
          res.fat = round(res.fat + materia.fat * radio, 2);
          res.carbohydrate = round(res.carbohydrate + materia.carbohydrate * radio, 2);
          res.calory = round(res.calory + materia.calory * radio, 2);

          return res;
        }, {
          protein: 0, // 蛋白质
          fat: 0, // 脂肪
          carbohydrate: 0, // 碳水化合物
          calory: 0// 卡路里
        });
      } else {
        this.nutrition = {
          protein: '', // 蛋白质
          fat: '', // 脂肪
          carbohydrate: '', // 碳水化合物
          calory: '' // 卡路里
        };
      }
    },
    validateMainMaterial() {
      const { mainMaterialList } = this;
      // eslint-disable-next-line
      for (const idx in mainMaterialList) {
        const val = mainMaterialList[idx];

        if (!(val.tflrCid && val.tflrWeight)) {
          return idx;
        }
      }

      return -1;
    },
    queryFoodList(name) {
      return this.$request('Diet/queryFoodLibList', {
        qurName: name,
        pageNo: 1,
        pageSize: 50
      }).then(({ data }) => {
        let list = [];

        if (data.errCode === 0) {
          list = data.obj.record.map((item) => {
            item.label = item.name;
            item.value = item.id;
            return item;
          });
        }

        return list;
      });
    },
    async remoteQueryName(query, index) {
      if (query !== '') {
        const item = this.mainMaterialList[index];
        item.opts = await this.queryFoodList(query);
      }
    },
    getFoodDetail(id) {
      this.$request('Diet/getDietUserUploadInfo', {
        tduuid: id
      }).then(({ data }) => {
        if (data.errCode === 0) {
          const detail = data.obj;

          this.food = detail;

          const foodOpts = detail.foodLibrary.map(item => this.queryFoodList(item.foodlibName));

          Promise.all(foodOpts).then((optsList) => {
            this.mainMaterialList = optsList.map((opts, idx) => {
              const item = detail.foodLibrary[idx];
              return {
                ...item,
                id: item.tflrCid,
                weight: item.tflrWeight,
                opts,
                tflrCid: opts.length ? item.tflrCid : '',
                tflrWeight: opts.length ? item.tflrWeight : '',
              };
            });
            this.recountNutritionData();
          });
          this.nutrition = {
            protein: detail.tduuProteinTotal,
            fat: detail.tduuFatTotal,
            carbohydrate: detail.tduuCarbohydrateTotal,
            calory: detail.tduuTotalKcal
          };
        }
      });
    },
    filterMainMaterialList(list) {
      return list.map((item) => {
        const $item = { ...item };
        // const match = $item.opts.find(opt => opt.id === $item.tflrCid);

        // $item.foodlibName = match.name;
        // $item.totalkcal = match.totalkcal;
        // $item.protein = match.protein;
        // $item.fat = match.fat;
        // $item.carbohydrate = match.carbohydrate;
        delete $item.opts;
        return $item;
      });
    },
    submitOnline() {
      this.$request('Diet/setDietUserUploadSttOnline', {
        tduuid: this.$route.query.id,
        ...this.nutrition,
        totalkcal: this.nutrition.calory,
        data: this.filterMainMaterialList(this.mainMaterialList)
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.$message({
            type: 'success',
            message: '上线成功'
          });
          this.$closeRoute()
        } else {
          this.$message({
            type: 'error',
            message: data.errMsg
          });
        }
      });
    },
    saveClick() {
      const params = {
        tduuid: this.$route.query.id,
        ...this.nutrition,
        totalkcal: this.nutrition.calory,
        data: this.filterMainMaterialList(this.mainMaterialList)
      };
      if (params.data.length <= 0) delete params.data;
      this.$request('Diet/saveFood', params).then(({ data }) => {
        if (data.errCode === 0) {
          this.$closeRoute()
        }
      });
    },
    submitClick() {
      this.$msgbox({
        title: '提示',
        message: '确认上线',
        center: true,
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(() => {
        const valid = this.validateMainMaterial();
        if (valid === -1) {
          this.submitOnline();
        } else {
          this.$message({
            type: 'warning',
            message: `请填写完整${valid + 1}项食材`
          });
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.section-title {
  font-size: 20px;
}

.food-image {
  margin-right: 14px;
  max-width: 500px;
  max-height: 500px;
}

.align-center {
  align-items: center;
}

.detail-item {
  margin: 14px 0;
}

.detail-input {
  margin-right: 8px;
}

.add-form-btn-box {
  text-align: center;
}

.item-label {
  display: inline-block;
  width: 140px;
  text-align: right;
}
</style>
