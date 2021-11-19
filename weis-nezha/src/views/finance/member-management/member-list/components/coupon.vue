<template>
  <div class="">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="4"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="handleExport">导出</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <div class="detail-section display-flex">
        <div class="section-item">
          <span class="section-label">累计券总面额：</span>
          <span>{{formData.historyAmount}}</span>
        </div>
        <div class="section-item">
          <span class="section-label">已激活：</span>
          <span>{{formData.activateAmount}}</span>
        </div>
        <div class="section-item">
          <span class="section-label">已使用：</span>
          <span>{{formData.usedAmount}}</span>
        </div>
        <div class="section-item">
          <span class="section-label">已失效：</span>
          <span>{{formData.loseEfficacyAmount}}</span>
        </div>
      </div>
      <div class="detail-section display-flex">
        <div class="section-item">
          <span class="section-label">累计券张数：</span>
          <span>{{formData.historyCount}}张</span>
        </div>
        <div class="section-item">
          <span class="section-label">已激活：</span>
          <span>{{formData.activateCount}}张</span>
        </div>
        <div class="section-item">
          <span class="section-label">已使用：</span>
          <span>{{formData.usedCount}}张</span>
        </div>
        <div class="section-item">
          <span class="section-label">已失效：</span>
          <span>{{formData.loseEfficacyCount}}张</span>
        </div>
      </div>
    </div>
    <div>
      <BasePageTable
        :height="tableHeight"
        :data="tableData"
        :total="tableDataTotal"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        @current-page-change="getList"
        @size-change="getList"
        border>
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';

export default {
  components: {
    QueryComponents,
    BasePageTable,
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  data() {
    return {
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        uid: '',
        date: [],
        stt: ''
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '领取时间',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '状态',
          placeholder: '请选择状态',
          props: {
            clearable: true,
            options: [
              { label: '已激活', value: '01' },
              { label: '已绑定', value: '02' },
              { label: '已兑换/已使用', value: '03' },
              { label: '已失效', value: '04' },
            ]
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
          label: '优惠券ID',
          prop: 'cid'
        },
        {
          label: '面额',
          prop: 'amount'
        },
        {
          label: '来源',
          prop: 'source'
        },
        {
          label: '领取时间',
          prop: 'acquireTime'
        },
        {
          label: '绑定单号',
          prop: 'oid'
        },
        {
          label: '使用时间',
          prop: 'useTime'
        },
        {
          label: '当前状态',
          prop: 'stt'
        }
      ],
    };
  },
  created() {
    const height = window.innerHeight;
    this.tableHeight = `${height - 380}px`;
    this.queryParams.uid = this.$route.query.id;
    this.getList();
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
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
      this.$request('userdetails.UserDetails/couponDetail', {
        ...this.page,
        ...this.genQueryParams()
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.formData = dataPage;
            this.tableData = dataPage.couponRecord.record;
            this.tableDataTotal = dataPage.couponRecord.totalRecordCount;
          }
        })
      );
    },
    genQueryParams() {
      const params = { ...this.queryParams };
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
            data: dataPage.couponRecord.record
          });
        })
      );
    },
    reqAllUserData() {
      return this.$request('userdetails.UserDetails/couponDetail', {
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
  margin: 0;
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
