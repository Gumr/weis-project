<template>
  <div class="page-container">
    <div style="margin: 14px 0">
      <ButtonTabs :tabs="tabs" v-model="activeTab"></ButtonTabs>
    </div>
    <div v-if="activeTab === 1">
      <BaseInfo></BaseInfo>
    </div>
    <div v-if="activeTab === 2">
      <Dish></Dish>
    </div>
    <div v-if="activeTab === 3">
      <BaseUser></BaseUser>
    </div>
    <div v-if="activeTab === 4">
      <Billboard></Billboard>
    </div>
  </div>
</template>

<script>
  import ButtonTabs from '@/components/ButtonTabs.vue';
  import BaseInfo from './components/baseInfo.vue';
  import Dish from './components/dish.vue';
  import BaseUser from './components/baseUser.vue';
  import Billboard from './components/billboard.vue';
  export default {
    name: 'om_crowdfund_crowdfund-list_detail',
    components: {
      ButtonTabs,
      BaseInfo,
      Dish,
      BaseUser,
      Billboard
    },
    data() {
      return {
        activeTab: 1,
        tabs: [
          {
            label: '基本详情',
            value: 1
          },
          {
            label: '参与菜品',
            value: 2
          },
          {
            label: '参与人员',
            value: 3
          },
          {
            label: '本期榜单',
            value: 4
          }
        ],
      }
    },
    created() {
      if(this.$route.query.tabs) {
        this.activeTab = this.$route.query.tabs
      }
    },
    methods: {

    }
  }
</script>

<style>
</style>
