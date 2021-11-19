<template>
  <div class="page-container">
    <section>
      <h3>基础信息</h3>
      <div>
        <div class="display-flex">
          <p>
            <span style="vertical-align: top;">规则名称：</span>
            <span>{{infolist.name}}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span style="vertical-align: top;">规则描述：</span>
            <span>{{infolist.intro}}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>规则配置：</span>
          </p>
          <p>
            <span style="width: 1200px;display: flex;" v-for="(item, index) in infolist.rule" :key="index">
              <span style="width: 250px;display: block;">
                <span style="width: 50px;">{{item.startAmount}}</span> &lt;= 支付金额 &lt; <span style="width: 50px;margin-right: 30px;">{{item.endAmount}}</span>
              </span>
              <span>赠送 {{item.discount}} %</span><br>
            </span>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>

export default {
  components: {
  },
  created() {
    this.infolist.id = this.$route.query.id;
    this.getInfo();
  },
  data() {
    return {
      infolist: {
        id: '',
        name: '',
        intro: '',
        rule: []
      },
    };
  },
  methods: {
    getInfo() {
      this.$request('card.DiscountRule/get', { id: this.infolist.id }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.infolist, dataPage);
          }
        })
      );
    },
  }
};
</script>

<style>
  .display-flex{
    padding-left: 100px;
  }
</style>
