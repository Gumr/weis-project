<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="60"
        :span="5"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="handleExport" :loading="$store.state.bloading">{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="goDetail('edit', '')">添加活动</el-button>
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
        border
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span class="brand-color cursor-pointer action-label" style="margin-right: 10px;" @click="goDetail('edit', row)" v-if="row.taStt != '05'">编辑</span>
            <span class="brand-color cursor-pointer action-label" @click="goDetail('detail', row)">具体内容</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';

export default {
  components: {
    QueryComponents,
    BasePageTable,
  },
  created() {
    this.getList();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '活动ID',
          prop: 'taId'
        },
        {
          label: '期数',
          prop: 'taPhase',
          formatter: row => row.taPhase == 0 ? '无' : '第' + row.taPhase + '期'
        },
        {
          label: '活动名称',
          prop: 'taName'
        },
        {
          label: '活动周期',
          prop: 'taCycle'
        },
        {
          label: '当前阶段',
          prop: 'taSttDesc'
        },
        {
          label: '参与人总数',
          prop: 'taJoinUserNum'
        },
        {
          label: '创建人',
          prop: 'taCreator'
        },
        {
          label: '创建时间',
          prop: 'taCtime'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        date: [],
        name: '',
        uname: '',
        stt: ''
      },
      queryComps: [
        // {
        //   component: 'el-date-picker',
        //   key: 'date',
        //   label: '日期',
        //   props: {
        //     type: 'daterange',
        //     startPlaceholder: '开始日期',
        //     endPlaceholder: '结束日期'
        //   }
        // },
        {
          component: 'el-input',
          key: 'name',
          label: '活动名称',
          placeholder: '请输入活动名称',
          props: {
            clearable: true
          },
          maxlength: 30
        },
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '当前阶段',
          props: {
            options: [
              { label: '全部方案状态', value: '' },
              { label: '征集期', value: '01' },
              { label: '审核期', value: '02' },
              { label: '投票期', value: '03' },
              { label: '发布期', value: '04' },
              { label: '研发量产上架期', value: '05' },
              { label: '空闲期', value: '00' }
            ]
          }
        },
      ],
    };
  },
  methods: {
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      this.$store.state.vloading = true;
      const res = await this.$http('foodfundraising.FundraisingActivity/queryActivityList', params);
      if (!res.errMsg) {
        this.tableData = res.obj.page.record;
        this.tableDataTotal = res.obj.page.totalRecordCount;
        this.$nt(() => {
          this.$refs.table.doLayout();
        });
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.page,
        ...this.genQueryParams(),
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http('foodfundraising.FundraisingActivity/queryActivityList', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.page.record
      });
    },
    goDetail(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          id: row.taId,
          taPhase: row.taPhase
        }
      });
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
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>
