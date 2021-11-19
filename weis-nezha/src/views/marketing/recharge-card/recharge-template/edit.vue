<template>
  <div class="page-container">
    <section v-if="tab == 0">
      <h2>基础信息</h2>
      <div class="section-item">
        <span class="section-label label-1">卡类型：</span>
        <span>线上卡</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">卡面图：</span>
        <ImageUpload
          v-model:file-list="infoOnLine.img"
          :upload-data="{ flag: 'recharge-template' }"
          :limit="1"
        />
        <span style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 690 X 330</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">分享链接封面图：</span>
        <ImageUpload
          v-model:file-list="infoOnLine.makeOverImg"
          :upload-data="{ flag: 'recharge-template' }"
          :limit="1"
        />
        <span style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 462 X 370</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">卡名称：</span>
        <el-input
          v-model="infoOnLine.name"
          clearable
          class="medium-input"
          placeholder="请输入卡名称"
          min="0"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">卡面额：</span>
        <el-input
          v-model="infoOnLine.amount"
          clearable
          class="medium-input"
          placeholder="请输入卡面额"
          min="0"
          type="number"
          oninput="if(value.length>5)value=value.slice(0,10)"
          @blur="oninput($event, 'amount')"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">卡销售期：</span>
        <el-date-picker
          v-model="infoOnLine.date"
          type="daterange"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </div>
      <div class="section-item">
        <span class="section-label label-1">卡使用有效期：</span>
        <el-input
          v-model="infoOnLine.useDeadline"
          clearable
          class="medium-input"
          placeholder="请输入有效期"
          min="0"
          type="number"
          oninput="if(value.length>5)value=value.slice(0,10)"
          @blur="oninput($event, 'date')"
        ></el-input>天
      </div>
      <div class="section-item">
        <span class="section-label label-1">卡使用限制简介：</span>
        <el-input
          v-model="infoOnLine.intro"
          clearable
          class="medium-input"
          placeholder="请输入简介"
          type="textarea"
          rows="6"
        ></el-input>
      </div>
    </section>
    <section v-else>
      <h2>基础信息</h2>
      <div class="section-item">
        <span class="section-label label-1">卡类型：</span>
        <span>线下卡模板</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">卡名称：</span>
        <el-input
          v-model="infoUnderLine.name"
          clearable
          class="medium-input"
          placeholder="请输入卡名称"
          min="0"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">卡面额：</span>
        <el-input
          v-model="infoUnderLine.amount"
          clearable
          class="medium-input"
          placeholder="请输入卡面额"
          min="0"
          type="number"
          oninput="if(value.length>5)value=value.slice(0,10)"
          onkeyup="return value=Number(value).toFixed(0)"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">卡使用限制简介：</span>
        <el-input
          v-model="infoUnderLine.intro"
          clearable
          class="medium-input"
          placeholder="请输入简介"
          type="textarea"
          rows="6"
        ></el-input>
      </div>
    </section>
    <footer class="btn-footer">
      <el-button type="primary" :loading="loading" @click="submit">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </footer>
  </div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload.vue';
import { round } from '@/utils/common'

export default {
  name: 'dietician_dietician-list_create',
  components: {
    ImageUpload,
  },
  props: {
    mode: String
  },
  data() {
    return {
      loading: false,
      tab: '',
      type: '',
      id: '',
      infoOnLine: {
        id: '',
        name: '',
        amount: '',
        useDeadline: '',
        makeOverImg: [],
        date: [],
        intro: '',
        img: [],
      },
      infoUnderLine: {
        id: '',
        name: '',
        amount: '',
        intro: '',
      }
    };
  },
  created() {
    this.tab = this.$route.query.tab;
    this.type = this.$route.query.type;
    if (this.type === 'edit') {
      this.id = this.$route.query.id;
      this.getInfo();
    }
  },
  methods: {
    oninput(e, type) {
      if (type === 'amount') {
        this.infoOnLine.amount = round(e.target.value, 2);
      } else if (type === 'date') {
        this.infoOnLine.useDeadline = Number(e.target.value).toFixed(0);
      }
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
      this.$request('card.Model/get', { id: this.id }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            if (this.tab == 0) {
              Object.assign(this.infoOnLine, dataPage);
              this.infoOnLine.date = [];
              this.infoOnLine.date.push(this.$day(this.infoOnLine.startTime).format('YYYY-MM-DD'));
              this.infoOnLine.date.push(this.$day(this.infoOnLine.endTime).format('YYYY-MM-DD'));
              this.infoOnLine.img = [{ url: this.infoOnLine.img }];
              this.infoOnLine.makeOverImg = [{ url: this.infoOnLine.makeOverImg }];
            } else {
              Object.assign(this.infoUnderLine, dataPage);
            }
          }
        })
      );
    },
    submit() {
      let params = {};
      if (this.tab == '0') {
        params = this.$deepClone(this.infoOnLine);
        if (!params.img[0]) {
          this.$message({ type: 'error', message: '请上传卡面图！' });
          return;
        }
        if (!params.makeOverImg[0]) {
          this.$message({ type: 'error', message: '请上传分享链接封面图！' });
          return;
        }
        if (!params.name) {
          this.$message({ type: 'error', message: '请输入名称！' });
          return;
        }
        if (!params.amount) {
          this.$message({ type: 'error', message: '请输入卡面额！' });
          return;
        }
        if (params.amount <= 0) {
          this.$message({ type: 'error', message: '卡面额金额错误！' });
          return;
        }
        if (!params.date) {
          this.$message({ type: 'error', message: '请输入销售期！' });
          return;
        }
        if (!params.useDeadline) {
          this.$message({ type: 'error', message: '请输入有效期！' });
          return;
        }
        if (params.useDeadline <= 0) {
          this.$message({ type: 'error', message: '有效期错误！' });
          return;
        }
        if (!/^\d+$/.test(params.useDeadline)) {
          this.$message({ type: 'error', message: '有效期为整数！' });
          return;
        }
        if (!params.intro) {
          this.$message({ type: 'error', message: '请输入简介！' });
          return;
        }
        params.img = params.img[0].response ? params.img[0].response.obj.imageUrl : params.img[0].url;
        params.makeOverImg = params.makeOverImg[0].response ? params.makeOverImg[0].response.obj.imageUrl : params.makeOverImg[0].url;
        params.startTime = this.$day(params.date[0]).format('YYYY-MM-DD');
        params.endTime = this.$day(params.date[1]).format('YYYY-MM-DD');
      } else {
        params = this.$deepClone(this.infoUnderLine);
        if (!params.name) {
          this.$message({ type: 'error', message: '请输入名称！' });
          return;
        }
        if (!params.amount) {
          this.$message({ type: 'error', message: '请输入卡面额！' });
          return;
        }
        if (!params.intro) {
          this.$message({ type: 'error', message: '请输入简介！' });
          return;
        }
      }
      let url = '';
      if (this.type == 'create') {
        url = {
          0: 'card.Model/addForOnLine',
          1: 'card.Model/addForOffline'
        }[this.tab];
      } else if (this.type == 'edit') {
        url = 'card.Model/edit';
      }
      this.loading = true;
      this.$request(url, params).then(
        this.$rw((err) => {
          this.loading = false;
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
  margin: 20px 0;
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
