<template>
  <div class="page-container">
    <section>
      <h2>基础信息</h2>
      <div class="section-item">
        <span class="section-label label-1">厨师头像</span>
        <ImageUpload
          :upload-data="{ flag: 'master' }"
          v-model:file-list="infolist.tfmImgUrl"
          :limit="1"
        />
      </div>
      <div class="section-item">
        <span class="section-label label-1">厨师名称</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入厨师名称"
          v-model="infolist.tfmName"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">厨师头衔</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入厨师头衔"
          v-model="infolist.tfmTitle"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">厨师简介</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入厨师简介"
          type="textarea"
          :rows="6"
          v-model="infolist.tfmIntroduce"
        ></el-input>
      </div>
    </section>
    <footer class="btn-footer">
      <el-button type="primary" @click="updateMaster">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </footer>
  </div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload.vue';

export default {
  
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
        tfmId: '',
        tfmImgUrl: [],
        tfmName: '',
        tfmTitle: '',
        tfmIntroduce: '',
      },
    };
  },
  created() {
    this.infolist.tfmId = this.$route.query.id;
    this.getMasterInfo();
  },
  methods: {
    cancel() {
      this.$confirm('确认取消添加厨师吗?', {
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
    getMasterInfo() {
      this.$request('FoodMaster/queryMasterById', {tfmId: this.infolist.tfmId}).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.infolist, dataPage.foodMasterVo);
            this.infolist.tfmImgUrl = [{ url: this.infolist.tfmImgUrl }];
          }
        })
      );
    },
    updateMaster() {
      const params = this.$deepClone(this.infolist);
      if (!params.tfmImgUrl[0]) {
        this.$message('请上传图片！');
        return;
      }
      params.tfmImgUrl = params.tfmImgUrl[0].response ? params.tfmImgUrl[0].response.obj.imageUrl : params.tfmImgUrl[0].url;
      this.$request('FoodMaster/updateMaster', params).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.$closeRoute();
            this.$message({type:'success', message: '修改成功'});
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
