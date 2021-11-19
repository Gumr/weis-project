<template>
  <div class="page-container">
    <section>
      <h3>基本信息</h3>
      <div>
        <div class="display-flex">
          <p>
            <span style="vertical-align: top;">封面图：</span>
            <span v-for="(item, index) in infolist.tdmCoverImg"
              ><el-image :src="item.url"></el-image
            ></span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>封面标题：</span> <span>{{ infolist.tdmCoverTitle }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>上架日期：</span> <span>{{ infolist.tdmLifeTimer }}</span>
          </p>
        </div>
      </div>
    </section>
    <section>
      <h3>运营信息</h3>
      <div>
        <div class="display-flex">
          <p>
            <span>初始点赞数：</span> <span>{{ infolist.tdmInitializeLikenumInt }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>用户点赞数：</span> <span>{{ infolist.tdmLikenumInt }}</span>
          </p>
        </div>
      </div>
    </section>
    <section>
      <h3>详情信息</h3>
      <div>
        <div class="display-flex">
          <p>
            <span style="vertical-align: top;">详情图：</span>
            <span v-for="(item, index) in infolist.tdmEssayImg"
              ><el-image :src="item.url"></el-image
            ></span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>文章标题：</span> <span>{{ infolist.tdmEssayTitle }}</span>
          </p>
        </div>
         <div class="display-flex">
           <p>
             <span>副标题：</span> <span>{{ infolist.tdmEssaySubhead }}</span>
           </p>
         </div>
         <div class="display-flex">
           <p>
             <span>详情：</span> <span>{{ infolist.tdmEssayDetails }}</span>
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
    this.infolist.tdmId = this.$route.query.id;
    this.getInfo();
  },
  data() {
    return {
      infolist: {
        tdmId: '',
        tdmCoverImg: [],
        tdmCoverTitle: '',
        tdmEssayImg: [],
        tdmEssayTitle: '',
        tdmEssaySubhead: '',
        tdmEssayDetails: '',
        tdmInitializeLikenumInt: 0,
        tdmLifeTimer: '',
      },
    };
  },
  methods: {
    getInfo() {
      this.$request('DailyMood/get', {tdmId: this.infolist.tdmId}).then(
        this.$rw((err, dataPage) => {
          console.log(dataPage);
          if (!err) {
            Object.assign(this.infolist, dataPage);
            this.infolist.tdmCoverImg = [{url:this.infolist.tdmCoverImg}];
            this.infolist.tdmEssayImg = [{url:this.infolist.tdmEssayImg}];
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
