<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="7"
        :label-width="40"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="handleExport" :loading="$store.state.bloading">{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
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
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        crid: '',
        cid: '',
        date: [],
        stt: ''
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '时间',
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
          props: {
            options: [
              { label: '全部状态', value: ''},
              { label: '未生效', value: '00'},
              { label: '未使用', value: '01'},
              { label: '已使用', value: '02'},
              { label: '已失效', value: '03'},
            ]
          }
        },
        {
          component: 'el-input',
          key: 'cid',
          label: '卡ID',
          placeholder: '请输入卡券ID',
          props: {
            clearable: true,
          },
        },
      ],
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '渠道ID',
          prop: 'channelId'
        },
        {
          label: '渠道名称',
          prop: 'channelName'
        },
        {
          label: '卡ID',
          prop: 'cid'
        },
        {
          label: '卡兑换码',
          prop: 'code'
        },
        {
          label: '卡面额',
          prop: 'amount'
        },
        {
          label: '卡兑换有效期至',
          prop: 'deadline'
        },
        {
          label: '状态',
          prop: 'stt'
        },
        {
          label: '分配时间',
          prop: 'ctime'
        }
      ],
    };
  },
  created() {
    this.queryParams.crid = this.$route.query.id;
    this.getList();
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request('card.Allocation/getCardSellRecordDetails', {
        ...this.page,
        ...this.genQueryParams()
      }).then(
        this.$rw((err, dataPage) => {
          this.$store.state.vloading = false;
          if (!err) {
            this.tableData = dataPage.allocationRecord.record;
            this.tableDataTotal = dataPage.allocationRecord.totalRecordCount;
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
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      this.reqAllUserData().then(
        this.$rw((err, dataPage) => {
          this.$store.state.bloading = false;
          exportExcel({
            columns: this.tableCol,
            filename,
            data: dataPage.allocationRecord.record
          });
        })
      );
    },
    reqAllUserData() {
      return this.$request('card.Allocation/getCardSellRecordDetails', {
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
  margin: 22px 0 22px 0;
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
</style>
