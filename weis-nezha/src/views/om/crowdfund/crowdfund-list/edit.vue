<template>
  <div class="page-container">
    <section>
      <div class="section-item">
        <span class="section-label label-1">活动期数：</span>
        <span>第{{taPhase}}期</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">活动名称：</span>
        <el-input clearable class="medium-input" placeholder="活动名称" v-model="taName"></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">征集期周期：</span>
        <el-date-picker
          type="daterange"
          value-format="yyyyMMdd"
          :picker-options="pickerOptions"
          class="medium-input"
          v-model="collectDate"
          @change="dateChange('collect')"
        ></el-date-picker>
        <span v-if="collectDays">天数：{{collectDays}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">审核周期：</span>
        <el-date-picker
          type="daterange"
          value-format="yyyyMMdd"
          :picker-options="pickerOptions"
          class="medium-input"
          v-model="auditDate"
          @change="dateChange('audit')"
        ></el-date-picker>
        <span v-if="auditDays">天数：{{auditDays}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">投票周期：</span>
        <el-date-picker
          type="daterange"
          value-format="yyyyMMdd"
          :picker-options="pickerOptions"
          class="medium-input"
          v-model="voteDate"
          @change="dateChange('vote')"
        ></el-date-picker>
        <span v-if="voteDays">天数：{{voteDays}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">发布期：</span>
        <el-date-picker
          type="daterange"
          value-format="yyyyMMdd"
          :picker-options="pickerOptions"
          class="medium-input"
          v-model="publishDate"
          @change="dateChange('publish')"
        ></el-date-picker>
        <span v-if="publishDays">天数：{{publishDays}}</span>
      </div>
      <div class="section-item" v-if="taId">
        <span class="section-label label-1">当前状态：</span>
        <span>{{taSttDesc}}</span>
      </div>
    </section>
    <footer class="btn-footer">
      <el-button type="primary" :loading="loading" @click="handleConfrim">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </footer>
  </div>
</template>

<script>
  export default {
    name: 'crowdfund_crowdfund-list_edit',
    components: {
    },
    data() {
      return {
        pickerOptions: {
          disabledDate(v) {
            return v.getTime() < new Date().getTime() - 86400000;
          }
        },
        taId: '',
        taPhase: '',
        taPhaseDesc: '',
        taSttDesc: '',
        loading: false,
        taName: '',
        collectDate: [],
        collectDays: '',
        auditDate: [],
        auditDays: '',
        voteDate: [],
        voteDays: '',
        publishDate: [],
        publishDays: '',
      }
    },
    created() {
      this.taId = this.$route.query.id;
      if (this.taId) {
        this.getInfo();
      } else {
        this.getPhase();
      }
    },
    methods: {
      async getPhase() {
        const res = await this.$http('foodfundraising.FundraisingActivity/getPhase', {});
        this.taPhase = res.obj.taPhase;
        this.taPhaseDesc = res.obj.taPhaseDesc;
      },
      async getInfo() {
        const res = await this.$http('foodfundraising.FundraisingActivity/queryActivityInfo', {taId: this.taId});
        this.taId = res.obj.taId;
        this.taPhase = res.obj.taPhase;
        this.taPhaseDesc = res.obj.taPhaseDesc;
        this.taSttDesc = res.obj.taSttDesc;
        this.taName = res.obj.taName;
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
      async handleConfrim() {
        if (!this.taName) {
          this.$msg('请输入活动名称', 'error');
          return;
        }
        if (!this.collectDate || !this.collectDate.length) {
          this.$msg('请选择征集期周期', 'error');
          return;
        }
        if (!this.auditDate || !this.auditDate.length) {
          this.$msg('请选择审核周期', 'error');
          return;
        }
        if (!this.voteDate || !this.voteDate.length) {
          this.$msg('请选择投票周期', 'error');
          return;
        }
        if (!this.publishDate || !this.publishDate.length) {
          this.$msg('请选择发布周期', 'error');
          return;
        }
        this.loading = true;
        const dateFormat = (date) => {
          return this.$day(date).format('YYYYMMDD')
        }

        const params = {
          taPhase: this.taPhase,
          taName: this.taName,
          taStartCollect: dateFormat(this.collectDate[0]),
          taEndCollect: dateFormat(this.collectDate[1]),
          taStartAudit: dateFormat(this.auditDate[0]),
          taEndAudit: dateFormat(this.auditDate[1]),
          taStartVote: dateFormat(this.voteDate[0]),
          taEndVote: dateFormat(this.voteDate[1]),
          taStartPublish: dateFormat(this.publishDate[0]),
          taEndPublish: dateFormat(this.publishDate[1]),
        };
        if (this.taId) {
          params.taId = this.taId;
        }
        const res = await this.$http('foodfundraising.FundraisingActivity/updateActivity', params);
        this.loading = false;
        if (!res.errMsg) {
          this.$msg('添加成功', 'success');
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

<style lang="less" scoped>
.label-1 {
  width: 100px;
  margin-right: 12px;
  text-align: right;
}
</style>
