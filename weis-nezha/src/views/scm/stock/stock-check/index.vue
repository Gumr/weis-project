<template>
  <div class="page-container">
    <div style="margin-top: 20px;">
      <ButtonTabs v-model="activeTab" :tabs="tabs" />
    </div>
    <div v-if="activeTab == 0">
      <BusinessCheck></BusinessCheck>
    </div>
    <div v-if="activeTab == 1">
      <CloseCheck></CloseCheck>
    </div>
    <div v-if="activeTab == 2">
      <StoreCheck></StoreCheck>
    </div>
  </div>
</template>

<script>
import ButtonTabs from '@/components/ButtonTabs.vue';
import CloseCheck from './components/closeCheck.vue';
import BusinessCheck from './components/businessCheck.vue';
import StoreCheck from './components/storeCheck.vue';
export default {
  name: 'stock_food-enter',
  components: {
    ButtonTabs,
    CloseCheck,
    BusinessCheck,
    StoreCheck
  },
  data() {
    return {
      activeTab: 0,
      tabs: [
        {
          label: '门店营业盘点',
          value: '0'
        },
        {
          label: '门店打烊盘点',
          value: '1'
        },
        {
          label: '门店盘点统计',
          value: '2'
        },
      ],
    }
  },
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.txt {
  width: 300px;
}
.food-cover {
  max-height: 100%;
  max-width: 100%;
}
</style>
