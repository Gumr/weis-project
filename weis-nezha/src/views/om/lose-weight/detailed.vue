<template>
  <div class="page-container">
    <ReturnButton back />
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="4"
        :label-width="90"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        :total="tableDataTotal"
        @current-page-change="getList"
        @size-change="getList"
        border
      >
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span class="brand-color cursor-pointer action-label" @click="toEdit(row)">转营</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="box"
      title="转营"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="tagConfirm"
    >
      <div>
        <div class="section-item">
          <span class="section-label label-1">用户昵称：</span>
          <span>{{currentTag.uname}}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">用户手机：</span>
          <span>{{currentTag.phone}}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">目前营长：</span>
          <span>{{currentTag.campPrincipal}}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">选择转营到：</span>
          <BaseSelect :options="campOptions" v-model="currentTag.campId"></BaseSelect>
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import ReturnButton from '@/components/ReturnButton.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

export default {
  name: 'goods_dish-unit',
  components: {
    QueryComponents,
    BasePageTable,
    ReturnButton,
    ConfirmDialog
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  created() {
    this.queryParams.campId = this.$route.query.campId || '';
    this.queryParams.activityId = this.$route.query.activityId || '';
    this.getCampPrincipal();
    this.getList();
  },
  data() {
    return {
      box: false,
      currentTag: {
        uname: '',
        phone: '',
        counselor: '',
        campId: '',
        campPrincipal: this.$route.query.campPrincipal,
      },
      uid: '',
      campOptions: [],
      height: window.innerHeight - 330,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
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
          label: '当前绑定的客户经理',
          prop: 'counselor'
        },
        {
          label: '当前积分',
          prop: 'score'
        },
        {
          label: '期间总消费金额',
          prop: 'amount'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        phone: '',
        campId: '',
        activityId: ''
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'phone',
          label: '用户手机',
          placeholder: '用户手机',
          props: {
            clearable: true
          },
        },
      ],
    };
  },
  methods: {
    async getCampPrincipal() {
      const activityId = this.$route.query.activityId;
      const res = await this.$http('marketing.activity.LoseWeightCamp/getActivityCamps', {pageNo: 1, pageSize: 999, activityId});
      this.campOptions = res.obj.record.map(val => ({label: val.campName, value: val.campId}));
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      this.$store.state.vloading = true;
      const res = await this.$http('marketing.activity.LoseWeightCamp/getCampMembers', params);
      if (!res.errMsg) {
        this.tableData = res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount;
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
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http('marketing.activity.LoseWeightCamp/getCampMembers', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
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
    toEdit(row) {
      Object.assign(this.currentTag, row);
      this.uid = row.uid;
      this.box = true;
    },
    async tagConfirm(done) {
      if (this.currentTag.campId == this.$route.query.campId) {
        this.$msg('已在该营中', 'error');
        done();
        return;
      }
      const res = await this.$http('marketing.activity.LoseWeightCamp/userChangeCamp', {campId: this.currentTag.campId, uid: this.uid});
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.getList();
        this.box = false;
        setTimeout(done, 500);
      } else {
        this.$msg(res.errMsg, 'error');
        done();
      }
    }
  }
};
</script>

<style lang="less" scoped>
.page-container {
  padding-top: 20px;
}
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>
