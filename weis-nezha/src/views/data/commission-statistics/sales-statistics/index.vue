<template>
  <div class="page-container">
    <div style="margin-top: 20px;">
      <ButtonTabs v-model="activeTab" :tabs="tabs" />
    </div>
    <div v-if="activeTab == 0">
      <DirectManager></DirectManager>
    </div>
    <div v-if="activeTab == 1">
      <ChannelManager></ChannelManager>
    </div>
  </div>
</template>

<script>
import ButtonTabs from '@/components/ButtonTabs.vue';
import DirectManager from './components/directManager.vue';
import ChannelManager from './components/channelManager.vue';
export default {
  name: 'sales-statistics_index',
  components: {
    ButtonTabs,
    DirectManager,
    ChannelManager,
  },
  created() {

  },
  data() {
    return {
      activeTab: 0,
      tabs: [
        {
          label: '直销市场',
          value: '0'
        },
        {
          label: '渠道市场',
          value: '1'
        }
      ],
    }
  },
  created() {
    this.getInfo();
  },
  methods: {
    async getInfo() {
      const res = await this.$http('Channel/checkCounselorAuth', {});
      if (!res.errMsg) {
        if (!res.obj.result) {
          this.activeTab = 0;
          this.tabs = [
            { label: '直销市场', value: '0' },
            { label: '渠道市场', value: '1' }
          ];
        } else {
          this.activeTab = 1;
          this.tabs = [
            { label: '渠道市场', value: '1' }
          ]
        }
      } else {
        this.$msg(res.errMsg, 'error');
      }
    }
  },
};

</script>
