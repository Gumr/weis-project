<template>
  <div class="page-container">
    <div style="margin-top: 20px;">
      <ButtonTabs v-model="activeTab" :tabs="tabs" />
    </div>
    <div v-if="activeTab == 0">
      <Channel></Channel>
    </div>
    <div v-if="activeTab == 1">
      <Partner></Partner>
    </div>
  </div>
</template>

<script>
import ButtonTabs from '@/components/ButtonTabs.vue';
import Channel from './components/channel-commission.vue';
import Partner from './components/lower-partner.vue';
export default {
  name: 'group-meal_partner-commission_detail',
  components: {
    ButtonTabs,
    Channel,
    Partner,
  },
  data() {
    return {
      activeTab: 0,
      type: '',
      tabs: [
        {
          label: '渠道提成',
          value: '0'
        },
        {
          label: '下级合伙人提成',
          value: '1'
        },
      ],
    }
  },
  created() {
    this.type = this.$route.query.type;
    if (this.type == '20') {
      this.tabs = [
        {
          label: '渠道提成',
          value: '0'
        }
      ]
    }
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
