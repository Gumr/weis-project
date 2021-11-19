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
          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="handleSelect">选择复活菜品</el-button>
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
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <el-table-column label="菜品缩略图">
          <template class="action-cell" v-slot="{ row }">
            <el-image
              :src="row.tfsSkuImgUrl"
              :preview-src-list="[row.tfsSkuImgUrl]"
              class="food-cover"
            />
          </template>
        </el-table-column>
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template class="action-cell" v-slot="{ row }">
            <span
              class="brand-color cursor-pointer action-label"
              @click="goUpdate('add', row)"
              v-if="row.isRevive == '01' || !row.isRevive"
            >复活</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="cancelResu(row)"
              v-if="row.isRevive == '02'"
            >取消复活</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="goUpdate('edit', row)"
              v-if="row.isRevive == '02'"
            >编辑日期</span>
            <span class="brand-color cursor-pointer action-label" @click="goDetail(row)">详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="box"
      title="复活日期"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="onConfirm"
    >
      <el-form label-width="130px">
        <el-form-item label="选择复活日期">
          <el-date-picker
            class="medium-input"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            type="date"
            v-model="date"
          ></el-date-picker>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="box2"
      title="选择复活菜品"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="onConfirm2"
    >
      <BasePageTable
        height="700"
        ref="table2"
        v-loading="loading"
        :data="tableData2"
        v-model:selection="tableSelection"
        :visible="false"
        border
      >
        <el-table-column type="selection" label="/" width="50"></el-table-column>
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <el-table-column label="菜品缩略图">
          <template class="action-cell" v-slot="{ row }">
            <el-image
              :src="row.tfsSkuImgUrl"
              :preview-src-list="[row.tfsSkuImgUrl]"
              class="food-cover"
            />
          </template>
        </el-table-column>
        <el-table-column label="菜品编码" prop="tfsCid"></el-table-column>
        <el-table-column label="菜品名称" prop="tfsSkuname"></el-table-column>
        <el-table-column label="菜品规格">
          <template class="action-cell" v-slot="{ row }">
            <span>{{row.tfsQuality + row.tfsUnit}}</span>
          </template>
        </el-table-column>
        <el-table-column label="菜品能量" prop="tfsEnergy"></el-table-column>
        <el-table-column label="上架餐别" prop="tfsCategory"></el-table-column>
        <el-table-column label="制定价格" prop="tfsNormalPrice"></el-table-column>
        <el-table-column label="实际价格" prop="tfsPrice"></el-table-column>
        <el-table-column label="当前版本" prop="tfsVersion"></el-table-column>
        <el-table-column label="供应时间" prop="tfsSaleTime"></el-table-column>
        <el-table-column label="是否名厨造" prop="tfsHaveMaster"></el-table-column>
        <el-table-column label="下架时间" prop="tfsUnpublisher"></el-table-column>
      </BasePageTable>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

export default {
  name: 'order-management_ship-list',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        },
      },
      height: 0,
      box: false,
      box2: false,
      loading: false,
      date:　'',
      id: '',
      tfsCid: '',
      tableData: [],
      tableData2: [],
      tableSelection: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '菜品编码',
          prop: 'tfsCid'
        },
        {
          label: '菜品名称',
          prop: 'tfsSkuname'
        },
        {
          label: '菜品规格',
          prop: 'tfsQuality',
          formatter: row => row.tfsQuality + row.tfsUnit
        },
        {
          label: '菜品能量',
          prop: 'tfsEnergy'
        },
        {
          label: '上架餐别',
          prop: 'tfsCategory'
        },
        {
          label: '制定价格',
          prop: 'tfsNormalPrice'
        },
        {
          label: '实际价格',
          prop: 'tfsPrice'
        },
        {
          label: '当前版本',
          prop: 'tfsVersion'
        },
        {
          label: '供应时间',
          prop: 'tfsSaleTime'
        },
        {
          label: '封面标签',
          prop: 'tfsTag'
        },
        {
          label: '是否名厨造',
          prop: 'tfsHaveMaster'
        },
        {
          label: '下架时间',
          prop: 'tfsUnpublishTime'
        },
        {
          label: '下架人',
          prop: 'tfsUnpublisher'
        },
        {
          label: '投票数',
          prop: 'voteNum'
        },
        {
          label: '复活日期',
          prop: 'reviveTime'
        },
        {
          label: '状态',
          prop: 'isReviveDesc'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        date: [],
        category: '',
        skuname: '',
        state: '',
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '下架时间',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
            clearable: true,
          }
        },
        {
          component: 'el-input',
          key: 'skuname',
          label: '菜品名称',
          placeholder: '菜品名称',
          props: {
            clearable: true
          },
          maxlength: 30
        },
        {
          component: 'BaseSelect',
          key: 'category',
          label: '上架餐别',
          props: {
            options: [
              {
                label: '全部',
                value: ''
              },
              {
                label: '早餐',
                value: '01'
              },
              {
                label: '午餐',
                value: '02'
              },
              {
                label: '晚餐',
                value: '03'
              },
            ]
          }
        },
        {
          component: 'BaseSelect',
          key: 'state',
          label: '状态',
          props: {
            options: [
              {
                label: '全部',
                value: ''
              },
              {
                label: '待复活',
                value: '01'
              },
              {
                label: '已复活',
                value: '02'
              },
            ]
          }
        },
      ],
    };
  },
  created() {
    this.getList();
    this.$nt(() => {
      const height = window.innerHeight;
      this.height = `${height - 280}px`;
    });
  },
  methods: {
    async getList() {
      this.$store.state.vloading = true;
      const res = await this.$http('foodfundraising.FoodResurgence/queryFoodResurgenceList', { ...this.page, ...this.genQueryParams() });
      this.tableData = res.obj.page.record;
      this.tableDataTotal = res.obj.page.totalRecordCount;
      setTimeout(() => {
        this.$refs.table.doLayout();
      }, 500);
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const res = await this.$http('foodfundraising.FoodResurgence/queryFoodResurgenceList', { pageNo: 1, pageSize: this.tableDataTotal, ...this.genQueryParams() });
      const columns = [{ label: '序号', type: 'index' }].concat(this.tableCol);
      exportExcel({
        columns,
        filename,
        data: res.obj.page.record
      });
    },
    async goUpdate(type, row) {
      this.date = type == 'add' ? '' : row.reviveTime;
      this.id = row.id;
      this.tfsCid = row.tfsCid;
      this.box = true;
    },
    async onConfirm(done) {
      if (!this.date) {
        this.$msg('请选择复活日期', 'error');
        done();
        return;
      }
      const res = await this.$http('foodfundraising.FoodResurgence/foodResurgence', { id: this.id, date: this.date, tfsCid: this.tfsCid });
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.getList();
        this.box = false;
        setTimeout(() => {
          done();
        }, 500);
      } else {
        this.$msg(res.errMsg, 'error');
        done();
      }
    },
    async handleSelect() {
      this.box2 = true;
      this.loading = true;
      const res = await this.$http('foodfundraising.FoodResurgence/queryUnpublishFoodList', {});
      this.tableData2 = res.obj;
      this.loading = false;
      this.$nt(() => {
        this.$refs.table2.doLayout();
        for (const item of res.obj) {
          if (item.isSelect == '1') {
            this.$refs.table2.$refs.table.toggleRowSelection(item);
          }
        }
      });
    },
    async onConfirm2(done) {
      const tfsCids = this.tableSelection.map(item => item.tfsCid);
      const res = await this.$http('foodfundraising.FoodResurgence/foodResurgenceSave', { tfsCids });
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.getList();
        this.box2 = false;
        setTimeout(done, 500);
      } else {
        this.$msg(res.errMsg, 'error');
        done();
      }
    },
    async cancelResu(row) {
      const res = await this.$http('foodfundraising.FoodResurgence/foodUnresurgence', { id: row.id });
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.getList();
      } else {
        this.$msg(res.errMsg, 'error');
      }
    },
    goDetail(row) {
      this.$router.push({
        path: '/goods/putaway-list/detail',
        query: {
          tfsId: row.tfsId,
          tfsCid: row.tfsCid,
          tfsVersion: row.tfsVersion
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
      if (params.shipdate && params.shipdate.length > 0) {
        const [startShipDate, endShipDate] = transformDaterange(params.shipdate);
        params.startShipDate = startShipDate.format('YYYY-MM-DD');
        params.endShipDate = endShipDate.format('YYYY-MM-DD');
      }
      delete params.date;
      delete params.shipdate;
      return params;
    },
  }
};
</script>

<style lang="less" scoped>
.page-container {
  padding-bottom: 0;
}
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.action-label {
  margin-right: 10px;
}
</style>
