<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        :modelValue="queryParams"
        :queryList="computedQueryComps"
        :span="4"
        :label-width="60"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="goPage('edit', '1')">添加套餐</el-button
          >
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
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span class="brand-color cursor-pointer action-label" style="margin-right: 10px" @click="goPage('edit', row)">编辑</span>
            <span class="brand-color cursor-pointer action-label" style="margin-right: 10px" v-if="row.tucStt === '00'" @click="update(row.tucId, '01')">上线</span>
            <span class="brand-color cursor-pointer action-label" style="margin-right: 10px" v-if="row.tucStt === '01'" @click="update(row.tucId, '00')">下线</span>
            <span class="brand-color cursor-pointer action-label" @click="goPage('detail', row)">详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';

export default {
  name: 'goods_package-template',
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
        date: [],
        name: '',
        tucStt: ''
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '创建时间',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'el-input',
          key: 'name',
          label: '套餐模板',
          placeholder: '请输入套餐模板名称',
          props: {
            clearable: true,
          },
        },
        {
          component: 'BaseSelect',
          key: 'tucStt',
          label: '状态',
          props: {
            options: [
              {
                label: '全部状态',
                value: ''
              },
              {
                label: '上线',
                value: '01'
              },
              {
                label: '下线',
                value: '00'
              }
            ]
          }
        },
      ],
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '套餐ID',
          prop: 'tucId'
        },
        {
          label: '套餐模板名称',
          prop: 'tucName'
        },
        {
          label: '套餐内容',
          prop: 'tucContent'
        },
        {
          label: '套餐价格',
          prop: 'tucPrice'
        },
        {
          label: '创建人',
          prop: 'tucUname',
          formatter: row => row.tucUname || '无'
        },
        {
          label: '创建时间',
          prop: 'tucCtime'
        },
        {
          label: '状态',
          prop: 'tucSttDesc'
        }
      ],
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
    goPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        // path: `${this.$route.path}/detail`,
        query: {
          type: row === '1' ? 'create' : 'edit',
          id: row.tucId
        }
      });
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request('fitness.Fitness/queryUnionComboList', {
        ...this.page,
        ...this.genQueryParams()
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
    update(tucId, status) {
      this.$request('fitness.Fitness/updateUnionComboState', {
        tucId,
        opType: status
      }).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({ type: 'success', message: '更新成功' });
            this.getList();
          } else {
            this.$message({ type: 'error', message: err.errMsg });
          }
        })
      );
    }
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
