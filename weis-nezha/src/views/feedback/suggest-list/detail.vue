<template>
  <div class="page-container">
    <section>
      <h3>基础信息</h3>
      <div class="section-item">
        <span class="section-label label-1">反馈类型：</span>
        <span>{{ infolist.type === '01' ? '功能建议' : 'bug反馈' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">反馈人昵称：</span>
        <span>{{ infolist.uname }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">反馈人ID：</span>
        <span>{{ infolist.uid }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">反馈人微信：</span>
        <span>{{ infolist.wechat }}</span>
      </div>
    </section>
    <section>
      <h3>反馈信息</h3>
      <div class="section-item">
        <span class="section-label label-1">反馈内容：</span>
        <span style="width: 800px;">{{ infolist.content }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">图片：</span>
        <div style="display: flex;align-items: center;flex-wrap: wrap;">
          <el-image  v-for="(item, index) in infolist.image" :key="index" class="img" fit="cover" :src="item" :preview-src-list="infolist.image"></el-image>
        </div>
      </div>
      <div class="section-item">
        <span class="section-label label-1">视频：</span>
        <div class="content-img">
          <video v-for="(item, index) in infolist.vedio" :key="index" :src="item"></video>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ReturnButton from '@/components/ReturnButton.vue';
export default {
  components: {
    ReturnButton,
  },
  created() {
    this.infolist.tcId = this.$route.query.id;
    this.getInfo();
  },
  data() {
    return {
      infolist: {
        tcId: '',
        type: '',
        uname: '',
        uid: '',
        wechat: '',
        content: '',
        image: [],
        video: []
      },
      tcDietician: '',
    }
  },
  methods: {
    getInfo() {
      this.$request('feedback.Suggest/querySuggestById', { qid: this.infolist.tcId }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.infolist, dataPage.suggestVo);
          }
        })
      );
    },
  }
}
</script>

<style lang="less" scoped>
.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}
</style>
