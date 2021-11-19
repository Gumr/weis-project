<template>
  <div class="page-container"  style="margin-top: 20px;">
    <ButtonTabs v-model="activeTab" :tabs="tableTabs"></ButtonTabs>
    <div v-show="activeTab === 0">
      <div style="margin: 20px 0;">
        <QueryComponents
          v-model="memberQuery"
          :queryList="memberQueryComps"
          :span="3"
        >
          <template v-slot:action>
            <el-button type="primary" @click="memberSearchClick"
              >搜索</el-button
            >
            <el-button type="info" @click="exportMemberClick">导出</el-button>
          </template>
        </QueryComponents>
      </div>
      <div style="margin: 14px 0;">
        <span class="total-item"
          >直级会员充值分润合计：￥{{ memberTotalData.totalRoyaltyRecharge }}
        </span>
        <span class="total-item"
          >直级会员消费分润合计：￥{{ memberTotalData.totalRoyaltyBuy }}</span
        >
        <span class="total-item"
          >总计：￥{{ memberTotalData.totalRoyalty }}</span
        >
      </div>
      <BasePageTable
        :data="memberTable.data"
        v-model:current-page="memberPage.pageNo"
        v-model:page-size="memberPage.pageSize"
        :total="memberTable.total"
        @current-page-change="getMemberTableData"
        @size-change="getMemberTableData"
        border
      >
        <el-table-column
          v-for="(col, index) in memberTable.col"
          v-bind="col"
          :key="index"
        ></el-table-column>
        <el-table-column width="80" label="操作">
          <template v-slot="{ row }">
            <el-button size="small" @click="goMemberDetail(row)"
              >详情</el-button
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <div v-show="activeTab === 1">
      <div style="margin: 20px 0;">
        <QueryComponents
          v-model="broderQuery"
          :queryList="broderQueryComps"
          :label-width="120"
          :span="3"
        >
          <template v-slot:action>
            <el-button type="primary" @click="broderSearchClick"
              >搜索</el-button
            >
            <el-button type="info" @click="exportBroderClick">导出</el-button>
          </template>
        </QueryComponents>
      </div>
      <div style="margin: 14px 0;">
        <span>
          直销兼职客户经理分润总计：￥{{ broderTotalData.totalRoyalty }}
        </span>
      </div>
      <BasePageTable
        :data="broderTable.data"
        v-model:current-page="broderPage.pageNo"
        v-model:page-size="broderPage.pageSize"
        :total="broderTable.total"
        @current-page-change="getBroderTableData"
        @size-change="getBroderTableData"
        border
      >
        <el-table-column
          v-for="(col, index) in broderTable.col"
          v-bind="col"
          :key="index"
        ></el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import QueryComponents from '@/components/QueryComponents.vue';
import ButtonTabs from '@/components/ButtonTabs.vue';
import { validArray } from '@/utils/common';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ButtonTabs
  },
  created() {
    const { type } = this.$route.query;
    this.marketType = this.$route.query.marketType;
    if (type == '02') {
      this.tableTabs = [{
        label: '直级会员分润详情',
        value: 0
      }, {
        label: '兼职客户经理分润详情',
        value: 1
      }];
    } else {
      this.tableTabs = [{
        label: '直级会员分润详情',
        value: 0
      }];
    }
    if (this.$route.query.startTime) {
      this.memberQuery.date[0] = this.$route.query.startTime;
      this.memberQuery.date[1] = this.$route.query.endTime;
      this.broderQuery.date[0] = this.$route.query.startTime;
      this.broderQuery.date[1] = this.$route.query.endTime;
    }
    if (this.$route.query.id) {
      this.broderQuery.parentId = this.$route.query.id;
      this.memberQuery.parentId = this.$route.query.id;

      this.getMemberTableData();
      this.getBroderTableData();
    }
  },
  data() {
    return {
      activeTab: 0,
      marketType: '',
      memberTotalData: {
        totalRoyaltyRecharge: 0,
        totalRoyaltyBuy: 0,
        totalRoyalty: 0,
      },
      broderTotalData: {
        totalRoyalty: 0,
      },
      tableTabs: [{
        label: '直级会员分润详情',
        value: 0
      }, {
        label: '兼职客户经理分润详情',
        value: 1
      }],
      memberPage: {
        pageNo: 1,
        pageSize: 10
      },
      broderPage: {
        pageNo: 1,
        pageSize: 10
      },
      broderTable: {
        data: [],
        total: 0,
        col: [{
          type: 'index',
          label: '序号',
        }, {
          label: '客户经理ID',
          prop: 'parentId'
        }, {
          label: '客户经理名称',
          prop: 'parentName'
        }, {
          label: '客户经理手机',
          prop: 'parentPhone',
        }, {
          label: '下级客户经理ID',
          prop: 'counselorId'
        }, {
          label: '下级客户经理名称',
          prop: 'counselorName'
        }, {
          label: '下级客户经理手机',
          prop: 'counselorPhone'
        }, {
          label: '分润金额',
          prop: 'royaltyIncome'
        }, {
          label: '下级客户经理分润-已确认',
          prop: 'royaltyIncomeAlready'
        }, {
          label: '下级客户经理分润-待确认',
          prop: 'royaltyIncomeComing'
        }, {
          label: '下级客户经理分润-已失效',
          prop: 'royaltyIncomeInvalid'
        }]
      },
      memberTable: {
        data: [],
        total: 0,
        col: [{
          type: 'index',
          label: '序号',
        }, {
          label: '客户经理ID',
          prop: 'counselorId'
        }, {
          label: '客户经理名称',
          prop: 'counselorName'
        }, {
          label: '客户经理手机',
          prop: 'counselorPhone'
        }, {
          label: '会员名称',
          prop: 'memberName'
        }, {
          label: '会员ID',
          prop: 'memberUid'
        }, {
          label: '会员手机',
          prop: 'memberPhone'
        }, {
          label: '直级会员充值分润',
          prop: 'royaltyRecharge'
        }, {
          label: '直级会员消费分润',
          prop: 'royaltyBuy'
        }, {
          label: '直级学员分润-已确认',
          prop: 'royaltyBuyAlready'
        }, {
          label: '直级学员分润-待确认',
          prop: 'royaltyBuyComing'
        }, {
          label: '直级学员分润-已失效',
          prop: 'royaltyBuyInvalid'
        }]
      },
      memberQuery: {
        date: [],
        phone: '',
      },
      broderQuery: {
        date: [],
        phone: '',
      },
      memberQueryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            clearable: true,
            type: 'daterange'
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '会员手机号',
          props: {
            clearable: true
          }
        }
      ],
      broderQueryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            clearable: true,
            type: 'daterange'
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '手机号',
          placeholder: '请输入兼职客户经理手机号',
          props: {
            clearable: true
          }
        }
      ]
    };
  },
  methods: {
    goMemberDetail(row) {
      let date = {}
      if (this.memberQuery.date && this.memberQuery.date.length) {
        date = {
          startTime: this.$day(this.memberQuery.date[0]).format('YYYY-MM-DD'),
          endTime: this.$day(this.memberQuery.date[1]).format('YYYY-MM-DD')
        }
      }
      this.$router.push({
        path: '/data/data/commission-statistics/sales-statistics/index/directCommissionMemberDetail',
        query: {
          bid: row.counselorId,
          uid: row.memberUid,
          type: '0',
          marketType: this.marketType,
          ...date,
        }
      });
    },
    transformParams(params) {
      if (validArray(params.date)) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = +startDate;
        params.endDate = +endDate;
      }

      delete params.date;

      return params;
    },
    async exportMemberClick() {
      const filename = `${this.$route.meta.title}-导出`;

      const data = await this.getAllMemberTableData();

      exportExcel({
        filename,
        data,
        columns: this.memberTable.col
      });
    },
    async exportBroderClick() {
      const filename = `${this.$route.meta.title}-导出`;

      const data = await this.getAllBrokerTableData();

      exportExcel({
        filename,
        data,
        columns: this.broderTable.col
      });
    },

    goDetail(id) {
      this.$pushRoute('detail', {
        query: {
          id
        }
      });
    },
    getAllMemberTableData() {
      const params = {
        ...this.transformParams({
          ...this.memberPage,
          ...this.memberQuery
        }),
        pageNo: 1,
        pageSize: 9999,
        marketType: this.marketType,
      };

      return this.$request('Channel/queryProfitByMembers', params).then(({ data }) => (data.errCode === 0 ? data.obj.dataPage.record : Promise.reject()));
    },
    getAllBrokerTableData() {
      const params = {
        ...this.transformParams({
          ...this.broderPage,
          ...this.broderQuery
        }),
        pageNo: 1,
        pageSize: 9999,
        marketType: this.marketType
      };

      return this.$request('Channel/queryProfitByAgent', params).then(({ data }) => (data.errCode === 0 ? data.obj.dataPage.record : Promise.reject()));
    },
    memberSearchClick() {
      this.memberPage.pageNo = 1;
      this.getMemberTableData();
    },
    broderSearchClick() {
      this.broderPage.pageNo = 1;
      this.getBroderTableData();
    },
    // borderTypeFormatter(row) {
    //   return BroderTypeMap[row.parentType];
    // },
    getMemberTableData() {
      this.$request('Channel/queryProfitByMembers', this.transformParams({
        ...this.memberPage,
        ...this.memberQuery,
        marketType: this.marketType,
      })).then(({ data }) => {
        if (data.errCode === 0) {
          data = data.obj;

          this.memberTable.data = data.dataPage.record;
          this.memberTable.total = data.dataPage.totalRecordCount;
          this.memberTotalData = data;
          delete this.memberTotalData.dataPage;
        }
      });
    },
    getBroderTableData() {
      this.$request('Channel/queryProfitByAgent', this.transformParams({
        ...this.broderPage,
        ...this.broderQuery,
        marketType: this.marketType,
      })).then(({ data }) => {
        if (data.errCode === 0) {
          data = data.obj;
          this.broderTable.data = data.dataPage.record;
          this.broderTable.total = data.dataPage.totalRecordCount;

          this.broderTotalData = data;
          delete this.broderTotalData.dataPage;
        }
      });
    }
  }
};

</script>

<style lang="less" scoped>
.total-item {
  display: inline-block;
  margin-right: 22px;
}
</style>
