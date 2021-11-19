<template>
  <div class="page-container">
    <div style="margin-top: 20px;">
      <ButtonTabs v-model="activeTab" :tabs="tabs" />
    </div>
    <div v-if="activeTab == 0">
      <StockList></StockList>
    </div>
    <div v-if="activeTab == 1">
      <StockDeploy></StockDeploy>
    </div>
  </div>
</template>

<script>
import ButtonTabs from '@/components/ButtonTabs.vue';
import StockList from './components/stock-list.vue';
import StockDeploy from './components/stock-deploy.vue';
export default {
  name: 'stock_stock-list',
  components: {
    ButtonTabs,
    StockList,
    StockDeploy,
  },
  data() {
    return {
      activeTab: 0,
      tabs: [
        {
          label: '库存列表',
          value: '0'
        },
        {
          label: '门店库存调配',
          value: '1'
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
