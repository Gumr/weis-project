<template>
  <div class="page-container">
    <div style="margin: 14px 0">
      <ButtonTabs v-model="activeTab" :tabs="tabs" />
    </div>
    <div v-show="activeTab === 1">
      <BasicInfo />
    </div>
    <div v-show="activeTab === 2">
      <RechargeList />
    </div>
    <div v-show="activeTab === 3">
      <ConsumerList />
    </div>
    <div v-show="activeTab === 4">
      <RechargeCard />
    </div>
    <div v-show="activeTab === 5">
      <Coupon />
    </div>
    <div v-show="activeTab === 6">
      <Activity />
    </div>
    <div v-show="activeTab === 7">
      <JoinActivity />
    </div>
    <div v-show="activeTab === 8">
      <LoseWeight />
    </div>
    <div v-show="activeTab === 9">
      <Discounts />
    </div>
  </div>
</template>

<script>
import ButtonTabs from '@/components/ButtonTabs.vue';
import BasicInfo from './components/basic-info.vue';
import RechargeList from './components/recharge-list.vue';
import ConsumerList from './components/consumer-list.vue';
import RechargeCard from './components/recharge-card.vue';
import Coupon from './components/coupon.vue';
import Activity from './components/activity.vue';
import JoinActivity from './components/join-activity.vue';
import LoseWeight from './components/lose-weight.vue';
import Discounts from './components/discounts.vue'

export default {
  components: {
    ButtonTabs,
    BasicInfo,
    RechargeList,
    ConsumerList,
    RechargeCard,
    Coupon,
    Activity,
    JoinActivity,
    LoseWeight,
    Discounts
  },
  data() {
    return {
      activeTab: 1,
      tabs: [
        {
          label: '基础信息',
          value: 1
        },
        {
          label: '充值记录',
          value: 2
        },
        {
          label: '消费记录',
          value: 3
        },
        {
          label: '充值卡',
          value: 4
        },
        {
          label: '优惠券',
          value: 5
        },
        {
          label: '访问记录',
          value: 6
        },

        {
          label: '参与活动',
          value: 7
        },
        {
          label: '减肥营',
          value: 8
        },
        {
          label: '折扣',
          value: 9
        }
      ],
    };
  },
  methods: {

  }
};
</script>

<style>
</style>
