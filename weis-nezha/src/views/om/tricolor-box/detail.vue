<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="6"
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
      id: '',
      queryParams: {
        date: [],
        phone: '',
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '购买日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '手机',
          placeholder: '请输入客户经理手机',
          props: {
            clearable: true,
          },
        },
      ],
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '会员昵称',
          prop: 'uname'
        },
        {
          label: '会员手机',
          prop: 'phone'
        },
        {
          label: '回收盒子数',
          prop: 'recoveryNum'
        },
        {
          label: '客户经理',
          prop: 'counselorName',
        },
        {
          label: '客户经理手机',
          prop: 'counselorPhone'
        },
        {
          label: '回收时间',
          prop: 'ctime'
        }
      ],
    };
  },
  created() {
    this.id = this.$route.query.id;
    this.getList();
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request('LunchBox/getLunchBoxRecord', {
        ...this.page,
        ...this.genQueryParams(),
        uid: this.id,
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.$store.state.vloading = false;
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
            this.$nt(() => {
              this.$refs.table.doLayout();
            });
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
            data: dataPage.record
          });
        })
      );
    },
    reqAllUserData() {
      return this.$request('card.UserAcquireRecord/getAllForUser', {
        ...this.genQueryParams(),
        pageNo: 1,
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
