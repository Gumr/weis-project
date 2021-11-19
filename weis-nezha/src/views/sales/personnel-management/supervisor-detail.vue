<template>
  <div class="page-container">
    <div>
      <ReturnButton back />
    </div>
    <div style="margin-top: 14px;">
      <ButtonTabs v-model="activeTab" :tabs="tabs" />
    </div>
    <div>
      <div v-show="activeTab === 0">
        <h2>基本信息</h2>

        <div class="detail-section display-flex">
          <div>
            <span class="section-label">服务主管名称：</span>
            <span>{{ counselor.tseName || '无' }}</span>
          </div>
        </div>

        <div class="detail-section display-flex">
          <div>
            <span class="section-label">服务主管手机：</span>
            <span>{{ counselor.tsePhone || '无' }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div>
            <span class="section-label">当前状态：</span>
            <span>{{ counselor.tseSttDesc || '无' }}</span>
          </div>
        </div>
      </div>
      <div v-show="activeTab === 1">
        <QueryComponents v-model="subQuery" style="margin: 12px 0;" :query-list="subQueryComps">
          <template #action>
            <el-button type="priamry" @click="getSubTableData">搜索</el-button>
          </template>
        </QueryComponents>
        <div style="margin: 12px 0;">
          当前绑定的全职客户经理人数
          <span class="count-label">
            {{
            subTable.total
            }}
          </span>
        </div>
        <el-table :data="subTable.data" border stripe>
          <el-table-column v-for="(col, index) in subTable.col" :key="index" v-bind="col" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import ButtonTabs from '@/components/ButtonTabs.vue';
import ReturnButton from '@/components/ReturnButton.vue';
import QueryComponents from '@/components/QueryComponents.vue';
import { transformDaterange } from '@/utils/transform';
import { validArray } from '@/utils/common';
import { requestFactor } from '@/utils/request';

const { request: requestMethod } = requestFactor('sale.SaleEmployee')

export default {
  components: {
    ReturnButton,
    ButtonTabs,
    QueryComponents
  },
  name: 'sales_personnel-management_supervisor-detail',
  data() {
    return {
      activeTab: 0,
      tabs: [
        {
          label: '基础信息',
          value: 0
        },
        {
          label: '全职客户经理',
          value: 1
        }
      ],
      subQuery: {
        date: [],
        phone: ''
      },
      subTable: {
        data: [],
        total: 0,
        col: [
          {
            label: '序号',
            type: 'index'
          },
          {
            label: '全职客户经理ID',
            prop: 'uid'
          },
          {
            label: '全职客户经理名称',
            prop: 'uname'
          },
          {
            label: '全职客户经理手机',
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
            prop: 'state',
            formatter: row => ({ '00': '解绑', '01': '绑定' }[row.state])
          }
        ]
      },
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
          label: '手机号',
          key: 'phone',
          placeholder: '全职客户经理手机号',
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
  created() {
    this.id = this.$route.query && this.$route.query.id;
    if (this.id) {
      this.getCounselorDetail();
      this.getSubTableData();
    }
  },
  methods: {
    getCounselorDetail() {
      requestMethod('querySaleEmployeeInfo', { tseId: this.id }).thenwrap((err, res) => {
        if (!err) {
          this.counselor = res;
        }
      });
    },
    getSubTableData() {
      requestMethod('queryCounselorLowerPage', {
        pageNo: 1,
        pageSize: 99999,
        tseId: this.id,
        ...this.transformQuery(this.subQuery)
      }).thenwrap((err, data) => {
        if (!err) {
          this.subTable.data = data.dataPage.record;
          this.subTable.total = data.count || 0;
        }
      });
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
  }
};
</script>

<style lang="less" scoped>
.page-container {
  padding-top: 20px;
}
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
  padding: 0;
}
</style>
