<template>
  <div class>
    <div class="query-bar">
      <QueryComponents v-model="queryParams" :query-list="computedQueryComps" :span="4" semi>
        <template #action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="handleExport">导出</el-button>
        </template>
      </QueryComponents>
      <el-button type="danger" @click="showDialog">添加员工</el-button>
    </div>
    <div>
      <BasePageTable
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center" width="100px">
          <template #default="{ row }" class="action-cell">
            <!-- <span
              v-if="row.tgeRole == '01'"
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="goEdit(row)"
            >编辑</span> -->
            <div>
              <span
                class="brand-color cursor-pointer action-label"
                style="margin-right: 10px"
                @click="changeSubsidyClick(row)"
              >修改优惠</span>
            </div>
            <div>
              <span
                class="brand-color cursor-pointer action-label"
                style="margin-right: 10px"
                @click="toOperate('del', row)"
              >删除</span>
            </div>
            <!-- <span class="brand-color cursor-pointer action-label" style="margin-right: 10px" @click="goPage('staffDetail', row)">详情</span> -->
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <input
      ref="upload"
      type="file"
      accept=".xls, .xlsx"
      class="outputlist_upload"
      style="opacity: 0;"
    />
    <ConfirmDialog
      v-model="hasDialog"
      title="添加"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="onconfirm"
    >
      <div style="padding: 20px 0;">
        <div class="section-item">
          <!-- <span class="section-label label-1">所属部门：</span>
          <BaseSelect
            v-model="tgoId"
            :options="tgoOptions"
            clearable
            style="width: 200px;margin-right: 20px;"
          ></BaseSelect> -->
          <el-button type="primary" @click="addEmpInfo">添加</el-button>
          <el-button type="primary" @click="choiceUpload">批量导入</el-button>
          <span class="download" @click="downLoadTemplate">下载导入模板</span>
        </div>
      </div>
      <BasePageTable
        ref="empTable"
        height="600"
        :visible="false"
        :data="empInfo"
        highlight-current-row
        :row-class-name="tableRowClassName"
        border
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="姓名">
          <template #default="{ row }" class="action-cell">
            <el-input v-model="row.tgeName" :readonly="!row.isEdit"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="微信绑定手机号">
          <template #default="{ row }" class="action-cell">
            <el-input v-model="row.tgePhone" maxlength="11" :readonly="!row.isEdit"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <el-button v-if="row.isEdit" type="success" @click="empConfirm(row.index)">保存</el-button>
            <el-button v-if="!row.isEdit" type="primary" @click="empEdit(row.index)">编辑</el-button>
            <el-button type="danger" @click="empDel(row.index)">删除</el-button>
          </template>
        </el-table-column>
      </BasePageTable>
    </ConfirmDialog>
    <!-- <ConfirmDialog
      v-model="editDialog"
      title="编辑员工"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="editConfirm"
    >
      <div style="padding: 20px 0;">
        <div class="section-item">
          <span class="section-label label-1">员工姓名：</span>
          <el-input v-model="current.tgeName" class="small-input"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">手机：</span>
          <el-input v-model="current.tgePhone" class="small-input"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">所属部门：</span>
          <BaseSelect
            v-model="current.tgeOrgId"
            :options="tgoOptions"
            clearable
            style="width: 200px;margin-right: 20px;"
          ></BaseSelect>
        </div>
      </div>
    </ConfirmDialog> -->
    <ConfirmDialog v-model="discountDialog" title="修改优惠" center async-confirm @on-confirm="editCorpDiscountByEmp">
      <h3>点餐优惠次数</h3>
      <div class="form-item">
        <span class="form-item__label">单日优惠次数上限</span>
        <NumberInput v-model="currentDiscount.tgeEmpOrderLimit" class="mini-input"></NumberInput>
        <span>餐</span>
      </div>
      <div class="form-item">
        <span class="form-item__label">早餐（选填）</span>
        <NumberInput v-model="currentDiscount.tgeBreakfastLimit" class="mini-input"></NumberInput>
        <span>餐</span>
      </div>
      <div class="form-item">
        <span class="form-item__label">午餐（选填）</span>
        <NumberInput v-model="currentDiscount.tgeLunchLimit" class="mini-input"></NumberInput>
        <span>餐</span>
      </div>
      <div class="form-item">
        <span class="form-item__label">晚餐（选填）</span>
        <NumberInput v-model="currentDiscount.tgeDinnerLimit" class="mini-input"></NumberInput>
        <span>餐</span>
      </div>
      <h3>补助金额</h3>
      <div>
        <div style="padding-left: 120px;">
          <el-radio-group v-model="currentDiscount.tgeSubsidyType" disabled>
            <el-radio v-for="type in subsidyTypes" :key="type.value" :label="type.value">{{ type.label }}</el-radio>
          </el-radio-group>
        </div>
        <div v-if="currentDiscount.tgeSubsidyType === '00'" class="form-item">
          <NumberInput v-model="currentDiscount.tgeEmpSubsidy" mode="digit" :precision="2" class="mini-input"></NumberInput>
          <span>元</span>
        </div>
        <div v-if="currentDiscount.tgeSubsidyType === '01'">
          <div class="form-item">
            <span class="form-item__label">早餐</span>
            <NumberInput v-model="currentDiscount.tgeEmpBreakfastSubsidy" mode="digit" :precision="2" class="mini-input"></NumberInput>
            <span>元</span>
          </div>
          <div class="form-item">
            <span class="form-item__label">午餐</span>
            <NumberInput v-model="currentDiscount.tgeEmpLunchSubsidy" mode="digit" :precision="2" class="mini-input"></NumberInput>
            <span>元</span>
          </div>
          <div class="form-item">
            <span class="form-item__label">晚餐</span>
            <NumberInput v-model="currentDiscount.tgeEmpDinnerSubsidy" mode="digit" :precision="2" class="mini-input"></NumberInput>
            <span>元</span>
          </div>
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'
import exportExcel from '@/utils/export-excel'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
// import BaseSelect from '@/components/BaseSelect.vue'
import XLSX from '@/utils/xlsx'
import { subsidyTypes } from './common'
import { objectForeach } from '@/utils/common'
export default {
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
    // BaseSelect
  },
  data() {
    return {
      subsidyTypes,
      tgcId: '',
      tgoId: '',
      tableData: [],
      tableDataTotal: 0,
      hasDialog: false,
      editDialog: false,
      empInfo: [],
      tgoOptions: [],
      current: {
        // tgeName: '',
        tgePhone: ''
        // tgeOrgId: ''
      },
      page: {
        pageNo: 1,
        pageSize: 100
      },
      queryParams: {
        phone: '',
        role: '',
        tgoId: ''
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'phone',
          label: '员工手机',
          placeholder: '请输入员工手机',
          props: {
            clearable: true
          }
        }
      ],
      tableCol: [
        { label: '序号', type: 'index', width: '80' },
        { label: '员工ID', prop: 'tgePageId' },
        { label: '员工姓名', prop: 'tgeName' },
        { label: '员工手机', prop: 'tgePhone' },
        { label: '单日优惠餐数上限', prop: 'tgeEmpOrderLimit' },
        { label: '早餐餐数', prop: 'tgeBreakfastLimit' },
        { label: '午餐餐数', prop: 'tgeLunchLimit' },
        { label: '晚餐餐数', prop: 'tgeDinnerLimit' },
        { label: '单日补助上限', prop: 'tgeEmpSubsidy' },
        { label: '早餐补助', prop: 'tgeEmpBreakfastSubsidy' },
        { label: '午餐补助', prop: 'tgeEmpLunchSubsidy' },
        { label: '晚餐补助', prop: 'tgeEmpDinnerSubsidy' }
      ],
      discountDialog: false,
      currentDiscount: {
        tgeId: '', //员工id
        tgeSubsidyType: undefined,
        tgeEmpOrderLimit: '', //员工单日优惠点餐数上限
        tgeBreakfastLimit: '', //员工单日早餐上限
        tgeLunchLimit: '', //员工单日午餐上限
        tgeDinnerLimit: '', //员工单日晚餐上限
        tgeEmpBreakfastSubsidy: '', //员工单日早餐补助金上限
        tgeEmpLunchSubsidy: '', //员工单日午餐补助金上限
        tgeEmpDinnerSubsidy: '', //员工单日晚餐补助金上限
        tgeEmpSubsidy: '' //单日补助上限
      }
    }
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps]
      return list
    }
  },
  created() {
    this.tgcId = this.$route.query.id
    this.getList()
  },
  mounted() {
    this.$refs.upload.addEventListener('change', (e) => { // 绑定监听表格导入事件
      this.readExcel(e)
    })
  },
  methods: {
    changeSubsidyClick(row) {
      const { currentDiscount } = this
      objectForeach(currentDiscount, (_, k) => {
        currentDiscount[k] = row[k]
      })
      if (!currentDiscount.tgeSubsidyType) {
        currentDiscount.tgeSubsidyType = '01'
      }

      this.discountDialog = true
    },
    editCorpDiscountByEmp(done) {
      this.$request('groupmeal.Corp/editCorpDiscountByEmp', {
        tgcId: this.tgcId,
        ...this.currentDiscount
      }).thenwrap((err) => {
        if (!err) {
          this.$message.success('修改成功')
          this.getList()
          this.discountDialog = false
        } else {
          this.$message.error(err.errMsg)
        }
        done()
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
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    goPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          id: this.tgcId,
          tgeId: row.tgeId
        }
      })
    },
    async queryCorpOrgList() {
      const res = await this.$http('groupmeal.Corp/queryCorpOrgList', { tgcId: this.tgcId })
      this.tgoOptions = res.obj.map((item) => {
        let label = item.tgoOrgName
        if (item.tgoId == '0') {
          label += '（企业主体）'
        }
        return { label, value: item.tgoId }
      })
      this.queryComps[2].props.options = this.tgoOptions
    },
    async getList() {
      const params = {
        tgcId: this.tgcId,
        ...this.page,
        ...this.genQueryParams()
      }
      const res = await this.$http('groupmeal.Corp/queryEmployeeList', params)
      this.tableData = res.obj.record
      this.tableDataTotal = res.obj.totalRecordCount
    },
    async showDialog() {
      this.tgoId = ''
      this.hasDialog = true
      this.empInfo = []
    },
    tableRowClassName({ row, rowIndex }) {
      row.index = rowIndex
    },
    addEmpInfo() {
      this.empInfo.push({ tgeName: '', tgePhone: '', isEdit: true })
    },
    empConfirm(index) {
      const item = this.empInfo[index]
      if (!item.tgeName || !(/^1[3456789]\d{9}$/.test(item.tgePhone))) {
        this.$msg('请填写正确的信息', 'error')
        return
      }
      this.empInfo[index].isEdit = false
    },
    empEdit(index) {
      this.empInfo[index].isEdit = true
    },
    empDel(index) {
      this.empInfo.splice(index, 1)
    },
    async onconfirm(done) {
      const item = this.empInfo.filter(item => !item.isEdit)
      if (!item.length) {
        this.$msg('没有要添加的员工', 'error')
        done()
        return
      }
      for (const i in this.empInfo) {
        const item = this.empInfo[i]
        if (!item.tgeName || !(/^1[3456789]\d{9}$/.test(item.tgePhone))) {
          this.$msg(`请${i + 1}行员工信息错误`, 'error')
          return
        }
      }
      const res = await this.$http('groupmeal.Corp/batchSaveEmployee', { tgcId: this.tgcId, tgeOrgId: this.tgoId, empInfo: item })
      setTimeout(done, 300)
      if (!res.errMsg) {
        this.$msg('添加成功', 'success')
        this.getList()
        this.hasDialog = false
      } else {
        this.$msg(res.errMsg, 'error')
      }
    },
    goEdit(row) {
      Object.assign(this.current, row)
      this.editDialog = true
    },
    async editConfirm(done) {
      if (!this.current.tgeName) {
        this.$msg('请输入员工姓名', 'error')
        done()
        return
      }
      if (!this.current.tgePhone) {
        this.$msg('请输入手机', 'error')
        done()
        return
      }
      if (!this.current.tgeOrgId) {
        this.$msg('请选择部门', 'error')
        done()
        return
      }
      const res = await this.$http('groupmeal.Corp/editEmployee', { ...this.current, tgcId: this.tgcId })
      setTimeout(done, 300)
      if (!res.errMsg) {
        this.$msg('修改成功', 'success')
        this.getList()
        this.editDialog = false
      } else {
        this.$msg(res.errMsg, 'error')
      }
    },
    async toOperate(type, row) {
      const url = 'groupmeal.Corp/deleteEmployee'
      const params = { tgcId: this.tgcId, tgeId: row.tgeId }
      const res = await this.$http(url, params)
      if (!res.errMsg) {
        this.$msg('删除成功', 'success')
        this.getList()
      } else {
        this.$msg(res.errMsg, 'error')
      }
    },
    async handleExport() {
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const params = {
        tgcId: this.tgcId,
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal
      }
      const res = await this.$http('groupmeal.Corp/queryEmployeeList', params)
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
      })
    },
    downLoadTemplate() {
      const col = [
        { label: '序号', type: 'index', width: '80' },
        { label: '姓名', prop: 'tgeName' },
        { label: '微信绑定手机号', prop: 'tgePhone' }
      ]
      exportExcel({
        columns: col,
        filename: '员工导入模板',
        data: []
      })
    },
    choiceUpload() {
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
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname])// 生成json表格内容
          const outputs = ws.map(item => ({
            tgeName: item['姓名'],
            tgePhone: item['微信绑定手机号'],
            isEdit: false
          }))
          this.empInfo = this.empInfo.concat(outputs)
          this.$refs.upload.value = ''
          this.$nt(() => {
            this.$refs.empTable.doLayout()
          })
        } catch (e) {
          this.$message({ type: 'error', message: e })
        }
      }
      fileReader.readAsBinaryString(files[0])
    }
  }
}
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.small-input {
  width: 300px;
}
.tiny-input {
  margin: 0 8px;
  width: 100px;
}
.food-cover {
  max-height: 100%;
  max-width: 100%;
}

.section-item {
  margin: 20px 0;
  display: flex;
  align-items: center;
  min-height: 30px;
  flex-wrap: wrap;
}
.detail-footer {
  text-align: center;
}

.vertical-top {
  vertical-align: top;
}

.section-label {
  display: inline-block;
  min-width: 50px;
  text-align: left;
}
.label-1 {
  width: 100px;
  margin-right: 12px;
  text-align: right;
}

.detail-section {
  margin: 22px 0 22px 0;
}

.flex-grow-1 {
  flex-basis: 25%;
}

.card-image-box {
  margin: 0 0 8px 12px;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 3px;
  display: inline-block;

  .certificate-img {
    max-width: 320px;
    max-height: 160px;
  }
}

.mini-input {
  width: 240px;
}

.form-item {
  text-align: center;
  margin: 12px;
  &__label {
    display: inline-block;
    width: 120px;
  }
}

.qrcode-image {
  max-width: 200px;
  max-height: 200px;
}

.phone-image {
  margin: 0 8px;
  max-width: 200px;
  max-height: 200px;
}
.count-label {
  margin-left: 20px;
}
.display-flex {
  padding: 0;
}
.download {
  margin-left: 20px;
  color: #409eff;
  cursor: pointer;
}
</style>
