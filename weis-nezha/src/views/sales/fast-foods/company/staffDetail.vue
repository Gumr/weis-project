<template>
  <div class="page-container">
    <section>
      <div class="section-item">
        <span class="section-label label-1">员工ID：</span>
        <span>{{tgeId}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">员工姓名：</span>
        <span>{{tgeName}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">员工手机：</span>
        <span>{{tgePhone}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">所属部门：</span>
        <span>{{tgeOrgName}}</span>
      </div>
    </section>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
export default {
  components: {
    BasePageTable,
  },
  data() {
    return {
      tgeId: '',
      tgeName: '',
      tgePhone: '',
      tgeOrgName: '',
    }
  },
  created() {
    this.tgeId = this.$route.query.tgeId;
    this.tgcId = this.$route.query.id;
    this.getInfo()
  },
  methods: {
    async getInfo() {
      const res = await this.$http('groupmeal.Corp/queryEmployeeInfo', { tgcId: this.tgcId, tgeId: this.tgeId });
      this.tgeName = res.obj.tgeName;
      this.tgePhone = res.obj.tgePhone;
      this.tgeOrgName = res.obj.tgeOrgName ? res.obj.tgeOrgName : '企业主体';
      console.log(res);
    },
  }
}
</script>

<style lang="less" scoped>
 h3{
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

.label-3, h3 {
  margin-left: 22px;
}
</style>
