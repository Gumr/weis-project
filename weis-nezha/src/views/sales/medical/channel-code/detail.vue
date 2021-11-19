<template>
  <div class="page-container">
    <ReturnButton back />
    <div class="section-item">
      <span class="section-label label-1">渠道码：</span>
      <span>{{currentTag.tprcPageId}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">
        <span style="color:red">*</span>渠道码名称：
      </span>
      <span>{{currentTag.tprcName}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">关联客户经理：</span>
      <span>{{currentTag.tcaName}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">当前拓展人数：</span>
      <span>{{currentTag.customerCount}}</span>
    </div>

    <div class="section-item">
      <span class="section-label label-1">当前总业绩：</span>
      <span>{{currentTag.totalPerfor}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">当前点餐业绩：</span>
      <span>{{currentTag.consumePerfor}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">当前充值业绩：</span>
      <span>{{currentTag.rechargePerfor}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">渠道码：</span>
      <div class="qrlist">
        <div class="qrcode">
          <img :src="currentTag.qrCodeUrl" />
          <span>渠道码（{{currentTag.qrCode}}）</span>
        </div>
      </div>
    </div>
    <div class="section-item">
      <HelperTable :data="currentTag.helperList" />
    </div>
  </div>
</template>

<script>
import HelperTable from '../../components/HelperTable'
import ReturnButton from '@/components/ReturnButton.vue';

export default {
  name: 'goods_dish-unit',
  components: {
    ReturnButton,
    HelperTable
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  created() {
    this.tprcId = this.$route.query.tprcId || '';
    this.getInfo();
  },
  data() {
    return {
      tprcId: '',
      height: window.innerHeight - 330,
      currentTag:　{}
    };
  },
  methods: {
    async getInfo() {
      const res = await this.$http('partner.Channel/queryChannelRepresentInfo', {tprcId: this.tprcId});
      this.currentTag = res.obj;
    }
  }
};
</script>

<style lang="less" scoped>
.page-container {
  padding-top: 20px;
}
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.action-label {
  margin-right: 10px;
}
.mini-input {
  width: 100px;
  margin-right: 20px;
}
.medium-picker {
  width: 300px;
}
.medium-input {
  width: 250px;
  margin-right: 20px;
}
.max-input {
  width: 350px;
}
.medium-select {
  width: 70px;
  margin-left: 10px;
}
.rule {
  padding-left: 150px;
}
.tiny-input {
  width: 150px;
  margin: 0 20px;
}

.small-input {
  margin-left: 8px;
  width: 120px;
}
.small-select {
  margin-left: 8px;
  width: 200px;
}

.section-label {
  display: inline-block;
}

.section-item {
  margin: 20px 0;
  display: flex;
  align-items: center;
  min-height: 30px;
  flex-wrap: wrap;
  button {
    height: 30px;
    line-height: 5px;
  }
  .qrlist {
    width: 700px;
    display: flex;
    flex-wrap: wrap;
  }
  .qrcode {
    width: 200px;
    height: 250px;
    display: flex;
    flex-wrap: wrap;
    margin-right: 10px;
    img {
      width: 200px;
      height: 200px;
    }
    span {
      width: 100%;
      text-align: center;
    }
  }
}

.btn-footer {
  text-align: center;
}
.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}

.label-3,
h3 {
  margin-left: 22px;
}
</style>
