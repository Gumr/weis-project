<template>
  <div>
    <section>
      <h3>组织信息</h3>
      <div class="section-item">
        <span class="section-label label-1">企业主体：</span>
        <span style="margin-right: 30px;">{{ tgcName }}</span>
        <el-button type="primary" @click="addOrg">添加部门</el-button>
      </div>
      <div v-for="(item, index) in orgInfo" :key="index">
        <div class="section-item">
          <span class="section-label label-1">部门：</span>
          <el-input v-model="item.tgoOrgName" clearable class="medium-input"></el-input>
          <el-button class="btn" type="danger" @click="delOrg(index)">删除</el-button>
        </div>
        <div class="section-item">
          <span class="section-label label-1">部门接口人：</span>
          <el-input v-model="item.tgoLeaderName" clearable class="medium-input"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">接口人手机：</span>
          <el-input v-model="item.tgoLeaderPhone" clearable class="medium-input"></el-input>
        </div>
      </div>
    </section>
    <footer class="btn-footer">
      <el-button type="primary" :loading="loading" @click="submit">保存</el-button>
      <el-button @click="cancel">取消</el-button>
    </footer>
  </div>
</template>

<script>
// import { regionData, CodeToText, TextToCode } from '@/utils/regon-data.js';
// import ReturnButton from '@/components/ReturnButton.vue';
// import areafrom from '@/utils/select_area.json';
export default {
  components: {
    // ReturnButton,
  },
  data() {
    return {
      loading: false,
      tgcName: '',
      orgInfo: [],
    }
  },
  created() {
    this.tgcId = this.$route.query.id;
    if (this.tgcId) {
      this.getInfo();
    }
  },
  methods: {
    async getInfo() {
      const res = await this.$http('groupmeal.Corp/queryCorpById', { tgcId: this.tgcId });
      this.tgcName = res.obj.corpInfo.tgcName;
      this.orgInfo = res.obj.orgInfo;
      if (!this.orgInfo.length) {
        this.orgInfo.push({ tgoOrgName: '', tgoLeaderName: '', tgoLeaderPhone: '' });
      }
    },
    addOrg() {
      this.orgInfo.push({ tgoOrgName: '', tgoLeaderName: '', tgoLeaderPhone: '' });
    },
    delOrg(index) {
      this.orgInfo.splice(index, 1);
    },
    cancel() {
      this.$confirm('确认返回？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        this.$router.go(-1);
      })
    },
    async submit() {
      const params = {
        tgcId: this.tgcId,
        orgInfo: this.orgInfo
      };
      const res = await this.$http('groupmeal.Corp/updateCorpOrg', params);
      if (!res.errMsg) {
        this.getInfo();
        this.$msg('修改成功', 'success');
      } else {
        this.$msg(res.errMsg, 'error');
      }
    }
  }
}
</script>

<style lang="less" scoped>
h3 {
  margin-right: 20px;
}
h4 {
  margin: 10px 0;
}
section {
  padding-top: 30px;
}
.mini-input {
  width: 100px;
  margin-right: 20px;
}
.medium-picker {
  width: 300px;
}
.medium-input {
  width: 350px;
  margin-right: 20px;
}
.max-input {
  width: 350px;
}
.medium-select {
  width: 70px;
  margin-left: 10px;
}
.rule {
  padding-left: 150px;
}
.tiny-input {
  width: 150px;
  margin: 0 20px;
}

.small-input {
  margin-left: 8px;
  width: 120px;
}
.small-select {
  margin-left: 8px;
  width: 200px;
}

.section-label {
  display: inline-block;
}

.section-item {
  margin: 20px 0;
  display: flex;
  align-items: center;
  min-height: 30px;
  flex-wrap: wrap;
  button {
    height: 38px;
    line-height: 5px;
  }
}
.btn-footer {
  text-align: center;
}
.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}

.label-3,
h3 {
  margin-left: 22px;
}
</style>
