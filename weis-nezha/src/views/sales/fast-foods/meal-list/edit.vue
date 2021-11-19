<template>
  <div class="page-container">
    <section>
      <div class="section-item">
        <span class="section-label label-1">套餐名称：</span>
        <el-input v-model="tgcName" clearable class="medium-input"></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">供餐端口：</span>
        <el-select v-model="tgcType" class="medium-input" placeholder="请选择">
          <el-option label="企业" value="01"></el-option>
          <el-option label="美团" value="02"></el-option>
        </el-select>
      </div>
      <div v-if="tgcType !== '02'" class="section-item">
        <span class="section-label label-1">套餐类型：</span>
        <BaseSelect
          v-model="tgcCategoryId"
          class="medium-input"
          :options="setMealCategoryOptions"
          :props="{ label: 'tgccName', value: 'tgccId' }"
        ></BaseSelect>
      </div>
      <div class="section-item">
        <span class="section-label label-1">套餐菜品：</span>
        <el-button type="primary" @click="showDialog">选择菜品</el-button>
      </div>
      <div class="section-item">
        <span class="section-label label-1"></span>
        <BasePageTable height="300" :data="tableData" :visible="false" border>
          <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
          <el-table-column label="操作" align="center" width="120px">
            <template #default="{ row }" class="action-cell">
              <span class="brand-color cursor-pointer action-label" @click="remove(row)">移除</span>
            </template>
          </el-table-column>
        </BasePageTable>
      </div>
      <div v-if="tableData.length" class="section-item">
        <span class="section-label label-1"></span>
        <span>合计：菜品数量 * {{ dishTotal }} ，菜品总价：{{ priceTotal }} 元</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">套餐价格：</span>
        <el-input v-model="tgcAmount" clearable class="medium-input" @blur="checkText2"></el-input>元
      </div>
      <div class="section-item">
        <span class="section-label label-1">套餐图片（选填）：</span>
        <UploadImage v-model="tgcImgUrl" />
      </div>
      <div class="section-item">
        <span class="section-label label-1">适用人群：</span>
        <el-checkbox-group v-model="tgcCrowd">
          <el-checkbox
            v-for="it in userTargetOptions"
            :key="it.value"
            :label="it.value"
          >{{ it.label }}</el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="section-item">
        <span class="section-label label-1">售卖时间：</span>
        <el-date-picker
          v-model="tgcSaleTime"
          type="daterange"
          start-placeholder="售卖开始日期"
          end-placeholder="售卖结束日期"
        ></el-date-picker>
      </div>
      <div class="section-item">
        <span class="section-label label-1">编码（选填）：</span>
        <el-input v-model="tgcCode" placeholder="输入编码" style="width: 200px"></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">营养小贴士（选填）</span>
        <el-input
          v-model="tgcRemark"
          style="width: 400px"
          type="textarea"
          :rows="4"
          placeholder="营养小贴士"
        />
      </div>
    </section>
    <footer class="btn-footer">
      <el-button type="primary" :loading="loading" @click="submit">确认</el-button>
      <el-button @click="cancel">取消</el-button>
    </footer>
    <ConfirmDialog
      v-model="hasDialog"
      title="选择菜品"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <BasePageTable
        ref="dishTable"
        height="600"
        empty-text="当前没有可关联菜品，请先到erp系统新建一款菜品"
        :visible="false"
        :data="dishData"
        border
      >
        <el-table-column v-for="col in dishTable" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="数量" align="center">
          <template #default="{ row }" class="action-cell">
            <el-input v-model="row.tfsNum" @keydown="catchNonNumberKeydown" @blur="checkText(row)"></el-input>
          </template>
        </el-table-column>
      </BasePageTable>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { catchNonIntKeydown, catchNonNumberKeydown } from '@/utils/event-catcher'
import UploadImage from '@/components/UploadImage'
import { getTargetUserList, getSetMealTypeOptions } from '@/utils/data-getter'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    BasePageTable,
    UploadImage,
    ConfirmDialog
  },
  data() {
    return {
      loading: false,
      hasDialog: false,
      tableData: [],
      dishTotal: 0,
      priceTotal: 0,
      tgcSaleTime: [],
      tgcCode: '',
      tgcCategoryId: '',
      setMealCategoryOptions: [],
      tableCol: [
        { label: '序号', type: 'index', width: '80' },
        { label: '菜品编码', prop: 'tfsCid', width: '120' },
        { label: '菜品名称', prop: 'tfsSkuname', width: '120' },
        { label: '菜品单价', prop: 'tfsPrice', width: '120' },
        { label: '数量', prop: 'tfsNum', width: '120' }
      ],
      dishData: [],
      dishTable: [
        { label: '序号', type: 'index' },
        { label: '菜品编码', prop: 'tfsCid' },
        { label: '菜品名称', prop: 'tfsSkuname' },
        { label: '菜品单价', prop: 'tfsPrice' }
      ],
      tgcId: '',
      tgcName: '',
      tgcType: '',
      tgcAmount: '',
      tgcImgUrl: '', // 套餐图片 <br>
      tgcCrowd: [], // 适用人群 <br>
      tgcRemark: '', // 营养小贴士 <br>
      userTargetOptions: [],
      skuInfo: []
    }
  },
  async created() {
    const { tgcId, corpId } = this.$route.query
    this.tgcId = tgcId
    this.corpId = corpId

    getTargetUserList()
      .then((data) => {
        this.userTargetOptions = data
      })

    try {
      if (tgcId && status !== 'create') {
        await this.getInfo()
      }
    } finally {
      this.queryComboCategoryList()
    }
  },
  methods: {
    catchNonNumberKeydown,
    catchNonIntKeydown,
    queryComboCategoryList() {
      getSetMealTypeOptions()
        .then(data => {
          this.setMealCategoryOptions = data
        })
    },
    checkText(row) {
      row.tfsNum = isNaN(row.tfsNum) ? 0 : row.tfsNum
      row.tfsNum = Number(Math.abs(row.tfsNum)).toFixed(0)
      row.tfsNum = row.tfsNum == 0 ? '' : row.tfsNum
    },
    checkText2() {
      this.tgcAmount = isNaN(this.tgcAmount) ? 0 : this.tgcAmount
      this.tgcAmount = Number(Math.abs(this.tgcAmount)).toFixed(2)
    },
    showDialog() {
      this.hasDialog = true
      this.getList()
    },
    computedPrice() {
      this.dishTotal = 0
      this.priceTotal = 0
      this.tableData.forEach((item) => {
        this.dishTotal += Number(item.tfsNum)
        this.priceTotal += Number(item.tfsNum) * Number(item.tfsPrice)
      })
      this.priceTotal = this.priceTotal.toFixed(2)
    },
    async getInfo() {
      const res = await this.$http('groupmeal.Combo/queryComboById', { tgcId: this.tgcId })
      this.tgcName = res.obj.tgcName
      this.tgcType = res.obj.tgcType
      this.tgcAmount = res.obj.tgcAmount
      this.tableData = res.obj.skuInfo
      this.tgcImgUrl = Array.isArray(res.obj.tgcImgUrl)
        ? (res.obj.tgcImgUrl[0] && res.obj.tgcImgUrl[0].imgUrl)
        : res.obj.tgcImgUrl
      this.tgcCrowd = res.obj.tgcCrowd || []
      this.tgcRemark = res.obj.tgcRemark
      this.tgcCategoryId = res.obj.tgcCategoryId
      const { tgcSaleTime } = res.obj
      this.tgcSaleTime = tgcSaleTime ? tgcSaleTime.split('-').map(d => d && new Date(this.$day(d).valueOf())) : ''
      this.tgcCode = res.obj.tgcCode
      this.computedPrice()
    },
    async getList() {
      const res = await this.$http('groupmeal.Combo/getSkuList', {})
      if (!res.err) {
        this.dishData = res.obj
        this.dishData.forEach((item) => {
          item.tfsNum = ''
        })
        this.tableData.forEach((item) => {
          this.dishData.forEach((child) => {
            if (item.tfsCid == child.tfsCid) {
              child.tfsNum = item.tfsNum
            }
          })
        })
        this.$nt(() => {
          this.$refs.dishTable.doLayout()
        })
      }
    },
    onconfirm() {
      const data = this.dishData.filter((item) => item.tfsNum && item.tfsNum > 0)
      if (!data.length) {
        this.$msg('请输入菜品数量', 'error')
        return
      }
      this.tableData = []
      this.tableData = data
      this.computedPrice()
      this.hasDialog = false
    },
    remove(row) {
      this.tableData = this.tableData.filter((item) => item.tfsCid != row.tfsCid)
      this.computedPrice()
    },
    cancel() {
      this.$confirm('确认取消？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        this.$closeRoute()
      })
    },
    submit() {
      if (!this.tgcName) {
        this.$msg('请输入套餐名称', 'error')
        return
      }
      if (!this.tgcType) {
        this.$msg('请输入供餐端口', 'error')
        return
      }
      if (!this.tgcAmount) {
        this.$msg('请输入套餐价格', 'error')
        return
      }
      if (!this.tableData.length) {
        this.$msg('请选择菜品', 'error')
        return
      }
      if (!this.tgcAmount || this.tgcAmount == 0) {
        this.$msg('套餐价格不为0', 'error')
        return
      }
      if (!this.tgcCrowd.length) {
        this.$msg('请选择适用人群', 'error')
        return
      }
      if (this.tgcType === '01' && !this.tgcCategoryId) {
        this.$msg('请选择套餐类型', 'error')
        return
      }
      this.$confirm('确认以上信息并提交？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        this.handleSubmit()
      })
    },
    async handleSubmit() {
      this.loading = true
      const params = {
        tgcCategoryId: this.tgcCategoryId,
        tgcName: this.tgcName,
        tgcAmount: this.tgcAmount,
        tgcType: this.tgcType,
        tgcImgUrl: this.tgcImgUrl ? [{ imgUrl: this.tgcImgUrl }] : [],
        tgcCrowd: this.tgcCrowd,
        tgcRemark: this.tgcRemark,
        tgcSaleTime: (this.tgcSaleTime && this.tgcSaleTime.filter(Boolean).length > 0)
          ? this.tgcSaleTime.map(d => this.$day(d).format('YYYYMMDD')).join('-')
          : '',
        tgcCode: this.tgcCode,
        skuInfo: this.tableData
      }

      if (this.tgcId) {
        params.tgcId = this.tgcId
      }
      if (this.corpId) {
        params.corpId = this.corpId
        params.tgcType = '03'
      }
      try {
        const res = await this.$http('groupmeal.Combo/updateCombo', params)
        if (!res.errMsg) {
          this.$msg('创建成功', 'success')
          this.$closeRoute()
        } else {
          this.$msg(res.errMsg, 'error')
        }
      } finally {
        this.loading = false
      }
    }
  }
})
</script>

<style lang="less" scoped>
.label-1 {
  width: 100px;
  margin-right: 12px;
  text-align: right;
}
</style>
