<template>
  <div class="page-container">
    <div v-if="counselor.rejectRemarks && counselor.status === '01'" style=" margin: 12px 0;">
      <div class="reject-title">驳回信息</div>
      <div class="reject-box">
        <span>{{ counselor.rejectRemarks }}</span>
      </div>
    </div>

    <div>
      <div class="detail-section display-flex">
        <div class="info-item" style="width: 40%;">
          <span class="section-label">姓名：</span>
          <span>{{ counselor.counselorName }}</span>
        </div>
        <div class="info-item">
          <span class="section-label section-label-2">邀请码：</span>
          <span>{{ counselor.invitationCode }}</span>
        </div>
      </div>
      <div class="detail-section display-flex">
        <div class="info-item" style="width: 40%;">
          <span class="section-label">手机号：</span>
          <span>{{ counselor.counselorPhone }}</span>
        </div>
        <div class="info-item">
          <span class="section-label section-label-2">所属渠道经理名称：</span>
          <span>{{ counselor.parentCounselorName }}</span>
        </div>
      </div>
      <div class="detail-section display-flex">
        <div class="info-item" style="width: 40%;">
          <span class="section-label">身份证号：</span>
          <span>{{ counselor.idCardNumber }}</span>
        </div>
        <div class="info-item">
          <span class="section-label section-label-2">所属渠道客户经ID：</span>
          <span>{{ counselor.parentCounselorId }}</span>
        </div>
      </div>
      <div class="detail-section">
        <div class="info-item">
          <span class="section-label">邮箱地址：</span>
          <span>{{ counselor.mailBox }}</span>
        </div>
      </div>
      <div class="info-item detail-section display-flex">
        <span class="section-label vertical-top">身份证正反面</span>
        <div class="image-box-wrap">
          <div
            class="card-image-box"
            v-for="(img, index) in counselor.idCardImageList"
            :key="index"
          >
            <el-image
              class="certificate-img"
              :preview-src-list="[img.imageUrl]"
              :src="img.imageUrl"
            ></el-image>
          </div>
        </div>
      </div>
      <div class="detail-section">
        <div class="info-item">
          <span class="section-label">银行卡号：</span>
          <span>{{ counselor.bankCardNumber }}</span>
        </div>
      </div>
      <div class="info-item detail-section">
        <div>
          <span class="section-label">开户银行：</span>
          <span>{{ counselor.bankName }}</span>
        </div>
      </div>
      <div class="info-item detail-section">
        <div>
          <span class="section-label">开户支行：</span>
          <span>{{ counselor.bankBranch }}</span>
        </div>
      </div>
      <div class="info-item detail-section">
        <div>
          <span class="section-label">纳税人类型：</span>
          <span>{{ counselor.taxpayerType }}</span>
        </div>
      </div>
      <div class="info-item detail-section">
        <div>
          <span class="section-label">开户人姓名：</span>
          <span>{{ counselor.accountName }}</span>
        </div>
      </div>
      <div class="info-item detail-section display-flex">
        <span class="section-label" style="vertical-align: top;">银行卡照片</span>
        <div class="image-box-wrap">
          <div
            class="card-image-box"
            v-for="(img, index) in counselor.backCardImageList"
            :key="index"
          >
            <el-image
              class="certificate-img"
              :preview-src-list="[img.imageUrl]"
              :src="img.imageUrl"
            ></el-image>
          </div>
        </div>
      </div>
      <div class="info-item detail-section display-flex">
        <span class="section-label" style="vertical-align: top;">专业证书</span>
        <div class="image-box-wrap">
          <div class="card-image-box" v-for="(img, index) in counselor.imageUrlList" :key="index">
            <el-image
              class="certificate-img"
              :preview-src-list="[img.imageUrl]"
              :src="img.imageUrl"
            ></el-image>
          </div>
        </div>
      </div>
      <!-- <div class="detail-section">
        <span class="section-label">专业证书</span>
        <el-image></el-image>
        <el-image></el-image>
      </div>-->
    </div>
    <div class="detail-footer">
      <el-button type="success" @click="passReviewClick" v-if="counselor.status === '02'">通过</el-button>
      <el-button type="warning" @click="rejectReviewClick" v-if="counselor.status === '02'">驳回</el-button>
      <el-button type="info" @click="cancelClick">取消</el-button>
    </div>
    <confirm-dialog
      title="驳回备注"
      v-model="rejectDialogVisible"
      @on-confirm="handleRejectConfirm"
      center
    >
      <el-input ref="reject" type="textarea" v-model="rejectMessage" :rows="4" maxlength="200"></el-input>
    </confirm-dialog>
  </div>
</template>

<script>
import ConfirmDialog from '@/components/ConfirmDialog.vue';

export default {
  components: {
    ConfirmDialog
  },
  data() {
    return {
      pageStatus: '0',
      counselor: {},
      rejectDialogVisible: false,
      rejectMessage: ''
    };
  },
  methods: {
    getCounselorDetail(id) {
      this.$request('Motion/getCounselorApplicationInfo', { id, marketType: '02', }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.counselor = res.result;
          }
        })
      );
    },
    // updateCounselorStatus(params) {
    //   return this.$request('Motion/setCounselorApplicationStt', params);
    // },
    passReviewClick() {
      this.$request('Motion/passCounselorApplication', {
        id: this.counselor.id,
        marketType: '02',
      }).then(this.$rw((err) => {
        if (!err) {
          this.$message({
            message: '审核通过成功',
            type: 'success'
          });
          this.$closeRoute();
        }
      }));
    },
    handleRejectConfirm() {
      if (!this.rejectMessage) {
        this.$message({
          message: '请输入驳回备注',
          type: 'error'
        });
        return;
      }

      this.$request('Motion/refuseCounselorApplication', {
        id: this.counselor.id,
        remarks: this.rejectMessage,
        marketType: '02',
      }).then(this.$rw((err) => {
        if (!err) {
          this.$message({
            message: '审核驳回成功',
            type: 'success'
          });

          this.rejectDialogVisible = false;
          this.$closeRoute();
        }
      }));
    },
    rejectReviewClick() {
      this.rejectDialogVisible = true;
      this.rejectMessage = '';
      this.$nt(() => {
        this.$refs.reject.focus();
      });
    },
    cancelClick() {
      this.$closeRoute();
    }
  },
  created() {
    const { id } = this.$route.query;
    // if (status) this.pageStatus = status;
    if (id) this.getCounselorDetail(id);
  }
};
</script>

<style lang="less" scoped>
@import "../../../../styles/base.less";

.vertical-top {
  vertical-align: top;
}

.section-label {
  display: inline-block;
  width: 140px;
  min-width: 140px;
  margin-right: 12px;
  text-align: right;
}

.section-label-2 {
  text-align: left;
}

.detail-section {
  margin: 22px 0;
}

.card-image-box {
  margin: 0 0 8px 12px;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 3px;
  display: inline-block;

  .certificate-img {
    max-width: 300px;
    max-height: 160px;
  }
}

.info-item {
  white-space: nowrap;
  overflow: hidden;
}

.reject-title {
  color: @danger-color;
}

.detail-footer {
  text-align: center;
}

.reject-box {
  border: 1px solid @danger-color;
  color: @danger-color;
  text-align: center;
  border-radius: 3px;
  padding: 14px 12px;
}

.image-box-wrap {
  overflow-y: auto;
}
</style>
