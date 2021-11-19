<template>
  <div class="page-container">
    <div style="margin-top: 20px;">
      <!-- <ButtonTabs v-model="activeTab" :tabs="tabs" /> -->
    </div>
    <div v-if="activeTab == 0">
      <ReHeating></ReHeating>
    </div>
    <div v-if="activeTab == 1">
      <ReHeatingOld></ReHeatingOld>
    </div>
  </div>
</template>

<script>
import ButtonTabs from '@/components/ButtonTabs.vue';
import ReHeating from './components/reheating.vue';
import ReHeatingOld from './components/reheating-old.vue';
export default {
  name: 'stock_food-enter',
  components: {
    ButtonTabs,
    ReHeating,
    ReHeatingOld,
  },
  data() {
    return {
      activeTab: 0,
      tabs: [
        {
          label: '复热单',
          value: '0'
        },
        {
          label: '复热单（旧）',
          value: '1'
        },
      ],
    }
  },
  created() {

  },
  methods: {

  }
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
