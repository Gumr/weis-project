<template>
  <div class="page-container">
    <ReturnButton />
    <section>
      <h3>基础信息</h3>
      <div class="section-item">
        <span class="section-label label-1">头像：</span>
        <ImageUpload
          :upload-data="{ flag: 'dietitian' }"
          v-model:file-list="formData.headImageUrl"
          :limit="1"
        />
        <span style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 400 X 400</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">二维码：</span>
        <ImageUpload
          :upload-data="{ flag: 'dietitian' }"
          v-model:file-list="formData.qrcodeUrl"
          :limit="1"
        />
        <span style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 400 X 400</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">名称：</span>
        <el-input
          clearable
          class="medium-input"
          maxlength="30"
          @keydown.enter="focusNext('phone')"
          placeholder="请输入名称"
          v-model="formData.uname"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">手机：</span>
        <el-input
          clearable
          class="medium-input"
          maxlength="11"
          @keydown.enter="focusNext('attestation')"
          ref="phone"
          placeholder="请输入手机"
          v-model="formData.phone"
          @keydown="catchNonNumberKeydown"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">认证：</span>
        <el-input
          clearable
          class="medium-input"
          maxlength="300"
          @keydown.enter="focusNext('introduction')"
          ref="attestation"
          placeholder="请输入认证"
          type="textarea"
          :rows="6"
          v-model="formData.attestation"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">简介：</span>
        <el-input
          clearable
          class="medium-input"
          maxlength="300"
          ref="introduction"
          placeholder="请输入简介"
          type="textarea"
          :rows="6"
          v-model="formData.introduction"
        ></el-input>
      </div>
    </section>
    <section>
      <h3>服务信息</h3>
      <div class="section-item">
        <span class="section-label label-1">领域选择：</span>
        <el-checkbox-group v-model="formData.field" @change="groupChange">
          <el-checkbox label="01">减脂</el-checkbox>
          <el-checkbox label="02">增肌</el-checkbox>
          <el-checkbox label="03">控糖</el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="section-item" v-if="formData.field.includes('01')">
        <span class="section-label label-1">(减脂)标题：</span>
        <el-input
          clearable
          class="medium-input"
          maxlength="30"
          @keydown.enter="focusNext('fatReductionDescribe')"
          placeholder="请输入标题"
          v-model="formData.fatReductionTitle"
        ></el-input>
      </div>
      <div class="section-item" v-if="formData.field.includes('01')">
        <span class="section-label label-1">(减脂)描述：</span>
        <el-input
          clearable
          class="medium-input"
          maxlength="500"
          ref="fatReductionDescribe"
          placeholder="请输入简介"
          type="textarea"
          :rows="6"
          v-model="formData.fatReductionDescribe"
        ></el-input>
      </div>
      <div class="section-item" v-if="formData.field.includes('02')">
        <span class="section-label label-1">(增肌)标题：</span>
        <el-input
          clearable
          class="medium-input"
          maxlength="30"
          @keydown.enter="focusNext('buildMusclesDescribe')"
          ref="buildMusclesTitle"
          placeholder="请输入标题"
          v-model="formData.buildMusclesTitle"
        ></el-input>
      </div>
      <div class="section-item" v-if="formData.field.includes('02')">
        <span class="section-label label-1">(增肌)描述：</span>
        <el-input
          clearable
          class="medium-input"
          maxlength="500"
          ref="buildMusclesDescribe"
          placeholder="请输入简介"
          type="textarea"
          :rows="6"
          v-model="formData.buildMusclesDescribe"
        ></el-input>
      </div>
      <div class="section-item" v-if="formData.field.includes('03')">
        <span class="section-label label-1">(控糖)标题：</span>
        <el-input
          clearable
          class="medium-input"
          maxlength="30"
          @keydown.enter="focusNext('sugarControlDescribe')"
          ref="sugarControlTitle"
          placeholder="请输入标题"
          v-model="formData.sugarControlTitle"
        ></el-input>
      </div>
      <div class="section-item" v-if="formData.field.includes('03')">
        <span class="section-label label-1">(控糖)描述：</span>
        <el-input
          clearable
          class="medium-input"
          maxlength="500"
          ref="sugarControlDescribe"
          placeholder="请输入简介"
          type="textarea"
          :rows="6"
          v-model="formData.sugarControlDescribe"
        ></el-input>
      </div>
    </section>
    <footer class="btn-footer">
      <el-button type="primary" @click="handleSubmit" :loading="loading">确认</el-button>
      <el-button type="danger" @click="cancel">取消</el-button>
    </footer>
  </div>
</template>

<script>
import ReturnButton from '@/components/ReturnButton.vue';
import ImageUpload from '@/components/ImageUpload.vue';
import { catchNonNumberKeydown } from '@/utils/event-catcher';
export default {
  components: {
    ReturnButton,
    ImageUpload
  },
  data() {
    return {
      id: '',
      loading: false,
      formData: {
        uname: '',
        phone: '',
        attestation: '',
        introduction: '',
        headImageUrl: [],
        qrcodeUrl: [],
        field: [],
        fatReductionTitle: '',
        buildMusclesTitle: '',
        sugarControlTitle: '',
        fatReductionDescribe: '',
        buildMusclesDescribe: '',
        sugarControlDescribe: '',
      }
    };
  },
  created() {
    this.id = this.$route.query.id || '';
    if (this.id) {
      this.getInfo();
    }
  },
  methods: {
    catchNonNumberKeydown,
    focusNext(nextRef) {
      this.$refs[nextRef].focus()
    },
    groupChange(e) {
      if (!e.includes('01')) {
        this.formData.fatReductionTitle = '';
        this.formData.fatReductionDescribe = '';
      }
      if (!e.includes('02')) {
        this.formData.buildMusclesTitle = '';
        this.formData.buildMusclesDescribe = '';
      }
      if (!e.includes('03')) {
        this.formData.sugarControlTitle = '';
        this.formData.sugarControlDescribe = '';
      }
    },
    async getInfo() {
      const res = await this.$http('Dietitian/queryDietitianById', {id: this.id});
      Object.assign(this.formData, res.obj.dietitianInfo);
      this.formData.headImageUrl = [{url: this.formData.headImageUrl}];
      this.formData.qrcodeUrl = [{url: this.formData.qrcodeUrl}];
      this.formData.field = JSON.parse(this.formData.field);
    },
    handleSubmit() {
      this.$confirm(`确定提交？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        this.submit();
      })
    },
    async submit() {
      const params = this.$deepClone(this.formData);
      if (!params.headImageUrl.length) {
        this.$msg('请上传头像', 'error');
        return;
      }
      if (!params.qrcodeUrl.length) {
        this.$msg('请上传二维码', 'error');
        return;
      }
      if (!params.uname) {
        this.$msg('请输入名称', 'error');
        return;
      }
      if (!params.phone) {
        this.$msg('请输入手机', 'error');
        return;
      }
      if (!params.attestation) {
        this.$msg('请输入认证', 'error');
        return;
      }
      if (!params.introduction) {
        this.$msg('请输入简介', 'error');
        return;
      }
      if (!params.field.length) {
        this.$msg('请选择领域', 'error');
        return;
      }
      if (params.field.includes('01') && (!params.fatReductionTitle || !params.fatReductionDescribe)) {
        this.$msg('请输入减脂信息', 'error');
        return;
      }
      if (params.field.includes('02') && (!params.buildMusclesTitle || !params.buildMusclesDescribe)) {
        this.$msg('请输入增肌信息', 'error');
        return;
      }
      if (params.field.includes('03') && (!params.sugarControlTitle || !params.sugarControlDescribe)) {
        this.$msg('请输入控糖信息', 'error');
        return;
      }
      params.headImageUrl = params.headImageUrl[0].response ? params.headImageUrl[0].response.obj.imageUrl : params.headImageUrl[0].url;
      params.qrcodeUrl = params.qrcodeUrl[0].response ? params.qrcodeUrl[0].response.obj.imageUrl : params.qrcodeUrl[0].url;
      this.loading = true;
      const res = await this.$http('Dietitian/addAdminDietitian', params);
      this.loading = false;
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.$closeRoute();
      } else {
        this.$msg(res.errMsg, 'error');
      }
    },
    cancel() {
      this.$closeRoute();
    }
  }
}
</script>

<style>
.page-container {
  padding-top: 20px;
}
.label-1 {
  width: 120px;
}
.medium-input {
  width: 305px;
}
</style>
