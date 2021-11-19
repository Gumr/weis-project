<template>
  <div class="page-container">
    <h2>基础信息</h2>
    <el-form ref="form" :model="prize" :rules="prizeRules" label-width="160px">
      <el-form-item label="券模板类别选择：" prop="tcsType">
        <BaseSelect v-model="prize.tcsType" :options="prizeTypeOptions"></BaseSelect>
      </el-form-item>
      <el-form-item label="使用门槛：" prop="tcsRestrictAmount" v-if="prize.tcsType == '02'">
        <el-input
          class="base-input"
          maxlength="30"
          placeholder="使用门槛"
          v-model="prize.tcsRestrictAmount"
          @keydown="catchNonNumberKeydown"
        ></el-input>
        <span class="line-height-40">元</span>
      </el-form-item>
      <el-form-item label="券模板名称：" prop="tcsName">
        <el-input class="base-input" maxlength="30" placeholder="输入券模板名称" v-model="prize.tcsName"></el-input>
      </el-form-item>
      <el-form-item label="券模板面额：" prop="tcsAmount">
        <el-input
          class="base-input"
          placeholder="输入券模板面额"
          v-model="prize.tcsAmount"
          @input="handleAmountInput"
          @keydown="catchNonNumberKeydown"
        ></el-input>
        <span class="line-height-40">元</span>
      </el-form-item>
      <el-form-item label="券模板有效期：" prop="tcsPeriodValid">
        <el-input
          class="base-input"
          placeholder="输入券模板有效期"
          v-model="prize.tcsPeriodValid"
          @keydown="catchNonIntKeydown"
        ></el-input>
        <span class="line-height-40">天</span>
      </el-form-item>
      <el-form-item label="券模板简介：" prop="tcsIntro">
        <el-input
          class="base-input"
          v-model="prize.tcsIntro"
          placeholder="输入券模板简介"
          type="textarea"
          :rows="4"
        ></el-input>
      </el-form-item>
    </el-form>
    <footer class="inline-center">
      <el-button type="primary" @click="confirmClick">确认</el-button>
      <el-button @click="cancelClick">取消</el-button>
    </footer>
  </div>
</template>

<script>
import ReturnButton from '@/components/ReturnButton.vue';
import { catchNonIntKeydown, catchNonNumberKeydown, DecimalRegExp } from '@/utils/event-catcher';

export default {
  components: {
    ReturnButton
  },
  props: {
    mode: {
      default: 'create',
      type: String
    }
  },
  data() {
    return {
      prize: {
        tcsName: '',
        tcsType: '',
        tcsAmount: '',
        tcsPeriodValid: '',
        tcsIntro: '',
        tcsRestrictAmount: '',
        tcsStackable: 2,
      },
      prizeRules: {
        tcsType: {
          type: 'string',
          required: true,
          trigger: 'change',
        },
        tcsName: {
          type: 'string',
          required: true,
          trigger: 'blur',
          message: '请输入券模板名称'
        },
        tcsAmount: {
          type: 'string',
          required: true,
          trigger: 'blur',
          validator: (rule, value, callback) => {
            value = Number(value);
            // eslint-disable-next-line
            if (isNaN(value)) {
              callback('请输入数字');
            } else if (value <= 0) {
              callback('优惠金额需要大于0');
            } else {
              callback();
            }
          }
        },
        tcsRestrictAmount: {
          type: 'string',
          required: true,
          trigger: 'blur',
          message: '请输入门槛'
          // validator: (rule, value, callback) => {
          //   value = Number(value);
          //   // eslint-disable-next-line
          //   if (isNaN(value)) {
          //     callback('请输入数字');
          //   } else if (value < 0) {
          //     callback('有效期需要大于0');
          //   } else {
          //     callback();
          //   }
          // }
        },
        tcsPeriodValid: {
          type: 'string',
          required: true,
          trigger: 'blur',
          validator: (rule, value, callback) => {
            value = Number(value);
            // eslint-disable-next-line
            if (isNaN(value)) {
              callback('请输入数字');
            } else if (value < 0) {
              callback('有效期需要大于0');
            } else {
              callback();
            }
          }
        },
        tcsIntro: {
          type: 'string',
          required: true,
          trigger: 'blur',
          message: '请输入券模板简介'
        }
      },
      prizeTypeOptions: [],
    };
  },
  methods: {
    catchNonNumberKeydown,
    catchNonIntKeydown,
    handleAmountInput(amount) {
      amount = amount.match(DecimalRegExp);
      amount = (amount && amount[0]);
      this.prize.tcsAmount = amount;
    },
    cancelClick() {
      this.$confirm('确认取消添加券模板吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$closeRoute();
      });
    },
    getCouponInfo() {
      const hander = (err, data) => {
        if (!err) {
          data = [
            'tcsId',
            'tcsName',
            'tcsType',
            'tcsAmount',
            'tcsPeriodValid',
            'tcsIntro',
            'tcsRestrictAmount'
          ].reduce((d, p) => {
            d[p] = data[p];
            return d;
          }, {});

          this.prize = {
            ...this.prize,
            ...data
          };
        }
      };

      this.$request('coupon.Coupon/getCouponInfo', {
        tcsId: this.$route.query.id
      }).then(this.$rw(hander));
    },
    confirmClick() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.handleConfirm();
        }
      });
    },
    handleConfirm() {
      const method = this.mode === 'edit'
        ? this.updatePrize
        : this.createPrize;

      method().then(this.$rw((err) => {
        if (!err) {
          this.$message({
            type: 'success',
            message: '添加券模板成功'
          });
          this.$closeRoute();
        }

        this.$errorNotify(err);
      }));
    },
    createPrize() {
      const params = this.$deepClone(this.prize);
      params.tcsRestrictAmount = this.prize.tcsType == '01' ? Number(params.tcsAmount) + 0.01 : params.tcsRestrictAmount;
      return this.$request('coupon.Coupon/addCoupon', params);
    },
    updatePrize() {
      const params = this.$deepClone(this.prize);
      params.tcsRestrictAmount = this.prize.tcsType == '01' ? Number(params.tcsAmount) + 0.01 : params.tcsRestrictAmount;
      return this.$request('coupon.Coupon/couponEdit', {
        tcsId: this.$route.query.id,
        ...params
      });
    },
    getTypeOptions() {
      this.$request('coupon.Coupon/getStateInfo', {})
        .then(this.$rw((err, data) => {
          if (!err) {
            this.prizeTypeOptions = data.coupontype
            // this.prizeTypeOptions = data.coupontype.filter(({ value }) => value !== '02');
            if (!this.prize.tcsType) {
              const tcsType = this.prizeTypeOptions[0];
              this.prize.tcsType = tcsType && tcsType.value;
            }
          }
        }));
    }
  },
  created() {
    this.getTypeOptions();
    if (this.mode === 'edit') {
      this.getCouponInfo();
    }
  }
};

</script>

<style lang="less" scoped>
.line-height-40 {
  line-height: 40px;
}

.base-section {
  margin: 14px 0;
}

.base-label {
  display: inline-block;
  flex-basis: 40%;
  text-align: right;
}

.base-input {
  width: 320px;
}
</style>
