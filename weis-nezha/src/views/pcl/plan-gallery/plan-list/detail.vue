<template>
  <div class="page-container">
    <section>
      <h3>方案师</h3>
      <div class="section-item">
        <span class="section-label label-1">方案师选择：</span>
        <span>{{ formData.tcDieticianName }}</span>
      </div>
    </section>
    <section>
      <h3>基础信息</h3>
      <div class="section-item">
        <span class="section-label label-1">推荐列表封面：</span>
        <el-image
          v-for="(url, inx) in formData.listImg"
          :key="inx"
          style="width: 200px"
          :src="url"
          :preview-src-list="[url]"
        ></el-image>
      </div>
      <div class="section-item">
        <span class="section-label label-1">方案封面：</span>
        <el-image
          v-for="(url, inx) in formData.tcImgUrl"
          :key="inx"
          style="width: 200px"
          :src="url"
          :preview-src-list="[url]"
        ></el-image>
      </div>
      <div class="section-item">
        <span class="section-label label-1">方案标题：</span>
        <span>{{ formData.tcTitle }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">方案描述：</span>
        <span>{{ formData.tcDescribe }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">方案排序：</span>
        <span>{{ formData.tcSort }}</span>
      </div>
    </section>
    <section>
      <h3>方案信息</h3>
      <div class="section-item">
        <span class="section-label label-1">方案类型：</span>
        <span>{{ formData.planTypeStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">应用性别：</span>
        <span>{{ formData.tcSexStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">建议BMI范围：</span>
        <span>{{ formData.tcBmiSta ? formData.tcBmiSta + '%' : '' }}</span>
        <span style="margin:0 10px">-</span>
        <span>{{ formData.tcBmiEnd ? formData.tcBmiEnd + '%' : '' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">建议体脂率范围：</span>
        <span>{{ formData.tcBodyfatSta ? formData.tcBodyfatSta + '%' : '' }}</span>
        <span style="margin:0 10px">-</span>
        <span>{{ formData.tcBodyfatEnd ? formData.tcBodyfatEnd + '%' : '' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">方案目标：</span>
        <span>{{ formData.tcTargetStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">应用时间：</span>
        <span>{{ formData.tcPeriod }}</span>
      </div>
      <div v-if="formData.planType == '01'" class="section-item">
        <span class="section-label label-1">每日安排：</span>
        <div class="day-group">
          <div
            v-for="(item, index) in formData.planDetail"
            :key="index"
            :class="['radio', index == dayIndex ? 'active' : '']"
            @click="dayChange(index)"
          >
            第{{ index + 1 }}天
          </div>
        </div>
      </div>
    </section>
    <section>
      <h3>方案计算基础信息</h3>
      <div class="section-item">
        <span class="section-label label-1">计算类别：</span>
        <span>{{ formData.planDetail[dayIndex].tcComputingMethodStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1"></span>
        <span>{{ formData.planDetail[dayIndex].tcTrialWayStr }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">差值算法</span>
        <span>{{ formData.planDetail[dayIndex].differenceValueStr }}</span>
      </div>
      <div v-if="formData.planDetail[dayIndex].tcTrialWay === '02'" class="section-item">
        <span class="section-label label-1">单位体重蛋白质：</span>
        <span>{{ formData.planDetail[dayIndex].tcUnitWeightProtein }}g/Kg</span>
      </div>
      <div v-if="formData.planDetail[dayIndex].tcTrialWay === '02'" class="section-item">
        <span class="section-label label-1">蛋白分配比：</span>
        <el-tag class="tag first-tag">早餐</el-tag>:
        <el-tag class="tag" type="danger">午餐</el-tag>:
        <el-tag class="tag" type="success">晚餐</el-tag>:
        <el-tag class="tag" type="info">晚餐</el-tag>=
        <span class="tag">{{ formData.planDetail[dayIndex].tcRatioProteinBreakfast }}%</span> :
        <span class="tag">{{ formData.planDetail[dayIndex].tcRatioProteinLunch }}%</span> :
        <span class="tag">{{ formData.planDetail[dayIndex].tcRatioProteinDinner }}%</span>
        <span class="tag">{{ formData.planDetail[dayIndex].tcRatioProteinSnack }}%</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">调整量：</span>
        <span>{{ formData.planDetail[dayIndex].tcBasicMetabolismAdjust }}</span>Kcal
      </div>
    </section>
    <section>
      <h3>三餐能量分配比</h3>
      <div class="section-item">
        <span class="section-label label-1"></span>
        <el-tag class="tag first-tag">早餐</el-tag>:
        <el-tag class="tag" type="danger">午餐</el-tag>:
        <el-tag class="tag" type="success">晚餐</el-tag>:
        <el-tag class="tag" type="info">加餐</el-tag>=
        <span class="tag">{{ formData.planDetail[dayIndex].tcRatioBreakfast }}%</span> :
        <span class="tag">{{ formData.planDetail[dayIndex].tcRatioLunch }}%</span> :
        <span class="tag">{{ formData.planDetail[dayIndex].tcRatioDinner }}%</span> :
        <span class="tag">{{ formData.planDetail[dayIndex].tcRatioSnack }}%</span>
      </div>
    </section>
    <section>
      <h3>每日各营养素摄入安排</h3>
      <div class="section-item">
        <span class="section-label label-1"></span>
        <span class="mini2-label">
          <el-tag class="tag first-tag">早餐</el-tag>
        </span>
        <span class="mini2-label">
          <el-tag class="tag" type="danger">午餐</el-tag>
        </span>
        <span class="mini2-label">
          <el-tag class="tag" type="success">晚餐</el-tag>
        </span>
        <span class="mini2-label">
          <el-tag class="tag" type="info">加餐</el-tag>
        </span>
      </div>
      <div v-if="formData.planDetail[dayIndex].tcTrialWay != '02'" class="section-item">
        <span class="section-label label-1">蛋白质：</span>
        <span>
          <span
            class="section-label label-3"
          >{{ formData.planDetail[dayIndex].eachmealnutrient.breakfast.protein }}%</span>
          <span
            class="section-label label-3"
          >{{ formData.planDetail[dayIndex].eachmealnutrient.lunch.protein }}%</span>
          <span
            class="section-label label-3"
          >{{ formData.planDetail[dayIndex].eachmealnutrient.supper.protein }}%</span>
          <span
            class="section-label label-3"
          >{{ formData.planDetail[dayIndex].eachmealnutrient.snack.protein }}%</span>
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">脂肪：</span>
        <span>
          <span
            class="section-label label-3"
          >{{ formData.planDetail[dayIndex].eachmealnutrient.breakfast.fat }}%</span>
          <span
            class="section-label label-3"
          >{{ formData.planDetail[dayIndex].eachmealnutrient.lunch.fat }}%</span>
          <span
            class="section-label label-3"
          >{{ formData.planDetail[dayIndex].eachmealnutrient.supper.fat }}%</span>
          <span
            class="section-label label-3"
          >{{ formData.planDetail[dayIndex].eachmealnutrient.snack.fat }}%</span>
        </span>
      </div>
      <div v-if="formData.planDetail[dayIndex].tcTrialWay != '02'" class="section-item">
        <span class="section-label label-1">碳水化合物：</span>
        <span>
          <span
            class="section-label label-3"
          >{{ formData.planDetail[dayIndex].eachmealnutrient.breakfast.carbohydrate }}%</span>
          <span
            class="section-label label-3"
          >{{ formData.planDetail[dayIndex].eachmealnutrient.lunch.carbohydrate }}%</span>
          <span
            class="section-label label-3"
          >{{ formData.planDetail[dayIndex].eachmealnutrient.supper.carbohydrate }}%</span>
          <span
            class="section-label label-3"
          >{{ formData.planDetail[dayIndex].eachmealnutrient.snack.carbohydrate }}%</span>
        </span>
      </div>
    </section>
    <section>
      <h3>标签</h3>
      <div class="section-item">
        <span class="section-label label-1"></span>
        <div class="checkedgroup">
          <span v-for="(item, index) in formData.planDetail[dayIndex].tcLabel" :key="index">
            <div class="check-label">{{ item.tclName }}</div>
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// import ImageUpload from '@/components/ImageUpload.vue'
function createEachmealnutrient() {
  return {
    breakfast: {
      protein: '',
      fat: '',
      carbohydrate: ''
    },
    lunch: {
      protein: '',
      fat: '',
      carbohydrate: ''
    },
    supper: {
      protein: '',
      fat: '',
      carbohydrate: ''
    },
    snack: {
      protein: '',
      fat: '',
      carbohydrate: ''
    }
  }
}
export default {
  components: {
    // ImageUpload
  },
  data() {
    return {
      tcId:　'',
      formData: {
        tcDieticianName: '',
        listImg: [],
        tcImgUrl: [],
        tcTitle: '',
        planDetail: [
          {
            tcComputingMethod: '',
            tcTrialWay: '01',
            tcUnitWeightProtein: '',
            tcRatioProteinBreakfast: '',
            tcRatioProteinLunch: '',
            tcRatioProteinDinner: '',
            tcBasicMetabolismAdjust: '',
            tcRatioBreakfast: '',
            tcRatioLunch: '',
            tcRatioDinner: '',
            tagValue: [],
            tagLabel: [],
            eachmealnutrient: createEachmealnutrient()
          }
        ]
      },
      tagValue: [],
      tagList: [], // 标签
      tagLabel: [], // 已选标签
      dayIndex: 0
    }
  },
  created() {
    this.tcId = this.$route.query.tcId
    this.getInfo()
  },
  methods: {
    dayChange(index) {
      this.dayIndex = index
    },
    async getInfo() {
      const res = await this.$http('plan.Plan/planInfo', { id: this.tcId })
      Object.assign(this.formData, res.obj)
      this.formData.listImg = [this.formData.listImg]
      this.formData.tcImgUrl = [this.formData.tcImgUrl]
      this.formData.planDetail.forEach((item) => {
        item.tcLabel = JSON.parse(item.tcLabel)
        item.eachmealnutrient = Object.assign(createEachmealnutrient(), item.eachmealnutrient || null)
      })
      if (Number(this.formData.tcPeriod) > this.formData.planDetail.length) {
        const num = Number(this.formData.tcPeriod) - this.formData.planDetail.length
        for (let i = 0; i < num; i++) {
          this.formData.planDetail.push({
            tcComputingMethod: '',
            tcTrialWay: '01',
            tcUnitWeightProtein: '',
            tcRatioProteinBreakfast: '',
            tcRatioProteinLunch: '',
            tcRatioProteinDinner: '',
            tcBasicMetabolismAdjust: '',
            tcRatioBreakfast: '',
            tcRatioLunch: '',
            tcRatioDinner: '',
            tagValue: [],
            tagLabel: [],
            eachmealnutrient: createEachmealnutrient()
          })
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
:deep(.el-radio-button__inner) {
  width: 80px;
  border-left: 1px solid #cccccc;
}
:deep(.el-textarea__inner) {
  line-height: 3 !important;
}
section {
  padding-top: 0px;
}
.medium-input {
  width: 240px;
  margin-right: 10px;
}
.medium-select {
  width: 240px;
}
.rule {
  padding-left: 150px;
}
.tiny-input {
  width: 150px;
  margin-right: 5px;
}
.mini-input {
  width: 100px;
  margin: 0 10px;
}
.mini2-label {
  margin-right: 30px;
}
.mini-input2 {
  width: 120px;
  margin-right: 3px;
  margin-left: 25px;
  &:first-child {
    margin-left: 0 !important;
  }
}
.tag {
  width: 70px;
  height: 40px;
  margin: 0 10px;
  line-height: 40px;
  text-align: center;
}
.first-tag {
  margin-left: 0;
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

.btn {
  width: 70px;
  height: 30px;
  border: 1px solid #cccccc;
  font-size: 14px;
  text-align: center;
  line-height: 30px;
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
  width: 150px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}
.label-3 {
  width: 100px;
  margin-right: 20px;
}
h3 {
  margin-left: 22px;
}
.checkedgroup {
  width: 530px;
  min-height: 120px;
  border: 1px solid #cccccc;
  display: block;
  padding: 10px;
  .el-checkbox {
    width: 100px;
    font-size: 20px;
  }
}
.check-label {
  border-radius: 20px;
  padding: 5px 10px;
  background-color: #eeeeee;
  float: left;
  margin-right: 20px;
  margin-bottom: 15px;
  font-size: 13px;
  position: relative;

  .check-label-close {
    width: 18px;
    height: 18px;
    border: 1px solid #cccccc;
    border-radius: 100%;
    background-color: #fff;
    position: absolute;
    top: -6px;
    right: -9px;
    z-index: 999;
    text-align: center;
    line-height: 15px;
    cursor: pointer;
  }
}
.tip {
  font-size: 13px;
  margin-left: 20px;
  width: 500px;
}
.day-group {
  width: 900px;
  height: auto;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.radio {
  width: 85px;
  font-size: 14px;
  height: 38px;
  border: 1px solid #dcdfe6;
  color: #606266;
  text-align: center;
  line-height: 38px;
  cursor: pointer;
  margin-right: -1px;
  margin-bottom: -1px;
}
.active {
  background-color: #409eff;
  border: 1px solid #409eff;
  color: white;
}
</style>
