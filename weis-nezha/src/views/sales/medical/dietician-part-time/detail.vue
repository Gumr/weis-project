<template>
  <div class="page-container" style="padding-top: 20px;">
    <div>
      <ReturnButton back />
    </div>
    <div style="margin-top: 14px;">
      <ButtonTabs v-model="activeTab" :tabs="tabs" @change="changes"></ButtonTabs>
    </div>
    <div>
      <div v-show="activeTab === 0">
        <div class="detail-section display-flex">
          <div class="info-item" style="width: 40%;">
            <span class="section-label">姓名：</span>
            <span>{{ counselor.counselorName }}</span>
          </div>
          <!-- <div class="info-item">
            <span class="section-label section-label-2">邀请码：</span>
            <span>{{ counselor.invitationCode }}</span>
          </div> -->
        </div>
        <div class="detail-section display-flex">
          <div class="info-item" style="width: 40%;">
            <span class="section-label">手机号：</span>
            <span>{{ counselor.counselorPhone }}</span>
          </div>
          <div class="info-item">
            <span class="section-label section-label-2">当前上级姓名：</span>
            <span>{{ counselor.parentCounselorName }}</span>
          </div>
        </div>
        <div class="detail-section display-flex">
          <div class="info-item" style="width: 40%;">
            <span class="section-label">身份证号：</span>
            <span>{{ counselor.idCardNumber }}</span>
          </div>
          <div class="info-item">
            <span class=" section-label section-label-2">当前上级ID：</span>
            <span>{{ counselor.parentCounselorId }}</span>
          </div>
        </div>
        <div class="detail-section display-flex">
          <div class="info-item" style="width: 40%;">
            <span class="section-label">邮箱地址：</span>
            <span>{{ counselor.mailBox }}</span>
          </div>
          <div class="info-item">
            <span class="section-label section-label-2">当前上级手机：</span>
            <span>{{ counselor.parentCounselorPhone }}</span>
          </div>
        </div>
        <div class="info-item detail-section display-flex">
          <span class="section-label vertical-top">身份证正反面</span>
          <div class="image-box-wrap">
            <div
              class="card-image-box"
              v-for="(img, index) in counselor.idCardImageUrl"
              :key="index"
            >
              <el-image
                class="certificate-img"
                :preview-src-list="[img]"
                :src="img"
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
            <span>{{ counselor.taxpayerTypeDesc }}</span>
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
            <div
              class="card-image-box"
              v-for="(img, index) in counselor.imageUrlList"
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
      <h2>基本信息</h2>
      <div class="section-item">
        <span class="section-label label-1">微信号：</span>
        <el-input clearable  class="medium-input" v-model="counselor.wxNumber"></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">手机号：</span>
        <el-input clearable  class="medium-input" v-model="counselor.coachPhone"></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">个人介绍：</span>
        <el-input clearable  class="medium-input" :rows="6" type="textarea" v-model="counselor.introduce"></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">微信二维码：</span>
        <ImageUpload
          :upload-data="{ flag: 'sales' }"
          v-model:file-list="counselor.wxQrcodeUrl"
          :limit="6"
        />
      </div>
      <div class="section-item">
        <span class="section-label label-1">专业证书：</span>
        <ImageUpload
          :upload-data="{ flag: 'sales' }"
          v-model:file-list="counselor.qualificationImageUrl"
          :limit="6"
        />
      </div>
      <div class="section-item">
        <span class="section-label label-1">照片：</span>
        <ImageUpload
          :upload-data="{ flag: 'sales' }"
          v-model:file-list="counselor.coachImageUrl"
          :limit="6"
        />
      </div>
      <div class="section-item">
        <span class="section-label label-1"></span>
        <el-button type="primary" style="width: 150px;" @click="confirm">保存</el-button>
      </div>
      </div>
      <div v-show="activeTab === 1">
        <QueryComponents
          style="margin: 12px 0;"
          v-model="memberQuery"
          :query-list="memeberQueryComps"
          :label-width="60"
          :span="5"
        >
          <template v-slot:action>
            <el-button type="priamry" @click="getMemberTableData"
              >搜索</el-button
            >
          </template>
        </QueryComponents>
        <div style="margin: 12px 0;">
          当前绑定直级会员数<span class="count-label">{{
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
      <div v-show="activeTab === 2">
        <Helper></Helper>
      </div>
    </div>
  </div>
</template>

<script>
import ButtonTabs from '@/components/ButtonTabs.vue';
import ReturnButton from '@/components/ReturnButton.vue';
import Helper from './components/helper.vue';
import { validArray } from '@/utils/common';
import { transformDaterange } from '@/utils/transform';
import ImageUpload from '@/components/ImageUpload.vue';
export default {
  components: {
    ReturnButton,
    ButtonTabs,
    Helper,
    ImageUpload
  },
  data() {
    return {
      id: '',
      counselorId: '',
      counselor: {
        wxNumber: '',
        coachPhone: '',
        introduce: '',
        qualificationImageUrl: [],
        coachImageUrl: [],
        wxQrcodeUrl: []
      },
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
        },
      ],
      memberQuery: {
        date: [],
        phone: ''
      },
      memeberQueryComps: [
        {
          component: 'el-date-picker',
          label: '绑定时间',
          key: 'date',
          props: {
            type: 'daterange',
            clearable: true
          }
        },
        {
          component: 'el-input',
          label: '手机号',
          key: 'phone',
          placeholder: '会员手机号',
          props: {
            clearable: true
          }
        }
      ],
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
          },
          {
            label: '助手名称',
            prop: 'helperName',
            formatter: row => row.helperName || '无'
          },
          {
            label: '助手手机',
            prop: 'helperPhone',
            formatter: row => row.helperPhone || '无'
          },
        ]
      },
    }
  },
  created() {
    this.id = this.$route.query && this.$route.query.id;
    this.counselorId = this.$route.query && this.$route.query.counselorId;
    if (this.counselorId) {
      this.getCounselorDetail();
      this.getMemberTableData();
    }
  },
  methods: {
    changes() {
      if (this.activeTab == '1') {
        this.getMemberTableData()
      }
    },
    getMemberTableData() {
      this.$request('Channel/queryAgentMemberList', {
        pageNo: 1,
        pageSize: 99999,
        counselorId: this.counselorId,
        marketType: '03',
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
    getCounselorDetail() {
      this.$request('Channel/queryAgentDetail', { id: this.id, marketType: '03' }).then(
        this.$rw((err, res) => {
          if (!err) {
            Object.assign(this.counselor, res.agentDetailVo);
            res.agentDetailVo.qualificationImageUrl = res.agentDetailVo.qualificationImageUrl ? res.agentDetailVo.qualificationImageUrl : [];
            this.counselor.qualificationImageUrl = res.agentDetailVo.qualificationImageUrl.map(item => {
              return { url: item }
            });
            res.agentDetailVo.coachImageUrl = res.agentDetailVo.coachImageUrl ? res.agentDetailVo.coachImageUrl : [];
            this.counselor.coachImageUrl = res.agentDetailVo.coachImageUrl.map(item => {
              return { url: item }
            });
            res.agentDetailVo.wxQrcodeUrl = res.agentDetailVo.wxQrcodeUrl ? res.agentDetailVo.wxQrcodeUrl : [];
            this.counselor.wxQrcodeUrl = res.agentDetailVo.wxQrcodeUrl.map(item => {
              return { url: item }
            });
          }
        })
      );
    },
    async confirm() {
      const qualificationImageUrl = [];
      this.counselor.qualificationImageUrl.forEach((item) => {
        const img = item.response ? item.response.obj.imageUrl : item.url;
        qualificationImageUrl.push(img);
      });

      const coachImageUrl = [];
      this.counselor.coachImageUrl.forEach((item) => {
        const img = item.response ? item.response.obj.imageUrl : item.url;
        coachImageUrl.push(img);
      });
      
      const wxQrcodeUrl = [];
      this.counselor.wxQrcodeUrl.forEach((item) => {
        const img = item.response ? item.response.obj.imageUrl : item.url;
        wxQrcodeUrl.push(img);
      });
      const res = await this.$http('Channel/updateAgentInfo', {
        id: this.id,
        wxNumber: this.counselor.wxNumber,
        coachPhone: this.counselor.coachPhone,
        introduce: this.counselor.introduce,
        qualificationImageUrl,
        coachImageUrl,
        wxQrcodeUrl
      });
      if (!res.errMsg) {
        this.$msg('保存成功', 'success');
      } else {
        this.$msg(res.errMsg, 'error');
      }
    }
  }
}
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
  width: 160px;
  text-align: left;
}
.label-1 {
  text-align: right;
  font-size: 15px;
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
