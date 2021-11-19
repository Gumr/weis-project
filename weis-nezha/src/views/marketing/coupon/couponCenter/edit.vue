<template>
  <div class="page-container">
    <section>
      <div class="section-item">
        <h3 class="section-label label-1">活动名称：</h3>
        <el-input
          v-model="formData.name"
          clearable
          class="medium-input"
        ></el-input>
      </div>
      <div class="section-item">
        <h3 class="section-label label-1">活动周期：</h3>
        <el-date-picker
          v-model="formData.date"
          class="medium-input"
          type="daterange"
        ></el-date-picker>
      </div>
      <div class="section-item">
        <h3 class="section-label label-1">活动内容:</h3>
        <el-button
          icon="el-icon-plus"
          type="primary"
          size="small"
          @click="contentAdd"
        >添加内容</el-button>
      </div>
      <div
        v-for="(item, index) in formData.coupon"
        :key="index"
        class="bgcontent"
      >
        <el-button
          type="danger"
          class="delbtn"
          @click="batchSync(index)"
          icon="el-icon-delete"
        >删除</el-button>
        <span class="section-label label-1">领券时间段:</span>
        <el-time-select
          placeholder="起始时间"
          v-model="item.restrictGetStartDate"
          start='00:00'
          step='01:00'
          end='24:00'
        >
        </el-time-select>
        <el-time-select
          placeholder="结束时间"
          v-model="item.restrictGetEndDate"
          start='00:00'
          step='01:00'
          end='24:00'
          :minTime="item.restrictGetStartDate"
        >
        </el-time-select>
        <div class="section-item ">
          <span class="section-label label-1">奖券配置:</span>
          <el-button
            icon="el-icon-plus"
            type="primary"
            size="small"
            @click="showDio(index)"
          >添加奖券</el-button>
        </div>
        <div class="section-item">
          <div class="coupon">
            <div
              v-for="(item2, index) in item.activityCoupon"
              :key="index"
              class="coupon-item"
            >
              <div class="c-item">
                <h4>{{ item2.couponName }}</h4>
                <div>
                  <span @click="couponUpd(index)">编辑</span>
                  <span @click="couponDel(index)">删除</span>
                </div>
              </div>
              <div class="c-item">
                <div>奖券类型：现金券</div>
                <div>张数：{{ item2.count}}</div>
              </div>
              <div class="c-item">
                <div>面额：{{ item2.tcsAmount }}元</div>
                <div>互斥条件：{{ item2.isReject == 1 ? '不可与维士红包叠加' : '可以与维士红包叠加' }}</div>
              </div>
              <div class="c-item">
                <div>生效日期：{{ item2.takeEffect == 0 ? '即时生效' : (item2.takeEffect == 1 ? '次日生效' : item2.takeEffect) }}</div>
                <div>失效日期：{{ item2.loseEfficacySign == '00' ? '模板有效期' : item2.loseEfficacyData }}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <footer class="btn-footer">
        <el-button
          type="primary"
          :loading="loading"
          @click="submit"
        >确定</el-button>
        <el-button
          type="danger"
          @click="cancel"
        >取消</el-button>
      </footer>
      <!-- 弹出层 -->
      <ConfirmDialog
        v-model="dialogVisible"
        title="配置奖券"
        :close-on-click-modal="false"
        :auto-confirm="false"
        :async-confirm="true"
        @on-confirm="tagConfirm"
      >
        <div class="section-item">
          <span class="section-label label-1">选择奖券类型：</span>
          <el-radio-group v-model="current.type">
            <el-radio :label="1">现金券</el-radio>
          </el-radio-group>
        </div>
        <div class="section-item">
          <span class="section-label label-1">选择模板：</span>
          <BaseSelect
            v-model="current.couponId"
            class="medium-input"
            :options="modelOptions"
            @change="change"
          ></BaseSelect>
        </div>

        <div class="section-item">
          <span class="section-label label-1">输入发行张数：</span>
          <NumberInput
            v-model="current.count"
            clearable
            class="medium-input"
            @keydown="catchNonIntKeydown"
            @blur="checkText"
          ></NumberInput>
        </div>
        <div class="section-item">
          <span class="section-label label-1">生效时间：</span>
          <el-radio-group
            v-model="dateRadio"
            @change="dateRadioChange"
          >
            <el-radio :label="0">即时生效</el-radio>
            <el-radio :label="1">次日生效</el-radio>
            <el-radio :label="2">指定日期生效</el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="dateRadio == 2"
          class="section-item"
        >
          <span class="section-label label-1">输入日期：</span>
          <date-picker
            v-model="current.takeEffect"
            class="medium-input"
            value-format="YYYY-MM-DD"
          ></date-picker>
        </div>
        <div class="section-item">
          <span class="section-label label-1">互斥条件：</span>
          <el-radio-group v-model="current.isReject">
            <el-radio :label="1">不可与维士红包叠加</el-radio>
            <el-radio :label="2">可以与维士红包叠加</el-radio>
          </el-radio-group>
        </div>
        <div class="section-item">
          <span class="section-label label-1">失效日期：</span>
          <el-radio-group v-model="effectRadio">
            <el-radio label="00">按模板有效期计算</el-radio>
            <el-radio label="01">指定失效日期</el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="effectRadio == '01'"
          class="section-item"
        >
          <span class="section-label label-1">输入日期：</span>
          <date-picker
            v-model="current.loseEfficacyData"
            class="medium-input"
            value-format="YYYY-MM-DD"
          ></date-picker>
        </div>
      </ConfirmDialog>
    </section>

  </div>
</template>

<script>
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import BaseSelect from "@/components/BaseSelect.vue";

export default {
  components: {
    BaseSelect,
    ConfirmDialog,
  },
  data() {
    return {
      type: "",
      activityId: "",
      isindex: 0,
      effectRadio: "00",
      dateRadio: 0,
      formData: {
        name: "",
        date: [],
        coupon: [],
      },

      dialogVisible: false,
      modelOptions: [],
      current: {
        type: "",
        couponId: "",
        isReject: 2,
        count: "",
        tcsAmount: "",
        takeEffect: "",
        guid: "",
        loseEfficacyData: "",
      },
    };
  },
  created() {
    this.getCoupon();
    this.activityId = this.$route.query.id;
    if (this.activityId) {
      this.type = "edit";
      this.getInfo();
    }
  },

  methods: {
    // 获取详情
    getInfo() {
      this.$request("coupon.Hotlist/getActivityInfo", {
        activityId: this.activityId,
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            Object.assign(this.formData, res);
            this.formData.date = [res.startTime, res.endTime];
            this.formData.coupon.forEach((item) => {
              item.restrictGetStartDate = item.restrictGetStartDate + ":00";
              item.restrictGetEndDate = item.restrictGetEndDate + ":00";
            });
            this.couponOptions = this.formData.coupon.map((item) => ({
              value: item.guid,
              label: item.couponName,
            }));
          } else {
            this.$message({ type: "error", message: err.errMsg });
          }
        })
      );
    },
    couponDel(index) {
      const isindex = this.isindex;
      const guid = this.formData.coupon[isindex].activityCoupon[index].guid;
      this.formData.coupon.forEach((item) => {
        if (item.guidInvite == guid) {
          item.condition = "";
          item.guidInvite = "";
          item.userCount = "";
          item.inviteCount = "";
        }
        if (item.guidUser == guid) {
          item.condition = "";
          item.guidUser = "";
          item.userCount = "";
          item.inviteCount = "";
        }
      });
      this.formData.coupon[isindex].activityCoupon.splice(index, 1);
      this.couponOptions = this.formData.coupon[isindex].activityCoupon.map(
        (item) => ({
          value: item.guid,
          label: item.couponName,
        })
      );
    },
    // 编辑奖券
    couponUpd(index) {
      const isindex = this.isindex;
      const item = this.formData.coupon[isindex].activityCoupon[index];
      let takeEffect = item.takeEffect;
      this.dateRadio = 2;
      
      if (item.takeEffect == 0 || item.takeEffect == 1) {
        takeEffect = "";
        this.dateRadio = Number(item.takeEffect);
      }
      this.effectRadio = item.loseEfficacySign;
      this.current = {
        couponName: item.couponName,
        type: 1,
        couponId: String(item.couponId),
        isReject: item.isReject,
        count: item.count,
        tcsAmount: item.tcsAmount,
        guid: item.guid,
        takeEffect,
        loseEfficacyData:
          item.loseEfficacySign == "00" ? "" : item.loseEfficacyData,
      };
      if (item.count == -1 || item.count == 2147483647) {
        this.countRadio = -1;
      } else {
        this.countRadio = 0;
      }
      this.dialogVisible = true;
    },
    cancel() {
      this.$closeRoute();
    },
    newGuid() {
      let guid = "";
      for (let i = 1; i <= 32; i++) {
        const n = Math.floor(Math.random() * 16.0).toString(16);
        guid += n;
        if (i == 8 || i == 12 || i == 16 || i == 20) {
          guid += "-";
        }
      }
      return guid;
    },
    batchSync(index) {
      this.formData.coupon.splice(index, 1);
    },
    // 添加奖品配置
    tagConfirm(done) {
      // if (!this.current.couponName) {
      //   this.$message({ type: 'error', message: '请输入奖券名称！' })
      //   done()
      //   return
      // }
      if (!this.current.couponId) {
        this.$message({ type: "error", message: "请选择模板！" });
        done();
        return;
      }
      if (!this.current.count) {
        this.$message({ type: "error", message: "请输入发行张数！" });
        done();
        return;
      }
      if (this.dateRadio == 2 && !this.current.takeEffect) {
        this.$message({ type: "error", message: "请输入指定日期！" });
        done();
        return;
      }
      if (this.effectRadio == "01" && !this.current.loseEfficacyData) {
        this.$message({ type: "error", message: "请输入指定日期！" });
        done();
        return;
      }
      const params = this.$deepClone(this.current);
      const isindex = this.isindex;
      params.takeEffect =
        this.dateRadio == 2 ? params.takeEffect : this.dateRadio;
      params.takeEffectSign = this.dateRadio == 2 ? "01" : "00";
      params.loseEfficacySign = this.effectRadio;
      const index = this.formData.coupon[isindex].activityCoupon.findIndex(
        (item) => item.guid == params.guid
      );

      if (index > -1) {
        this.formData.coupon[isindex].activityCoupon[index] = params;
        this.formData.coupon[isindex].activityCoupon.push({});
        this.formData.coupon[isindex].activityCoupon.pop();
      } else {
        this.formData.coupon[isindex].activityCoupon.push(params);
      }
      if (params.loseEfficacySign == "00") {
        params.loseEfficacyData = "";
      }
      this.couponOptions = this.formData.coupon[isindex].activityCoupon.map(
        (item) => ({
          value: item.guid,
          label: item.couponName,
        })
      );
      this.dialogVisible = false;
      setTimeout(() => {
        done();
      }, 300);
    },
    dateRadioChange(e) {
      this.current.takeEffect = "";
    },
    showDio(index) {
      this.current = {
        type: 1,
        couponName: "",
        couponId: "",
        isReject: 2,
        count: "",
        tcsAmount: "",
        takeEffect: "",
        loseEfficacyData: "",
        guid: this.newGuid(),
      };
      this.isindex = index;
      this.dialogVisible = true;
    },
    contentAdd() {
      this.formData.coupon.push({
        condition: "",
        restrictGetStartDate: "",
        restrictGetEndDate: "",
        activityCoupon: [],
      });
    },
    change(e) {
      const item = this.modelOptions.find((item) => item.value == e);
      this.current.couponName = item.label;
      this.current.tcsAmount = item.tcsAmount;
    },
    // 提交
    submit() {
      let params = this.$deepClone(this.formData);
      if (!params.name) {
        this.$message({ type: "error", message: "请输入活动名称！" });
        return;
      }
      if (!params.date.length) {
        this.$message({ type: "error", message: "请选择时间！" });
        return;
      }

      const valid = this.valid1(params);
      if (!valid) return;
      params.coupon.forEach((item) => {
        item.restrictGetStartDate = item.restrictGetStartDate.substring(0, 2);;
        item.restrictGetEndDate = item.restrictGetEndDate.substring(0, 2);
      });

      params.type = "06";
      params.activityId = this.activityId;
      params.startTime = this.$day(params.date[0]).format("YYYY-MM-DD");
      params.endTime = this.$day(params.date[1]).format("YYYY-MM-DD");

      this.$confirm("确认以上信息并提交？", "确认提交？", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      }).then(() => {
        // this.loading = true;
        this.handleSubmit(params);
      });
    },
    // 手动发券校验 value 01
    valid1(params) {
      for (const index in params.coupon) {
        const item = params.coupon[index];
        let num = 0;
        for (const inx in params.acquireCondition) {
          const it = params.acquireCondition[inx];
          if (!it.guidUser || !it.userCount) {
            this.$message({ type: "error", message: "请完善发券规则！" });
            return false;
          }
          if (it.guidUser == item.guid) {
            num += Number(it.userCount);
          }
          it.condition = 0;
          it.couponIdInvite = 0;
          it.inviteCount = 0;
        }
        if (item.count != -1 && num > item.count) {
          this.$message({ type: "error", message: "发放的奖券数大于配置数！" });
          return false;
        }
      }
      return true;
    },
    handleSubmit(params) {
      let url = "coupon.Hotlist/edit";
      this.loading = true;
      this.$request(url, params).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$message({ type: "success", message: "操作成功" });
            this.$closeRoute();
          } else {
            this.$message({ type: "error", message: err.errMsg });
          }
          this.loading = false;
        })
      );
    },
    // 获取优惠券
    getCoupon() {
      this.$request("coupon.Coupon/getCouponAll", {
        pageNo: 1,
        pageSize: 999,
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.modelOptions = dataPage.record.map((item) => ({
              label: `${item.tcsName}（${item.tcsAmount}元, 有效期:${item.tcsPeriodValid}天）`,
              value: item.tcsId,
              tcsAmount: item.tcsAmount,
            }));
          }
        })
      );
    },
  },
};
</script>

<style lang="less" scoped>
.btn-footer {
  margin-top: 80px;
}
.bgcontent {
  background: #f2f6fc;
  padding-top: 20px;
  padding-bottom: 20px;
  margin-top: 20px;
}
.delbtn {
  float: right;
  margin-right: 20px;
}
.section-item .coupon {
  margin-left: 100px;
  min-height: 10px;
  width: 920px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  .coupon-item {
    width: 450px;
    min-height: 130px;
    border: 1px solid #cccccc;
    margin-bottom: 20px;
    padding: 10px 0;
    box-sizing: border-box;
  }
  .c-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    padding: 0 10px;
    box-sizing: border-box;
    span {
      margin-right: 10px;
      color: #409eff;
      cursor: pointer;
      &:last-child {
        margin: 0;
      }
    }
  }
}
</style>