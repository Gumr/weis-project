<template>
  <div class="page-container">
    <section>
      <h2>基础配置</h2>
      <el-form
        ref="baseForm"
        :rules="baseConfigRules"
        :model="baseConfig"
        label-width="80px"
        status-icon
      >
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="baseConfig.actname" placeholder="请输入活动名称"></el-input>
        </el-form-item>
        <el-form-item label="起始时间" prop="date">
          <el-date-picker v-model="baseConfig.date" type="daterange"></el-date-picker>
        </el-form-item>
      </el-form>
      <div>
        <span class="base-item-label">活动周期</span>
        <span>{{ activityCycle }}</span>
        <span>天</span>
      </div>
    </section>
    <section>
      <h2>充值配置</h2>
      <div class="display-flex pay-item-wrap" v-for="(item, index) in payConfigList" :key="index">
        <div class="display-flex pay-item">
          <span class="pay-item-label" style="margin-right: 8px;">充值金额</span>
          <el-input
            v-model="item.sSection"
            @blur="() => validateRechargeInput(item.sSection, index)"
            @keydown="catchNonIntKeydown"
          ></el-input>
          <span class="pay-item-label" style="margin: 0 8px;">
            {{
            "<= 值 <"
            }}
          </span>
          <el-input
            v-model="item.eSection"
            @blur="() => validateRechargeInput(item.sSection, index)"
            @keydown="catchNonIntKeydown"
          ></el-input>
        </div>
        <div class="display-flex pay-item">
          <span class="pay-item-label" style="margin-right: 8px;">赠送比例</span>
          <el-input v-model="item.donation" @keydown="catchNonNumberKeydown"></el-input>
          <span class="pay-item-label">%</span>
        </div>
        <div>
          <el-button type="danger" @click="deletePayConfigClick(index)">删除</el-button>
        </div>
      </div>
      <div>
        <el-button style="width: 100%;" type="info" @click="addPayConfigClick">添加</el-button>
      </div>
    </section>
    <footer class="btn-footer">
      <el-button type="primary" @click="confirmClick">确认</el-button>
      <el-button @click="cancel">取消</el-button>
    </footer>
  </div>
</template>

<script>
import { transformDaterange } from '@/utils/transform';
import { catchNonIntKeydown, catchNonNumberKeydown } from '@/utils/event-catcher';

function PayConfig() {
  this.sSection = '';
  this.eSection = '';
  this.donation = '';
}

export default {
  components: {
  },
  computed: {
    activityCycle() {
      const { date } = this.baseConfig;
      if (!date || date.length <= 0) return 0;

      return Math.ceil((date[1] - date[0]) / 86400000);
    }
  },
  data() {
    return {
      baseConfig: {
        actname: '',
        date: []
      },
      baseConfigRules: {
        actname: [{
          required: true,
          type: 'string',
          trigger: 'blur',
          message: '请输入活动名称'
        }],
        date: [{
          required: true,
          type: 'array',
          trigger: 'blur',
          message: '请选择活动区间'
        }]
      },
      payConfigList: [new PayConfig()]
    };
  },
  methods: {
    getActivityData() {
      this.$request('BusinessActivities/getActivityInfo', {
        id: this.$route.query.id
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.act = data.obj;
        }
      });
    },
    confirmClick() {
      if (this.payConfigList.length <= 0) {
        this.$message({
          type: 'error',
          message: '请至少配置一项充值配置！'
        });
        return;
      }

      this.$refs.baseForm.validate((valid) => {
        if (valid) {
          const payConfigValid = this.validatePayConfigList();
          if (payConfigValid === -1) {
            this.addActivity();
          } else {
            this.$message({
              type: 'error',
              message: `充值配置第${payConfigValid + 1}项还未配置完整`
            });
          }
        }
      });
    },
    deletePayConfigClick(index) {
      this.payConfigList.splice(index, 1);
    },
    addPayConfigClick() {
      this.payConfigList.push(new PayConfig());
    },
    validatePayConfigList() {
      return this.payConfigList.findIndex(item => !(Object.keys(item).every(key => item[key])));
    },
    validateRechargeInput(val, index) {
      if (!val) return;
      val = +val;
      const valid = this.payConfigList.some(({ sSection, eSection }, i) => i !== index && sSection < val && val < eSection);

      if (valid) {
        this.$message({
          type: 'error',
          message: `充值配置第${index + 1}项的充值范围已被配置`
        });
      }
    },
    // 添加活动
    addActivity() {
      const [statimr, endtimr] = transformDaterange(this.baseConfig.date);

      const activity = {
        actname: this.baseConfig.actname,
        statimr: statimr.format('YYYY-MM-DD'),
        endtimr: endtimr.format('YYYY-MM-DD'),
        period: this.activityCycle,
        discounts: this.payConfigList
      };

      this.$request('BusinessActivities/addActivity', activity)
        .then(({ data }) => {
          if (data.errCode === 0) {
            this.$message({
              type: 'success',
              message: '添加活动成功'
            });
            this.$router.back();
          }
        });
    },
    catchNonNumberKeydown,
    catchNonIntKeydown,
    cancel() {
      this.$confirm('确定取消？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        console.log('点击确定');
        this.$closeRoute();
      }).catch(() => {
        console.log('点击取消');
      });
    },
  }
};
</script>

<style lang="less" scoped>
.pay-item {
  margin: 0 12px;
}

.pay-item-label {
  white-space: nowrap;
  line-height: 40px;
}

.pay-item-wrap {
  margin: 12px 0;
}

.base-item-label {
  display: inline-block;
  width: 68px;
  font-size: 14px;
  padding-right: 12px;
  text-align: right;
}

.btn-footer {
  margin: 12px 0;
  text-align: center;
}
</style>
