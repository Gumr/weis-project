<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="4"
        :label-width="120"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="toCreate()">新建减肥营</el-button>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template #default="{ row }" class="action-cell">
            <span
              v-if="row.stt !== '已结束'"
              class="brand-color cursor-pointer action-label"
              @click="toEdit(row)"
            >编辑</span>
            <span class="brand-color cursor-pointer action-label" @click="toDetail(row)">参与详情</span>
            <span class="brand-color cursor-pointer" @click="toOrder(row)">预约详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="editDialogVisible"
      :title="title"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="tagConfirm"
    >
      <el-form
        ref="form"
        :model="currentTag"
        :rules="formRules"
        label-width="140px"
        :validate-on-rule-change="false"
      >
        <el-form-item label="减脂营类型" prop="type">
          <el-radio-group
            v-model="currentTag.type"
            :disabled="currentTag.stt === '进行中'"
            @change="handleFormTypeChange"
          >
            <el-radio
              v-for="item in campTypes"
              :key="item.value"
              :label="item.value"
            >{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="减肥营活动名称：" prop="activityName">
          <el-input v-model="currentTag.activityName" clearable class="medium-input"></el-input>
        </el-form-item>
        <el-form-item label="减肥营活动周期：" prop="date">
          <el-date-picker v-model="currentTag.date" clearable type="daterange" class="medium-input"></el-date-picker>
        </el-form-item>
        <el-form-item label="选择营长：" prop="principal">
          <BaseSelect
            v-if="currentTag.type === '01'"
            v-model="currentTag.principal"
            :options="camperList"
            :props="{ label: 'principalName', value: 'principal' }"
            @change="handleCamperChange"
          ></BaseSelect>
          <BaseSelect
            v-else
            v-model="currentTag.principal"
            :options="campOptions"
            @change="currentTag.principalType = '00'"
          ></BaseSelect>
        </el-form-item>
        <el-form-item label="报名海报：" prop="applyPoster">
          <UploadImage v-model="currentTag.applyPoster" :limit="1" />
        </el-form-item>
        <el-form-item label="减脂营封面：" prop="cover">
          <UploadImage v-model="currentTag.cover" />
        </el-form-item>
        <el-form-item label="活动规则介绍：" prop="rule">
          <UploadImage v-model="currentTag.rule" />
        </el-form-item>
        <el-form-item label="（选填）群二维码：" prop="groupQrcode">
          <UploadImage v-model="currentTag.groupQrcode" />
        </el-form-item>
        <el-form-item label="活动规则设置："></el-form-item>
        <el-form-item label="1.入营规则" prop="ruleConf">
          <el-row>
            余额门槛：
            <NumberInput
              v-model="currentTag.ruleConf['01']"
              style="width: 140px"
              mode="digit"
              :precision="2"
            ></NumberInput>元
          </el-row>
          <el-row class="margin-12">
            点餐门槛：
            <NumberInput v-model="currentTag.ruleConf['02']" style="width: 90px"></NumberInput>天
            每天
            <NumberInput v-model="currentTag.ruleConf['03']" style="width: 90px"></NumberInput>餐
          </el-row>
        </el-form-item>
        <el-form-item label="2.点餐优惠" prop="ruleConf">
          <div v-if="currentTag.type === '01'">
            <NumberInput
              v-model="currentTag.ruleConf['04']"
              mode="digit"
              :precision="2"
              style="width: 140px"
            ></NumberInput>折
          </div>
          <div v-else>第一次五折，第二次7折，第三次8折</div>
        </el-form-item>
        <el-form-item label="3.积分规则" prop="ruleConf">
          <el-row>
            每天定一餐：
            <NumberInput v-model="currentTag.ruleConf['06']" style="width: 90px"></NumberInput>分
            <span class="red" style="margin-left: 8px">每天订餐上限：</span>
            <NumberInput v-model="currentTag.ruleConf['07']" style="width: 90px"></NumberInput>
            <span class="red">餐</span>
          </el-row>
          <el-row class="margin-12">
            每天饮食打卡：
            <NumberInput v-model="currentTag.ruleConf['10']" style="width: 90px"></NumberInput>分
          </el-row>
          <el-row class="margin-12">
            每天运动打卡：
            <NumberInput v-model="currentTag.ruleConf['11']" style="width: 90px"></NumberInput>分
          </el-row>
          <el-row class="margin-12">
            邀请一人点赞：
            <NumberInput v-model="currentTag.ruleConf['08']" style="width: 90px"></NumberInput>分
            <span class="red" style="margin-left: 8px">点赞得分人数上限：</span>
            <NumberInput v-model="currentTag.ruleConf['09']" style="width: 90px"></NumberInput>
            <span class="red">人</span>
          </el-row>
        </el-form-item>
        <el-form-item label="4.提成规则" prop="ruleConf">
          <div v-if="currentTag.type === '01'">
            <el-row>
              初始提成折扣
              <NumberInput
                v-model="currentTag.ruleConf['05']"
                style="width: 90px"
                mode="digit"
                :precision="2"
              ></NumberInput>折
            </el-row>
            <el-row>营长实际提成{{ camperBonus }}%</el-row>
          </div>
          <div v-else>默认提成</div>
        </el-form-item>
         <el-form-item label="小程序跳转链接：" v-if="title=='编辑减肥营活动'">/pages/packageDiscover/onLineFat/reduceFatDetail/reduceFatDetail?campId={{currentTag.campId}}&activityId={{currentTag.activityId}}</el-form-item>
      </el-form>
      <!-- <div>
        <div class="section-item">
          <span class="section-label label-1">减肥营活动名称：</span>
          <el-input clearable class="medium-input" v-model="currentTag.activityName"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">减肥营活动周期：</span>
          <el-date-picker clearable type="daterange" class="medium-input" v-model="currentTag.date"></el-date-picker>
        </div>
        <div class="section-item">
          <span class="section-label label-1">选择减肥营数量：</span>
          <el-input
            clearable
            class="medium-input"
            v-model="currentTag.campNum"
            @blur="checkText('campNum')"
          ></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">封面：</span>
          <UploadImage v-model="currentTag.cover" />
        </div>
        <div class="section-item">
          <span class="section-label label-1">活动规则：</span>
          <UploadImage v-model="currentTag.rule" />
        </div>
      </div>-->
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel'
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import UploadImage from '@/components/UploadImage'
import { defineComponent } from 'vue'
import { ElMessage } from 'element-plus'
import { objectForeach, round } from '@/utils/common'

function createRuleConf(type) {
  return type === '00'
    ? ({
      '01': '0',
      '02': '5',
      '03': '2',
      '04': '',
      '05': '',
      '06': '5',
      '07': '3',
      '08': '0',
      '09': '',
      '10': '1',
      '11': '1'
    })
    : ({
      '01': '',
      '02': '',
      '03': '',
      '04': '',
      '05': '',
      '06': '',
      '07': '',
      '08': '',
      '09': '',
      '10': '',
      '11': ''
    })
}

function createForm() {
  return {
    date: [],
    applyPoster: '', // 报名海报
    activityName: '', //活动名称
    startTime: '', //活动开始时间
    endTime: '', //活动结束时间
    discount: '', //活动营奖励折扣
    principal: '', //负责人
    groupQrcode: '', // 群二维码
    principalType: '00',
    cover: '', //封面
    rule: '', //规则
    type: '00', //减脂营类型 00:普通减脂营 01:KOL减脂营
    ruleConf: createRuleConf('00') //活动营规则配置 01 入营规则_余额门槛 02 入营规则_点餐门槛_天数 03 入营规则_点餐门槛_餐数 04 点餐优惠 05 初始提成折扣 06 每天订餐分数 07 每天订餐上限 08 每天点赞分数 09 每天点赞上限 10 每天饮食打卡分数 11 每天运动打卡分数
  }
}

export default defineComponent({
  name: 'goods_dish-unit',
  components: {
    QueryComponents,
    BasePageTable,
    UploadImage,
    ConfirmDialog
  },

  data() {
    return {
      height: window.innerHeight - 280,
      editDialogVisible: false,
      title: '',
      currentTag: createForm(),
      campTypes: [
        {
          label: '维士减脂营',
          value: '00'
        },
        {
          label: 'KOL减脂营',
          value: '01'
        }
      ],
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '活动ID',
          prop: 'activityId'
        },
        {
          label: '活动名称',
          prop: 'activityName'
        },
        {
          label: '周期',
          prop: 'period'
        },
        {
          label: '营长名字',
          prop: 'campPrincipal'
        },
        {
          label: '营长手机号',
          prop: 'campPhone'
        },
        {
          label: '总参与人数',
          prop: 'peopleNum'
        },
        {
          label: '总消费金额',
          prop: 'amount'
        },
        {
          label: '当前状态',
          prop: 'stt'
        },
        {
          label: '创建时间',
          prop: 'ctime'
        },
        {
          label: '创建人',
          prop: 'creator'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        activityName: '',
        date: []
      },
      campOptions: [],
      camperList: [], //营长列表
      queryComps: [
        {
          component: 'el-input',
          key: 'activityName',
          label: '活动名称',
          placeholder: '活动名称',
          props: {
            clearable: true
          }
        },
        {
          component: 'el-date-picker',
          key: 'date',
          label: '创建时间',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
            'value-format': 'yyyy-MM-dd'
          }
        }
      ]
    }
  },
  computed: {
    camperBonus() {
      const { ruleConf } = this.currentTag
      const B = Number(ruleConf['04']) // 点餐优惠
      const A = Number(ruleConf['05']) // 初始提成折扣
      if (!A || !B) return 0
      if (A >= B) {
        return 0
      } else {
        return round((B - A) * 10, 2)
      }
    },
    computedQueryComps() {
      const list = [...this.queryComps]
      return list
    },
    formRules() {
      // const ruleConfValidator = (rule, value, callback) => {
      //   console.log(rule, 'rule')
      //   const msg = this.checkRuleConf(value)
      //   if (msg) {
      //     callback(msg)
      //     return
      //   }
      //   callback()
      // }

      const rules = {
        type: { required: true, message: '请选择减脂营类型', trigger: 'blur' },
        applyPoster: { required: true, message: '请上传报名海报', trigger: 'change' },
        activityName: { required: true, message: '请输入活动名称', trigger: 'change' },
        date: { required: true, type: 'array', message: '请选择活动周期', trigger: 'change' },
        principal: { required: true, message: '请选择营长', trigger: 'change' },
        cover: { required: true, message: '请添加减脂营封面', trigger: 'change' },
        rule: { required: true, message: '请添加活动规则介绍封面', trigger: 'change' }
        // ruleConf: { required: true,  trigger: 'blur', validator: ruleConfValidator }
      }
      if (this.currentTag.type === '01') {
        rules.discount = { required: true, message: '请输入点餐优惠折扣', trigger: 'change' }
      }
      return rules
    }
  },
  created() {
    this.getList()
    // this.queryPrincipals()
    this.getPrincipal()
    this.getCampPrincipal()
  },
  methods: {
    handleFormTypeChange(val) {
      const { currentTag } = this
      currentTag.principal = ''
      currentTag.discount = ''
      Object.assign(currentTag.ruleConf, createRuleConf(currentTag.type))
    },
    handleCamperChange(value) {
      console.log(value, 'value')
      const item = this.camperList.find(i => i.principal === value)
      if (item) {
        this.currentTag.principalType = item.key
      }
    },
    async getCampPrincipal() {
      const res = await this.$http('marketing.activity.LoseWeightCamp/getCampPrincipal', {})
      this.campOptions = res.obj.map(val => ({ label: val.campPrincipal + ' - ' + val.campPrincipalPhone, value: val.campPrincipalId }))
    },
    // queryPrincipals() {
    //   this.$request('marketing.activity.Principal/queryPrincipals', {
    //     pageNo: 1,
    //     pageSize: 999
    //   })
    //     .thenwrap((err, res) => {
    //       if (!err) {
    //         this.camperList = res.record.map(item => ({
    //           name: `${item.name} (${item.cphone || '无'})`,
    //           cid: item.cid
    //         }))
    //       }
    //     })
    // },
    getPrincipal() {
      this.$request('marketing.activity.LoseWeightCamp/getPrincipal', {})
        .thenwrap((err, res) => {
          if (!err) {
            objectForeach(res, (values, key) => {
              this.camperList.push(
                ...values.map(item => ({
                  principal: Number(item.principal),
                  principalName: item.principalName,
                  key
                }))
              )
            })
          }
        })
    },
    checkText(type) {
      let number = this.currentTag[type]
      const toFixed = type == 'discount' ? 2 : 0
      number = isNaN(number) ? '' : Number(number).toFixed(toFixed)
      this.currentTag[type] = number
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      }
      this.$store.state.vloading = true
      const res = await this.$http('marketing.activity.LoseWeightCamp/getActivitys', params)
      if (!res.errMsg) {
        this.tableData = res.obj.record
        this.tableDataTotal = res.obj.totalRecordCount
      }
    },
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    async handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const params = {
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal
      }
      const res = await this.$http('marketing.activity.LoseWeightCamp/getActivitys', params)
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
      })
    },
    toCreate() {
      this.title = '新建减肥营活动'
      this.currentTag = createForm()
      this.editDialogVisible = true
      this.$nt(() => {
        this.$refs.form.resetFields()
      })
    },
    async toEdit(row) {
      this.title = '编辑减肥营活动'
      this.editDialogVisible = true
      const res = await this.$http('marketing.activity.LoseWeightCamp/marketingActivityInfo', { activityId: row.activityId })
      Object.assign(this.currentTag, res.obj, { stt: row.stt })
      const timeToDate = (time) => new Date(this.$day(time).valueOf())
      this.currentTag.date = [timeToDate(this.currentTag.startTime), timeToDate(this.currentTag.endTime)]
    },
    async toDel(row) {
      this.$confirm('确定删除？', '提示？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('FoodUnit/deleteUnit', { tfsId: row.tfsId })
        if (!res.errMsg) {
          this.$msg('操作成功', 'success')
          this.getList()
        } else {
          this.$msg(res.errMsg, 'error')
        }
      })
    },
    genQueryParams() {
      const params = { ...this.queryParams }
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date)
        params.startDate = startDate.format('YYYY-MM-DD')
        params.endDate = endDate.format('YYYY-MM-DD')
      }
      delete params.date
      return params
    },
    checkRuleConf(ruleConf) {
      const type = this.currentTag.type
      const keys = Object.keys(ruleConf)
        .filter(key => {
          if (type === '00' && ['04', '05'].includes(key)) { // 为维士减脂营是不检查 04 和 05
            return false
          }
          return true
        })

      const msgMap = {
        '01': '入营规则_余额门槛',
        '02': '入营规则_点餐门槛_天数',
        '03': '入营规则_点餐门槛_餐数',
        '04': '点餐优惠',
        '05': '初始提成折扣',
        '06': '每天订餐分数',
        '07': '每天订餐上限',
        '08': '每天点赞分数',
        '09': '每天点赞上限',
        '10': '每天饮食打卡分数',
        '11': '每天运动打卡分数'
      }

      for (const key of keys) {
        if (!ruleConf[key]) return `请输入${msgMap[key]}`
      }
    },
    tagConfirm(done) {
      this.$refs.form.validate(async valid => {
        if (valid) {
          const params = this.$deepClone(this.currentTag)
          const [startTime, endTime] = transformDaterange(params.date)
          params.startTime = startTime.format('YYYY-MM-DD')
          params.endTime = endTime.format('YYYY-MM-DD')

          const confMsg = this.checkRuleConf(params.ruleConf)
          if (confMsg) {
            ElMessage.error(confMsg)
            done()
            return
          }
          // if (params.activityId) {
          //   params.principalType = '00'
          // }
          const url = params.activityId ? 'marketing.activity.LoseWeightCamp/editActivity' : 'marketing.activity.LoseWeightCamp/addActivity'
          try {
            const res = await this.$http(url, params)
            if (!res.errMsg) {
              this.$msg('操作成功', 'success')
              this.editDialogVisible = false
              this.getList()
            } else {
              this.$msg(res.errMsg, 'error')
            }
          } catch (e) { }
        }
        done()
      })
    },
    toDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          activityId: row.activityId
        }
      })
    },
    toOrder(row) {
      this.$router.push({
        path: `${this.$route.path}/ordered`,
        query: {
          activityId: row.activityId
        }
      })
    }
  }
})
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.medium-input {
  width: 250px;
  margin-right: 20px;
}

.margin-12 {
  margin: 12px 0;
}

.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}
.action-label {
  margin-right: 10px;
}
.red {
  color: red;
}
</style>
