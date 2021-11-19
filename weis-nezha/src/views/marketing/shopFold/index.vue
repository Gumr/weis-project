<template>
  <div class="page-container">
    <div class="query-bar" style="text-align: right">
      <el-button type="primary" @click="updateDiscount">新建</el-button>
    </div>
    <div class="table">
      <BasePageTable
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :total="tableDataTotal"
        :data="tableData"
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column
          v-for="col in tableCols"
          :key="col.prop"
          v-bind="col"
          align="center"
        >
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <span
              class="brand-color cursor-pointer action-label"
              @click="updateDiscount('edit', row)"
              >编辑</span
            >
            <span
              class="brand-color cursor-pointer action-label"
              @click="delGroup(row, done)"
              >删除</span
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="showCrDialog"
      title=""
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="onConfirm"
      @on-cancel="onCancel"
      @close="onCancel"
    >
      <el-form :model="form" ref="refForm" :rules="formRules">
        <el-form-item label="标题" label-width="140px" prop="groupName">
          <el-input v-model="form.groupName" style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item label="门店" label-width="140px" prop="discountHPs">
          <el-checkbox-group v-model="form.discountHPs">
            <el-checkbox
              v-for="hp in heatPoints"
              :key="hp.value"
              :label="hp.value"
              >{{ hp.label }}</el-checkbox
            >
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="折扣" label-width="140px" prop="discount">
          <el-input
            v-model="form.discount"
            type="number"
            style="width: 90%"
          />&nbsp;折
        </el-form-item>
        <el-form-item label="原价金额上限(选填)" label-width="140px">
          <el-input v-model="form.dayLimitAmount" style="width: 90%" />&nbsp;元
        </el-form-item>
        <el-form-item label="用餐日期" label-width="140px" prop="startDate">
          <el-date-picker
            type="daterange"
            placeholder="选择日期"
            v-model="selectDate"
            @change="handleDatePickerChange"
          ></el-date-picker>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import 'dayjs/locale/zh-cn'
import { ElMessage } from 'element-plus'
import { cloneDeep } from '@/utils/common'
import { requestFactor } from '@/utils/request'
import { defineComponent, reactive, ref, toRefs } from 'vue'
import FormItem from '@/components/FormItem.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
const { http } = requestFactor('discount.DiscountGroup', true)
const { http: hpHttp } = requestFactor('HeatingPoint', true)

export default defineComponent({
  components: {
    ConfirmDialog,
    FormItem,
  },
  setup() {
    const initForm = {
      groupName: '', // 门店折扣名称
      discountHPs: [], // 参加折扣的门店
      discount: '',
      startDate: '',
      endDate: '', // 折扣值
      dayLimitAmount: '', // 上限金额
    }
    const refForm = ref({})
    const form = reactive(cloneDeep(initForm))

    const validateDate = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择日期'))
        return
      }
      refForm.value.validateField('startDate')
      callback()
    }
    const formRules = {
      groupName: [{ required: true, message: '请输入标题', trigger: 'blur' }],
      discountHPs: [{ required: true, message: '请选择门店', trigger: 'blur' }],
      discount: [{ required: true, message: '请输入折扣', trigger: 'blur' }],
      // dayLimitAmount: [
      //   { required: true, message: '请输入原价金额上限', trigger: 'blur' },
      // ],
      startDate: [{ required: true, validator: validateDate, trigger: 'blur' }],
    }

    const data = reactive({
      selectDate: [],
      labelStyle: { width: '140px', marginBottom: '10px' },
      showCrDialog: false,
      heatPoints: [],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      tableDataTotal: 0,
      tableData: [],
      tableCols: [
        {
          label: '序号',
          type: 'index',
          width: '80',
        },
        {
          label: '标题',
          prop: 'groupName',
        },
        {
          label: '门店',
          prop: 'heatingPointInfos',
          formatter: (row) => {
            if (row.heatingPointInfos) {
              let hpNames = row.heatingPointInfos.map(
                (item) => `${item.thpName}`
              )
              return hpNames.join('、')
            }
          },
        },
        {
          label: '折扣',
          prop: 'discount',
        },
        {
          label: '原价金额上限',
          prop: 'dayLimitAmount',
        },
        {
          label: '用餐日期',
          prop: 'startDate',
          formatter: (row) => {
            const start = dayjs(row.startDate).format('YYYY-MM-DD')
            const end = dayjs(row.endDate).format('YYYY-MM-DD')
            return `${start}-${end}`
          },
        },
      ],
    })

    // 新建门店折扣
    let opType, _editId
    function updateDiscount(type = 'create', row) {
      opType = type
      data.showCrDialog = true
      if (opType === 'edit') {
        const {
          groupName,
          discount,
          startDate,
          endDate,
          dayLimitAmount,
          heatingPointInfos,
        } = row
        _editId = row.groupId
        data.selectDate = [startDate, endDate]
        Object.assign(form, {
          groupName,
          discount,
          startDate,
          endDate,
          dayLimitAmount,
          discountHPs: heatingPointInfos
            ? heatingPointInfos.map((item) => item.thpId)
            : [],
        })
        return
      }
      _editId = ''
      data.selectDate = []
      Object.assign(form, initForm)
    }

    function getHpList() {
      hpHttp('queryHeatingPointList', {
        stt: '01',
      }).thenwrap((err, res) => {
        if (!err) {
          data.heatPoints = res
          return
        }
        ElMessage.error(err)
      })
    }

    // 获取门店折扣列表
    function getList(done) {
      http('getHPDiscounts', {
        pageNo: data.page.pageNo,
        pageSize: data.page.pageSize,
      }).thenwrap((err, res) => {
        if (!err) {
          data.tableData = res.result.record
          data.tableDataTotal = res.result.totalRecordCount
          return
        }
        ElMessage.error(err)
      })
    }

    function onConfirm(done) {
      refForm.value.validate((valid) => {
        if (valid) {
          const params = { ...form }
          if (!_editId) {
            params.startDate = dayjs(data.selectDate[0]).format('YYYYMMDD')
            params.endDate = dayjs(data.selectDate[1]).format('YYYYMMDD')
          } else {
            params.groupId = _editId
          }
          http('editHPDiscount', params).thenwrap((err, res) => {
            if (!err) {
              data.showCrDialog = false
              ElMessage.success('创建成功')
              Object.assign(form, {
                ...initForm,
              })
              getList()
            } else {
              _editId = ''
              ElMessage.error(err.errMsg)
            }
          })
        }
        done()
      })
    }

    function onCancel() {
      refForm.value.resetFields()
    }

    function delGroup(row, done) {
      const { groupId } = row
      http('delGroup', {
        groupId,
      }).thenwrap((err, res) => {
        if (!err) {
          ElMessage.success('已删除')
          getList()
        } else {
          ElMessage.error(err.errMsg)
        }
        done()
      })
    }

    function handleDatePickerChange(dates) {
      form.startDate = dayjs(dates[0]).format('YYYYMMDD')
      form.endDate = dayjs(dates[1]).format('YYYYMMDD')
    }
    getHpList()
    getList()
    return {
      ...toRefs(data),
      form,
      refForm,
      formRules,
      handleDatePickerChange,
      updateDiscount,
      onConfirm,
      onCancel,
      delGroup,
      getList,
    }
  },
})
</script>

<style scoped lang="less">
.btn {
  width: 220px;
  height: 50px;
}
.action-label {
  margin-right: 10px;
}
</style>
