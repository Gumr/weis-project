<template>
  <div>
    <div style="margin-top: 20px;">
      <ButtonTabs size="small"  v-model="activeTab" :tabs="tabs" />
    </div>
    <div v-if="activeTab == 0">
      <DirectSales></DirectSales>
    </div>
    <div v-if="activeTab == 1">
      <DirectCommission></DirectCommission>
    </div>
  </div>
</template>

<script>
import ButtonTabs from '@/components/ButtonTabs.vue';
import DirectSales from './directSales.vue';
import DirectCommission from './directCommission.vue';

export default {
  components: {
    ButtonTabs,
    DirectSales,
    DirectCommission
  },
  data() {
    return {
      activeTab: 0,
      tabs: [
        {
          label: '直销市场营业额',
          value: '0'
        },
        {
          label: '全职客户经理佣金',
          value: '1'
        }
      ],
    }
  },
  methods: {

  },
  created() {

  }
};

</script>

<style>
</style>
