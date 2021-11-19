<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="7"
        :label-width="60"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="handleExport">导出</el-button>
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
  name: 'marketing_recharge-card_giving-list',
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
        stt: '',
        cid: '',
        phone: '',
        sphone: '',
      },
      queryComps: [
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '状态',
          props: {
            options: [
              {
                label: '全部状态',
                value: ''
              },
              {
                label: '转让中',
                value: '01'
              },
              {
                label: '转让成功',
                value: '02'
              },
              {
                label: '转让失败',
                value: '03'
              }
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
        {
          component: 'el-input',
          key: 'sphone',
          label: '购买手机',
          placeholder: '请输入购买人手机',
          props: {
            clearable: true,
          },
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '所属手机',
          placeholder: '请输入所属人手机',
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
          label: '卡ID',
          prop: 'cid'
        },
        {
          label: '卡名称',
          prop: 'name'
        },
        {
          label: '卡面金额',
          prop: 'amount'
        },
        {
          label: '卡销售有效期',
          prop: 'sellTime',
        },
        {
          label: '购买人昵称',
          prop: 'uname'
        },
        {
          label: '手机',
          prop: 'phone'
        },
        {
          label: '转赠时间',
          prop: 'ctime'
        },
        {
          label: '被转赠人昵称',
          prop: 'transferee'
        },
        {
          label: '被转赠人手机',
          prop: 'transfereePhone'
        },
        {
          label: '当前状态',
          prop: 'stt'
        }
      ],
      uname: '',
      uid: '',
      uphone: '',
      addDialog: false,
      delDialog: false,
    };
  },
  created() {
    this.getList();
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request('card.UserAcquireRecord/getAllForMakeOver', {
        ...this.page,
        ...this.genQueryParams()
      }).then(
        this.$rw((err, dataPage) => {
          this.$store.state.vloading = false;
          if (!err) {
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
      return this.$request('card.UserAcquireRecord/getAllForMakeOver', {
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
