<template>
  <div class="page-container">
    <div>
      <h3>健身房</h3>
      <div class="display-flex">
        <p>
          <span>健身房图片：</span>
          <div style="display: flex;align-items: center;flex-wrap: wrap;">
            <el-image style="width: 200px" :src="url" :preview-src-list="[url]" v-for="(url, inx) in infolist.tuImgs" :key="inx"></el-image>
          </div>
        </p>
      </div>
      <div class="display-flex">
        <p>
          <span>渠道类别：</span><span>{{ infolist.tuTypeDesc }}</span>
        </p>
      </div>
      <div class="display-flex">
        <p>
          <span>健身房名称：</span><span>{{ infolist.tuName }}</span>
        </p>
      </div>
      <div class="display-flex">
        <p>
          <span>健身房负责人：</span> <span>{{ infolist.tuLeaderName }}</span>
        </p>
      </div>
      <div class="display-flex">
        <p>
          <span>负责人手机号：</span> <span>{{ infolist.tuLeaderPhone }}</span>
        </p>
      </div>
      <div class="display-flex">
        <p>
          <span>健身房描述：</span><span>{{ infolist.tuDesc }}</span>
        </p>
      </div>
      <div class="display-flex">
        <p>
          <span>健身房地址：</span><span>{{ infolist.tuAddrProvince }}-{{ infolist.tuAddrCity }}-{{ infolist.tuAddrArea }}</span>
        </p>
      </div>
      <div class="display-flex">
        <p>
          <span>详细地址：</span><span>{{ infolist.tuAddress }}</span>
        </p>
      </div>
      <div class="display-flex">
        <p>
          <span>客户经理：</span><span>{{ infolist.tuCounselorName }} {{infolist.tuCounselorType == '02' ? '自有' : '外部' }}</span>
        </p>
      </div>
      <div class="display-flex">
        <p>
          <span>客户经理手机：</span><span>{{ infolist.tuCounselorPhone }}</span>
        </p>
      </div>
      <h3>明星教练</h3>
      <div style="margin-bottom: 50px;" v-for="(item, index) in infolist.tuCoachInfo" :key="index">
        <div class="display-flex">
          <p>
            <div style="width: 100px;">头像：</div>
            <div style="display: flex;align-items: center;flex-wrap: wrap;">
              <el-image style="width: 200px" :src="item.img" :preview-src-list="[item.img]" ></el-image>
            </div>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <div style="width: 100px;">姓名：</div><span>{{ item.name }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <div style="width: 100px;">擅长课程：</div><span>{{ item.adeptClass }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <div style="width: 100px;">从业时间：</div><span>{{ item.joinTime }}年</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  components: {
  },
  created() {
    this.infolist.tuId = this.$route.query.id;
    this.getInfo();
  },
  data() {
    return {
      infolist: {
        tuID: '',
        tuName: '',
        tuLeaderName: '',
        tuLeaderPhone: '',
        tuDesc: '',
        tuAddress: '',
        tuAddrProvince: '',
        tuAddrCity: '',
        tuAddrArea: '',
        tuCounselorId: '',
      },
    };
  },
  methods: {
    getInfo() {
      this.$request('fitness.Fitness/queryUnionById', {tuId: this.infolist.tuId}).then(
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

<style lang="less">
  .display-flex{
    padding-left: 50px;
    align-items: flex-start;
    span {
      width: 500px;
    }
  }
</style>
