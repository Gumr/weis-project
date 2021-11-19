<template>
  <div class="page-container">
    <section>
      <ReturnButton back />
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">活动名称：</span>
        <span class="section-label">{{formData.tfdName}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">选择商品</span>
        <BasePageTable
          height="500"
          ref="table"
          :data="tableData"
          :visible="false"
          border>
          <el-table-column
            v-for="col in tableCol"
            :key="col.prop"
            v-bind="col"
          ></el-table-column>
        </BasePageTable>
      </div>
      <div class="section-item">
        <span class="section-label label-1">设置特惠：</span>
        <el-radio-group disabled="false" v-model="formData.tfdDiscountType">
          <el-radio class="radio" label="01">打</el-radio>
          <el-radio class="radio" label="02">减</el-radio>
          <el-radio class="radio" label="03">固定</el-radio>
        </el-radio-group>
      </div>
      <div class="section-item">
        <span class="section-label label-1"></span>
        <span>{{formData.tfdDiscountValue}}</span>
        <span>{{formData.tfdDiscountType == '01' ? '折' : '钱'}}</span>
      </div>
    </section>
  </div>
</template>

<script>
import ReturnButton from '@/components/ReturnButton.vue';
import BasePageTable from '@/components/BasePageTable.vue';
export default {
  components: {
    ReturnButton,
    BasePageTable,
  },
  data() {
    return {
      box: false,
      loading: false,
      boxloading: false,
      formData: {
        tfdName: '',
        tfdDiscountType: '01',
        tfdDiscountValue: '',
        foodList: []
      },
      boxTable: [],
      tableData: [],
      tableSelection: [],
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '菜品编码',
          prop: 'tfddCid'
        },
        {
          label: '菜品名称',
          prop: 'tfddSkuName'
        },
        {
          label: '菜品原价',
          prop: 'tfddSkuPrice'
        },
        {
          label: '供应时间',
          prop: 'tfddSaletime'
        },
        {
          label: '上架端口',
          prop: 'tfddOpenMarket'
        },
      ],
    }
  },
  created() {
    if (this.$route.query.tfdId) {
      this.getInfo();
    }
  },
  methods: {
    async getInfo() {
      const res = await this.$http('FoodDiscount/queryFoodDiscountInfo', {tfdId: this.$route.query.tfdId});
      this.formData.tfdName = res.obj.tfdName;
      this.formData.tfdDiscountType = res.obj.tfdDiscountType;
      this.formData.tfdDiscountValue = res.obj.tfdDiscountValue;
      this.tableData = res.obj.foodList;
    },
  }
}
</script>

<style>
  .page-container {
    padding-top: 20px;
  }
  .mini-input {
    width: 100px;
    margin-right: 10px;
  }
</style>
