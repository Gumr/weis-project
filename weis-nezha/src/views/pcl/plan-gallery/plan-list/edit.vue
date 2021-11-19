<template>
  <div class="page-container">
    <section>
      <h3>方案师</h3>
      <div class="section-item">
        <span class="section-label label-1">方案师选择：</span>
        <BaseSelect
          v-model="formData.tcDieticianUid"
          :options="dieticianOptions"
          clearable
          class="medium-input"
        ></BaseSelect>
      </div>
    </section>
    <section>
      <h3>基础信息</h3>
      <div class="section-item">
        <span class="section-label label-1">推荐列表封面：</span>
        <ImageUpload
          v-model:file-list="formData.listImg"
          :upload-data="{ flag: 'exception' }"
          :limit="1"
        />
        <span style="margin-left: 10px;font-size: 13px;color:#999999">图片尺寸 670 X 670</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">方案封面：</span>
        <ImageUpload
          v-model:file-list="formData.tcImgUrl"
          :upload-data="{ flag: 'exception' }"
          :limit="1"
        />
        <span style="margin-left: 10px;font-size: 13px;color:#999999">图片尺寸 172 X 218</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">方案标题：</span>
        <el-input v-model="formData.tcTitle" clearable class="medium-input" placeholder="方案标题"></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">方案描述：</span>
        <el-input
          v-model="formData.tcDescribe"
          clearable
          class="medium-input"
          type="textarea"
          placeholder="描述"
          row="6"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">方案排序：</span>
        <el-input
          v-model="formData.tcSort"
          clearable
          class="medium-input"
          placeholder="方案排序"
          @blur="checkText('tcSort')"
        ></el-input>
        <span
          style="width: 500px;font-size: 12px;"
        >提示：此处对应小程序端展示方案顺序；按正整数的正序排列；即：输入1则排在小程序方案内容区的最上方，999为排在小程序方案内容区的最下方</span>
      </div>
    </section>
    <section>
      <h3>方案信息</h3>
      <div class="section-item">
        <span class="section-label label-1">方案类型：</span>
        <BaseSelect
          v-model="formData.planType"
          clearable
          class="medium-input"
          :options="planTypeOptions"
          @change="planChange"
        ></BaseSelect>
      </div>
      <div class="section-item">
        <span class="section-label label-1">应用性别：</span>
        <el-radio-group v-model="formData.tcSex">
          <el-radio
            v-for="(item, index) in sexOptions"
            :key="index"
            :label="item.value"
          >
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </div>
      <div class="section-item">
        <span class="section-label label-1">(选填)建议BMI范围：</span>
        <el-input v-model="formData.tcBmiSta" class="mini-input3" @blur="checkText('tcBmiSta')"></el-input>
        <span style="margin:0 17px 0 12px">-</span>
        <el-input v-model="formData.tcBmiEnd" class="mini-input3" @blur="checkText('tcBmiEnd')"></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">(选填)建议体脂率范围：</span>
        <el-input
          v-model="formData.tcBodyfatSta"
          class="mini-input3"
          @blur="checkText('tcBodyfatSta')"
        ></el-input>%
        <span style="margin:0 9px 0 5px">-</span>
        <el-input
          v-model="formData.tcBodyfatEnd"
          class="mini-input3"
          @blur="checkText('tcBodyfatEnd')"
        ></el-input>%
      </div>
      <div class="section-item">
        <span class="section-label label-1">方案目标：</span>
        <BaseSelect
          v-model="formData.tcTarget"
          clearable
          class="medium-input"
          :options="tcTargetOptions"
        ></BaseSelect>
      </div>
      <div class="section-item">
        <span class="section-label label-1">应用时间：</span>
        <el-input
          v-model="formData.tcPeriod"
          clearable
          class="medium-input"
          placeholder="应用时间"
          @blur="checkText('tcPeriod')"
          @clear="tcPeriodClear"
        ></el-input>天
      </div>
      <div v-if="formData.planType == '01' && formData.planDetail.length" class="section-item">
        <span class="section-label label-1">每日安排：</span>
        <div class="day-group">
          <div
            v-for="(item, index) in formData.planDetail"
            :key="index"
            :class="['radio', item.isFinish ? 'success' : '', index == dayIndex ? 'active' : '']"
            @click="dayChange(index)"
          >
            第{{ index + 1 }}天
          </div>
        </div>
      </div>
    </section>
    <div v-if="formData.planDetail.length">
      <section>
        <h3>方案计算基础信息</h3>
        <div class="section-item">
          <span class="section-label label-1">计算类别：</span>
          <BaseSelect
            v-model="formData.planDetail[dayIndex].tcComputingMethod"
            filterable
            clearable
            class="medium-input"
            :options="computingOptions"
          ></BaseSelect>
        </div>
        <div class="section-item">
          <span class="section-label label-1"></span>
          <el-radio-group v-model="formData.planDetail[dayIndex].tcTrialWay">
            <el-radio
              v-for="(item, index) in planTrialWayOptions"
              :key="index"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </div>
        <div v-if="formData.planDetail[dayIndex].tcTrialWay === '02'" class="section-item">
          <span class="section-label label-1">单位体重蛋白质：</span>
          <el-input
            v-model="formData.planDetail[dayIndex].tcUnitWeightProtein"
            clearable
            class="medium-input"
            placeholder="单位体重蛋白质"
            @blur="checkText2('tcUnitWeightProtein')"
          ></el-input>g/Kg
        </div>
        <div v-if="formData.planDetail[dayIndex].tcTrialWay === '02'" class="section-item">
          <span class="section-label label-1">蛋白分配比：</span>
          <el-tag class="tag first-tag">早餐</el-tag>:
          <el-tag class="tag" type="danger">午餐</el-tag>:
          <el-tag class="tag" type="success">晚餐</el-tag>:
          <el-tag class="tag" type="info">加餐</el-tag>=
          <el-input
            v-model="formData.planDetail[dayIndex].tcRatioProteinBreakfast"
            clearable
            class="mini-input"
            placeholder
            @blur="checkText2('tcRatioProteinBreakfast')"
          ></el-input>% :
          <el-input
            v-model="formData.planDetail[dayIndex].tcRatioProteinLunch"
            clearable
            class="mini-input"
            placeholder
            @blur="checkText2('tcRatioProteinLunch')"
          ></el-input>% :
          <el-input
            v-model="formData.planDetail[dayIndex].tcRatioProteinDinner"
            clearable
            class="mini-input"
            placeholder
            @blur="checkText2('tcRatioProteinDinner')"
          ></el-input>%
          <el-input
            v-model="formData.planDetail[dayIndex].tcRatioProteinSnack"
            clearable
            class="mini-input"
            placeholder
            @blur="checkText2('tcRatioProteinSnack')"
          ></el-input>%
        </div>
        <div class="section-item">
          <span class="section-label label-1">差值算法</span>
          <BaseSelect
            v-model="formData.planDetail[dayIndex].differenceValue"
            class="medium-input"
            :options="differenceOptions"
          ></BaseSelect>
        </div>
        <div class="section-item">
          <span class="section-label label-1">调整量：</span>
          <el-input
            v-model="formData.planDetail[dayIndex].tcBasicMetabolismAdjust"
            clearable
            class="medium-input"
            placeholder="调整量"
            @blur="checkText2('tcBasicMetabolismAdjust')"
          ></el-input>Kcal
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
          <el-input
            v-model="formData.planDetail[dayIndex].tcRatioBreakfast"
            clearable
            class="mini-input"
            placeholder
            @blur="checkText2('tcRatioBreakfast')"
          ></el-input>% :
          <el-input
            v-model="formData.planDetail[dayIndex].tcRatioLunch"
            clearable
            class="mini-input"
            placeholder
            @blur="checkText2('tcRatioLunch')"
          ></el-input>% :
          <el-input
            v-model="formData.planDetail[dayIndex].tcRatioDinner"
            clearable
            class="mini-input"
            placeholder
            @blur="checkText2('tcRatioDinner')"
          ></el-input>% :
          <el-input
            v-model="formData.planDetail[dayIndex].tcRatioSnack"
            clearable
            class="mini-input"
            placeholder
            @blur="checkText2('tcRatioDinner')"
          ></el-input>%
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
            <el-input
              v-model="formData.planDetail[dayIndex].eachmealnutrient.breakfast.protein"
              clearable
              class="mini-input2"
              placeholder="蛋白质"
              @blur="checkText3('breakfast', 'protein')"
            ></el-input>%
            <el-input
              v-model="formData.planDetail[dayIndex].eachmealnutrient.lunch.protein"
              clearable
              class="mini-input2"
              placeholder="蛋白质"
              @blur="checkText3('lunch', 'protein')"
            ></el-input>%
            <el-input
              v-model="formData.planDetail[dayIndex].eachmealnutrient.supper.protein"
              clearable
              class="mini-input2"
              placeholder="蛋白质"
              @blur="checkText3('supper', 'protein')"
            ></el-input>%
            <el-input
              v-model="formData.planDetail[dayIndex].eachmealnutrient.snack.protein"
              clearable
              class="mini-input2"
              placeholder="蛋白质"
              @blur="checkText3('snack', 'protein')"
            ></el-input>%
          </span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">脂肪：</span>
          <span>
            <el-input
              v-model="formData.planDetail[dayIndex].eachmealnutrient.breakfast.fat"
              clearable
              class="mini-input2"
              placeholder="脂肪"
              @blur="checkText3('breakfast', 'fat')"
            ></el-input>%
            <el-input
              v-model="formData.planDetail[dayIndex].eachmealnutrient.lunch.fat"
              clearable
              class="mini-input2"
              placeholder="脂肪"
              @blur="checkText3('lunch', 'fat')"
            ></el-input>%
            <el-input
              v-model="formData.planDetail[dayIndex].eachmealnutrient.supper.fat"
              clearable
              class="mini-input2"
              placeholder="脂肪"
              @blur="checkText3('supper', 'fat')"
            ></el-input>%
            <el-input
              v-model="formData.planDetail[dayIndex].eachmealnutrient.snack.fat"
              clearable
              class="mini-input2"
              placeholder="脂肪"
              @blur="checkText3('snack', 'fat')"
            ></el-input>%
          </span>
        </div>
        <div v-if="formData.planDetail[dayIndex].tcTrialWay != '02'" class="section-item">
          <span class="section-label label-1">碳水化合物：</span>
          <span>
            <el-input
              v-model="formData.planDetail[dayIndex].eachmealnutrient.breakfast.carbohydrate"
              clearable
              class="mini-input2"
              placeholder="碳水化合物"
              @blur="checkText3('breakfast', 'carbohydrate')"
            ></el-input>%
            <el-input
              v-model="formData.planDetail[dayIndex].eachmealnutrient.lunch.carbohydrate"
              clearable
              class="mini-input2"
              placeholder="碳水化合物"
              @blur="checkText3('lunch', 'carbohydrate')"
            ></el-input>%
            <el-input
              v-model="formData.planDetail[dayIndex].eachmealnutrient.supper.carbohydrate"
              clearable
              class="mini-input2"
              placeholder="碳水化合物"
              @blur="checkText3('supper', 'carbohydrate')"
            ></el-input>%
            <el-input
              v-model="formData.planDetail[dayIndex].eachmealnutrient.snack.carbohydrate"
              clearable
              class="mini-input2"
              placeholder="碳水化合物"
              @blur="checkText3('snack', 'carbohydrate')"
            ></el-input>%
          </span>
        </div>
      </section>
      <section>
        <h3>标签选择</h3>
        <div class="section-item">
          <span class="section-label label-1"></span>
          <div class="checkboxgroup">
            <el-checkbox-group v-model="formData.planDetail[dayIndex].tagValue" :max="3">
              <el-checkbox
                v-for="(item, index) in tagList"
                :key="index"
                :label="index"
                @change="checkTag()"
              >
                {{ item.tclName }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <div class="section-item">
          <span class="section-label label-1">已选标签：</span>
          <div class="checkedgroup">
            <span v-for="(item, index) in formData.planDetail[dayIndex].tagLabel" :key="index">
              <div class="check-label">
                {{ item.tclName }}
                <span class="check-label-close" @click="removeTag(index)">x</span>
              </div>
            </span>
          </div>
        </div>
      </section>
    </div>
    <footer class="btn-footer">
      <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </footer>
  </div>
</template>

<script>
// import BaseSelect from '@/components/BaseSelect.vue';
// import areafrom from '@/utils/select_area.json';
import ImageUpload from '@/components/ImageUpload.vue'

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
      protein: '0',
      fat: '0',
      carbohydrate: '0'
    }
  }
}

function createPlanDetail(options) {
  return {
    signDay: options.signDay,
    tcComputingMethod: '',
    tcTrialWay: '01',
    tcUnitWeightProtein: '',
    tcRatioProteinSnack: '0',
    tcRatioProteinBreakfast: '',
    tcRatioProteinLunch: '',
    tcRatioProteinDinner: '',
    tcBasicMetabolismAdjust: '',
    tcRatioBreakfast: '',
    tcRatioLunch: '',
    tcRatioDinner: '',
    tcRatioSnack: '0',
    tagValue: [],
    tagLabel: [],
    eachmealnutrient: createEachmealnutrient()
  }
}

export default {
  components: {
    ImageUpload
  },
  data() {
    return {
      tcId:　'',
      loading: false,
      dieticianOptions: [], // 方案师
      sexOptions: [], // 性别
      tcTargetOptions: [], // 方案目标
      planTrialWayOptions: [],
      planTypeOptions: [],
      differenceOptions: [],
      computingOptions: [],
      formData: {
        listImg: [],
        planType: '',
        tcDieticianUid: '',
        tcImgUrl: [],
        tcTitle: '',
        tcDescribe: '',
        tcSort: '',
        tcSex: '',
        tcBmiSta: '',
        tcBmiEnd: '',
        tcBodyfatSta: '',
        tcBodyfatEnd: '',
        tcTarget: '',
        tcPeriod: '',
        planDetail: []
      },
      tagValue: [],
      tagList: [], // 标签
      tagLabel: [], // 已选标签
      dayIndex: 0
    }
  },
  created() {
    this.tcId = this.$route.query.tcId
    this.getTarget()
  },
  methods: {
    // 选择方案类型
    planChange(e) {
      this.dayIndex = 0
      this.formData.tcPeriod = ''
      this.formData.planDetail = []
      if (e == '00') {
        this.formData.planDetail.push(createPlanDetail({
          signDay: 1
        }))
      }
    },
    dayChange(index) {
      if (index == this.dayIndex) return
      const res = this.checkPlanInfo()
      if (res) {
        if (index != 0) {
          if (!this.formData.planDetail[index - 1].isFinish) {
            this.$msg('请按顺序填写方案信息', 'error')
            return
          }
        }
        this.dayIndex = index
      }
    },
    tcPeriodClear() {
      this.dayIndex = 0
      this.formData.planDetail = []
    },
    checkText(type) {
      const arr = ['tcBmiSta', 'tcBmiEnd', 'tcBodyfatSta', 'tcBodyfatEnd']
      const toFixed = arr.includes(type) ? 2 : 0
      this.formData[type] = this.formData[type] == '' ? '' : (isNaN(this.formData[type]) ? '' : Number(Math.abs(this.formData[type])).toFixed(toFixed))
      // BMI
      if (type == 'tcBmiSta' || type == 'tcBmiEnd') {
        this.formData.tcBmiEnd = Number(this.formData.tcBmiSta) > Number(this.formData.tcBmiEnd) ? this.formData.tcBmiSta : this.formData.tcBmiEnd
        this.formData.tcBmiEnd = this.formData.tcBmiSta === '' ? '' : this.formData.tcBmiEnd
      }
      // 建议体脂率
      if (type == 'tcBodyfatSta' || type == 'tcBodyfatEnd') {
        this.formData.tcBodyfatEnd = Number(this.formData.tcBodyfatSta) > Number(this.formData.tcBodyfatEnd) ? this.formData.tcBodyfatSta : this.formData.tcBodyfatEnd
        this.formData.tcBodyfatEnd = this.formData.tcBodyfatSta === '' ? '' : this.formData.tcBodyfatEnd
      }
      // 应用时间
      if (type == 'tcPeriod' && this.formData.planType == '01') {
        if (this.formData.tcPeriod === '') {
          this.dayIndex = 0
          this.formData.planDetail = []
        } else {
          this.formData.tcPeriod = this.formData.tcPeriod > 30 ? 30 : (this.formData.tcPeriod < 1 ? 1 : this.formData.tcPeriod)
          if (this.formData.tcPeriod > this.formData.planDetail.length) {
            const length = this.formData.tcPeriod - this.formData.planDetail.length
            for (let i = 0; i < length; i++) {
              this.formData.planDetail.push(createPlanDetail({
                signDay: i + 1
              }))
            }
          } else {
            this.dayIndex = 0
            this.formData.planDetail = this.formData.planDetail.slice(0, this.formData.tcPeriod)
          }
        }
      }
    },
    checkText2(type) {
      if (type == 'tcBasicMetabolismAdjust') {
        let res = this.formData.planDetail[this.dayIndex].tcBasicMetabolismAdjust
        res = res == '' ? '' : (isNaN(res) ? '' : Number(res).toFixed(2))
        this.formData.planDetail[this.dayIndex].tcBasicMetabolismAdjust = res
        return
      }
      const arr = ['tcUnitWeightProtein', 'tcRatioProteinBreakfast', 'tcRatioProteinLunch', 'tcRatioProteinDinner', 'tcRatioBreakfast', 'tcRatioLunch', 'tcRatioDinner']
      const toFixed = arr.includes(type) ? 2 : 0
      let res = this.formData.planDetail[this.dayIndex][type]
      res = res == '' ? '' : (isNaN(res) ? '' : Number(Math.abs(res)).toFixed(toFixed))
      this.formData.planDetail[this.dayIndex][type] = res
    },
    checkText3(type1, type2) {
      let res = this.formData.planDetail[this.dayIndex].eachmealnutrient[type1][type2]
      res = res == '' ? '' : (isNaN(res) ? '' : Number(Math.abs(res)).toFixed(2))
      this.formData.planDetail[this.dayIndex].eachmealnutrient[type1][type2] = res
    },
    async getTarget() {
      const res = await this.$http('plan.Plan/addPlanInfo', {})
      this.tagList = res.obj.label
      this.planTypeOptions = Object.entries(res.obj.planType).map(item => ({ value: item[0], label: item[1] }))
      this.dieticianOptions = res.obj.dietician.map(item => ({ label: item.tcdName, value: item.tcdId }))
      this.sexOptions = Object.entries(res.obj.sex).map(item => ({ value: item[0], label: item[1] }))
      this.tcTargetOptions = Object.entries(res.obj.target).map(item => ({ value: item[0], label: item[1] }))
      this.planTrialWayOptions = Object.entries(res.obj.planTrialWay).map(item => ({ value: item[0], label: item[1] }))
      this.computingOptions = Object.entries(res.obj.computingMethod).map(item => ({ value: item[0], label: item[1] }))
      this.differenceOptions = Object.entries(res.obj.differenceValue).map(item => ({ value: item[0], label: item[1] }))
      if (this.tcId) {
        this.getInfo()
      }
    },
    // 标签选择
    checkTag(index) {
      this.formData.planDetail[this.dayIndex].tagLabel = []
      this.formData.planDetail[this.dayIndex].tagValue.forEach((item) => {
        this.formData.planDetail[this.dayIndex].tagLabel.push(this.tagList[item])
      })
    },
    removeTag(index) {
      this.formData.planDetail[this.dayIndex].tagValue.splice(index, 1)
      this.formData.planDetail[this.dayIndex].tagLabel.splice(index, 1)
    },
    async getInfo() {
      const res = await this.$http('plan.Plan/planInfo', { id: this.tcId })
      Object.assign(this.formData, res.obj)
      this.formData.tcSex = res.obj.tcSex
      this.formData.listImg = [{ url: this.formData.listImg }]
      this.formData.tcImgUrl = [{ url: this.formData.tcImgUrl }]
      this.formData.tcDieticianUid = String(this.formData.tcDieticianUid)
      this.formData.tcBmiSta = Number(this.formData.tcBmiSta) == 0 ? '' : this.formData.tcBmiSta
      this.formData.tcBmiEnd = Number(this.formData.tcBmiEnd) == 0 ? '' : this.formData.tcBmiEnd
      this.formData.tcBodyfatSta = Number(this.formData.tcBodyfatSta) == 0 ? '' : this.formData.tcBodyfatSta
      this.formData.tcBodyfatEnd = Number(this.formData.tcBodyfatEnd) == 0 ? '' : this.formData.tcBodyfatEnd
      this.formData.planDetail.sort((a, b) => a.signDay - b.signDay)
      this.formData.planDetail.forEach((item) => {
        item.tagValue = []
        item.tcUnitWeightProtein = Number(item.tcUnitWeightProtein) == 0 ? '' : item.tcUnitWeightProtein
        item.tcRatioProteinBreakfast = Number(item.tcRatioProteinBreakfast) == 0 ? '' : item.tcRatioProteinBreakfast
        item.tcRatioProteinLunch = Number(item.tcRatioProteinLunch) == 0 ? '' : item.tcRatioProteinLunch
        item.tcRatioProteinDinner = Number(item.tcRatioProteinDinner) == 0 ? '' : item.tcRatioProteinDinner
        item.tcRatioProteinSnack = Number(item.tcRatioProteinSnack) == 0 ? '0' : item.tcRatioProteinSnack
        item.tagLabel = JSON.parse(item.tcLabel)
        item.tagLabel.forEach((label) => {
          const index = this.tagList.findIndex(tag => tag.tclId == label.tclId)
          item.tagValue.push(index)
        })

        item.eachmealnutrient = item.eachmealnutrient ? Object.assign(createEachmealnutrient(), item.eachmealnutrient)  : createEachmealnutrient()
      })
      if (Number(this.formData.tcPeriod) > this.formData.planDetail.length) {
        const num = Number(this.formData.tcPeriod) - this.formData.planDetail.length
        for (let i = 0; i < num; i++) {
          this.formData.planDetail.push(createPlanDetail({}))
          this.formData.planDetail.forEach((item, index) => {
            item.signDay = (index + 1)
          })
        }
      }
    },
    async handleConfirm() {
      if (!this.formData.tcDieticianUid) {
        this.$msg('请选择方案师', 'error')
        return
      }
      if (!this.formData.tcImgUrl.length) {
        this.$msg('请上传方案封面', 'error')
        return
      }
      if (!this.formData.tcTitle) {
        this.$msg('请选择方案标题', 'error')
        return
      }
      if (!this.formData.tcDescribe) {
        this.$msg('请选择方案描述', 'error')
        return
      }
      if (!this.formData.tcSort) {
        this.$msg('请选择方案排序', 'error')
        return
      }
      if (!this.formData.planType) {
        this.$msg('请选择方案类型', 'error')
        return
      }
      if (!this.formData.tcSex) {
        this.$msg('请选择应用性别', 'error')
        return
      }
      if (!this.formData.tcTarget) {
        this.$msg('请选择方案目标', 'error')
        return
      }
      if (!this.formData.tcPeriod) {
        this.$msg('请输入应用时间', 'error')
        return
      }
      const flag = this.checkPlanInfo()
      if (flag) {
        try {
          await this.$confirm('确认以上信息并提交？', '提示', {
            confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', center: true
          })
          const params = this.$deepClone(this.formData)
          params.planDetail = params.planDetail.filter(item => item.isFinish)
          params.listImg = params.listImg[0].response ? params.listImg[0].response.obj.imageUrl : params.listImg[0].url
          params.tcImgUrl = params.tcImgUrl[0].response ? params.tcImgUrl[0].response.obj.imageUrl : params.tcImgUrl[0].url
          params.planDetail.forEach((item) => {
            item.label = item.tagLabel.map(item => item.tclId)
            if (item.tcTrialWay == '02') {
              item.eachmealnutrient.breakfast.protein = ''
              item.eachmealnutrient.breakfast.carbohydrate = ''
              item.eachmealnutrient.lunch.protein = ''
              item.eachmealnutrient.lunch.carbohydrate = ''
              item.eachmealnutrient.supper.protein = ''
              item.eachmealnutrient.supper.carbohydrate = ''
              item.eachmealnutrient.snack.protein = ''
              item.eachmealnutrient.snack.carbohydrate = ''
            } else {
              item.tcRatioProteinBreakfast = ''
              item.tcRatioProteinLunch = ''
              item.tcRatioProteinDinner = ''
              item.tcRatioProteinSnack = ''
            }
          })
          this.loading = true
          const url = this.tcId ? 'plan.Plan/editPlan' : 'plan.Plan/addPlan'
          if (this.tcId) {
            params.planId = this.tcId
          }
          const res = await this.$http(url, params)
          if (!res.errMsg) {
            this.$msg('操作成功', 'success')
            this.$closeRoute()
          } else {
            this.$msg(res.errMsg, 'error')
          }
          this.loading = false
        } catch (e) {
          console.log('用户取消')
        }
      }
    },
    // 校验方案信息
    checkPlanInfo() {
      const params = this.$deepClone(this.formData.planDetail[this.dayIndex])
      if (!params.tcComputingMethod) {
        this.$msg('请选择计算类别', 'error')
        return false
      }
      if (!params.differenceValue) {
        this.$msg('请选择差值算法', 'error')
        return false
      }
      if (params.tcTrialWay == '02') { // 固定蛋白法
        if (!params.tcUnitWeightProtein) {
          this.$msg('请输入单位体重蛋白质', 'error')
          return false
        }
        if (Number(params.tcRatioProteinBreakfast * 100)
        + Number(params.tcRatioProteinLunch * 100)
        + Number(params.tcRatioProteinDinner * 100)
        + Number(params.tcRatioProteinSnack * 100) != 10000) {
          this.$msg('蛋白配比应等于100', 'error')
          return false
        }
      }
      if (params.tcBasicMetabolismAdjust === '') {
        this.$msg('请输入调整量', 'error')
        return false
      }
      if (params.tcTrialWay == '01') {
        if (Number(params.eachmealnutrient.breakfast.protein * 100)
        + Number(params.eachmealnutrient.breakfast.fat * 100)
        + Number(params.eachmealnutrient.breakfast.carbohydrate * 100) != 10000) {
          this.$msg('早餐营养素摄入应等于100', 'error')
          return false
        }
        if (Number(params.eachmealnutrient.lunch.protein * 100)
        + Number(params.eachmealnutrient.lunch.fat * 100)
        + Number(params.eachmealnutrient.lunch.carbohydrate * 100) != 10000) {
          this.$msg('午餐营养素摄入应等于100', 'error')
          return false
        }
        if (Number(params.eachmealnutrient.supper.protein* 100)
        + Number(params.eachmealnutrient.supper.fat * 100)
        + Number(params.eachmealnutrient.supper.carbohydrate * 100) != 10000) {
          this.$msg('晚餐营养素摄入应等于100', 'error')
          return false
        }
        if (Number(params.eachmealnutrient.snack.protein * 100)
        + Number(params.eachmealnutrient.snack.fat * 100)
        + Number(params.eachmealnutrient.snack.carbohydrate * 100) != 10000) {
          this.$msg('加餐营养素摄入应等于100', 'error')
          return false
        }
      }
      if (Number(params.tcRatioBreakfast * 100)
      + Number(params.tcRatioLunch * 100)
      + Number(params.tcRatioDinner * 100)
      + Number(params.tcRatioSnack * 100) != 10000) {
        this.$msg('四餐能量配比应等于100', 'error')
        return false
      }
      if (!params.tagValue.length) {
        this.$msg('请选择标签', 'error')
        return false
      }
      this.formData.planDetail[this.dayIndex].isFinish = true
      return true
    },
    async handleCancel() {
      try {
        await this.$confirm('确定取消？', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', center: true
        })
        this.$closeRoute()
      } catch (e) {
        console.log('用户取消')
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
  margin-right: 61px;
}
.mini-input3 {
  width: 100px;
  margin-right: 5px;
}
.mini-input2 {
  width: 100px;
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
  width: 180px;
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
  background-color: #409eff !important;
  border: 1px solid #409eff !important;
  color: white !important;
}
.success {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}
</style>
