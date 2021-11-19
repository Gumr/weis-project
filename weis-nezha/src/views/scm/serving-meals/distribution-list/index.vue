<template>
  <div class="page-container">
    <div style="margin-top: 20px">
      <ButtonTabs v-model="activeTab" :tabs="tabs" @change="changes" />
    </div>
    <div v-show="activeTab == 0">
      <Distribution />
    </div>
    <div v-show="activeTab == 1">
      <Take />
    </div>
    <div v-if="activeTab == 2">
      <CorpDispatching />
    </div>
    <div v-if="activeTab == 3">
      <mtOrder />
    </div>
    <div v-if="activeTab == 4">
      <eleOrder />
    </div>
  </div>
</template>

<script>
import ButtonTabs from '@/components/ButtonTabs.vue'
import Distribution from './components/distribution.vue'
import Take from './components/take.vue'
import CorpDispatching from './components/corpDispatching.vue'
import mtOrder from '@/views/meituan/order-list/index.vue'
import eleOrder from '@/views/ele/order-list/index.vue'
export default {
  name: 'scm_serving-meals_distribution-list',
  components: {
    ButtonTabs,
    Distribution,
    Take,
    CorpDispatching,
    mtOrder,
    eleOrder,
  },
  data() {
    return {
      activeTab: 0,
      tabs: [
        {
          label: '配送单',
          value: '0',
        },
        {
          label: '自取单',
          value: '1',
        },
        {
          label: '企业专送单',
          value: '2',
        },
        {
          label: '美团订单',
          value: '3',
        },
        {
          label: '饿了么订单',
          value: '4',
        },
      ],
    }
  },
  created() {},
  methods: {
    changes(e) {
      this.activeTab = e
    },
  },
}
</script>

<style>
</style>
