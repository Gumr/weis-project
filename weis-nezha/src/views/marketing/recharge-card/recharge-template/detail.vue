<template>
  <div class="page-container">
    <section v-if="tab == 0">
      <h3>基础信息</h3>
      <div>
        <div class="display-flex">
          <p>
            <span>卡类型：</span> <span>线上卡</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <div style="width: 120px;">分享链接图：</div>
            <span v-for="(item, inx) in infolist.makeOverImg" :key="inx"
              ><el-image :src="item.url"></el-image
            ></span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <div style="width: 120px;">卡面图：</div>
            <span v-for="(item, index) in infolist.img" :key="index"
              ><el-image :src="item.url"></el-image
            ></span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>卡名称：</span> <span>{{ infolist.name }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>卡面额：</span> <span>{{ infolist.amount }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>卡销售期：</span> <span style="width: 800px;">{{ infolist.sellingTime }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>卡使用限制简介：</span> <span>{{ infolist.intro }}</span>
          </p>
        </div>
      </div>
    </section>
    <section v-if="tab == 1">
      <h3>基础信息</h3>
      <div>
        <div class="display-flex">
          <p>
            <span>卡类型：</span> <span>线下卡</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>卡名称：</span> <span>{{ infolist.name }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>卡面额：</span> <span>{{ infolist.amount }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>卡使用限制简介：</span> <span>{{ infolist.intro }}</span>
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
    this.tab = this.$route.query.tab;
    this.id = this.$route.query.id;
    this.getInfo();
  },
  data() {
    return {
      tab: '',
      id: '',
      infolist: {
        name: '',
        amount: '',
        date: '',
        intro: '',
        img: [],
        sellingTime: ''
      },
    };
  },
  methods: {
    getInfo() {
      this.$request('card.Model/get', { id: this.id }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.infolist, dataPage);
            this.infolist.img = [{url: this.infolist.img}];
            this.infolist.makeOverImg = [{url: this.infolist.makeOverImg}];
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
