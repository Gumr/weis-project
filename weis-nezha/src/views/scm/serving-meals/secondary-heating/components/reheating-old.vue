<template>
  <div class>
    <QueryComponents
      class="query-bar"
      v-model="tableQuery"
      :queryList="tableQueryComps"
      :span="7"
      :label-width="60"
    >
      <template v-slot:action>
        <el-button type="primary" @click="searchClick">搜索</el-button>
        <el-button
          type="primary"
          @click="exportClick"
          :loading="$store.state.bloading"
        >{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
      </template>
    </QueryComponents>
    <!-- 早餐 -->
    <el-table class="table" align="center" style="margin-bottom: 18px;" :data="breakfastTableData">
      <el-table-column align="center" type="index" label="序号" width="60px"></el-table-column>
      <el-table-column label-class-name="category-label" align="center" label="餐别">
        <template>早餐</template>
      </el-table-column>
      <el-table-column align="center" label="非蔬菜类" label-class-name="category-label">
        <el-table-column align="center" label="菜品名称" prop="mName"></el-table-column>
        <el-table-column align="center" label="数量(份)" prop="mCount"></el-table-column>
      </el-table-column>
      <el-table-column align="center" label="蔬菜类" label-class-name="category-label">
        <el-table-column align="center" label="菜品名称" prop="vName"></el-table-column>
        <el-table-column align="center" label="数量" prop="vCount"></el-table-column>
      </el-table-column>
    </el-table>

    <!-- 午餐 -->
    <el-table class="table" style="margin-bottom: 18px;" :data="lunchTableData">
      <el-table-column align="center" type="index" label="序号" width="60px"></el-table-column>
      <el-table-column align="center" label="餐别" label-class-name="category-label">
        <template>午餐</template>
      </el-table-column>
      <el-table-column align="center" label="非蔬菜类" label-class-name="category-label">
        <el-table-column align="center" label="菜品名称" prop="mName"></el-table-column>
        <el-table-column align="center" label="数量(份)" prop="mCount"></el-table-column>
      </el-table-column>
      <el-table-column label="蔬菜类(12:00配送)" align="center" label-class-name="category-label">
        <el-table-column align="center" label="菜品名称" prop="vName"></el-table-column>
        <el-table-column align="center" label="数量(份)" prop="vCount"></el-table-column>
      </el-table-column>
      <el-table-column label="其他时间段蔬菜类" align="center" label-class-name="category-label">
        <el-table-column align="center" label="菜品名称" prop="ovName"></el-table-column>
        <el-table-column align="center" label="数量(份)" prop="ovCount"></el-table-column>
      </el-table-column>
    </el-table>

    <!-- 晚餐 -->
    <el-table class="table" :data="dinnerTableData">
      <el-table-column align="center" type="index" label="序号" width="60px"></el-table-column>
      <el-table-column align="center" label="餐别" label-class-name="category-label">
        <template>晚餐</template>
      </el-table-column>
      <el-table-column align="center" label="非蔬菜类" label-class-name="category-label">
        <el-table-column align="center" label="菜品名称" prop="mName"></el-table-column>
        <el-table-column align="center" label="数量(份)" prop="mCount"></el-table-column>
      </el-table-column>
      <el-table-column label="蔬菜类(18:00配送)" align="center" label-class-name="category-label">
        <el-table-column align="center" label="菜品名称" prop="vName"></el-table-column>
        <el-table-column align="center" label="数量(份)" prop="vCount"></el-table-column>
      </el-table-column>
      <el-table-column label="其他时间段蔬菜类" align="center" label-class-name="category-label">
        <el-table-column align="center" label="菜品名称" prop="ovName"></el-table-column>
        <el-table-column align="center" label="数量(份)" prop="ovCount"></el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import exportExcel from '@/utils/export-excel';
import { getHeadPointList } from '@/utils/data-getter';
import {mapGetters} from 'vuex'
function Sku(m, v, ov) {
  const baseSku = { name: null, count: null };

  m = m || baseSku;
  v = v || baseSku;
  ov = ov || baseSku;
  this.mName = m.name;
  this.mCount = m.count;
  this.vName = v.name;
  this.vCount = v.count;
  this.ovName = ov.name;
  this.ovCount = ov.count;
}

function skuDataConverter(data) {
  return Object.keys(data || {}).map(name => ({
    name,
    count: data[name]
  }));
}

function genSkuList(data, splitVegetable = true) {
  if (!data) return [];

  const meat = data[0] ? skuDataConverter(data[0][1]) : [];
  const vegetables = data[1] || { 0: [], 1: [] };

  const result = [];

  if (splitVegetable) {
    const vegetable = skuDataConverter(vegetables[0]);
    const otherVegetable = skuDataConverter(vegetables[1]);

    const maxLength = Math.max(meat.length,
      vegetable.length,
      otherVegetable.length);

    for (let i = 0; i < maxLength; i += 1) {
      result.push(new Sku(
        meat[i],
        vegetable[i],
        otherVegetable[i]
      ));
    }
  } else {
    const vegetable = skuDataConverter(vegetables[1]);
    const maxLength = Math.max(meat.length,
      vegetable.length,);

    for (let i = 0; i < maxLength; i += 1) {
      result.push(new Sku(
        meat[i],
        vegetable[i]
      ));
    }
  }

  return result;
}

export default {
  name: 'servingMeals_secondary-heating',
  computed: {
    ...mapGetters(['userData']),
  },
  components: {
    QueryComponents
  },
  data() {
    return {
      printDate: this.$day(new Date()).format('YYYY-MM-DD'),
      page: {
        pageNo: 1,
        pageSize: 20
      },
      tableQueryComps: [{
        label: '日期',
        key: 'date',
        component: 'el-date-picker'
      }, {
        label: '供餐点',
        key: 'shipId',
        component: 'BaseSelect',
        props: {
          options: []
        }
      }],
      tableQuery: {
        date: Date.now(),
        shipId: ''
      },
      breakfastTableData: [],
      lunchTableData: [],
      dinnerTableData: [],
      tableCol: [{
        type: 'index',
        label: '序号'
      }, {
        label: 'sku名称',
        prop: 'tfsSkuname'
      }, {
        label: '规格',
        formatter: row => `${row.tfsQuality}g`
      }, {
        label: '配送单-数量',
        prop: 'dispatchingnum'
      }, {
        label: '自取单-数量',
        prop: 'acquirenum'
      }, {
        label: '总计-数量',
        prop: 'totalnum'
      }],
    };
  },
  methods: {
    getHeatPointer() {
      return getHeadPointList().then((res) => {
        const opts = res.heatList;
        this.tableQueryComps[1].props.options = opts;
        // this.tableQuery.shipId = opts[0] && opts[0].value;
      });
    },
    getTableData() {
      const query = { ...this.tableQuery };
      query.date = this.$day(query.date).format('YYYYMMDD');

      this.$request('ServeMealsOperation/skuAginWarm', query).then(({ data }) => {
        if (data.errCode === 0) {
          data = data.obj.collect;
          this.breakfastTableData = genSkuList(data['01'], false);
          this.lunchTableData = genSkuList(data['02']);
          this.dinnerTableData = genSkuList(data['03']);
        }
      });
    },
    searchClick() {
      this.page.pageNo = 1;
      this.printDate = this.$day(this.tableQuery.date).format('YYYY-MM-DD');
      this.getTableData();
    },
    exportClick() {
      const filename = `${this.$route.meta.title}-导出(${this.printDate})`;

      const BreakfastExcel = {
        columns: [{
          type: 'index',
          label: '序号'
        }, {
          label: '早餐',
          formatter: () => '早餐'
        }, {
          label: '非蔬菜类-sku名称',
          prop: 'mName'
        }, {
          label: '非蔬菜类-数量',
          prop: 'mCount'
        }, {
          label: '蔬菜类-sku名称',
          prop: 'vName'
        }, {
          label: '蔬菜类-数量',
          prop: 'vCount'
        }],
        data: this.breakfastTableData
      };

      const LunchExcel = {
        columns: [{
          type: 'index',
          label: '序号'
        }, {
          label: '午餐',
          formatter: () => '午餐'
        }, {
          label: '非蔬菜类-sku名称',
          prop: 'mName'
        }, {
          label: '非蔬菜类-数量',
          prop: 'mCount'
        }, {
          label: '蔬菜类(12:00配送)-sku名称',
          prop: 'vName'
        }, {
          label: '蔬菜类(12:00配送)-数量',
          prop: 'vCount'
        }, {
          label: '其他时间段蔬菜类-sku名称',
          prop: 'ovName'
        }, {
          label: '其他时间段蔬菜类-数量',
          prop: 'ovCount'
        }],
        data: this.lunchTableData
      };

      const DinnerExcel = {
        columns: [{
          type: 'index',
          label: '序号'
        }, {
          label: '晚餐',
          formatter: () => '晚餐'
        }, {
          label: '非蔬菜类-sku名称',
          prop: 'mName'
        }, {
          label: '非蔬菜类-数量',
          prop: 'mCount'
        }, {
          label: '蔬菜类(18:00配送)-sku名称',
          prop: 'vName'
        }, {
          label: '蔬菜类(18:00配送)-数量',
          prop: 'vCount'
        }, {
          label: '其他时间段蔬菜类-sku名称',
          prop: 'ovName'
        }, {
          label: '其他时间段蔬菜类-数量',
          prop: 'ovCount'
        }],
        data: this.dinnerTableData
      };

      exportExcel({
        filename,
        excel: [
          BreakfastExcel,
          LunchExcel,
          DinnerExcel
        ]
      });
    },
  },
  created() {
    this.getHeatPointer().then(this.getTableData);
    this.tableQuery.shipId =  this.userData.heatedPoint[0].value;
  }
};
</script>

<style lang="less" scoped>
.checkbox-type-section {
  flex-grow: 1;
}

.checkbox-type-title {
  font-weight: bold;
  font-size: 16px;
}

.checkbox-box {
  margin: 12px 0;
}

.query-bar {
  margin: 14px 0;
}

.table :deep(.category-label) {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
</style>
