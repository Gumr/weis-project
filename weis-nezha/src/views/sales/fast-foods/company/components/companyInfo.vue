<template>
  <div>
    <h3>基本信息</h3>
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>合作类型：
      </span>
      <BaseSelect
        v-model="formData.tgcType"
        :disabled="Boolean(tgcId)"
        :options="typeOptions"
        clearable
        class="medium-input"
      />
    </div>
    <div v-if="formData.tgcType === '00'" class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>企业类型：
      </span>
      <BaseSelect
        v-model="formData.tgcAreaType"
        :options="areaTypeOptions"
        filterable
        class="medium-input"
      />
    </div>
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>企业logo
      </span>
      <ImageUpload
        v-model:file-list="formData.tgcLogoImg"
        :upload-data="{ flag: 'exception' }"
        :limit="1"
      />
    </div>
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>企业名称：
      </span>
      <el-input v-model="formData.tgcName" clearable class="medium-input" />
    </div>

    <!-- <div >
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>企业接口人：
        </span>
        <el-button type="primary" @click="addLinkman">添加接口人</el-button>
      </div>
      <div>
        <div v-for="(item, index) in formData.corpWeis" :key="index">
          <div class="linkman-item">
            <div class="section-item">
              <span class="section-label label-1">
                企业接口人：
              </span>
              <el-input v-model="item.tgeName" class="medium-input"></el-input>
              <el-button v-if="index !== 0" class="linkman-item__delete" type="danger" @click="removeLinkman(index)">删除</el-button>
            </div>
            <div class="section-item">
              <span class="section-label label-1">
                接口人手机：
              </span>
              <NumberInput v-model="item.tgePhone" class="medium-input" :precision="11">添加接口人</NumberInput>
            </div>
          </div>
        </div>
      </div>
    </div>-->
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>点餐时间：
      </span>
      <el-checkbox-group v-model="formData.tgcMealDays">
        <el-checkbox label="1">周一</el-checkbox>
        <el-checkbox label="2">周二</el-checkbox>
        <el-checkbox label="3">周三</el-checkbox>
        <el-checkbox label="4">周四</el-checkbox>
        <el-checkbox label="5">周五</el-checkbox>
        <el-checkbox label="6">周六</el-checkbox>
        <el-checkbox label="7">周日</el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="section-item">
      <span class="section-label label-1">点餐折扣：</span>
      <NumberInput v-model="formData.tgcEmpDiscount" class="mini-input" mode="digit" :precision="1"></NumberInput>
      <span style="margin: 0 8px">折，折扣门槛</span>
      <NumberInput
        v-model="formData.tgcDiscountThreshold"
        class="mini-input"
        mode="digit"
        :precision="2"
      />
    </div>
    <div class="section-item">
      <span class="section-label label-1"><span style="color:red">*</span>配送时间：</span>
      <span style="margin-right: 20px;">早餐</span>
      <el-time-select
        :key="reqId"
        v-model="formData.tgcBreakfastTime[0]"
        placeholder="起始时间"
        v-bind="{ start: '07:30', step: '00:15', end: '23:30' }"
      />
      <span style="margin-right: 10px;" />
      <el-time-select
        :key="reqId"
        v-model="formData.tgcBreakfastTime[1]"
        placeholder="结束时间"
        v-bind="{ start: '07:30', step: '00:15', end: '23:30', minTime: formData.tgcBreakfastTime[0] }"
      />
    </div>
    <div class="section-item">
      <span class="section-label label-1" />
      <span style="margin-right: 20px;">午餐</span>
      <el-time-select
        :key="reqId"
        v-model="formData.tgcLunchTime[0]"
        placeholder="起始时间"
        v-bind="{ start: '07:30', step: '00:15', end: '23:30' }"
      />
      <span style="margin-right: 10px;" />
      <el-time-select
        :key="reqId"
        v-model="formData.tgcLunchTime[1]"
        placeholder="结束时间"
        v-bind="{ start: '07:30', step: '00:15', end: '23:30', minTime: formData.tgcLunchTime[0] }"
      />
    </div>
    <div class="section-item">
      <span class="section-label label-1" />
      <span style="margin-right: 20px;">晚餐</span>
      <el-time-select
        :key="reqId"
        v-model="formData.tgcDinnerTime[0]"
        placeholder="起始时间"
        v-bind="{ start: '07:30', step: '00:15', end: '23:30' }"
      />
      <span style="margin-right: 10px;" />
      <el-time-select
        :key="reqId"
        v-model="formData.tgcDinnerTime[1]"
        placeholder="结束时间"
        v-bind="{ start: '07:30', step: '00:15', end: '23:30', minTime: formData.tgcDinnerTime[0] }"
      />
    </div>
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>企业排序：
      </span>
      <el-input
        v-model="formData.tgcSort"
        clearable
        class="medium-input"
        @keydown="catchNonIntKeydown"
      />
    </div>
    <FormItem
      v-if="formData.tgcType === '00'"
      label-style="font-weight: bold;"
      label="企业接口人"
      semi
      required
    >
      <div class="display-flex flex-items-center">
        <span class="font-size-14">企业接口人</span>
        <el-button icon="el-icon-plus" size="small" type="primary" @click="addLinkman">添加</el-button>
      </div>
      <el-table class="table" :data="formData.corpWeis" border stripe>
        <el-table-column type="index" label="序号" :width="80"></el-table-column>
        <el-table-column label="接口人姓名">
          <template #default="{ row }">
            <el-input v-model="row.tgeName" />
          </template>
        </el-table-column>
        <el-table-column label="微信手机号">
          <template #default="{ row }">
            <NumberInput v-model="row.tgePhone" mode="int" :precision="11" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" :width="100">
          <template #default="{ $index }">
            <el-button type="danger" @click="removeLinkman($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="section-item">
        <span class="section-label label-1" style="white-space: nowrap">接口人点餐金额：</span>
        <NumberInput
          v-model="formData.tgcGroupAmount"
          style="width: 140px"
          mode="digit"
          :precision="2"
        ></NumberInput>元
      </div>
    </FormItem>
    <FormItem label-style="font-weight: bold;" label="维士销售人员" semi required>
      <div class="section-item">
        <span class="section-label nowrap">维士销售人员：</span>
        <el-select v-model="formData.tgcPartnerId" clearable class="medium-input">
          <el-option
            v-for="(opt, idx) in partnerOptions"
            :key="idx"
            :label="`${opt.tseRoleName}-- ${opt.tseName}（${opt.tsePhone}）`"
            :value="opt.tseId"
          />
        </el-select>
      </div>
      <div class="section-item">
        <span class="section-label nowrap">维士销售人员提成比例：</span>
        <NumberInput v-model="formData.tgcProfitRatio" style="width: 240px" />%
      </div>
    </FormItem>
    <FormItem
      v-if="formData.tgcType === '00'"
      label-style="font-weight: bold;"
      label="维士服务人员"
      semi
      required
    >
      <div class="display-flex flex-items-center">
        <span class="font-size-14">维士服务人员</span>
        <el-button icon="el-icon-plus" size="small" type="primary" @click="add2Bman">添加</el-button>
      </div>
      <el-table class="table" :data="formData.attendantList" border stripe>
        <el-table-column type="index" label="序号" :width="80"></el-table-column>
        <el-table-column label="姓名">
          <template #default="{ row }">
            <el-input v-model="row.tgcaName" />
          </template>
        </el-table-column>
        <el-table-column label="微信手机号">
          <template #default="{ row }">
            <NumberInput v-model="row.tgcaPhone" mode="int" :precision="11" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" :width="100">
          <template #default="{ $index }">
            <el-button type="danger" @click="remove2Bman($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </FormItem>
    <footer class="btn-footer">
      <el-button type="primary" :loading="loading" @click="submit">保存</el-button>
      <el-button @click="cancel">取消</el-button>
    </footer>
  </div>
</template>

<script>
import { regionData, CodeToText } from '@/utils/regon-data.js'
// import ReturnButton from '@/components/ReturnButton.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import { catchNonIntKeydown } from '@/utils/event-catcher'
import { channelTypeOptions } from '@/utils/data-map'
import { validateObject } from '@/utils/common'
import FormItem from '@/components/FormItem.vue'
export default {
  components: {
    ImageUpload,
    BaseSelect,
    FormItem
  },
  data() {
    return {
      channelOptions: [],
      channelTypeOptions,
      channelType: '',
      reqId: 0,
      tgcId: '',
      loading: false,
      cityValue: [],
      cityOptions: regionData,
      areaTypeOptions: [
        { label: '企业', value: '00' },
        { label: '幼托(2-6)岁', value: '01' }
      ],
      typeOptions: [
        { label: '对公', value: '00' },
        { label: '对私', value: '01' }
      ],
      heatPointOptions: [],
      partnerOptions: [],
      formData: {
        attendantList: [],
        tgcEmpDiscount: '',
        tgcPartnerChannelId: '',
        tgcAreaType: '00',
        tgcType: '',
        tgcDiscountThreshold: '',
        tgcLogoImg: [],
        tgcName: '',
        tgcLeaderName: '',
        tgcLeaderPhone: '',
        tgcAddrProvince: '',
        tgcAddrCity: '',
        tgcAddrArea: '',
        tgcAddress: '',
        tgcHeatingPoint: '',
        tgcMealDays: [],
        tgcWeisName: '',
        tgcWeisPhone: '',
        tgcBreakfastTime: [],
        tgcLunchTime: [],
        tgcDinnerTime: [],
        tgcProfitRatio: '',
        tgcPartnerId: '',
        tgcLat: '',
        tgcGroupAmount: '',
        tgcLon: '',
        tgcSort: '',
        corpWeis: [{ tgeName: '', tgePhone: '' }]
      }
    }
  },
  watch: {
    'formData.tgcType': function(type) {
      if (type === '01') {
        this.formData.tgcAreaType = '00'
      }
    }
  },
  async created() {
    this.tgcId = this.$route.query.id
    await this.getPartner()
    if (this.tgcId) {
      this.getInfo()
    }
    this.getHeatPoint()
  },
  methods: {
    catchNonIntKeydown,
    add2Bman() {
      this.formData.attendantList.push({ tgcaName: '', tgcaPhone: '' })
    },
    remove2Bman(index) {
      this.formData.attendantList.splice(index, 1)
    },
    addLinkman() {
      this.formData.corpWeis.push({ tgeName: '', tgePhone: '' })
    },
    removeLinkman(index) {
      this.formData.corpWeis.splice(index, 1)
    },
    typeChange() {
      this.$emit('typeChange', this.formData.tgcType)
    },
    channelTypeClick(val) {
      if (!val) return
      // this.channelType = val
      this.formData.tgcPartnerChannelId = ''
      this.queryChannelList()
    },
    queryChannelList() {
      this.$request('partner.Channel/queryChannelList', {
        tpiChannelType: this.channelType
      }).thenwrap((err, data) => {
        if (!err) {
          this.channelOptions = data
        }
      })
    },
    handleChange(value) {
      this.formData.tgcAddrProvince = CodeToText[value[0]]
      this.formData.tgcAddrCity = CodeToText[value[1]]
      this.formData.tgcAddrArea = CodeToText[value[2]]
    },
    async getHeatPoint() {
      const res = await this.$request('HeatingPoint/queryEnabledHeat')
      this.heatPointOptions = res.data.obj.heatVos
    },
    // selectChange(val) {
    //   if (!val) {
    //     this.formData.tgcProfitRatio = '';
    //     this.formData.tgcWeisPhone = '';
    //     return;
    //   }
    //   const item = this.partnerOptions.find(item => item.tpiId == val);
    //   this.formData.tgcWeisPhone = item.tpiPhone;
    //   this.formData.tgcProfitRatio = item.tpiProfitRatio;
    // },
    async getPartner() {
      const res = await this.$request('sale.SaleEmployee/querySaleEmployeeList', {
        tseRoleId: "100002,100003,100004,100005",
        tseStt: "01",
      })
      this.partnerOptions = res.data.obj
    },
    async getInfo() {
      const res = await this.$http('groupmeal.Corp/queryCorpById', { tgcId: this.tgcId })
      this.reqId += 1
      const channelType = res.obj.corpInfo.tgcPartnerChannelType
      if (channelType) { // 发现有渠道类型返回 回显承包渠道得信息
        this.channelType = channelType
        this.queryChannelList()
      }
      Object.assign(this.formData, res.obj.corpInfo)
      this.formData.tgcEmpDiscount = res.obj.discountInfo && res.obj.discountInfo.tgcEmpDiscount
      function handleTime(times) {
        const res = times.split('-')
        return res.length >= 2 ? res : ['', '']
      }
      this.formData.tgcBreakfastTime = handleTime(this.formData.tgcBreakfastTime)
      this.formData.tgcLunchTime = handleTime(this.formData.tgcLunchTime)
      this.formData.tgcDinnerTime = handleTime(this.formData.tgcDinnerTime)
      this.formData.tgcLogoImg = [{ url: this.formData.tgcLogoImg }]

      this.formData.tgcPartnerId = isNaN(this.formData.tgcPartnerId) ? '' : Number(this.formData.tgcPartnerId)
      const item = this.partnerOptions.find(item => item.tseId == this.formData.tgcPartnerId)
      this.formData.tgcPartnerId = item ? this.formData.tgcPartnerId+'' : ''
 
      this.typeChange()
    },
    cancel() {
      this.$confirm('确认返回？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        this.$closeRoute()
      })
    },
    submit() {
      const { formData } = this
     
   
      if (!formData.tgcType) {
        this.$message({ type: 'error', message: '请选择企业类型！' })
        return
      }
      if (!formData.tgcLogoImg.length) {
        this.$message({ type: 'error', message: '请上传企业图片！' })
        return
      }
      if (!formData.tgcName) {
        this.$message({ type: 'error', message: '请输入企业名称' })
        return
      }
      if (!formData.tgcMealDays.length) {   
        return
      }
      if ((!formData.tgcBreakfastTime[0] || !formData.tgcBreakfastTime[1])&&(!formData.tgcLunchTime[0] ||!formData.tgcLunchTime[1])&&(!formData.tgcDinnerTime[0] || !formData.tgcDinnerTime[1])){
         this.$message({ type: 'error', message: '请选择配送时间' })
        return
        
      }
        
      if (!formData.tgcSort) {
        this.$message({ type: 'error', message: '请输入企业排序' })
        return
      }
      if (!formData.tgcPartnerId || !formData.tgcProfitRatio) {
        this.$message({ type: 'error', message: '请填写维士销售人员信息' })
        return
      }
      if (formData.tgcType === '00') {
        const index = formData.corpWeis.findIndex(item => !validateObject(item, ['tgeName', 'tgePhone']))
        if (index !== -1) {
          this.$message({ type: 'error', message: `请填写完整第${index + 1}项接口人` })
          return
        }
      }

      if (formData.tgcType === '00') {
        const index = formData.attendantList.findIndex(item => !validateObject(item, ['tgcaName', 'tgcaPhone']))
        if (index !== -1) {
          this.$message({ type: 'error', message: `请填写完整第${index + 1}项维士服务人员` })
          return
        }
      }

      const params = this.$deepClone(formData)
      params.tgcLogoImg = params.tgcLogoImg[0].response ? params.tgcLogoImg[0].response.obj.imageUrl : params.tgcLogoImg[0].url

      params.tgcBreakfastTime = formData.tgcBreakfastTime.some(Boolean) ? formData.tgcBreakfastTime.join('-') : ''
      params.tgcLunchTime = formData.tgcLunchTime.some(Boolean) ? formData.tgcLunchTime.join('-') : ''
      params.tgcDinnerTime = formData.tgcDinnerTime.some(Boolean) ? formData.tgcDinnerTime.join('-') : ''
      params.tpiChannelType = '01,03'
      if (this.tgcId) params.tgcId = this.tgcId

      this.$confirm('确认以上信息并提交？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        this.loading = true
        this.handleSubmit(params)
      })
    },
    async handleSubmit(params) {
      const res = await this.$http('groupmeal.Corp/updateCorp', params)
      this.loading = false
      if (!res.errMsg) {
        if (!this.tgcId) {
          this.$msg('企业创建成功', 'success')
          this.$closeRoute()
        } else {
          this.$msg('修改成功', 'success')
        }
      } else {
        this.$msg(res.errMsg, 'error')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.label-1 {
  width: 100px;
  margin-right: 12px;
  text-align: right;
}

.linkman-item {
  display: inline-block;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  margin-bottom: 12px;
  &__delete {
    margin-left: 8px;
  }
}

.mini-input {
  width: 200px;
}

.font-size-14 {
  font-size: 14px;
}

.table {
  width: 600px;
  margin: 12px 0;
}
</style>
