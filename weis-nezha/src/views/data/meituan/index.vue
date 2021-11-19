<template>
  <div class="page-container">
    <div style="margin-top: 20px;">
      <ButtonTabs v-model="activeTab" :tabs="tabs" @change="changes" />
    </div>
    <div v-show="activeTab == 0">
      <Store></Store>
    </div>
    <div v-show="activeTab == 1">
      <Goods></Goods>
    </div>
    <div v-if="activeTab == 2">
      <SingleGoods></SingleGoods>
    </div>
  </div>
</template>

<script>
import ButtonTabs from '@/components/ButtonTabs.vue';
import Store from './components/store.vue';
import Goods from './components/goods.vue';
import SingleGoods from './components/single-goods.vue';
export default {
  name: 'scm_serving-meals_distribution-list',
  components: {
    ButtonTabs,
    Store,
    Goods,
    SingleGoods
  },
  data() {
    return {
      activeTab: 0,
      tabs: [
        {
          label: '美团门店数据',
          value: '0'
        },
        {
          label: '美团商品数据',
          value: '1'
        },
        {
          label: '美团单品数据',
          value: '2'
        }
      ],
    }
  },
  created() {

  },
  methods: {
    changes(e) {
      this.activeTab = e;
    }
  }
}
</script>

<style>
</style>
