<template>
  <div>
    <div class="row">
      <div class="item" v-for="(item, index) in channelCode" :key="index">
        <img class="img" :src="item.channelUrl" />
        <div class="txt">{{item.channelName}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        channelCode: [],
      }
    },
    async created() {
      this.tgcId = this.$route.query.id;
      if (this.tgcId) {
        this.getInfo();
      }
    },
    methods: {
      async getInfo() {
        const res = await this.$http('groupmeal.Corp/queryCorpById', { tgcId: this.tgcId });
        this.channelCode = res.obj.channelCode;
      },
    }
  }
</script>

<style lang="scss" scoped>
  .row {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  .item {
    width: 300px;
    height: 350px;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    margin-top: 30px;
    margin-right: 30px;
  }
  .img {
    width: 300px;
    height: 300px;
  }
  .txt {
    width: 300px;
    height: 50px;
    text-align: center;
    line-height: 50px;
  }
</style>
