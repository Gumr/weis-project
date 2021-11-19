<template>
  <div>
    <h2>注册信息</h2>
    <div class="detail-section display-flex">
      <div class="section-item">
        <span class="section-label">用户昵称：</span>
        <span>{{ userInfo.registerInfo.uname || '无' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label">用户手机：</span>
        <span>{{ userInfo.registerInfo.phone || '无' }}</span>
      </div>
    </div>
    <div class="detail-section display-flex">
      <div class="section-item">
        <span class="section-label">用户类型：</span>
        <span>{{ userInfo.registerInfo.auth || '无' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label">注册时间：</span>
        <span>{{ userInfo.registerInfo.ctime || '无' }}</span>
      </div>
    </div>
    <div class="detail-section display-flex">
      <div class="section-item">
        <span class="section-label">来源：</span>
        <span>{{ userInfo.registerInfo.source || '无' }}</span>
      </div>
    </div>
    <div class="detail-section display-flex">
      <div class="section-item">
        <span class="section-label">渠道：</span>
        <span>{{ userInfo.registerInfo.channel || '无' }}</span>
      </div>
    </div>
    <h2>个人信息</h2>
    <div class="detail-section display-flex">
      <div class="section-item">
        <span class="section-label">姓名：</span>
        <span>{{ userInfo.registerInfo.uname || '无' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label">性别：</span>
        <span>{{ userInfo.personalInfo.sex || '无' }}</span>
      </div>
    </div>
    <div class="detail-section display-flex">
      <div class="section-item">
        <span class="section-label">年龄：</span>
        <span>{{ userInfo.personalInfo.age || '无' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label">体重：</span>
        <span
          class="section-label"
        >{{ userInfo.personalInfo.weight ? userInfo.personalInfo.weight + 'kg' : '无' }}</span>
        <span class="blue" @click="showDialog('4')">明细</span>
      </div>
    </div>
    <div class="detail-section display-flex">
      <div class="section-item">
        <span class="section-label">身高：</span>
        <span
          class="section-label"
        >{{ userInfo.personalInfo.stature ? userInfo.personalInfo.stature + 'cm' : '无' }}</span>
        <span class="blue" @click="showDialog('3')">明细</span>
      </div>
      <div class="section-item">
        <span class="section-label">体脂率：</span>
        <span
          class="section-label"
        >{{ userInfo.personalInfo.bodyFatRate ? userInfo.personalInfo.bodyFatRate + '%' : '无' }}</span>
        <span class="blue" @click="showDialog('5')">明细</span>
      </div>
    </div>
    <div class="detail-section display-flex">
      <div class="section-item">
        <span class="section-label">日常消耗活动：</span>
        <span class="section-label">{{ userInfo.personalInfo.motion || '无' }}</span>
        <span class="blue" @click="showDialog('6')">明细</span>
      </div>
      <div class="section-item">
        <span class="section-label">血糖：</span>
        <span
          class="section-label"
        >{{ userInfo.personalInfo.bloodGlucose ? userInfo.personalInfo.bloodGlucose + 'mmol/L' : '无' }}</span>
        <span class="blue" @click="showDialog('50')">明细</span>
      </div>
    </div>
    <div class="detail-section display-flex">
      <div class="section-item">
        <span class="section-label">BMI：</span>
        <span
          class="section-label"
        >{{ userInfo.personalInfo.bmi ? userInfo.personalInfo.bmi + '%' : '无' }}</span>
        <span class="blue" @click="showDialog('15')">明细</span>
      </div>
      <div class="section-item">
        <span class="section-label">血压值(高压)：</span>
        <span
          class="section-label"
        >{{ userInfo.personalInfo.bloodPressureH ? userInfo.personalInfo.bloodPressureH + 'mmHG' : '无' }}</span>
        <span class="blue" @click="showDialog('51')">明细</span>
      </div>
    </div>
    <div class="detail-section display-flex">
      <div class="section-item">
        <span class="section-label">我的签名：</span>
        <span>{{ userInfo.registerInfo.signature || '无' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label">血压值(低压)：</span>
        <span
          class="section-label"
        >{{ userInfo.personalInfo.bloodPressureL ? userInfo.personalInfo.bloodPressureL + 'mmHG' : '无' }}</span>
        <span class="blue" @click="showDialog('51')">明细</span>
      </div>
    </div>
    <div class="detail-section display-flex">
      <div class="section-item">
        <span class="section-label">步数：</span>
        <span class="section-label">{{ userInfo.step }}</span>
        <span class="blue" @click="showStep">明细</span>
      </div>
    </div>
    <h2>资产信息</h2>
    <div class="detail-section display-flex">
      <div class="section-item" style="width: 500px;">
        <span class="section-label">当前余额：</span>
        <span>{{ Number(userInfo.propertyIn.balance).toFixed(2) || '无' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label">本金：</span>
        <span>{{ Number(userInfo.propertyIn.recharge).toFixed(2) || '无' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label">赠送金：</span>
        <span>{{ Number(userInfo.propertyIn.donation).toFixed(2) || '无' }}</span>
      </div>
    </div>
    <div class="detail-section display-flex">
      <div class="section-item">
        <span class="section-label">当前充值卡数量：</span>
        <span>{{ userInfo.propertyIn.cardCount ? userInfo.propertyIn.cardCount + '张' : '无' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label">当前优惠券数量：</span>
        <span>{{ userInfo.propertyIn.couponCount ? userInfo.propertyIn.couponCount + '张' : '无' }}</span>
      </div>
    </div>
    <div class="detail-section display-flex">
      <div class="section-item">
        <span class="section-label">折扣：</span>
        <span
          v-for="(item, index) in userInfo.propertyIn.userDiscount"
          :key="index"
          style="margin-right: 10px;"
        >{{ item.port }} {{ item.discount }}折</span>
      </div>
    </div>
    <!-- 弹窗 -->
    <ConfirmDialog
      v-model="hasDialog"
      title
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <el-button type="primary" style="margin-bottom: 10px;float:right" @click="handleExport">导出</el-button>
      <BasePageTable height="200" :visible="false" :data="tableData" border>
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
      </BasePageTable>
    </ConfirmDialog>
  </div>
</template>

<script>
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import exportExcel from "@/utils/export-excel";
export default {
  components: {
    ConfirmDialog,
    BasePageTable
  },
  data() {
    return {
      hasDialog: false,
      userInfo: {
        registerInfo: {},
        personalInfo: {},
        propertyIn: {}
      },
      tableCol: [
        {
          label: "序号",
          type: "index",
          width: "100"
        },
        {
          label: "时间",
          prop: "time"
        },
        {
          label: "",
          prop: "data"
        }
      ],
      tableData: []
    };
  },
  created() {
    this.uid = this.$route.query.id;
    this.getInfo();
  },
  methods: {
    getInfo() {
      this.$request("userdetails.UserDetails/basicsInfo", {
        uid: this.uid
      }).then(({ data }) => {
        Object.assign(this.userInfo, data.obj);
      });
    },
    async showStep() {
      this.hasDialog = true;
      this.tableCol = [
        { label: "序号", type: "index", width: "100" },
        { label: "日期", prop: "date" },
        { label: "步数", prop: "step" }
      ];
      const res = await this.$http("userdetails.UserDetails/memberStep", { uid: this.uid });
      this.tableData = res.obj;
    },
    showDialog(type) {
      if (type == "51") {
        this.tableCol = [
          { label: "序号", type: "index", width: "100" },
          { label: "时间", prop: "time" },
          { label: "类型", prop: "type" }
        ];
      } else {
        this.tableCol = [
          { label: "序号", type: "index", width: "100" },
          { label: "时间", prop: "time" }
        ];
      }
      const label = {
        3: "身高（cm）",
        4: "体重（kg）",
        5: "体脂率（%）",
        6: "日常消耗活动",
        15: "BMI（%）",
        50: "血糖(mmHG)",
        51: "血压"
      }[type];
      this.tableCol.push({ label, prop: "data" });
      this.$request("userdetails.UserDetails/bodyDate", {
        uid: this.uid,
        type
      }).then(({ data }) => {
        this.tableData = data.obj;
        this.hasDialog = true;
      });
    },
    onconfirm() {
      this.hasDialog = false;
    },
    handleExport() {
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出-${this.tableCol[2].label}(${date})`;
      exportExcel({
        columns: this.tableCol,
        filename,
        data: this.tableData
      });
    }
  }
};
</script>

<style lang="less" scoped>
.section-item {
  width: 500px;
  margin: 10px 0;
}
.detail-footer {
  text-align: center;
}
.blue {
  color: #409eff;
  margin-left: 10px;
  cursor: pointer;
}
.vertical-top {
  vertical-align: top;
}

.section-label {
  display: inline-block;
  width: 150px;
  margin-right: 12px;
  text-align: left;
}

.detail-section {
  margin-left: 50px;
}

.flex-grow-1 {
  flex-basis: 25%;
}

.card-image-box {
  margin: 0 0 8px 12px;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 3px;
  display: inline-block;

  .certificate-img {
    max-width: 320px;
    max-height: 160px;
  }
}

.qrcode-image {
  max-width: 200px;
  max-height: 200px;
}

.phone-image {
  margin: 0 8px;
  max-width: 200px;
  max-height: 200px;
}
.count-label {
  margin-left: 20px;
}
.display-flex {
  padding: 0;
}
</style>
