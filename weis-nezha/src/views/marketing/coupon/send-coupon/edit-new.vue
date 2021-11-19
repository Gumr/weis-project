<template>
  <div class="page-container">
    <section>
      <h3>活动基础信息</h3>
      <div class="section-item">
        <span class="section-label label-1">活动名称：</span>
        <span>{{ formData.name }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">活动周期：</span>
        <el-date-picker v-model="formData.date" class="medium-input" type="daterange"></el-date-picker>
      </div>
    </section>
    <section>
      <div class="section-item">
        <h3>奖券配置</h3>
        <el-button type="primary" @click="addCoupon">添加奖券</el-button>
      </div>
      <div class="section-item">
        <div class="coupon">
          <div v-for="(item, index) in formData.coupon" :key="index" class="coupon-item">
            <div class="c-item">
              <h4>{{ item.couponName }}</h4>
              <div>
                <span @click="couponUpd(index)">编辑</span>
                <span @click="couponDel(index)">删除</span>
              </div>
            </div>
            <div class="c-item">
              <div>奖券类型：现金券</div>
              <div>张数：{{ item.count > 114748364 ? '不限制张数' : (item.count == -1 ? '不限制张数' : item.count) }}</div>
            </div>
            <div class="c-item">
              <div>面额：{{ item.tcsAmount }}元</div>
              <div>互斥条件：{{ item.isReject == 1 ? '不可与维士红包叠加' : '可以与维士红包叠加' }}</div>
            </div>
            <div class="c-item">
              <div>生效日期：{{ item.takeEffect == 0 ? '即时生效' : (item.takeEffect == 1 ? '次日生效' : item.takeEffect) }}</div>
              <div>失效日期：{{ item.loseEfficacySign == '00' ? '模板有效期' : item.loseEfficacyData }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section>
      <div class="section-item">
        <h3>发券规则</h3>
        <span style="margin-right: 20px;">使用门槛</span>
        <el-button type="primary" @click="ruleAdd">添加</el-button>
      </div>
      <input
        ref="upload"
        type="file"
        accept=".xls, .xlsx"
        class="outputlist_upload"
        style="opacity: 0;"
      />
      <div>
        <div v-for="(item, index) in formData.acquireCondition" :key="index" class="section-item">
          <span class="section-label label-1">发放应用人群奖券：</span>
          <BaseSelect v-model="item.guidUser" class="medium-input" :options="couponOptions"></BaseSelect>
          <span>张数：</span>
          <el-input
            v-model="item.userCount"
            clearable
            class="mini-input"
            @keydown="catchNonIntKeydown"
            @blur="checkText2(index, 'userCount')"
          ></el-input>
          <span>给人群：</span>
          <el-input v-model="item.userPhone" class="medium-input"></el-input>
          <el-button type="primary" style="height: 30px;" @click="choiceUpload(index)">上传</el-button>
          <span class="download" @click="downLoadTemplate">下载导入模板</span>
          <el-button style="height: 30px;" type="danger" @click="ruleDel(index)">删除</el-button>
        </div>
      </div>
    </section>
    <!--    <section>
      <h3>应用人群</h3>
      <div class="section-item">
        <span class="section-label label-1">选择人群：</span>
        <BaseSelect class="medium-input" :options="userTypeOptions" v-model="formData.userType" @change="userTypeChange"></BaseSelect>
        <div v-show="formData.userType == '00'">
          <span class="section-label label-1">选择指定用户：</span>
          <BaseSelect class="medium-input" :options="desiOptions" v-model="appointUsers"></BaseSelect>
        </div>
        <div v-show="formData.userType == '01'">
          <span class="section-label label-1">批量导入：</span>
          <el-input class="medium-input max-input" readonly v-model="formData.excelPhone"></el-input>
          <el-button type="primary" style="margin-left: 10px;height: 40px;" @click="choiceUpload">上传</el-button>
          <span class="download" @click="downLoadTemplate">下载导入模板</span>
          <input type="file" ref="upload" accept=".xls,.xlsx" class="outputlist_upload" style="opacity: 0;">
        </div>
        <div v-show="formData.userType == '02'">
          <span class="section-label label-1">手动输入账户：</span>
          <el-input   class="medium-input" v-model="formData.userPhone"></el-input>
          <span style="font-size: 14px;color:#999999;margin-left: 10px;">输入格式：账户1，账户2，... "，"为中文状态下字符，</span>
        </div>
      </div>
    </section>-->
    <section>
      <h3>投放端口</h3>
      <div v-for="(item ,index) in checkData" :key="index" class="section-item">
        <span class="section-label label-1">{{ item.port }}：</span>
        <el-checkbox v-model="item.check">{{ item.label }}</el-checkbox>
      </div>
    </section>
    <section>
      <h3>备注</h3>
      <div class="section-item">
        <span class="section-label label-1" style="width: 75px;"></span>
        <el-input v-model="formData.remark" clearable class="max-input" type="textarea" :rows="6"></el-input>
      </div>
    </section>
    <footer class="btn-footer">
      <el-button type="primary" :loading="loading" @click="submit">确定</el-button>
      <el-button type="danger" @click="cancel">取消</el-button>
    </footer>
    <!-- 弹出层 -->
    <ConfirmDialog
      v-model="dialogVisible"
      title="配置奖券"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="tagConfirm"
    >
      <!-- <div class="section-item">
        <span class="section-label label-1">奖券名称：</span>
        <el-input clearable class="medium-input" v-model="current.couponName"></el-input>
      </div>-->
      <div class="section-item">
        <span class="section-label label-1">选择奖券类型：</span>
        <el-radio-group v-model="current.type">
          <el-radio :label="1">现金券</el-radio>
        </el-radio-group>
      </div>
      <div class="section-item">
        <span class="section-label label-1">选择模板：</span>
        <BaseSelect
          v-model="current.couponId"
          class="medium-input"
          :options="modelOptions"
          @change="change"
        ></BaseSelect>
      </div>
      <div class="section-item">
        <span class="section-label label-1">是否限制张数：</span>
        <el-radio-group v-model="countRadio">
          <el-radio :label="0">限制张数</el-radio>
          <el-radio :label="-1">不限制张数</el-radio>
        </el-radio-group>
      </div>
      <div v-if="countRadio == 0" class="section-item">
        <span class="section-label label-1">输入发行张数：</span>
        <el-input
          v-model="current.count"
          clearable
          class="medium-input"
          @keydown="catchNonIntKeydown"
          @blur="checkText"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">生效时间：</span>
        <el-radio-group v-model="dateRadio" @change="dateRadioChange">
          <el-radio :label="0">领券即时生效</el-radio>
          <el-radio :label="1">领券次日生效</el-radio>
          <el-radio :label="2">指定日期生效</el-radio>
        </el-radio-group>
      </div>
      <div v-if="dateRadio == 2" class="section-item">
        <span class="section-label label-1">输入日期：</span>
        <el-date-picker v-model="current.takeEffect" class="medium-input" value-format="yyyy-MM-dd"></el-date-picker>
      </div>
      <div class="section-item">
        <span class="section-label label-1">互斥条件：</span>
        <el-radio-group v-model="current.isReject">
          <el-radio :label="1">不可与维士红包叠加</el-radio>
          <el-radio :label="2">可以与维士红包叠加</el-radio>
        </el-radio-group>
      </div>
      <div class="section-item">
        <span class="section-label label-1">失效日期：</span>
        <el-radio-group v-model="effectRadio">
          <el-radio label="00">按模板有效期计算</el-radio>
          <el-radio label="01">指定失效日期</el-radio>
        </el-radio-group>
      </div>
      <div v-if="effectRadio == '01'" class="section-item">
        <span class="section-label label-1">输入日期：</span>
        <el-date-picker
          v-model="current.loseEfficacyData"
          class="medium-input"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import BaseSelect from '@/components/BaseSelect.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { catchNonIntKeydown, catchNonNumberKeydown } from '@/utils/event-catcher'
import exportExcel from '@/utils/export-excel'
import XLSX from '@/utils/xlsx'

export default {
  components: {
    BaseSelect,
    ConfirmDialog
  },
  data() {
    return {
      type: '',
      activityId: '',
      loading: false,
      dialogVisible: false,
      radio: 3,
      countRadio: 0,
      dateRadio: 0,
      effectRadio: '00',
      modelOptions: [],
      couponOptions: [],
      userTypeOptions: [
        // {label: '全部用户', value: '00'},
        // {label: '选择指定用户', value: '00'},
        { label: '批量导入', value: '01' },
        { label: '手动输入', value: '02' }
      ],
      checkData: [
        {
          port: '饮食市场', label: '饮食小程序', value: '10', check: false
        },
        {
          port: '外卖市场', label: '数搭', value: '30', check: false
        },
        {
          port: '慢病市场', label: '糖三彩', value: '20', check: false
        }
      ],
      desiOptions: [{ value: '-1', label: '全部用户' }],
      appointUsers: '-1',
      current: {
        type: '',
        couponId: '',
        isReject: 2,
        count: '',
        tcsAmount: '',
        takeEffect: '',
        guid: '',
        loseEfficacyData: ''
      },
      formData: {
        name: '手动发券',
        date: [],
        userType: '',
        userPhone: '',
        excelPhone: '',
        acquireCondition: [],
        coupon: [],
        port: [],
        remark: ''
      },
      uploadIndex: 0
    }
  },
  created() {
    this.activityId = this.$route.query.id
    this.type = this.$route.query.type // 00:下单发券，01:手动发券, 02:预定送券, 03: 新人下单送券
    this.getCoupon()
    if (this.activityId) {
      this.getInfo()
    }
  },
  mounted() {
    this.$refs.upload.addEventListener('change', (e) => { // 绑定监听表格导入事件
      this.readExcel(e)
    })
  },
  methods: {
    catchNonNumberKeydown,
    catchNonIntKeydown,
    userTypeChange() {
      this.formData.userPhone = ''
      this.formData.excelPhone = ''
    },
    checkText() {
      let num = this.current.count
      num = isNaN(num) ? '0' : num
      this.current.count = Math.abs(num)
    },
    checkText2(index, type) {
      let num = this.formData.acquireCondition[index][type]
      num = isNaN(num) ? '0' : num
      this.formData.acquireCondition[index][type] = Math.abs(num)
    },
    cancel() {
      this.$closeRoute()
    },
    change(e) {
      const item = this.modelOptions.find(item => item.value == e)

      this.current.couponName = item.label
      this.current.tcsAmount = item.tcsAmount
    },
    // 获取优惠券
    async getCoupon() {
      const res = await this.$http('coupon.Coupon/getCouponAll', { pageNo: 1, pageSize: 999 })
      this.modelOptions = res.obj.record.map(item => ({
        label: `${item.tcsName}（${item.tcsAmount}元, 有效期:${item.tcsPeriodValid}天）`,
        value: item.tcsId,
        tcsAmount: item.tcsAmount
      }))
    },
    newGuid() {
      let guid = ''
      for (let i = 1; i <= 32; i++) {
        const n = Math.floor(Math.random() * 16.0).toString(16)
        guid += n
        if ((i == 8) || (i == 12) || (i == 16) || (i == 20)) {
          guid += '-'
        }
      }
      return guid
    },
    addCoupon() {
      this.current = {
        type: 1,
        couponName: '',
        couponId: '',
        isReject: 2,
        count: '',
        tcsAmount: '',
        takeEffect: '',
        loseEfficacyData: '',
        guid: this.newGuid()
      }
      this.dialogVisible = true
    },
    // 添加奖品配置
    tagConfirm(done) {
      // if (!this.current.couponName) {
      //   this.$message({ type: 'error', message: '请输入奖券名称！' });
      //   done();
      //   return;
      // }
      if (!this.current.couponId) {
        this.$message({ type: 'error', message: '请选择模板！' })
        done()
        return
      }
      if (this.countRadio == 0 && !this.current.count) {
        this.$message({ type: 'error', message: '请输入发行张数！' })
        done()
        return
      }
      if (this.dateRadio == 2 && !this.current.takeEffect) {
        this.$message({ type: 'error', message: '请输入指定日期！' })
        done()
        return
      }
      if (this.effectRadio == '01' && !this.current.loseEfficacyData) {
        this.$message({ type: 'error', message: '请输入指定日期！' })
        done()
        return
      }
      const params = this.$deepClone(this.current)
      params.count = this.countRadio == 0 ? params.count : -1
      params.takeEffect = this.dateRadio == 2 ? params.takeEffect : this.dateRadio
      params.takeEffectSign = this.dateRadio == 2 ? '01' : '00'
      params.loseEfficacySign = this.effectRadio
      const index = this.formData.coupon.findIndex(item => item.guid == params.guid)
      if (index > -1) {
        this.formData.coupon[index] = params
        this.formData.coupon.push({})
        this.formData.coupon.pop()
      } else {
        this.formData.coupon.push(params)
      }
      if (params.loseEfficacySign == '00') {
        params.loseEfficacyData = ''
      }
      this.couponOptions = this.formData.coupon.map(item => ({
        value: item.guid,
        label: item.couponName
      }))
      this.dialogVisible = false
      setTimeout(() => { done() }, 300)
    },
    dateRadioChange(e) {
      this.current.takeEffect = ''
    },
    // 编辑奖券
    couponUpd(index) {
      const item = this.formData.coupon[index]
      let takeEffect = item.takeEffect
      this.dateRadio = 2
      if (item.takeEffect == 0 || item.takeEffect == 1) {
        takeEffect = ''
        this.dateRadio = Number(item.takeEffect)
      }
      this.effectRadio = item.loseEfficacySign
      this.current = {
        couponName: item.couponName,
        type: item.type,
        couponId: String(item.couponId),
        isReject: item.isReject,
        count: item.count == -1 ? '' : (item.count > 1147483647 ? '' : item.count),
        tcsAmount: item.tcsAmount,
        guid: item.guid,
        takeEffect,
        loseEfficacyData: item.loseEfficacySign == '00' ? '' : item.loseEfficacyData
      }
      if (item.count == -1 || item.count == 2147483647) {
        this.countRadio = -1
      } else {
        this.countRadio = 0
      }
      this.dialogVisible = true
    },
    couponDel(index) {
      const guid = this.formData.coupon[index].guid
      this.formData.acquireCondition.forEach((item) => {
        if (item.guidInvite == guid) {
          item.condition = ''
          item.guidInvite = ''
          item.userCount = ''
          item.inviteCount = ''
        }
        if (item.guidUser == guid) {
          item.condition = ''
          item.guidUser = ''
          item.userCount = ''
          item.inviteCount = ''
        }
      })
      this.formData.coupon.splice(index, 1)
      this.couponOptions = this.formData.coupon.map(item => ({
        value: item.guid,
        label: item.couponName
      }))
    },
    // 发券规则
    ruleAdd() {
      this.formData.acquireCondition.push({
        condition: '', couponIdInvite: '', couponIdUser: '', userPhone: '', userCount: '', inviteCount: '', guidUser: '', guidInvite: ''
      })
    },
    ruleDel(index) {
      this.formData.acquireCondition.splice(index, 1)
    },
    // 获取详情
    getInfo() {
      this.$request('coupon.Hotlist/getActivityInfo', { activityId: this.activityId }).then(
        this.$rw((err, res) => {
          if (!err) {
            Object.assign(this.formData, res)
            this.formData.date = [res.startTime, res.endTime]
            this.formData.acquireCondition.forEach((item) => {
              item.userPhone = item.userPhone.join('，')
            })
            this.couponOptions = this.formData.coupon.map(item => ({
              value: item.guid,
              label: item.couponName
            }))
            // 还原端口
            res.port.forEach((port) => {
              this.checkData.forEach((item) => {
                if (item.value == port) {
                  item.check = true
                }
              })
            })
          } else {
            this.$message({ type: 'error', message: err.errMsg })
          }
        })
      )
    },
    // 提交
    submit() {
      const params = this.$deepClone(this.formData)
      if (!params.name) {
        this.$message({ type: 'error', message: '请输入活动名称！' })
        return
      }
      if (!params.date.length) {
        this.$message({ type: 'error', message: '请选择时间！' })
        return
      }
      if (!params.coupon.length) {
        this.$message({ type: 'error', message: '请添加奖券配置！' })
        return
      }
      if (!params.acquireCondition.length) {
        this.$message({ type: 'error', message: '请添加发券规则！' })
        return
      }
      const valid = this.valid1(params)
      if (!valid) return
      const ids = params.acquireCondition.map(value => value.guidUser)
      const idsSet = Array.from(new Set(ids))
      console.log(idsSet)
      if (idsSet.length != ids.length) {
        this.$message({ type: 'error', message: '有相同的券！' })
        return
      }
      params.acquireCondition.forEach((item) => {
        const temp = params.coupon.find(it => it.guid == item.guidUser)
        item.couponIdUser = temp.couponId
        item.userPhone = item.userPhone.split('，')
      })
      // if (!this.formData.userType) {
      //   this.$message({ type: 'error', message: '请选择应用人群！' });
      //   return;
      // }
      // if (this.formData.userType == '02' && !this.formData.userPhone) {
      //   this.$message({ type: 'error', message: '请输入指定用户！' });
      //   return;
      // }
      // if (this.formData.userType == '01' && !this.formData.excelPhone) {
      //   this.$message({ type: 'error', message: '请导入用户！' });
      //   return;
      // }
      // 投放端口
      params.port = []
      for (const item of this.checkData) {
        if (item.check) {
          params.port.push(item.value)
        }
      }
      if (!params.port.length) {
        this.$message({ type: 'error', message: '请选择投放端口！' })
        return
      }
      params.type = '01'
      params.startTime = this.$day(params.date[0]).format('YYYY-MM-DD')
      params.endTime = this.$day(params.date[1]).format('YYYY-MM-DD')
      this.$confirm('确认以上信息并提交？', '确认提交？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        // this.loading = true;
        this.handleSubmit(params)
      })
    },
    // 手动发券校验 value 01
    valid1(params) {
      for (const index in params.coupon) {
        const item = params.coupon[index]
        let num = 0
        for (const inx in params.acquireCondition) {
          const it = params.acquireCondition[inx]
          if (!it.guidUser || !it.userCount) {
            this.$message({ type: 'error', message: '请完善发券规则！' })
            return false
          }
          if (it.guidUser == item.guid) {
            num += Number(it.userCount)
          }
          it.condition = 0
          it.couponIdInvite = 0
          it.inviteCount = 0
        }
        if (item.count != -1 && num > item.count) {
          this.$message({ type: 'error', message: '发放的奖券数大于配置数！' })
          return false
        }
      }
      return true
    },
    handleSubmit(params) {
      let url = 'coupon.Hotlist/addForDirect'
      if (this.activityId) {
        params.activityId = this.activityId
        url = 'coupon.Hotlist/edit'
      }
      this.$request(url, params).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$message({ type: 'success', message: '操作成功' })
            this.$closeRoute()
          } else {
            this.$message({ type: 'error', message: err.errMsg })
          }
          this.loading = false
        })
      )
    },
    // 表格导入
    choiceUpload(index) {
      this.uploadIndex = index
      this.$refs.upload.dispatchEvent(new MouseEvent('click'))
    },
    readExcel(e) {
      const files = e.target.files
      if (files.length <= 0) {
        this.$message({ type: 'error', message: '没有文件名' })
        return
      } if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
        this.$message({ type: 'error', message: '上传格式不正确，请上传xls或者xlsx格式' })
        return
      }
      const fileReader = new FileReader()
      fileReader.onload = (ev) => {
        try {
          const data = ev.target.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const wsname = workbook.SheetNames[0]// 取第一张表
          let ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname])// 生成json表格内容
          ws = ws.filter(val => val['手机号'])
          const outputs = ws.map(item => item['手机号'])
          let userPhone = this.formData.acquireCondition[this.uploadIndex].userPhone
          const lastChart = userPhone.charAt(userPhone.length - 1)
          if (lastChart != '，' && lastChart != ',' && lastChart) {
            userPhone += '，'
          }
          userPhone += outputs.join('，')
          this.formData.acquireCondition[this.uploadIndex].userPhone = userPhone
          this.formData.acquireCondition.push({})
          this.formData.acquireCondition.pop()
          this.$refs.upload.value = ''
        } catch (e) {
          this.$message({ type: 'error', message: e })
        }
      }
      fileReader.readAsBinaryString(files[0])
    },
    downLoadTemplate() {
      const col = [
        { label: '序号', type: 'index' },
        { label: '姓名', prop: '' },
        { label: '手机号', prop: '' }
      ]
      exportExcel({
        columns: col,
        filename: '账户导入模板',
        data: []
      })
    }
  }
}
</script>

<style lang="less" scoped>
h3 {
  margin-right: 20px;
}
h4 {
  margin: 10px 0;
}
section {
  padding-top: 30px;
}
.mini-input {
  width: 100px;
  margin-right: 20px;
}
.medium-input {
  width: 240px;
  margin-right: 20px;
}
.max-input {
  width: 350px;
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
  min-height: 30px;
  button {
    height: 30px;
    line-height: 5px;
  }
}

.btn-footer {
  text-align: center;
}
.label-1 {
  width: 170px;
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
.coupon {
  margin-left: 100px;
  min-height: 10px;
  width: 920px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  .coupon-item {
    width: 450px;
    min-height: 130px;
    border: 1px solid #cccccc;
    margin-bottom: 20px;
    padding: 10px 0;
    box-sizing: border-box;
  }
  .c-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    padding: 0 10px;
    box-sizing: border-box;
    span {
      margin-right: 10px;
      color: #409eff;
      cursor: pointer;
      &:last-child {
        margin: 0;
      }
    }
  }
}
.download {
  margin: 0 20px;
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
}
</style>
