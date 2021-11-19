<template>
  <div class="page-container">
    <section>
      <h2>基础信息</h2>
      <div class="section-item">
        <span class="section-label label-1">封面图</span>
        <ImageUpload
          :limit="1"
          v-model:file-list="infolist.tdmCoverImg"
        />
        <span style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 388 X 218</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">封面标题</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入封面标题"
          maxlength="30"
          v-model="infolist.tdmCoverTitle"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">上架日期</span>
        <el-date-picker v-model="infolist.tdmLifeTimer" value-format="yyyy-MM-dd"></el-date-picker>
      </div>
    </section>
    <section>
      <h2>运营信息</h2>
      <div class="section-item">
        <span class="section-label label-1">初始点赞数</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入点赞数"
          min="0"
          v-model="infolist.tdmInitializeLikenumInt"
          @input="regText"
        ></el-input>
        <!-- onkeyup= "return value=value.replace(/^(0+)|[^\d]+/g, '')" -->
      </div>
    </section>
    <section>
      <h2>详情信息</h2>
      <div class="section-item">
        <span class="section-label label-1">详情图</span>
        <ImageUpload
          :limit="1"
          v-model:file-list="infolist.tdmEssayImg"
        />
        <span style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 590 X 550</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">文章标题</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入文章标题"
          maxlength="30"
          v-model="infolist.tdmEssayTitle"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">副标题</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入副标题"
          maxlength="30"
          v-model="infolist.tdmEssaySubhead"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">详情</span>
        <el-input
          clearable
          class="medium-input"
          type="textarea"
          placeholder="请输入详情"
          maxlength="200"
          :rows="6"
          v-model="infolist.tdmEssayDetails"
        ></el-input>
      </div>
    </section>
    <footer class="btn-footer">
      <el-button type="primary" @click="submit">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </footer>
  </div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload.vue';

export default {
  name: 'dietician_dietician-list_create',
  components: {
    ImageUpload
  },
  props: {
    mode: String
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
  created() {
    if (this.mode === 'edit') {
      this.infolist.tdmId = this.$route.query.id;
      this.getInfo();
    }
  },
  methods: {
    regText(e) {
      e = e.replace(/^(0+)|[^\d]+/g, '');
      this.infolist.tdmInitializeLikenumInt = e == '' ? 0 : e;
    },
    cancel() {
      this.$confirm('确认取消添加吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('点击确定');
        this.$closeRoute();
      }).catch(() => {
        console.log('点击取消');
      });
    },
    getInfo() {
      this.$request('DailyMood/get', { tdmId: this.infolist.tdmId }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.infolist, dataPage);
            this.infolist.tdmCoverImg = [{ url: this.infolist.tdmCoverImg }];
            this.infolist.tdmEssayImg = [{ url: this.infolist.tdmEssayImg }];
          }
        })
      );
    },
    submit() {
      const params = this.$deepClone(this.infolist);
      if (!params.tdmCoverImg[0]) {
        this.$message({ type: 'error', message: '请上传封面图！' });
        return;
      }
      if (!params.tdmEssayImg[0]) {
        this.$message({ type: 'error', message: '请上传详情图！' });
        return;
      }
      if (!params.tdmLifeTimer) {
        this.$message({ type: 'error', message: '请选择时间！' });
        return;
      }
      if (!params.tdmCoverTitle || !params.tdmEssayTitle || !params.tdmEssaySubhead || !params.tdmEssayDetails) {
        this.$message({ type: 'error', message: '信息不完整！' });
        return;
      }
      params.tdmInitializeLikenumInt === '' ? 0 : params.tdmInitializeLikenumInt;
      params.tdmCoverImg = params.tdmCoverImg[0].response ? params.tdmCoverImg[0].response.obj.imageUrl : params.tdmCoverImg[0].url;
      params.tdmEssayImg = params.tdmEssayImg[0].response ? params.tdmEssayImg[0].response.obj.imageUrl : params.tdmEssayImg[0].url;
      const url = {
        create: 'DailyMood/add',
        edit: 'DailyMood/edit'
      }[this.mode];
      this.$request(url, params).then(
        this.$rw((err) => {
          if (!err) {
            this.$closeRoute();
            this.$message({ type: 'success', message: '操作成功！' });
          } else {
            this.$message(err.errMsg);
          }
        })
      );
    }
  }
};
</script>

<style lang="less" scoped>
.medium-input {
  width: 240px;
}

.small-input {
  margin-left: 8px;
  width: 120px;
}

.section-label {
  display: inline-block;
}

.section-item {
  margin: 12px 0;
  display: flex;
  align-items: center;
}

.btn-footer {
  text-align: center;
}

.label-1 {
  width: 160px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}

.label-3 {
  margin-left: 22px;
}
</style>
