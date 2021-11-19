<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :span="7"
        :label-width="80"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="add">新建</el-button>
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
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <el-button type="primary" v-if="row.stt == '00'" @click="toEdit(row)">失效</el-button>
            <span type="text" style="color:red" v-if="row.stt == '01'">已失效</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="box"
      title="设置不营业时间"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="tagConfirm"
    >
      <div>
        <div class="section-item">
          <span class="section-label label-1">时间：</span>
          <el-date-picker
            type="daterange"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            v-model="currentTag.date"
          ></el-date-picker>
        </div>
        <div class="section-item">
          <span class="section-label label-1">餐别：</span>
          <el-checkbox-group v-model="currentTag.categorys" @change="categoryChange">
            <el-checkbox
              v-for="(item, index) in categorys"
              :key="index"
              :label="item.value"
            >{{item.label}}</el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="section-item">
          <span class="section-label label-1">供餐点：</span>
          <el-checkbox-group
            v-model="currentTag.shipIds"
            style="width: 600px;"
            @change="heatChange"
          >
            <el-checkbox style="width: 100px;margin-bottom: 10px;" label="00">全部</el-checkbox>
            <el-checkbox
              style="width: 100px;margin-bottom: 10px;"
              v-for="(item, index) in heatArr"
              :key="index"
              :label="item.shipId"
            >{{item.shipName}}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import exportExcel from '@/utils/export-excel';
import { transformDaterange } from '@/utils/transform';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
  },
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now();
        },
      },
      height: window.innerHeight - 330,
      box: false,
      heatArr: [],
      categorys: [],
      currentTag: {
        date: [],
        categorys: [],
        shipIds: [],
      },
      queryParams: {
        stt: '',
        shipName: '',
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'shipName',
          label: '供餐点名称',
          placeholder: '供餐点名称',
          maxlength: 30,
          props: {
            clearable: true
          }
        },
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '状态',
          props: {
            clearable: true,
            options: [
              { label: '正常', value: '00' },
              { label: '失效', value: '01' }
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
          label: '供餐点名称',
          prop: 'shipNames'
        },
        {
          label: '不营业时间',
          prop: 'closeTime'
        },
        {
          label: '创建时间',
          prop: 'utime',
          formatter: row => this.$day(row.utime).format('YYYY-MM-DD')
        },
      ],
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
    };
  },
  created() {
    this.getInfo();
    this.getList();
  },
  methods: {
    categoryChange() {
      const { categorys } = this.currentTag
      console.log(categorys, 'categorys')
      const current = categorys[categorys.length - 1]
      if (current === '00') {
        this.currentTag.categorys = ['00'];
      } else {
        const idx = categorys.indexOf('00')
        if (idx !== -1) {
          this.currentTag.categorys.splice(idx, 1)
        }
      }
      // if (last == '00') {
      //   this.currentTag.categorys = ['00'];
      // } else if (e[0] == '00') {
      //   this.currentTag.categorys.shift();
      // } else if (e.length == this.categorys.length) {
      //   this.currentTag.categorys = ['00'];
      // }
    },
    heatChange(e) {
      const last = e[e.length - 1];
      if (last == '00') {
        this.currentTag.shipIds = ['00'];
      } else if (e[0] == '00') {
        this.currentTag.shipIds.shift();
      } else if (e.length == this.heatArr.length) {
        this.currentTag.shipIds = ['00'];
      }
    },
    add() {
      this.currentTag = {
        date: [],
        categorys: [],
        shipIds: [],
      };
      this.box = true;
    },
    async toEdit(row) {
      this.$confirm('确定失效？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        console.log('点击确定');
        const res = await this.$http('shipconf.ShipHeatingClosing/closeConf', { confId: row.confId });
        if (!res.errMsg) {
          this.$msg('失效成功', 'success');
          this.getList();
        } else {
          this.$msg(res.errMsg, 'error');
        }
      }).catch(() => {
        console.log('点击取消');
      });
    },
    searchClick() {
      this.date = this.queryParams.date;
      this.getList();
    },
    async getInfo() {
      const res = await this.$http('shipconf.ShipHeatingClosing/queryGetShipHeating', {});
      this.heatArr = res.obj;

      const rel = await this.$http('shipconf.ShipHeatingClosing/relevantInfo', {});
      this.categorys = [{ label: '全天', value: '00' }, ...rel.obj.categorys];
    },
    async getList() {
      this.$store.state.vloading = true;
      const res = await this.$http('shipconf.ShipHeatingClosing/queryClosingConf', { ...this.page, ...this.genQueryParams() });
      this.tableData = res.obj.record;
      this.tableDataTotal = res.obj.totalRecordCount;
      this.tableData.forEach((val) => {
        val.closeTime = `${this.$day(val.startDate).format('YYYY-MM-DD')} 至  ${this.$day(val.endDate).format('YYYY-MM-DD')}   ${val.category}`;
      });
      this.$nt(() => {
        this.$refs.table.doLayout();
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
      if (!this.currentTag.date || !this.currentTag.date.length) {
        this.$msg('请选择日期', 'error');
        done();
        return;
      }
      if (!this.currentTag.categorys.length) {
        this.$msg('请选择餐别', 'error');
        done();
        return;
      }
      if (!this.currentTag.shipIds.length) {
        this.$msg('请选择加热点', 'error');
        done();
        return;
      }

      const params = this.$deepClone(this.currentTag);

      params.categorys = params.categorys.includes('00') ? this.categorys.map(val => val.value) : params.categorys;
      params.shipIds = params.shipIds.includes('00') ? this.heatArr.map(val => val.shipId) : params.shipIds;
      params.startDate = params.date[0];
      params.endDate = params.date[1];
      const res = await this.$http('shipconf.ShipHeatingClosing/addClosingConf', params);
      if (!res.errMsg) {
        this.$msg('添加成功', 'success');
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
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.txt {
  width: 300px;
}
.food-cover {
  max-height: 100%;
  max-width: 100%;
}
</style>
