<template>
  <div class="page-container">
    <section>
      <div class="section-item">
        <span class="section-label label-1">规则名称：</span>
        <el-input clearable class="medium-input" placeholder="请输入规则名称" v-model="infolist.name"></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">规则描述：</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入规则描述"
          type="textarea"
          rows="6"
          v-model="infolist.intro"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">规则配置：</span>
        <span style="margin-right: 20px;">购买充值卡时</span>
        <el-button type="primary" style="width: 125px;" @click="addRule">添加</el-button>
      </div>
      <div class="section-item" v-for="(item, index) in infolist.rule">
        <div class="rule">
          <el-input
            clearable
            class="tiny-input"
            maxlength="10"
            v-model="item.startAmount"
            @blur="
              () => validateRechargeInput(item.startAmount, index, 'input')
            "
            @keydown="catchNonIntKeydown"
          ></el-input>
          <span style="width: 140px;display: inline-block;text-align-last:justify">
            &lt;
            <span>=</span> 支付总金额 &lt;
          </span>
          <el-input
            clearable
            class="tiny-input"
            maxlength="10"
            v-model="item.endAmount"
            @blur="() => validateRechargeInput(item.endAmount, index, 'input')"
            @keydown="catchNonIntKeydown"
          ></el-input>
          <span>赠送</span>
          <el-input
            clearable
            class="tiny-input"
            style="margin-right: 10px;"
            maxlength="10"
            @blur="() => discountBlur(index)"
            v-model="item.discount"
            @keydown="catchNonNumberKeydown"
          ></el-input>%
          <el-button
            style="margin-left: 10px; height: 38px;"
            type="danger"
            @click="delRule(index)"
          >删除</el-button>
        </div>
      </div>
    </section>
    <footer class="btn-footer">
      <el-button type="primary" @click="submit" :loading="loading">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </footer>
  </div>
</template>

<script>
import { catchNonIntKeydown, catchNonNumberKeydown } from '@/utils/event-catcher';

export default {
  components: {
  },
  props: {
    mode: String
  },
  data() {
    return {
      loading: false,
      infolist: {
        id: '',
        name: '',
        intro: '',
        rule: [{
          startAmount: '',
          endAmount: '',
          discount: ''
        }]
      },
      type: ''
    };
  },
  created() {
    this.type = this.$route.query.type;
    if (this.type === 'edit') {
      this.infolist.id = this.$route.query.id;
      this.getInfo();
    }
  },
  methods: {
    discountBlur(index) {
      const { discount } = this.infolist.rule[index];
      const idx = discount.indexOf('.');
      if (idx !== -1) {
        this.infolist.rule[index].discount = discount.slice(0, idx + 3);
      }
    },
    validateRechargeInput(val, index, type) {
      if (!val) return;
      val = +val;
      const valid = this.infolist.rule.some(({ startAmount, endAmount }, i) => i !== index && Number(startAmount) < Number(val) && Number(val) < Number(endAmount));
      if (valid && type === 'input') {
        this.$message({
          type: 'error',
          message: `充值配置第${index + 1}项的充值范围已被配置`
        });
      }
      return valid;
    },
    catchNonNumberKeydown,
    catchNonIntKeydown,
    addRule() {
      this.infolist.rule.push({
        startAmount: '',
        endAmount: '',
        discount: ''
      });
    },
    delRule(index) {
      if (this.infolist.rule.length === 1) return;
      this.infolist.rule.splice(index, 1);
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
      this.$request('card.DiscountRule/get', { id: this.infolist.id }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.infolist, dataPage);
          }
        })
      );
    },
    submit() {
      const params = this.$deepClone(this.infolist);
      if (!params.name) {
        this.$message({ type: 'error', message: '请输入规则名称！' });
        return;
      }
      if (!params.intro) {
        this.$message({ type: 'error', message: '请输入描述！' });
        return;
      }
      params.rule = [];
      let sValid = false;
      let eValid = false;
      for (const i in this.infolist.rule) {
        const rule = this.infolist.rule[i];
        if (rule.startAmount == '' || rule.endAmount == '') {
          this.$message({ type: 'error', message: '规则金额不能为空！' });
          console.log(1);
          return;
        }
        if (Number(rule.startAmount) >= Number(rule.endAmount)) {
          this.$message({ type: 'error', message: '规则金额设置错误！' });
          return;
        }
        if (Number(rule.discount) > 100 || Number(rule.discount) < 0 || rule.discount == '') {
          this.$message({ type: 'error', message: '赠送信息错误！' });
          return;
        }
        sValid = this.validateRechargeInput(rule.startAmount, Number(i), 'submit');
        eValid = this.validateRechargeInput(rule.endAmount, Number(i), 'submit');
        if (sValid || eValid) {
          this.$message({ type: 'error', message: '规则项被覆盖' });
          return;
        }
        params.rule.push(rule);
      }
      if (!params.rule.length) {
        this.$message({ type: 'error', message: '请配置规则！' });
        return;
      }
      this.loading = true;
      const url = {
        create: 'card.DiscountRule/add',
        edit: 'card.DiscountRule/edit',
      }[this.type];
      this.$request(url, params).then(
        this.$rw((err) => {
          this.loading = false;
          if (!err) {
            this.$closeRoute();
            this.$message({ type: 'success', message: '操作成功！' });
          } else {
            this.$msg(err.errMsg, 'erorr');
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
.rule {
  padding-left: 110px;
}
.tiny-input {
  width: 150px;
  margin: 0 20px;
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
  button {
    height: 30px;
    line-height: 5px;
  }
}

.btn-footer {
  text-align: center;
}

.label-1 {
  width: 120px;
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
