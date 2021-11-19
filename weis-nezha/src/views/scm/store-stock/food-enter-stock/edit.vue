<template>
  <div class="page-container">
    <div class="section-item">
      <span class="section-label label-1">供餐点：</span>
      <span>{{ tkdhHpName }}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">备货用途：</span>
      <span>{{ tkdhChannelDesc }}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">备注：</span>
      <span>{{ remark }}</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">备货售卖时间：</span>
      <el-date-picker v-model="date" value-format="yyyy-MM-dd" @change="dateChange"></el-date-picker>
      <el-button type="primary" :loading="loading" style="margin-left: 20px;height: 38px;" @click="confirm">保存</el-button>
    </div>
    <div style="padding-top: 20px;">
      <BasePageTable
        :visible="false"
        :data="tableData"
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
import BasePageTable from '@/components/BasePageTable.vue';
import { catchNonNumberKeydown } from '@/utils/event-catcher';
import exportExcel from '@/utils/export-excel';
import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    BasePageTable
  },
  data() {
    return {
      count: 0,
      tkdhId: '',
      tkdhHpName: '',
      tkdhChannelDesc: '',
      remark: '',
      loading: false,
      date: this.$day(new Date(Date.now() + 86400000)).format('YYYY-MM-DD'),
      tableData: [],
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: 'SKU',
          prop: 'tkdhSkuName'
        },
        {
          label: '编码',
          prop: 'tkdhCid'
        },
        {
          label: '规格',
          prop: 'tfsQuality',
          formatter: row => `${row.tkdhQuality}${row.tkdhUnit}`
        },
        {
          label: '供餐点',
          prop: 'tkdhHpName'
        },
        {
          label: '总量',
          prop: 'tkdhTotal'
        },
        {
          label: '端内备货量',
          prop: 'tkdhInnerTotal'
        },
        {
          label: '端外备货量',
          prop: 'tkdhOutTotal'
        },
      ],
    };
  },
  created() {
    this.tkdhId  = this.$route.query.id;
    this.date  = this.$route.query.date;
    this.remark = this.$route.query.remark;
    this.tkdhHpName  = this.$route.query.tkdhHpName;
    this.tkdhChannelDesc  = this.$route.query.tkdhChannelDesc;
    this.getList();
  },
  methods: {
    catchNonNumberKeydown,
    getTomorrowTimes() {
      return this.$day().add(1, 'day').startOf('day').valueOf()
    },
    dateChange(val) {
      if (this.getTomorrowTimes() === val.valueOf()) {
        this.$msgbox({
          title: '提示',
          message: '备货选择明天,需要生成“补生产单”',
          showCancelButton: false,
          confirmButtonText: '确定'
        })
      }
    },
    getList() {
      this.$request('OrderStockHist/queryStockHistDetailList', { tkdhId: this.tkdhId, type: '05' }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.tableData = dataPage;
          }
        })
      );
    },
    handleExport() {
      const filename = `${this.$route.meta.title}-导出`;
      exportExcel({
        columns: this.tableCol,
        filename,
        data: this.tableData
      });
    },
    async confirm() {
      if (!this.date) {
        this.$msg('请选择时间', 'error');
        return;
      }
      this.loading = true;
      const params = {
        date: this.date,
        type: '05',
        tkdhId: this.tkdhId,
      }
      const res = await this.$http('OrderStockHist/updateStockHist', params);
      if (!res.errMsg) {
        this.$msg('修改成功', 'success');
        this.$router.go(-1);
      } else {
        this.$msg(res.errMsg, 'error');
      }
      this.loading = false;
    }
  }
});
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}

.food-cover {
  max-height: 100%;
  max-width: 100%;
}
.small-input {
  margin-left: 8px;
  width: 120px;
}
.small-select {
  margin-left: 8px;
  width: 200px;
}

.section-label {
  display: inline-block;
}

.section-item {
  margin: 20px 0;
  display: flex;
  align-items: center;
  min-height: 30px;
  flex-wrap: wrap;
  button {
    height: 30px;
    line-height: 5px;
  }
}

.btn-footer {
  text-align: center;
}
.label-1 {
  width: 130px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 210px;
}

.label-3,
h3 {
  margin-left: 22px;
}
</style>
