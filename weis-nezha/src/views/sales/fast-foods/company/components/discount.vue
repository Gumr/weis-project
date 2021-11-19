<template>
  <div>
    <h3>限制规则</h3>
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>员工单日优惠点餐餐数上限：
      </span>
      <el-input
        v-model="discountInfo.tgcEmpOrderLimit"
        clearable
        class="medium-input"
        @blur="checkText('tgcEmpOrderLimit')"
      ></el-input>餐
    </div>
    <div class="section-item">
      <span class="section-label label-1">（选填）早餐：</span>
      <el-input
        v-model="discountInfo.tgcBreakfastLimit"
        clearable
        class="medium-input"
        @blur="checkText('tgcBreakfastLimit')"
      ></el-input>餐
    </div>
    <div class="section-item">
      <span class="section-label label-1">（选填）午餐：</span>
      <el-input
        v-model="discountInfo.tgcLunchLimit"
        clearable
        class="medium-input"
        @blur="checkText('tgcLunchLimit')"
      ></el-input>餐
    </div>
    <div class="section-item">
      <span class="section-label label-1">（选填）晚餐：</span>
      <el-input
        v-model="discountInfo.tgcDinnerLimit"
        clearable
        class="medium-input"
        @blur="checkText('tgcDinnerLimit')"
      ></el-input>餐
    </div>
    <h3>补助金额</h3>
    <div style="padding-left: 280px;">
      <el-radio-group
        v-model="discountInfo.tgcSubsidyType"
        @change="handleSubsidyTypeChange"
      >
        <el-radio v-for="type in subsidyTypes" :key="type.value" :label="type.value">{{ type.label }}</el-radio>
      </el-radio-group>
    </div>
    <div v-if="discountInfo.tgcSubsidyType === '00'" style="padding-left: 280px; margin: 12px 0;">
      <NumberInput
        v-model="discountInfo.tgcEmpSubsidy"
        clearable
        class="mini-input"
        mode="digit"
        :precision="2"
      ></NumberInput>元
    </div>
    <div v-if="discountInfo.tgcSubsidyType === '01'">
      <div class="section-item" style="padding-left: 280px;">
        <span style="margin-right: 20px;">早餐</span>
        <NumberInput
          v-model="discountInfo.tgcEmpBreakfastSubsidy "
          clearable
          class="mini-input"
          mode="digit"
          :precision="2"
        ></NumberInput>元
      </div>
      <div class="section-item" style="padding-left: 280px;">
        <span style="margin-right: 20px;">午餐</span>
        <NumberInput
          v-model="discountInfo.tgcEmpLunchSubsidy"
          clearable
          class="mini-input"
          mode="digit"
          :precision="2"
        ></NumberInput>元
      </div>
      <div class="section-item" style="padding-left: 280px;">
        <span style="margin-right: 20px;">晚餐</span>
        <NumberInput
          v-model="discountInfo.tgcEmpDinnerSubsidy"
          clearable
          class="mini-input"
          mode="digit"
          :precision="2"
        ></NumberInput>元
      </div>
    </div>
    <!-- <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>接口人团膳单餐金额：
      </span>
      <el-input
        v-model="discountInfo.tgcGroupSingleAmount"
        clearable
        class="medium-input"
        @blur="checkText('tgcGroupSingleAmount')"
      ></el-input>元
    </div> -->
    <!-- <h3>优惠规则</h3>
    <div class="section-item">
      <span class="section-label label-1">（选填）员工团膳点餐享受折扣：</span>
      <el-input
        v-model="discountInfo.tgcEmpDiscount"
        clearable
        class="medium-input"
        @blur="checkText('tgcEmpDiscount')"
      ></el-input>折（仅推荐套餐，用户单点 [0＜折扣≤10] ）
    </div> -->
    <!-- <div class="section-item">
      <span class="section-label label-1">（选填）员工团膳单日点餐补助金额上限：</span>
      <span style="margin-right: 20px;">早餐</span>
      <el-input
        v-model="discountInfo.tgcEmpBreakfastSubsidy"
        clearable
        class="mini-input"
        @blur="checkText('tgcEmpBreakfastSubsidy')"
      ></el-input>元
    </div> -->
    <!-- <div class="section-item">
      <span class="section-label label-1"></span>
      <span style="margin-right: 20px;">午餐</span>
      <el-input
        v-model="discountInfo.tgcEmpLunchSubsidy"
        clearable
        class="mini-input"
        @blur="checkText('tgcEmpLunchSubsidy')"
      ></el-input>元
    </div>
    <div class="section-item">
      <span class="section-label label-1"></span>
      <span style="margin-right: 20px;">晚餐</span>
      <el-input
        v-model="discountInfo.tgcEmpDinnerSubsidy"
        clearable
        class="mini-input"
        @blur="checkText('tgcEmpDinnerSubsidy')"
      ></el-input>元
    </div> -->
    <footer class="btn-footer">
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button @click="cancel">取消</el-button>
    </footer>
  </div>
</template>

<script>
// import { regionData, CodeToText, TextToCode } from '@/utils/regon-data.js';
// import ReturnButton from '@/components/ReturnButton.vue';
// import areafrom from '@/utils/select_area.json';
import { subsidyTypes } from './common'
export default {
  components: {
    // ReturnButton,
  },
  data() {
    return {
      subsidyTypes,
      tgcId: '',
      discountInfo: {
        tgcSubsidyType: '',
        tgcEmpOrderLimit: '',
        tgcBreakfastLimit: '',
        tgcLunchLimit: '',
        tgcDinnerLimit: '',
        tgcGroupSingleAmount: '',
        tgcEmpDiscount: '',
        tgcEmpBreakfastSubsidy: '',
        tgcEmpLunchSubsidy: '',
        tgcEmpDinnerSubsidy: ''
      }
    }
  },

  created() {
    this.tgcId = this.$route.query.id
    if (this.tgcId) {
      this.getInfo()
    }
  },
  methods: {
    async getInfo() {
      const res = await this.$http('groupmeal.Corp/queryCorpById', { tgcId: this.tgcId })
      const { discountInfo, corpInfo } = res.obj
      Object.assign(this.discountInfo, discountInfo)
      this.discountInfo.tgcSubsidyType = corpInfo.tgcSubsidyType || '01'
    },
    handleSubsidyTypeChange() {
      const { discountInfo } = this
      discountInfo.tgcEmpSubsidy = ''
      discountInfo.tgcEmpBreakfastSubsidy = ''
      discountInfo.tgcEmpLunchSubsidy = ''
      discountInfo.tgcEmpDinnerSubsidy = ''
    },
    cancel() {
      this.$confirm('确认返回？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        this.$router.go(-1)
      })
    },
    checkText(type) {
      this.discountInfo[type] = isNaN(this.discountInfo[type]) ? '' : this.discountInfo[type]
      let fixednum = 0
      if (type == 'tgcGroupSingleAmount' || type == 'tgcEmpDiscount') {
        fixednum = 2
      }
      this.discountInfo[type] = this.discountInfo[type] == '' ? '' : Number(Math.abs(this.discountInfo[type])).toFixed(fixednum)
      let num = 0
      for (let i of ['tgcBreakfastLimit', 'tgcLunchLimit', 'tgcDinnerLimit']) {
        num += Number(this.discountInfo[i])
      }
      if (num > this.discountInfo.tgcEmpOrderLimit) {
        this.$msg('单餐数量不能大于点餐数量', 'error')
        return
      }
    },
    submit() {
      if (!this.discountInfo.tgcEmpOrderLimit) {
        this.$msg('请输入点餐上限', 'error')
        return
      }
      if (!this.discountInfo.tgcGroupSingleAmount) {
        this.$msg('请输入团膳金额', 'error')
        return
      }
      if (this.discountInfo.tgcEmpOrderLimit < (Number(this.discountInfo.tgcBreakfastLimit) + Number(this.discountInfo.tgcLunchLimit) + Number(this.discountInfo.tgcDinnerLimit))) {
        this.$msg('点餐数超过上限', 'error')
        return
      }
      if (this.discountInfo.tgcEmpDiscount && (Number(this.discountInfo.tgcEmpDiscount) <= 0 || Number(this.discountInfo.tgcEmpDiscount) > 10)) {
        this.$msg('请输入正确的折扣 【0 ＜ 折扣 ≤ 10】', 'error')
        return
      }
      this.$confirm('确认以上信息并提交？', '确认提交？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        const params = this.$deepClone(this.discountInfo)
        params.tgcId = this.tgcId
        this.handleSubmit(params)
      })
    },
    async handleSubmit(params) {
      const res = await this.$http('groupmeal.Corp/updateCorpDiscount', params)
      if (!res.errMsg) {
        this.$msg('修改成功', 'success')
      } else {
        this.$msg(res.errMsg, 'error')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.mini-input {
  width: 300px;
  margin-right: 20px;
}
.medium-picker {
  width: 300px;
}
.medium-input {
  width: 350px;
  margin-right: 20px;
}
.max-input {
  width: 350px;
}
.medium-select {
  width: 70px;
  margin-left: 10px;
}

.tiny-input {
  width: 150px;
  margin: 0 20px;
}

.label-1 {
  width: 280px;
  margin-right: 12px;
  text-align: right;
}
</style>
