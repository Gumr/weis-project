<template>
  <div class="page-container">
    <div style="margin-top: 14px;">
      <ButtonTabs v-model="activeTab" :tabs="tabs"></ButtonTabs>
    </div>
    <div>
      <div v-show="activeTab === 0">
        <h2>基本信息</h2>
        <div class="detail-section display-flex">
          <div>
            <span class="section-label">渠道兼职客户经理ID：</span>
            <span>{{ counselor.counselorId || '无' }}</span>
          </div>
        </div>

        <div class="detail-section  display-flex">
          <div>
            <span class="section-label">渠道兼职客户经理名称：</span>
            <span>{{ counselor.counselorName || '无'}}</span>
          </div>
        </div>

        <div class="detail-section  display-flex">
          <div>
            <span class="section-label">渠道兼职客户经理手机：</span>
            <span>{{ counselor.counselorPhone || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">绑定渠道经理ID：</span>
            <span>{{ counselor.parentCounselorId || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">绑定渠道经理名称：</span>
            <span>{{ counselor.parentCounselorName || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">绑定渠道经理手机：</span>
            <span>{{ counselor.parentCounselorPhone || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">绑定渠道主管ID：</span>
            <span>{{ counselor.ownManagerId  || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">绑定渠道主管名称：</span>
            <span>{{ counselor.ownManagerName  || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">绑定渠道主管手机：</span>
            <span>{{ counselor.ownManagerPhone  || '无' }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div>
            <span class="section-label">申请成为渠道兼职客户经理时间：</span>
            <span>{{ counselor.ctime || '无' }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div>
            <span class="section-label">当前状态：</span>
            <span>{{ counselor.statusDesc || '无' }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div>
            <span class="section-label">个人简介：</span>
            <span>{{ counselor.introduce || '无' }}</span>
          </div>
        </div>

        <div class="detail-section">
          <span class="section-label" style="vertical-align: top;"
            >微信二维码：</span
          >
          <el-image
            class="qrcode-image"
            v-if="counselor.wxQrcode "
            :src="counselor.wxQrcode "
            :preview-src-list="[counselor.wxQrcode ]"
          ></el-image>
        </div>

        <div class="detail-section">
          <span class="section-label" style="vertical-align: top;"
            >我的照片：</span
          >
          <el-image
            class="phone-image"
            v-for="(img, idx) in counselor.coachImageUrl"
            :key="idx"
            :src="img"
            :preview-src-list="[img]"
          ></el-image>
        </div>
        <div class="detail-section">
          <span class="section-label" style="vertical-align: top;"
            >专业证书：</span
          >
          <el-image
            class="phone-image"
            v-for="(img, idx) in counselor.qualificationImageUrl "
            :key="idx"
            :src="img"
            :preview-src-list="[img]"
          ></el-image>
        </div>
        <h2>邀请信息</h2>
        <div class="detail-section">
          <div>
            <span class="section-label">邀请人ID：</span>
            <span>{{ counselor.invitationCode || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">邀请人姓名：</span>
            <span>{{ counselor.inviterName || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">邀请人手机：</span>
            <span>{{ counselor.inviterPhone || '无' }}</span>
          </div>
        </div>
        <h2>银行信息</h2>
        <div class="detail-section">
          <div>
            <span class="section-label">银行卡号：</span>
            <span>{{ counselor.bankCardNumber || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">开户银行：</span>
            <span>{{ counselor.bankName || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">所属支行：</span>
            <span>{{ counselor.bankBranch || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">开户人名称：</span>
            <span>{{ counselor.accountName || '无' }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div>
            <span class="section-label">纳税人类型：</span>
            <span>{{ counselor.taxpayerTypeDesc || '无' }}</span>
          </div>
        </div>
      </div>
      <div v-show="activeTab === 1">
        <QueryComponents
          style="margin: 12px 0;"
          v-model="memberQuery"
          :query-list="memeberQueryComps"
        >
          <template v-slot:action>
            <el-button type="priamry" @click="getMemberTableData"
              >搜索</el-button
            >
          </template>
        </QueryComponents>
        <div style="margin: 12px 0;">
          当前绑定会员数<span class="count-label">{{
            memberTable.total
          }}</span>
        </div>
        <el-table :data="memberTable.data" border stripe>
          <el-table-column
            v-for="(col, index) in memberTable.col"
            :key="index"
            v-bind="col"
          ></el-table-column>
        </el-table>
      </div>
      <div v-if="activeTab === 2">
        <Helper></Helper>
      </div>
    </div>
  </div>
</template>

<script>
import ButtonTabs from '@/components/ButtonTabs.vue';
import QueryComponents from '@/components/QueryComponents.vue';
import { transformDaterange } from '@/utils/transform';
import Helper from './components/helper.vue';
import { validArray } from '@/utils/common';

export default {
  components: {
    ButtonTabs,
    QueryComponents,
    Helper
  },
  data() {
    return {
      activeTab: 0,
      tabs: [
        {
          label: '基础信息',
          value: 0
        },
        {
          label: '会员信息',
          value: 1
        },
        {
          label: '助手信息',
          value: 2
        }
      ],
      memberQuery: {
        date: [],
        phone: ''
      },
      subQuery: {
        date: [],
        phone: ''
      },
      memberTable: {
        data: [],
        total: 0,
        col: [
          {
            label: '序号',
            type: 'index'
          },
          {
            label: '会员ID',
            prop: 'uid'
          },
          {
            label: '会员名称',
            prop: 'uname'
          },
          {
            label: '会员手机',
            prop: 'phone'
          },
          {
            label: '绑定时间',
            prop: 'ctime'
          },
          {
            label: '解绑时间',
            prop: 'utime'
          },
          {
            label: '当前状态',
            formatter: row => ({ '00': '解绑', '01': '绑定' }[row.state])
          }
        ]
      },
      memeberQueryComps: [
        {
          component: 'el-date-picker',
          label: '日期',
          key: 'date',
          props: {
            type: 'daterange',
            clearable: true
          }
        },
        {
          component: 'el-input',
          label: '会员手机号',
          key: 'phone',
          placeholder: '会员手机号',
          props: {
            clearable: true
          }
        }
      ],
      subQueryComps: [
        {
          component: 'el-date-picker',
          label: '日期',
          key: 'date',
          props: {
            type: 'daterange',
            clearable: true
          }
        },
        {
          component: 'el-input',
          label: '会员手机号',
          key: 'phone',
          placeholder: '客户经理手机号',
          props: {
            clearable: true
          }
        }
      ],
      counselor: {},
      rejectDialogVisible: false,
      rejectMessage: '',
      transformer: {
        brokerType: type => ({
          '01': '外部',
          '02': '自有'
        }[type]),
        brokerStatus: status => ({
          '00': '删除',
          '01': '正常'
        }[status])
      }
    };
  },
  methods: {
    getCounselorDetail() {
      this.$request('Channel/queryAgentDetail', { id: this.id, marketType: '02', }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.counselor = res.agentDetailVo;
          }
        })
      );
    },
    getMemberTableData() {
      this.$request('Channel/queryAgentMemberList', {
        pageNo: 1,
        pageSize: 99999,
        id: this.id,
        marketType: '02',
        ...this.transformQuery(this.memberQuery)
      }).then(this.$rw((err, data) => {
        if (!err) {
          this.memberTable.data = data.dataPage.record;
          this.memberTable.total = data.count || 0;
        }
      }));
    },
    transformQuery(query) {
      query = { ...query };
      if (validArray(query.date)) {
        const [startDate, endDate] = transformDaterange(query.date);
        query.startDate = startDate.format('YYYY-MM-DD');
        query.endDate = endDate.format('YYYY-MM-DD');
      }

      return query;
    },
    cancelClick() {
      this.$router.back();
    }
  },
  created() {
    this.id = this.$route.query && this.$route.query.id;
    if (this.id) {
      this.getCounselorDetail();
      this.getMemberTableData();
    }
  }
};
</script>

<style lang="less" scoped>
.detail-footer {
  text-align: center;
}

.vertical-top {
  vertical-align: top;
}

.section-label {
  display: inline-block;
  width: 180px;
  margin-right: 12px;
  text-align: left;
}

.detail-section {
  margin: 22px 0 22px 6%;
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
  padding: 0
}
</style>
