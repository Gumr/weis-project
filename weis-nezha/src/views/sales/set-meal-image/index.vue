<template>
  <div class="page-container">
    <QueryComponents
        v-model="queryValue"
        class="query-bar"
        :query-list="queryList"
        :action="false"
    ></QueryComponents>
    <BasePageTable
        v-model:current-page="table.page.pageNo"
        v-model:page-size="table.page.pageSize"
        :data="table.data"
        :total="table.total"
        @page-change="getList"
    >
      <el-table-column
          v-for="col in columns"
          :key="col.prop"
          v-bind="col"
      ></el-table-column>
      <el-table-column
          label="操作"
          :width="160"
          align="center"
      >
        <template #default="{row}">
          <span
              class="table-action-label"
              style="margin-right: 6px"
              @click="editClick(row)"
          >编辑</span>
          <span
              class="table-action-label"
              style="margin-right: 6px"
              @click="deleteClick(row)"
          >删除</span>
          <span
              class="table-action-label"
              @click="viewClick(row)"
          >查看图片</span>
        </template>
      </el-table-column>
    </BasePageTable>
    <div
        v-if="currentMeal.setMealType === '00'"
        id="image1"
        class="image-1 fixed-hidden"
    >
      <div class="image-1__topImage">
        <div class="image-1__times ">
          <span
              class="image-1__boldtext family-ximaiti">{{ $day(currentMeal.setMealInfo[0].startDate).format('M月D日') }}</span>
          <span
              class="image-1__nametext">{{ currentMeal.setMealInfo[0].setMealImgName || currentMeal.setMealName }}</span>
          <!--          <div>-->
          <!--            <div class="image-1__weektext family-ximaiti">{{weeks($day(currentMeal.setMealInfo[0].startDate).day())}}</div>-->
          <!--            <div class="image-1__nametext family-ximaiti">{{currentMeal.setMealInfo[0].setMealImgName || currentMeal.setMealName}}</div>-->
          <!--          </div>-->
        </div>
      </div>
      <div class="image-1__box">
        <DayImage
            :kcal="currentMeal.setMealInfo[0].energy"
            :protein="currentMeal.setMealInfo[0].protein"
            :fat="currentMeal.setMealInfo[0].fat"
            :carbon="currentMeal.setMealInfo[0].carbonwater"
            :salt="currentMeal.setMealInfo[0].salt"
            :skus="currentMeal.setMealInfo[0].skuData"
        />
      </div>
      <div class="image-1__box image-1__footer">
        <div
            class="footer-tags"
        >
          <img
              class="smile"
              src="/images/smile.png"
          />
          <div class="footer-tips">
            <div
                class="text-color-666 font-size-24"
                style="margin-top: 20px;word-wrap: break-word;"
            >
              {{ currentMeal.tips }}
            </div>
          </div>
          <!-- <div class="text-color-333 font-size-32">过敏原</div> -->
          <div class="image-1__tags"
               v-if="currentMeal.setMealInfo[0].dietaryIntake && currentMeal.setMealInfo[0].dietaryIntake.length > 0">
            <span class="image-1__tag image-1__typetag">过敏原</span>
            <span
                v-for="tag in currentMeal.setMealInfo[0].dietaryIntake"
                :key="tag"
                class="image-1__tag"
            >{{ tag }}</span>
          </div>
        </div>
        <img
            class="image-1__logo"
            src="/images/bottom.png"
        />
      </div>

    </div>
    <div
        v-if="currentMeal.setMealType === '01'"
        id="image2"
        class="image-2 fixed-hidden"
    >
      <div class="display-flex flex-content-center image-2__header">
        <!--        <div class="display-flex">-->
        <img
            src="/images/leftTop.png"
            :class="{
          'image-2__header__leftTopLarge': currentMeal.setMealInfo.length > 2,
          'image-2__header__leftTopMiddle': currentMeal.setMealInfo.length === 2,
          'image-2__header__leftTopMini': currentMeal.setMealInfo.length <= 1
        }"
        >
        <div class="image-2__title ">
          <div
              class="family-ximaiti"
              :class="{'font-size-80': currentMeal.setMealInfo.length > 2,
          'font-size-60 mr40': currentMeal.setMealInfo.length === 2,
          'font-size-50': currentMeal.setMealInfo.length <= 1}"
          >维士小盒饭
          </div>
          <div :class="{'fm50': currentMeal.setMealInfo.length > 2,
          'font-size-40 ml20': currentMeal.setMealInfo.length === 2,
          'font30': currentMeal.setMealInfo.length <= 1}">膳食营养分析表
          </div>
        </div>
        <!--        </div>-->
        <img
            src="/images/rightTop.png"
            :class="{
          'image-2__header__rightTopLarge': currentMeal.setMealInfo.length > 2,
          'image-2__header__rightTopMiddle': currentMeal.setMealInfo.length === 2,
          'image-2__header__rightTopMini': currentMeal.setMealInfo.length <= 1
        }"
        >
      </div>

      <!-- <img
          v-if="currentMeal.setMealInfo.length > 1"
          class="image-2__logo1"
          :class="{'image-2__logo1--small': currentMeal.setMealInfo.length <= 2}"
          src="/images/meal-2-logo-2.png"
        >
        <img
          :class="{
          'image-2__title--large': currentMeal.setMealInfo.length > 2,
          'image-2__title--medium': currentMeal.setMealInfo.length === 2,
          'image-2__title--small': currentMeal.setMealInfo.length <= 1
        }"
          src="/images/meal-2-title.png"
        >
        <img
          v-if="currentMeal.setMealInfo.length > 1"
          class="image-2__logo2"
          :class="{'image-2__logo2--small': currentMeal.setMealInfo.length <= 2}"
          src="/images/meal-2-logo-1.png"
        > -->

      <div class="display-flex">
        <div
            v-for="(item, index) in currentMeal.setMealInfo"
            :key="index"
            class="image-2__day"
            style="width:100%;padding-right:20px;margin-right:30px"
            :class="{
          'skumrlrTop': currentMeal.setMealInfo.length > 2,
          'skumrmiTop': currentMeal.setMealInfo.length === 2,
          'skumrTop': currentMeal.setMealInfo.length <= 1
        }"
        >
          <DayImage
              :date="$day(item.startDate).format('M月D日')"
              :name="item.setMealImgName || currentMeal.setMealName"
              :kcal="item.energy"
              :protein="item.protein"
              :fat="item.fat"
              :carbon="item.carbonwater"
              :salt="item.salt"
              :skus="item.skuData"
              style="width:100%;"
          />
        </div>
      </div>
      <div class="image-2__footer">
        <img
            :class="{
          'largeleftbottom': currentMeal.setMealInfo.length > 2,
          'midelleftbottom': currentMeal.setMealInfo.length === 2,
          'image-2__footer__leftbottom': currentMeal.setMealInfo.length <= 1
        }"
            src="/images/leftbottom.png"
        >

        <img
            :class="{
          'largerighttbottom': currentMeal.setMealInfo.length > 2,
          'midelrightbottom': currentMeal.setMealInfo.length === 2,
          'image-2__footer__rightbottom': currentMeal.setMealInfo.length <= 1}"
            src="/images/rightBottom.png"
        >
      </div>
    </div>

    <el-image-viewer
        v-if="dialogVisible.image"
        :url-list="[image1]"
        @close="dialogVisible.image = false"
    />

    <ConfirmDialog
        v-model="dialogVisible.form"
        center
        async-confirm
        @on-confirm="handleFormConfirm"
    >
      <el-form
          ref="formRef"
          :model="form"
          label-width="100px"
          :rules="formRules"
          :validate-on-rule-change="false"
      >
        <el-form-item
            label="图片名称"
            prop="setMealName"
        >
          <el-input v-model="form.setMealName"></el-input>
        </el-form-item>
        <el-form-item
            label="图片类型"
            prop="setMealType"
        >
          <el-radio-group v-model="form.setMealType">
            <el-radio
                v-for="item in setMealTypes"
                :key="item.value"
                :label="item.value"
                @change="form.setMealInfo.length = 1"
            >{{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
            v-show="form.setMealType === '00'"
            label="选择时间"
            prop="date"
        >
          <el-date-picker
              v-model="form.setMealInfo[0].date"
              placeholder="请选择时间"
          ></el-date-picker>
        </el-form-item>
        <el-form-item
            v-if="form.setMealType === '00'"
            label="选择菜品"
        >
          <el-button
              class="select-btn"
              @click="selectSkuClick(0)"
          >选择菜品
          </el-button>
          <el-table
              v-for="(item, index) in form.setMealInfo"
              :key="index"
              max-height="400px"
              border
              stripe
              :data="item.skuData"
          >
            <el-table-column
                v-for="col in selectSkuColumns"
                :key="col.prop"
                v-bind="col"
            ></el-table-column>
            <el-table-column label="操作">
              <template #default="{$index}">
                <span
                    class="table-action-label"
                    @click="removeSkuClick(index, $index)"
                >移除</span>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item
            v-if="form.setMealType === '01'"
            label="添加餐单"
            prop="date"
        >
          <el-button
              class="select-btn"
              @click="addMealClick"
          >添加餐单
          </el-button>
          <div
              v-for="(item, index) in form.setMealInfo"
              :key="index"
              class="meal-item"
          >
            <FormItem label="选择时间">
              <div class="flex-items-center flex-content-between">
                <div>
                  <el-date-picker v-model="item.date"></el-date-picker>
                  <el-tag
                      v-if="item.date"
                      class="meal-item__tag"
                  >{{ format(item.date) }}
                  </el-tag>
                </div>
                <el-button
                    v-if="index > 0"
                    type="danger"
                    @click="deleteMealClick(index)"
                >删除
                </el-button>
              </div>
            </FormItem>
            <FormItem
                style="margin-top: 12px"
                label="选择菜品"
            >
              <div>
                <el-button
                    class="select-btn"
                    @click="selectSkuClick(index)"
                >选择菜品
                </el-button>
                <el-table
                    max-height="400px"
                    border
                    stripe
                    :data="item.skuData"
                >
                  <el-table-column
                      v-for="col in selectSkuColumns"
                      :key="col.prop"
                      v-bind="col"
                  ></el-table-column>
                  <el-table-column label="操作">
                    <template #default="{$index}">
                      <span
                          class="table-action-label"
                          @click="removeSkuClick(index, $index)"
                      >移除</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </FormItem>
          </div>
        </el-form-item>
        <el-form-item
            v-if="form.setMealType !== '01'"
            label="营养小贴士"
            prop="tips"
        >
          <el-input
              v-model="form.tips"
              type="textarea"
              :rows="4"
          ></el-input>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
    <ConfirmDialog
        v-model="dialogVisible.sku"
        center
        @on-confirm="handleSkuConfirm"
    >
      <el-table
          :data="skuTableData"
          border
          stripe
          max-height="600px"
      >
        <el-table-column
            v-for="col in skuColumns"
            :key="col.prop"
            v-bind="col"
        ></el-table-column>
        <el-table-column label="菜品数量">
          <template #default="{row}">
            <NumberInput v-model="row.skuNum"></NumberInput>
          </template>
        </el-table-column>
      </el-table>
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import FormItem from '@/components/FormItem.vue'
import { reactive, h, ref, watch, computed, nextTick } from 'vue'
import request from '@/utils/request'
import {
  ElButton,
  ElForm,
  ElMessage,
  ElMessageBox,
  ElLoading
} from 'element-plus'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import dayjs from 'dayjs'
import html2canvas from 'html2canvas'
import DayImage from './DayImage.vue'
import { objectForeach, round } from '@/utils/common'
import type { Sku } from './types'

interface MealInfo {
  date: Date | null;
  carbonwater?: number;
  energy?: number;
  fat?: number;
  protein?: number;
  salt?: number;
  setMealImgName?: string;
  dietaryIntake?: string[];
  startDate: string;
  endDate: string;
  skuData: Sku[];
}

const dialogVisible = reactive({
  form: false,
  sku: false,
  image: false
})

const queryValue = reactive({
  setMealName: ''
})

const formRef = ref({}) as Ref<typeof ElForm>
// const image1Ref = ref({}) as Ref<HTMLElement>
const image1 = ref('')
const setMealTypes = [
  {
    label: '每日餐单',
    value: '00'
  },
  {
    label: '营养分析表',
    value: '01'
  }
]

function createForm() {
  return {
    setMealName: '',
    setMealType: '00',
    // date: '',
    setMealInfo: [createMealInfo()] as MealInfo[],
    // setMealImg: '',
    tips: ''
  }
}

function createMealInfo(): MealInfo {
  return {
    date: null,
    startDate: '',
    endDate: '',
    skuData: []
  }
}

function format(d: Date) {
  return dayjs(d).format('dddd')
}

function weeks(w: Number) {
  switch (w) {
    case 1:
      return '星期一'
    case 2:
      return '星期二'
    case 3:
      return '星期三'
    case 4:
      return '星期四'
    case 5:
      return '星期五'
    case 6:
      return '星期六'
    case 0:
      return '星期日'
    default :
      return ''
  }
}

const form = reactive(createForm())

const formRules = computed(() => {
  const rule = {
    setMealName: {
      required: true,
      trigger: 'blur',
      type: 'string',
      message: '请输入图片名称'
    },
    setMealType: {
      required: true,
      trigger: 'change',
      type: 'string',
      message: '请选择图片类型'
    },
    date: {
      required: true,
      trigger: 'change',
      validator: (r, v, callback) => {
        const failed =
            form.setMealType === '00'
                ? !form.setMealInfo[0].date // 每日餐单时判断一个餐
                : form.setMealInfo.some(({ date }) => !date) // 营养分析时判断每个餐的时间

        if (failed) {
          callback('请选择时间')
        } else {
          callback()
        }
      }
    },
    tips: {
      required: true,
      trigger: 'blur',
      type: 'string',
      message: '请输入营养小贴士'
    }
  }
  if (form.setMealType === '01') {
    rule.date.required = false
    rule.tips.required = false
  }
  return rule
})

function removeSkuClick(mealInfoIndex: number, skuDataIndex: number) {
  form.setMealInfo[mealInfoIndex].skuData!.splice(skuDataIndex, 1)
}

// function getSetMealImgInfo(row: any) {
//   return
// }
const currentMeal = reactive({
  setMealName: '',
  setMealType: '',
  tips: '',
  setMealInfo: [] as MealInfo[]
})
let recordId: string

function editClick(row: any) {
  recordId = row.recordId
  request('groupmeal.SetMealImg/getSetMealImgInfo', {
    recordId: row.recordId
  }).thenwrap((err, data) => {
    if (!err) {
      data.setMealInfo = data.setMealInfo.map((item: any) => {
        item.date = new Date(dayjs(item.startDate).valueOf())
        return item
      })
      objectForeach(form, (_, key) => {
        form[key] = data[key]
      })
      if (form.setMealInfo.length <= 0) {
        form.setMealInfo = [createMealInfo()]
      }
      // form.setMealInfo
      dialogVisible.form = true
    }
  })
}

function deleteClick(row: any) {
  ElMessageBox.confirm('是否删除该图片？', '提示').then(() => {
    request('groupmeal.SetMealImg/delSetMealImg', {
      recordId: row.recordId
    }).thenwrap((err) => {
      if (!err) {
        ElMessage.success('删除成功')
        getList()
      } else {
        ElMessage.error(err.errMsg)
      }
    })
  })
}

function viewClick(row: any) {
  request('groupmeal.SetMealImg/getSetMealImgInfoByImg', {
    recordId: row.recordId
  }).thenwrap((err, data) => {
    if (!err) {
      Object.assign(currentMeal, data)

      if (currentMeal.setMealInfo.length <= 0) {
        ElMessage.error('缺少菜品，无法绘制')
        return
      }
      const loading = ElLoading.service({
        text: '绘制图片中'
      })
      currentMeal.setMealInfo.forEach((item) => {
        const res = item.skuData.reduce(
            (r, sku) => {
              r.carbonwater += Number(sku.skuNum) * Number(sku.carbonwater)!
              r.fat += Number(sku.skuNum) * Number(sku.fat)!
              r.protein += Number(sku.skuNum) * Number(sku.protein)!
              r.salt += Number(sku.skuNum) * Number(sku.salt)!
              r.energy += Number(sku.skuNum) * Number(sku.energy)!
              return r
            },
            {
              carbonwater: 0,
              fat: 0,
              protein: 0,
              energy: 0,
              salt: 0
            }
        )

        item.carbonwater = round(res.carbonwater, 2)
        item.energy = round(res.energy, 2)
        item.fat = round(res.fat, 2)
        item.protein = round(res.protein, 2)
        item.salt = round(res.salt, 2)
      })
      nextTick(() => {
        const el =
            currentMeal.setMealType === '00'
                ? document.getElementById('image1')!
                : document.getElementById('image2')!

        setTimeout(() => {
          // console.log('-------------'+el.offsetHeight)
          //延时计算高度
          html2canvas(el, {
            useCORS: true
          }).then((canvas) => {
            const url = canvas.toDataURL('image/png')
            image1.value = url
            dialogVisible.image = true
            loading.close()
          })
        }, 100)
      })
    }
  })
}

const skuTableData = ref([])
const selectSkuColumns = [
  {
    type: 'index',
    label: '序号'
  },
  {
    prop: 'skuName',
    label: '菜品名称'
  },
  {
    prop: 'skuNum',
    label: '菜品数量'
  }
]
const skuColumns = [
  {
    type: 'index',
    label: '序号'
  },
  {
    prop: 'skuId',
    label: '菜品编码'
  },
  {
    prop: 'skuName',
    label: '菜品名称'
  },
  {
    prop: 'quality',
    label: '菜品规格',
    formatter: (row: any) =>
        row.type === '00' ? row.quality + row.unit : '无'
  }
  // {
  //   prop: 'setMealTypeStr',
  //   label: '菜品单价'
  // }
]
const table = reactive({
  data: [],
  total: 0,
  page: {
    pageNo: 1,
    pageSize: 10
  }
})

const columns = [
  {
    type: 'index',
    label: '序号'
  },
  {
    prop: 'setMealName',
    label: '图片名称'
  },
  {
    prop: 'setMealTypeStr',
    label: '图片类型'
  }
]

function getList() {
  request('groupmeal.SetMealImg/getSetMealImgs', {
    ...table.page,
    ...queryValue
  }).thenwrap((err, data) => {
    if (!err) {
      table.data = data.record
      table.total = data.totalRecordCount
    }
  })
}

function setMealImg() {
  const params = {
    ...form
  }
  params.setMealInfo = params.setMealInfo.map((item) => {
    const dateStr = dayjs(item.date!).format('YYYYMMDD')
    item.startDate = item.endDate = dateStr
    return item
  })
  // 用recordId是否为空 判断新增还是编辑
  return request(
      'groupmeal.SetMealImg/setMealImg',
      recordId ? { recordId, ...params } : params
  )
}

function deleteMealClick(index: number) {
  form.setMealInfo.splice(index, 1)
}

function handleFormConfirm(done: () => void) {
  formRef.value.validate(async (valid: boolean) => {
    console.log(valid, 'valid')
    if (valid) {
      const { setMealInfo } = form
      const index = setMealInfo.findIndex(
          (item) => !item.date || item.skuData.length <= 0
      )
      if (index !== -1) {
        ElMessage.error(`请填写完整第${index + 1}餐的菜品列表`)
        done()
        return
      }

      try {
        const res = (await setMealImg()).data
        if (res.errCode === 0) {
          dialogVisible.form = false
          getList()
          ElMessage.success('操作成功')
        } else {
          ElMessage.error(res.errMsg)
        }
      } catch {
      }
    }
    done()
  })
}

function handleSkuConfirm() {
  const skus = skuTableData.value.filter(
      (item: any) => Number(item.skuNum) > 0
  )

  function getSkuList(list: Sku[]) {
    return list.map((item: Sku) => ({
      skuId: item.skuId, //套餐或sku id
      skuName: item.skuName, //套餐或sku id
      type: item.type, //类型 00:单品,01:套餐
      skuNum: item.skuNum //数量
    }))
  }

  const skuData = skus.length >= 0 ? getSkuList(skus) : []

  if (form.setMealType === '00') {
    // 每日餐单
    form.setMealInfo[0].skuData = skuData
  }
  if (form.setMealType === '01') {
    // 营养分析表
    form.setMealInfo[mealInfoIndex].skuData = skuData
  }
}

function getSkuInfo() {
  request('groupmeal.SetMealImg/getSkuInfo', {}).thenwrap((err, data) => {
    if (!err) {
      skuTableData.value = data.map((item: Sku) => {
        item.skuNum = '0'
        return item
      })
      // table.data = data.record
      // table.total = data.totalRecordCount
    }
  })
}

let mealInfoIndex = 0

function selectSkuClick(idx = 0) {
  mealInfoIndex = idx

  const { skuData } = form.setMealInfo[idx]
  skuTableData.value.forEach((item: any) => {
    const match = skuData.find((sku) => sku.skuId === item.skuId)
    item.skuNum = match ? match.skuNum : '0'
  })
  dialogVisible.sku = true
}

function addMealClick() {
  form.setMealInfo.push(createMealInfo())
}

const queryList = [
  {
    component: 'el-input',
    key: 'setMealName',
    placeholder: '请输入图片名称',
    props: {
      clearable: true
    }
  },
  {
    slot: () =>
        h(
            ElButton,
            {
              onClick: getList
            },
            '搜索'
        )
  },
  {
    slot: () =>
        h(
            'div',
            {
              style: {
                textAlign: 'right'
              }
            },
            [
              h(
                  ElButton,
                  {
                    type: 'primary',
                    onClick() {
                      recordId = ''

                      Object.assign(form, createForm())
                      dialogVisible.form = true
                      nextTick(() => {
                        formRef.value.clearValidate('date')
                      })
                    }
                  },
                  '新建图片'
              )
            ]
        )
  }
]

getSkuInfo()
getList()
</script>
<style lang="less">
@font-face {
  font-family: "XiMaiTi";
  src: url("/src/views/sales/set-meal-image/ZiZhiQuXiMaiTi-2.ttf") format("truetype");
}

.select-btn {
  margin-bottom: 12px;
}

.text-color-666 {
  color: #153371;
}

.text-color-333 {
  color: #333;
}

.skumrTop {
  margin-top: -140px;
}

.skumrmiTop {
  margin-top: -320px;
}

.skumrlrTop {
  margin-top: -480px;
}

.font70 {
  font-size: 70px;
}

.font-size-40 {
  font-size: 40px;
}

.ml20 {
  margin-left: -640px;
}

.mr40 {
  margin-top: 140px;
  margin-left: -640px;
}

.font-size-50 {
  font-size: 50px;
  margin-top: 60px;
  margin-left: -260px;
}

.font30 {
  font-size: 30px;
  margin-left: -260px;
}

.font-size-32 {
  font-size: 32px;
}

.font-size-28 {
  font-size: 28px;
}

.font-size-24 {
  font-size: 24px;
}

.font-size-60 {
  font-size: 70px;
}

.fm50 {
  font-size: 50px;
  margin-left: -837px;
}

.font-size-80 {
  font-size: 100px;
  margin-top: 200px;
  margin-left: -837px;
}

// .image-text-color {
//   color: #994d27;
// }

.family-ximaiti {
  font-family: "XiMaiTi";
}

.meal-item {
  border: 1px solid #dcdfe6;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;

  &__tag {
    margin-left: 8px;
  }
}

.image-background {
  background-color: #eff3fa;
  // background-repeat: repeat;
  // background-image: url("/public/images/grid.png");
}

.fixed-hidden {
  position: fixed;
  right: 200vw;
}

.midelleftbottom {
  width: 600px;
  height: 300px;
}

.largeleftbottom {
  width: 800px;
  height: 400px;
}

.image-2 {
  .image-background();
  display: inline-block;
  width: auto;

  &__header {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;

    &__leftTopMiddle {
      height: 660px;
    }

    &__leftTopMini {
      height: 330px;
    }

    &__leftTopLarge {
      height: 1000px;
    }

    &__rightTopMini {
      height: 166px;
    }

    &__rightTopMiddle {
      height: 330px;
    }

    &__rightTopLarge {
      height: 500px;
    }
  }

  &__title {
    color: #073190;
    // margin-top: 67px;
    text-align: center;
    // margin-left: -60px;
    width: auto;
  }

  &__day {
    border: 8px solid #073190;
    border-radius: 30px;

    margin-left: 34px;
    width: auto;

    &:last-child {
      margin-right: 0;
    }
  }

  &__logo1 {
    width: 304px;
    height: 309px;

    &--small {
      width: 183px;
      height: 186px;
    }
  }

  &__title--large {
    width: 1211px;
    height: 284px;
  }

  &__title--medium {
    width: 727px;
    height: 170px;
  }

  &__title--small {
    width: 582px;
    height: 136px;
  }

  &__logo2 {
    margin-left: -57px;
    width: 206px;
    height: 291px;

    &--small {
      width: 125px;
      height: 175px;
    }
  }

  &__footer {
    margin-top: 20px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;

    &__leftbottom {
      width: 400px;
      height: 200px;
    }

    &__rightbottom {
      width: 193px;
      height: 83px;
      margin-bottom: 20px;
      margin-right: 51px;
      margin-top: 68px;
    }
  }
}

.midelrightbottom {
  width: 300px;
  height: 150px;
  margin-bottom: 40px;
  margin-right: 51px;
  margin-top: 68px;
}

.largerighttbottom {
  width: 400px;
  height: 200px;
  margin-bottom: 40px;
  margin-right: 51px;
  margin-top: 68px;
}

.image-1 {
  .image-background();
  display: inline-block;
  box-sizing: border-box;
  width: 750px;
  // padding: 0 63px;
  // height: 600px;
  &__footer {
    // margin-top: 20px;
  }

  &__topImage {
    width: 750px;
    height: 320px;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url("/public/images/top.png");
  }

  &__boldtext {
    white-space: nowrap;
    font-size: 55px;
    font-weight: bold;
    color: #ffffff;
  }

  &__nametext {
    font-size: 40px;
    font-weight: normal;
    color: #ffffff;
    margin-left: 27px;
  }

  &__weektext {
    font-size: 28px;
    font-weight: bold;
    color: #ffffff;
    margin-left: 27px;
  }

  &__times {
    align-items: start;
    display: flex;
    padding-top: 200px;
    padding-left: 30px;
  }

  &__logo-box {
    // padding: 16px 0 201px;
  }

  &__logo {
    width: 750px;
    // height: 400px;
    margin-top: 7px;
    // display: block;
    vertical-align: top;
  }

  .footer-tags {
    padding: 30px 30px 46px;
    // border-bottom: 1px dashed rgba(255, 184, 148, 0.5);
    background: #ffffff;
    margin-top: 20px;
    // width: 702px;
    border-radius: 18px;
    border: 0px solid #ffffff;
    margin-left: 20px;
    margin-right: 27px;
  }

  .smile {
    width: 109px;
    height: 121px;
    float: right;
    margin-top: -80px;
    display: block;
  }

  .footer-tips {
    padding: 0px 24px 10px;
  }

  &__tags {
    // margin-top: 20px;
  }

  &__tag {
    display: inline-block;
    padding: 0 30px;
    height: 52px;
    line-height: 52px;
    color: #f97e75;
    font-size: 28px;
    border-radius: 29px;
    border: 2px solid #f97e75;
    margin-right: 20px;
    margin-top: 10px;

    &:last-child {
      margin-right: 0;
    }
  }

  &__typetag {
    background-color: #f97e75;
    font-size: 23px;
    font-weight: bold;
    color: #ffffff;
  }

  &__text {
    font-size: 32px;
    font-weight: 600;
    color: #f97e75;
  }

  &__title {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #bd693f;
    border-radius: 99px;
    border: 4px solid #f97e75;
    width: 488px;
    height: 120px;
    font-size: 60px;
    text-shadow: 0px 3px 0px #994d27;
    color: #ffffff;
    line-height: 77px;
  }

  &__box {
    margin-top: 30px;
    // border: 4px solid #d7916d;
    // border-radius: 30px;
    // background-color: #fff;
    // overflow: hidden;
  }
}
</style>