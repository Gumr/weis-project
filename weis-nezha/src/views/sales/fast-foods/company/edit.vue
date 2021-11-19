<template>
  <div class="page-container">
    <div v-show="tgcId" style="margin: 14px 0">
      <ButtonTabs v-model="activeTab" :tabs="tabs"></ButtonTabs>
    </div>
    <div v-if="activeTab === 1">
      <CompanyInfo @typeChange="typeChange"></CompanyInfo>
    </div>
    <div v-if="activeTab === 2">
      <Organize></Organize>
    </div>
    <div v-if="activeTab === 3">
      <Discount></Discount>
    </div>
    <div v-if="activeTab === 4">
      <CompanyMeal></CompanyMeal>
    </div>
    <div v-if="activeTab === 5">
      <Staff></Staff>
    </div>
    <div v-if="activeTab === 6">
      <Address></Address>
    </div>
    <div v-if="activeTab === 7">
      <QRCode></QRCode>
    </div>
    <div v-if="activeTab === 8">
      <ChildUser></ChildUser>
    </div>
    <div v-if="activeTab === 9">
      <CompanyOrder></CompanyOrder>
    </div>
    <div v-if="activeTab === 10">
      <SignOrder></SignOrder>
    </div>
  </div>
</template>

<script>
import ButtonTabs from '@/components/ButtonTabs.vue'
import CompanyInfo from './components/companyInfo.vue'
import Organize from './components/organize.vue'
import Discount from './components/discount.vue'
import CompanyMeal from './components/companyMeal.vue'
import Staff from './components/staff.vue'
import Address from './components/address.vue'
import QRCode from './components/QRCode.vue'
import ChildUser from './components/ChildUser'
import CompanyOrder from './components/CompanyOrder.vue'
import SignOrder from './components/SignOrder.vue'
export default {
  name: 'sales_fast-foods_company_edit',
  components: {
    ButtonTabs,
    CompanyInfo,
    Organize,
    Discount,
    CompanyMeal,
    CompanyOrder,
    Staff,
    Address,
    ChildUser,
    SignOrder,
    QRCode
  },
  data() {
    return {
      tgcId: '',
      tgcType:'',
      activeTab: 1,
      tabs: [
      ]
    }
  },
  created() {
    if (this.$route.query.id) {
      this.tgcId = this.$route.query.id,
      this.tgcType= this.$route.query.tgcType
    }
  },
  methods: {
    typeChange(type) {
      if (!type) return
      if (type == '00') {
        this.tabs = [
          { label: '基本信息', value: 1 },
          { label: '优惠', value: 3 },
          { label: '成员', value: 5 },
          { label: '地址', value: 6 },
          { label: '企业套餐', value: 4 },
          { label: '订单', value: 9 },
          { label: '签收单', value: 10 },
          // { label: '组织', value: 2 },
          { label: '子账号', value: 8 }
          // { label: '企业码', value: 7 },
        ]
      } else {
        this.tabs = [
          { label: '基本信息', value: 1 },
          { label: '优惠', value: 3 },
          { label: '企业套餐', value: 4 },
          { label: '地址管理', value: 6 }
          // { label: '子账号', value: 8 },
          // { label: '企业码', value: 7 },
        ]
      }
    }
  }
}
</script>

<style>
</style>
