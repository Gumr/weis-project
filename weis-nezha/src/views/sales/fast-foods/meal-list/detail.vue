<template>
  <div class="page-container">
    <section>
      <div class="section-item">
        <span class="section-label label-1">套餐名称：</span>
        <span>{{ tgcName }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">供餐端口：</span>
        <span>{{ tgcTypeDesc }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">套餐类型：</span>
        <span>{{ tgcCategory }}</span>
      </div>

      <div class="section-item">
        <span class="section-label label-1">套餐菜品：</span>
        <BasePageTable height="300" :data="tableData" :visible="false" border>
          <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        </BasePageTable>
      </div>
      <div v-if="tableData.length" class="section-item">
        <span class="section-label label-1"></span>
        <span>合计：菜品数量 * {{ dishTotal }} ，菜品总价：{{ priceTotal }} 元</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">套餐价格：</span>
        <span>{{ tgcAmount }}</span> 元
      </div>
      <div v-if="tgcImgUrl" class="section-item">
        <span class="section-label label-1">套餐图片（选填）：</span>
        <el-image :src="tgcImgUrl" style="width: 400px; height: 400px;" fit="contain" />
      </div>
      <div class="section-item">
        <span class="section-label label-1">适用人群：</span>
        <el-checkbox-group v-model="tgcCrowd" disabled>
          <el-checkbox
            v-for="it in userTargetOptions"
            :key="it.value"
            :label="it.value"
          >{{ it.label }}</el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="section-item">
        <span class="section-label label-1">售卖时间：</span>
        <span>{{ tgcSaleTime }}</span>
      </div>
      <div v-if="tgcCode" class="section-item">
        <span class="section-label label-1">编码：</span>
        <span>{{ tgcCode }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">营养小贴士（选填）</span>
        <span>{{ tgcRemark }}</span>
      </div>
    </section>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue'
import { getTargetUserList } from '@/utils/data-getter'
export default {
  components: {
    BasePageTable
  },
  data() {
    return {
      tableData: [],
      dishTotal: 0,
      priceTotal: 0,
      tgcCategory: '',
      tableCol: [
        { label: '序号', type: 'index', width: '80' },
        { label: '菜品编码', prop: 'tfsCid', width: '120' },
        { label: '菜品名称', prop: 'tfsSkuname', width: '120' },
        { label: '菜品单价', prop: 'tfsPrice', width: '120' },
        { label: '数量', prop: 'tfsNum', width: '120' }
      ],
      tgcId: '',
      tgcName: '',
      tgcTypeDesc: '',
      tgcAmount: '',
      tgcSaleTime: '',
      tgcCode: '',
      tgcImgUrl: '', // 套餐图片 <br>
      tgcCrowd: [], // 适用人群 <br>
      tgcRemark: '', // 营养小贴士 <br>
      skuInfo: [],
      userTargetOptions: []
    }
  },
  created() {
    this.tgcId = this.$route.query.tgcId
    getTargetUserList()
      .then(data => {
        this.userTargetOptions = data
      })
    if (this.tgcId) {
      this.getInfo()
    }
  },
  methods: {
    async getInfo() {
      const res = await this.$http('groupmeal.Combo/queryComboById', { tgcId: this.tgcId })
      this.tgcName = res.obj.tgcName
      this.tgcTypeDesc = res.obj.tgcTypeDesc
      this.tgcAmount = res.obj.tgcAmount
      this.tableData = res.obj.skuInfo
      this.tgcImgUrl = Array.isArray(res.obj.tgcImgUrl)
        ? (res.obj.tgcImgUrl[0] && res.obj.tgcImgUrl[0].imgUrl)
        : res.obj.tgcImgUrl
      this.tgcCrowd = res.obj.tgcCrowd || []
      this.tgcCategory = res.obj.tgcCategory
      this.tgcRemark = res.obj.tgcRemark
      this.dishTotal = 0
      this.priceTotal = 0
      this.tgcSaleTime = res.obj.tgcSaleTime.split('-').map((d) => this.$day(d).format('YYYY-MM-DD')).join('-')
      this.tgcCode = res.obj.tgcCode
      this.tableData.forEach(item => {
        this.dishTotal += Number(item.tfsNum)
        this.priceTotal += (Number(item.tfsNum) * Number(item.tfsPrice))
      })
      this.priceTotal = this.priceTotal.toFixed(2)
    }
  }
}
</script>

<style lang="less" scoped>
.label-1 {
  width: 110px;
  margin-right: 12px;
  text-align: right;
}
</style>
