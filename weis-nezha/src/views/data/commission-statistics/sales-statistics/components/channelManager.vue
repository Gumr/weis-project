<template>
  <div>
    <div style="margin-top: 20px;">
      <ButtonTabs size="small"  v-model="activeTab" :tabs="tabs" />
    </div>
    <div v-if="activeTab == 0">
      <ChannelSales></ChannelSales>
    </div>
    <div v-if="activeTab == 1">
      <ChannelCommission></ChannelCommission>
    </div>
  </div>
</template>

<script>
import ButtonTabs from '@/components/ButtonTabs.vue';
import ChannelSales from './channelSales.vue';
import ChannelCommission from './channelCommission.vue';

export default {
  components: {
    ButtonTabs,
    ChannelSales,
    ChannelCommission
  },
  data() {
    return {
      activeTab: 0,
      tabs: [
        {
          label: '渠道市场营业额',
          value: '0'
        },
        {
          label: '渠道兼职客户经理佣金',
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
