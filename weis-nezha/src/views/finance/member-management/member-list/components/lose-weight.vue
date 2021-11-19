<template>
  <div class="">
    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :visible="false"
        border
      >
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
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

export default {
  name: 'goods_dish-unit',
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
  created() {
    this.uid = this.$route.query.id;
    this.getList();
  },
  data() {
    return {
      uid: '',
      height: window.innerHeight - 260,
      tableData: [],
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '活动ID',
          prop: 'activityId'
        },
        {
          label: '活动名称',
          prop: 'activityName'
        },
        {
          label: '营名称',
          prop: 'campName'
        },
        {
          label: '营长',
          prop: 'campPrincipal'
        },
        {
          label: '营长手机',
          prop: 'campPrincipalPhone'
        },
        {
          label: '活动周期',
          prop: 'period'
        },
        {
          label: '积分',
          prop: 'integral'
        },
        {
          label: '状态',
          prop: 'stt'
        },
      ],
    };
  },
  methods: {
    async getList() {
      this.$store.state.vloading = true;
      const res = await this.$http('userdetails.UserDetails/loseWeightActivity', {uid: this.uid, pageSize: 999, pageNo: 1});
      if (!res.errMsg) {
        this.tableData = res.obj.record;
      }
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const res = await this.$http('userdetails.UserDetails/loseWeightActivity', {uid: this.uid, pageSize: 999, pageNo: 1});
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
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
.medium-input {
  width: 250px;
  margin-right: 20px;
}

.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}
.action-label {
  margin-right: 10px;
}
</style>
