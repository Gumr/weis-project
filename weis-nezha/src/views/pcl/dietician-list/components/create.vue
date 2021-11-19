<template>
  <div class="page-container">
    <section>
      <h2>基础信息</h2>
      <div class="section-item">
        <span class="section-label label-1">方案师头像</span>
        <ImageUpload
          :limit="1"
          v-model:file-list="infolist.tcdImgUrl"
          @upload-success="handleUpload"
          @delete-success="changeimg"
        />
      </div>
      <div class="section-item">
        <span class="section-label label-1">方案师名称</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入方案师名称"
          maxlength="30"
          v-model="infolist.tcdName"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">方案师头衔</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入方案师头衔"
          maxlength="30"
          v-model="infolist.tcdTitle"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">方案师简介</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入方案师简介"
          type="textarea"
          maxlength="200"
          :rows="6"
          v-model="infolist.tcdIntroduce"
        ></el-input>
      </div>
    </section>
    <footer class="btn-footer">
      <el-button type="primary" @click="updateDietician">确定</el-button>
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
    routeQuery: {
      type: Object
    }
  },
  data() {
    return {
      infolist: {
        tcdImgUrl: [],
        tcdName: '',
        tcdTitle: '',
        tcdIntroduce: '',
      },
      indeximg: 1,
    };
  },
  created() {

  },
  methods: {
    handleUpload(url) {
    },
    changeimg() {
    },
    cancel() {
      this.$confirm('确认取消添加方案师吗?', {
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
    updateDietician() {
      const params = JSON.parse(JSON.stringify(this.infolist));
      if (!params.tcdImgUrl[0]) {
        this.$message('请上传图片！');
        return;
      }
      params.tcdImgUrl = params.tcdImgUrl[0].response ? params.tcdImgUrl[0].response.obj.imageUrl : params.tcdImgUrl[0].url;
      this.$request('plan.Dietician/updateDietician', params).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.$closeRoute();
            this.$message('添加成功');
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
