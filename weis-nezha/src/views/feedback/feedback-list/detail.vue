<template>
  <div class="page-container">
    <section>
      <h3>基础信息</h3>
      <div class="section-item">
        <span class="section-label label-1">反馈人昵称：</span>
        <span>{{ infolist.uname }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">反馈人ID：</span>
        <span>{{ infolist.uid }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">反馈人手机：</span>
        <span>{{ infolist.uphone }}</span>
      </div>
    </section>
    <section>
      <h3>菜品信息</h3>
      <div class="section-item">
        <span class="section-label label-1">菜品名称：</span>
        <span>{{ infolist.skuname }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品编码：</span>
        <span>{{ infolist.skucid }}</span>
      </div>
    </section>
    <section>
      <h3>反馈信息</h3>
      <div class="section-item">
        <span class="section-label label-1">口味：</span>
        <span>{{ infolist.flavorScore }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">包装：</span>
        <span>{{ infolist.packScore }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">建议：</span>
        <span style="width: 800px;">{{ infolist.propose }}</span>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  components: {
  },
  created() {
    this.infolist.tdodId = this.$route.query.id;
    this.getInfo();
  },
  data() {
    return {
      infolist: {
        tdodId: '',
        uid: '',
        uname: '',
        uphone: '',
        skuname: '',
        skucid: '',
        flavorScore: '',
        packScore: '',
        propose: ''
      },
      tcDietician: '',
    }
  },
  methods: {
    getInfo() {
      this.$request('feedback.SkuFeed/queryFeedById', { qid: this.infolist.tdodId }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.infolist, dataPage.skuFeedVo);
          }
        })
      );
    },
  }
}
</script>

<style lang="less" scoped>
.label-1 {
  width: 150px;
  margin-right: 12px;
  text-align: right;
}
</style>
