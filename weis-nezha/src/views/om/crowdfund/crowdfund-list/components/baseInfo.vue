<template>
  <div>
    <div class="section-item">
      <span class="section-label label-1">活动ID：</span>
      <span>{{baseInfo.taId}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">期数：</span>
      <span>第{{baseInfo.taPhase}}期</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">活动名称：</span>
      <span>{{baseInfo.taName}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">征集期周期：</span>
      <span class="section-label label-2">{{collectDate[0]}} - {{collectDate[1]}}</span>
      <span>天数: {{collectDays}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">审核周期：</span>
      <span class="section-label label-2">{{auditDate[0]}} - {{auditDate[1]}}</span>
      <span>天数: {{auditDays}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">投票周期：</span>
      <span class="section-label label-2">{{voteDate[0]}} - {{voteDate[1]}}</span>
      <span>天数: {{voteDays}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">发布期：</span>
      <span class="section-label label-2">{{publishDate[0]}} - {{publishDate[1]}}</span>
      <span>天数: {{publishDays}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">当前阶段：</span>
      <span>{{baseInfo.taSttDesc}}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">参与总人数：</span>
      <span>{{baseInfo.taJoinUserNum}} 人</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">上传菜品人数：</span>
      <span>{{baseInfo.taUploadUserNum}} 人</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">收藏菜品人总数：</span>
      <span>{{baseInfo.taEnshrineUserNum}} 人</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">分享菜品人总数：</span>
      <span>{{baseInfo.taShareFoodNum}} 人</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">参与菜品数：</span>
      <span>{{baseInfo.taJoinFoodNum}} 份</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">审核通过菜品数：</span>
      <span>{{baseInfo.taAuditFoodNum}} 份</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">投票人数：</span>
      <span>{{baseInfo.taVoteUserNum}} 人</span>
    </div>
  </div>
</template>

<script>
  export default {
    components: {

    },
    created() {
      this.baseInfo.taId = this.$route.query.id;
      this.getInfo();
    },
    data() {
      return {
        collectDate: [],
        collectDays: '',
        auditDate: [],
        auditDays: '',
        voteDate: [],
        voteDays: '',
        publishDate: [],
        publishDays: '',
        baseInfo: {
          taId: '',
          taName: '',
          taSttDesc: '',
          taJoinUserNum: '',
          taUploadUserNum: '',
          taEnshrineUserNum: '',
          taShareFoodNum: '',
          taJoinFoodNum: '',
          taAuditFoodNum: '',
        }
      }
    },
    methods: {
      async getInfo() {
        const res = await this.$http('foodfundraising.FundraisingActivity/queryActivityInfo', {taId: this.baseInfo.taId});
        Object.assign(this.baseInfo, res.obj);
        this.collectDate = [res.obj.taStartCollect, res.obj.taEndCollect];
        this.auditDate = [res.obj.taStartAudit, res.obj.taEndAudit];
        this.voteDate = [res.obj.taStartVote, res.obj.taEndVote];
        this.publishDate = [res.obj.taStartPublish, res.obj.taEndPublish];
        this.dateChange('collect');
        this.dateChange('audit');
        this.dateChange('vote');
        this.dateChange('publish');
      },
      dateChange(type) {
        const date = this[type + 'Date'];
        if (!date || !date.length) {
          this[type + 'Days'] = '';
        } else {
          this[type + 'Days'] = this.$day(date[1]).diff(this.$day(date[0]), 'day') + 1;
        }
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
    height: 30px;
    line-height: 5px;
  }
}

.btn-footer {
  text-align: center;
}
.label-1 {
  width: 130px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 210px;
}

.label-3, h3 {
  margin-left: 22px;
}
</style>
