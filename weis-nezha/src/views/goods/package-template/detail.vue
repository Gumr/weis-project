<template>
  <div class="page-container">
    <section>
      <h3>基础信息</h3>
      <div>
        <div class="display-flex">
          <p style="display: flex;align-items: center;">
            <span>列表封面图：</span>
            <el-image style="width: 200px" :src="infolist.tucImgUrl" :preview-src-list="[infolist.tucImgUrl]"></el-image>
          </p>
        </div>
        <div class="display-flex">
          <p style="display: flex;align-items: center;">
            <span>详情图：</span>
            <el-image style="width: 200px" :src="infolist.tucImgDetailUrl" :preview-src-list="[infolist.tucImgDetailUrl]"></el-image>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>训练营套装名称：</span> <span>{{ infolist.tucName }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>训练营套装价格：</span> <span>{{ infolist.tucPrice }} 元</span>
          </p>
        </div>
      </div>
    </section>
    <section>
      <h3>训练营套餐配置</h3>
      <div>
        <div class="display-flex">
          <p>
            <span>设置运动金额：</span> <span>{{ infolist.tucExerPrice }} 元</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>饮食消费金额：</span> <span>{{ infolist.tucConsPrice }} 元</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>设置私教课数：</span> <span>{{ infolist.tucCurrNum }} 节</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>设置限购次数：</span> <span>{{ infolist.tucBuyLimit }} 次</span>
          </p>
        </div>
      </div>
    </section>
    <section>
      <h3>运营类信息</h3>
      <div>
        <div class="display-flex">
          <p>
            <span>健身房：</span> <span style="width: 600px;">{{ infolist.tucUnionInfo.join(',') || '无' }}</span>
          </p>
        </div>
         <div class="display-flex">
           <p>
             <span>设置初始参与人数：</span> <span>{{ infolist.tucJoinNum }} 人</span>
           </p>
         </div>
         <div v-for="(item, index) in infolist.tucDetailInfo">
           <div class="display-flex">
             <p style="display: flex;align-items: center;">
               <span>标题{{index+1}}：</span><span>{{ item.title }}</span>
             </p>
           </div>
           <div class="display-flex">
             <p style="display: flex;align-items: center;flex-wrap: wrap;">
               <span>图片：</span>
               <div style="display: flex;align-items: center;flex-wrap: wrap;">
                <el-image style="width: 200px" :src="url" :preview-src-list="[url]" v-for="(url, inx) in item.img_url" :key="inx"></el-image>
               </div>
             </p>
           </div>
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
    this.infolist.tucId = this.$route.query.id;
    this.getInfo();
  },
  data() {
    return {
      infolist: {
        tucId: '',
        tucName: '',
        tucPrice: '',
        tucImgUrl: '',
        tucExerPrice: '',
        tucConsPrice: '',
        tucCurrNum: '',
        tucBuyLimit: '',
        tucUnionIds: '',
        tucJoinNum: '',
        tucUnionInfo: [],
        tucDetailInfo: [],
      },
    };
  },
  methods: {
    getInfo() {
      this.$request('fitness.Fitness/queryUnionComboById', {tucId: this.infolist.tucId}).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.infolist, dataPage);
            this.infolist.tucUnionInfo = dataPage.tucUnionInfo.map(item => {
              return item.tuName;
            });
          }
        })
      );
    },
  }
};
</script>

<style lang="less" scoped>
  .display-flex{
    padding-left: 40px;
    span {
      width: 180px;
      display: inline-block;
    }
  }
</style>
