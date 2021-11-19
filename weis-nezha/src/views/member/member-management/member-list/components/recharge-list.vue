<template>
  <div class>
    <div class="query-bar">
      <QueryComponents
        v-if="tab.value === 0"
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="4"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="handleExport">导出</el-button>
        </template>
      </QueryComponents>
      <QueryComponents
        v-if="tab.value === 1"
        v-model="queryParams2"
        :query-list="computedQueryComps"
        :span="4"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick2">搜索</el-button>
          <el-button type="primary" @click="handleExport2">导出</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <div class="detail-section display-flex">
        <div class="section-item">
          <span class="section-label">累计充值金额：</span>
          <span>{{ formData.balanceHistory }}</span>
        </div>
        <div class="section-item">
          <span class="section-label">本金：</span>
          <span>{{ formData.recharge }}</span>
        </div>
        <div class="section-item">
          <span class="section-label">赠送金：</span>
          <span>{{ formData.donation }}</span>
        </div>
      </div>
    </div>
    <ButtonTabs v-model="tab.value" :tabs="tab.list" style="margin-bottom:12px" />
    <div>
      <BasePageTable
        v-if="tab.value === 0"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        :height="tableHeight"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col" />
      </BasePageTable>
      <BasePageTable
        v-if="tab.value === 1"
        v-model:current-page="page2.pageNo"
        v-model:page-size="page2.pageSize"
        :height="tableHeight"
        :data="tableData2"
        :total="tableDataTotal2"
        border
        @current-page-change="getList2"
        @size-change="getList2"
      >
        <el-table-column v-for="col in tableCol2" :key="col.prop" v-bind="col" />
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';
import ButtonTabs from '@/components/ButtonTabs.vue'
export default {
  components: {
    QueryComponents,
    BasePageTable,
    ButtonTabs
  },
  data() {
    return {
      tab: {
        value: 0,
        list: [
          {
            label: '自己充值',
            value: 0
          },
          {
            label: '代充值',
            value: 1
          }
        ]
      },
      tableData: [],
      tableData2: [],
      tableDataTotal2: 0,
      tableDataTotal: 0,
      page: { // 自己充值
        pageNo: 1,
        pageSize: 10
      },
      page2: { // 代充值
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        uid: '',
        date: [],
      },
       queryParams2: {
        uid: '',
        date: [],
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '充值时间',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
      ],
      formData: {},
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '充值单号',
          prop: 'oid'
        },
        {
          label: '充值金额',
          prop: 'recharge'
        },
        {
          label: '赠送金额',
          prop: 'donation'
        },
        {
          label: '充值时间',
          prop: 'ctime'
        },
        {
          label: '充值后余额',
          prop: 'balance'
        },
        {
          label: '充值时绑定客户经理名称',
          prop: 'customer'
        },
        {
          label: '手机',
          prop: 'phone'
        },
        {
          label: '端口',
          prop: 'market'
        },
        {
          label: '充值类型',
          prop: 'rechargeType'
        },
        {
          label: '用户昵称',
          prop: 'uname'
        },
        {
          label: '手机号',
          prop: 'uphone'
        }
      ],
      tableCol2: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '代充值单号',
          prop: 'oid'
        },
        {
          label: '代充值金额',
          prop: 'recharge'
        },
        {
          label: '赠送金额',
          prop: 'donation'
        },
        {
          label: '代充值时间',
          prop: 'ctime'
        },
        {
          label: '代充值时后余额',
          prop: 'balance'
        },
        {
          label: '代充值的用户',
          prop: 'uname'
        },
        {
          label: '代充值用户手机',
          prop: 'uphone'
        },
        {
          label: '代充值用户充值时绑定的客户经理',
          prop: 'customer'
        },
        {
          label: '代充值用户充值时绑定的客户经理',
          prop: 'phone'
        }
      ],
    };
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  created() {
    const height = window.innerHeight;
    this.tableHeight = `${height - 380}px`;
    this.queryParams.uid = (this.queryParams2.uid = this.$route.query.id);
    this.getList();
    this.getList2();
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    searchClick2() {
      this.page2.pageNo = 1;
      this.getList2();
    },
    goPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        // path: `${this.$route.path}/detail`,
        query: {
          type: row === '1' ? 'create' : 'edit',
          id: row.id
        }
      });
    },
    getList() {
      this.$request('userdetails.UserDetails/rechargeRecord', {
        ...this.page,
        ...this.genQueryParams(this.queryParams)
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.formData = dataPage;
            this.tableData = dataPage.rechargeRecord.record;
            this.tableDataTotal = dataPage.rechargeRecord.totalRecordCount;
          }
        })
      );
    },
    getList2() {
      this.$request('userdetails.UserDetails/rechargeRecordForRep', {
        ...this.page2,
        ...this.genQueryParams(this.queryParams2)
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.formData = dataPage;
            this.tableData2 = dataPage.rechargeRecord.record;
            this.tableDataTotal2 = dataPage.rechargeRecord.totalRecordCount;
          }
        })
      );
    },
    genQueryParams(queryParams) {
      const params = { ...queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.format('YYYY-MM-DD');
        params.endDate = endDate.format('YYYY-MM-DD');
      }
      delete params.date;
      return params;
    },
    handleExport() {
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      this.reqAllUserData().then(
        this.$rw((err, dataPage) => {
          exportExcel({
            columns: this.tableCol,
            filename,
            data: dataPage.rechargeRecord.record
          });
        })
      );
    },
    handleExport2() {
      this.reqAllUserData2().then(
        this.$rw((err, dataPage) => {
          exportExcel({
            columns: this.tableCol2,
            data: dataPage.rechargeRecord.record
          });
        })
      );
    },
    reqAllUserData2() {
      return this.$request('userdetails.UserDetails/rechargeRecord', {
        ...this.genQueryParams2(),
        ...this.page2,
        pageSize: this.tableDataTotal2,
      });
    },
    reqAllUserData() {
      return this.$request('userdetails.UserDetails/rechargeRecord', {
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal,
      });
    },
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 0px 0;
}
.small-input {
  margin: 0 8px;
  width: 300px;
}
.tiny-input {
  margin: 0 8px;
  width: 100px;
}
.food-cover {
  max-height: 100%;
  max-width: 100%;
}

.section-item {
  min-width: 200px;
  margin-right: 20px;
  margin: 10px 0;
}
.detail-footer {
  text-align: center;
}

.vertical-top {
  vertical-align: top;
}

.section-label {
  display: inline-block;
  min-width: 50px;
  text-align: left;
}

.detail-section {
  margin: 0;
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
