<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="5"
        :label-width="60"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="goPlanPage('edit', 1)">添加方案</el-button>
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
        @current-page-change="getPlanList"
        @size-change="getPlanList"
        border
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <!-- <el-table-column label="ID" prop="tcId"></el-table-column> -->
        <el-table-column label="方案ID" prop="tcFid"></el-table-column>
        <el-table-column label="方案名称" prop="tcTitle"></el-table-column>
        <el-table-column label="方案目标" prop="tcTarget"></el-table-column>
        <el-table-column label="方案周期（天）" prop="tcPeriod"></el-table-column>
        <el-table-column label="方案类型" prop="planTypeStr"></el-table-column>
        <el-table-column label="应用性别" prop="tcSex"></el-table-column>
        <el-table-column label="应用人数" prop="useAmount"></el-table-column>
        <el-table-column label="当前状态" prop="tcCaseStt"></el-table-column>
        <el-table-column label="编辑人" prop="uname"></el-table-column>
        <el-table-column label="最后编辑时间" prop="tcModificationTime"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px;"
              @click="goPlanPage('edit', row)"
            >编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px;"
              @click="goPlanPage('detail', row)"
            >详情</span>
            <span
              v-if="row.tcCaseStt === '上线'"
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px;"
              @click="handleEdit('hide', row)"
            >下线</span>
            <span
              v-if="row.tcCaseStt === '下线'"
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px;"
              @click="handleEdit('open', row)"
            >上线</span>
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px;"
              @click="handleDel(row)"
            >删除</span>
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
  name: 'pcl_plan-gallery_plan-list',
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
        tcTarget: '00',
        tcTitle: '',
        tcCaseStt: ''
      },
      queryComps: [
        {
          component: 'BaseSelect',
          key: 'tcTarget',
          label: '方案目标',
          props: {
            options: [
              {
                label: '全部方案目标',
                value: '00'
              }
            ]
          }
        },
        {
          component: 'el-input',
          key: 'tcTitle',
          label: '方案名称',
          placeholder: '请输入方案名称',
          maxlength: 30,
          props: {
            clearable: true
          }
        },
        {
          component: 'BaseSelect',
          key: 'planType',
          label: '方案类型',
          props: {
            options: [
              {
                label: '全部方案状态',
                value: ''
              },
              {
                label: '普通',
                value: '00'
              },
              {
                label: '帕梅拉',
                value: '01'
              }
            ]
          }
        },
        {
          component: 'BaseSelect',
          key: 'tcCaseStt',
          label: '方案状态',
          props: {
            options: [
              {
                label: '全部方案状态',
                value: ''
              },
            ]
          }
        },
      ],
    };
  },
  created() {
    this.getTarget();
    this.getPlanList();
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getPlanList();
    },
    goPlanPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          tcId: row.tcId
        }
      });
    },
    handleEdit(type, row) {
      let url = '';
      if (type === 'hide') {
        url = 'plan.Plan/closePlan';
      } else if (type === 'open') {
        url = 'plan.Plan/openPlan';
      } else if (type === 'del') {
        url = 'plan.Plan/delPlan';
      }
      this.$request(url, { id: row.tcId }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            console.log(dataPage);
            if (dataPage === 5001) {
              this.$confirm('因为该方案的标签已经下线或删除，所以请重新选择该方案的标签信息?', {
                confirmButtonText: '确定',
                type: 'warning'
              });
              return;
            }
            this.$msg('操作成功', 'success');
            this.getPlanList();
          } else {
            this.$msg(err.errMsg, 'error');
          }
        })
      );
    },
    handleDel(row) {
      this.$confirm('确认删除该方案吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('点击确定');
        this.handleEdit('del', row);
      }).catch(() => {
        console.log('点击取消');
      });
    },
    getTarget() {
      this.$request('plan.Plan/allTarget', {}).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            const targetOptions = Object.entries(dataPage.target).map(item => ({ value: item[0], label: item[1] }));
            const sttOptions = Object.entries(dataPage.planStt).map(item => ({ value: item[0], label: item[1] }));
            this.queryComps[0].props.options = ([{
              label: '全部方案目标',
              value: '00'
            }, ...targetOptions]);
            this.queryComps[3].props.options = ([{
              label: '全部方案状态',
              value: ''
            }, ...sttOptions]);
          }
        })
      );
    },
    getPlanList() {
      this.$store.state.vloading = true;
      this.$request('plan.Plan/allPlan', {
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
      if (params.tcTarget === '00') {
        delete params.tcTarget;
      }
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
