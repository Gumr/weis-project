<template>
  <div class="page-container">
    <ReturnButton back />
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="4"
        :label-width="100"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >
            {{ $store.state.bloading ? '导出中' : '导出' }}
          </el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="toBatchEdit()">批量编辑</el-button>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <!-- <span class="brand-color cursor-pointer action-label" @click="toEdit(row)">编辑</span> -->
            <span class="brand-color cursor-pointer" @click="toDetail(row)">明细</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="box"
      title="批量编辑营长"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="boxConfirm"
    >
      <BasePageTable
        ref="boxTable"
        v-loading="loading"
        height="700"
        :visible="false"
        :data="boxData"
        border
      >
        <el-table-column prop="campId" label="营ID"></el-table-column>
        <el-table-column prop="campName" label="营名称">
          <template #default="{ row }" class="action-cell">
            <el-input v-model="row.campName" class="medium-input" />
          </template>
        </el-table-column>
        <el-table-column label="营长">
          <template #default="{ row }" class="action-cell">
            <BaseSelect v-model="row.campPrincipalId" class="medium-input" :options="campOptions"></BaseSelect>
          </template>
        </el-table-column>
        <el-table-column prop="campName" label="人数上限">
          <template #default="scope" class="action-cell">
            <el-input
              v-model="scope.row.amountLimit"
              class="medium-input"
              @blur="checkTable(scope)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="campName" label="折扣">
          <template #default="scope" class="action-cell">
            <el-input v-model="scope.row.discount" class="medium-input" @blur="checkTable(scope)" />
          </template>
        </el-table-column>
      </BasePageTable>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="editDialogVisible"
      title="编辑"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="tagConfirm"
    >
      <div>
        <div class="section-item">
          <span class="section-label label-1">营ID：</span>
          <span>{{ currentTag.campId }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color: red">*</span>营名称：
          </span>
          <el-input v-model="currentTag.campName" clearable class="medium-input2"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color: red">*</span>营长：
          </span>
          <BaseSelect
            v-model="currentTag.campPrincipalId"
            class="medium-input2"
            :options="campOptions"
          ></BaseSelect>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color: red">*</span>人数上限：
          </span>
          <el-input
            v-model="currentTag.amountLimit"
            clearable
            class="medium-input2"
            @blur="checkText"
          ></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color: red">*</span>折扣设置：
          </span>
          <el-input
            v-model="currentTag.discount"
            clearable
            class="medium-input2"
            @blur="checkText1('discount')"
          ></el-input>
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
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import ReturnButton from '@/components/ReturnButton.vue';
import BaseSelect from '@/components/BaseSelect.vue';

export default {
  name: 'goods_dish-unit',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    ReturnButton,
    BaseSelect
  },
  data() {
    return {
      height: window.innerHeight - 330,
      loading: false,
      box: false,
      editDialogVisible: false,
      currentTag: {
        campId: '',
        campPrincipalId: '',
        campName: '',
        amountLimit: '',
        discount: ''
      },
      campOptions: [],
      boxData: [],
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '减肥营ID',
          prop: 'campId'
        },
        {
          label: '减肥营名称',
          prop: 'campName',
          formatter: row => row.campName || ''
        },
        {
          label: '营长名称',
          prop: 'campPrincipal',
          formatter: row => row.campPrincipal || ''
        },
        {
          label: '营长手机号',
          prop: 'campPrincipalPhone',
          formatter: row => row.campPrincipalPhone == '0' ? '' : row.campPrincipalPhone
        },
        {
          label: '折扣',
          prop: 'discount',
          formatter: row => row.discount || '无'
        },
        {
          label: '参与营人数',
          prop: 'peopleNum',
          formatter: row => row.peopleNum || ''
        },
        {
          label: '人数上限',
          prop: 'amountLimit',
          formatter: row => row.amountLimit || ''
        },
        {
          label: '期间总消费金额',
          prop: 'amount',
          formatter: row => row.amount || ''
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        activityId: '',
        campPrincipalPhone: ''
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'campPrincipalPhone',
          label: '营长手机号',
          placeholder: '营长手机号',
          props: {
            clearable: true
          }
        }
      ]
    };
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  created() {
    this.queryParams.activityId = this.$route.query.activityId || '';
    this.getCampPrincipal();
    this.getList();
  },
  methods: {
    checkText() {
      this.currentTag.amountLimit = isNaN(this.currentTag.amountLimit) ? '' : Number(this.currentTag.amountLimit).toFixed(0);
    },
    checkText1(type) {
      let number = this.currentTag[type];
      const toFixed = type == 'discount' ? 2 : 0;
      number = isNaN(number) ? '' : Number(number).toFixed(toFixed);
      number = number == 0 ? '' : number;
      this.currentTag[type] = number;
    },
    checkTable(scope) {
      let number = this.boxData[scope.$index].amountLimit;
      number = number == '' ? '' : (isNaN(number) ? '' : Number(number).toFixed(0));
      number = number == 0 ? '' : number;
      this.boxData[scope.$index].amountLimit = number;
    },
    async getCampPrincipal() {
      const res = await this.$http('marketing.activity.LoseWeightCamp/getCampPrincipal', {});
      this.campOptions = res.obj.map(val => ({ label: val.campPrincipal + ' - ' + val.campPrincipalPhone, value: val.campPrincipalId }));
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      this.$store.state.vloading = true;
      const res = await this.$http('marketing.activity.LoseWeightCamp/getActivityCamps', params);
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
        pageSize: this.tableDataTotal
      };
      const res = await this.$http('marketing.activity.LoseWeightCamp/getActivityCamps', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
      });
    },
    async toEdit(row) {
      Object.assign(this.currentTag, row);
      this.currentTag.campPrincipalId = this.currentTag.campPrincipalId ? this.currentTag.campPrincipalId : '';
      this.currentTag.amountLimit = this.currentTag.amountLimit ? this.currentTag.amountLimit : '';
      this.editDialogVisible = true;
    },
    async toBatchEdit() {
      this.box = true;
      this.loading = true;
      const params = {
        activityId: this.$route.query.activityId,
        pageNo: 1,
        pageSize: 9999
      };
      const res = await this.$http('marketing.activity.LoseWeightCamp/getActivityCamps', params);
      this.boxData = res.obj.record;
      for(const item of this.boxData) {
        item.amountLimit = item.amountLimit ? item.amountLimit : '';
        item.campPrincipalId = item.campPrincipalId ? item.campPrincipalId : '';
      }
      this.loading = false;
      setTimeout(() => {
        this.$refs.boxTable.doLayout();
      }, 200);
    },
    async toDel(row) {
      this.$confirm('确定删除？', '提示？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('FoodUnit/deleteUnit', { tfsId: row.tfsId });
        if (!res.errMsg) {
          this.$msg('操作成功', 'success');
          this.getList();
        } else {
          this.$msg(res.errMsg, 'error');
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
    async tagConfirm(done) {
      if (!this.currentTag.campName) {
        this.$msg('请输入营名称', 'error');
        done();
        return;
      }
      if (!this.currentTag.campPrincipalId) {
        this.$msg('请选择营长', 'error');
        done();
        return;
      }
      if (!this.currentTag.amountLimit || this.currentTag.amountLimit == '0') {
        this.$msg('请输入人数上限', 'error');
        done();
        return;
      }
      if (!this.currentTag.discount) {
        this.$msg('请输入折扣', 'error');
        done();
        return;
      }
      const params = {
        activityId: this.$route.query.activityId,
        campPrincipal: [
          {
            campId: this.currentTag.campId,
            campPrincipalId: this.currentTag.campPrincipalId,
            campName: this.currentTag.campName,
            amountLimit: this.currentTag.amountLimit,
            discount: this.currentTag.discount
          }
        ]
      };
      const res = await this.$http('marketing.activity.LoseWeightCamp/editPrincipal', params);
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.editDialogVisible = false;
        this.getList();
        setTimeout(done(), 800);
      } else {
        this.$msg(res.errMsg, 'error');
        done();
      }
    },
    async boxConfirm(done) {
      const arr = this.boxData.filter(val => val.campName || val.campPrincipalId || val.amountLimit);
      if (!arr.length) {
        this.$msg('请填写正确数据', 'error');
        done();
        return;
      }
      for (const item of arr) {
        if (!item.campName || !item.campPrincipalId || !item.amountLimit) {
          this.$msg('请填写完整数据', 'error');
          done();
          return;
        }
      }
      const params = {
        activityId: this.$route.query.activityId,
        campPrincipal: arr
      }
      const res = await this.$http('marketing.activity.LoseWeightCamp/editPrincipal', params);
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.box = false;
        this.getList();
        setTimeout(done(), 800);
      } else {
        this.$msg(res.errMsg, 'error');
        done();
      }
    },
    toDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/detailed`,
        query: {
          campId: row.campId,
          campPrincipal: row.campPrincipal,
          activityId: this.$route.query.activityId
        }
      });
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
.medium-input {
  width: 100%;
}
.medium-input2 {
  width: 250px;
}
.action-label {
  margin-right: 10px;
}
</style>
