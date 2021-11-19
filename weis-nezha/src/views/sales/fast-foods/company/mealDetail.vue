<template>
  <div class="page-container">
    <section>
      <div class="section-item">
        <span class="section-label label-1">套餐名称：</span>
        <span>{{tgcName}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">套餐菜品：</span>
        <BasePageTable
          height="500"
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
      <div class="section-item" v-if="tableData.length">
        <span class="section-label label-1"></span>
        <span>合计：菜品数量 * {{dishTotal}} ，菜品总价：{{priceTotal}} 元</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">套餐价格：</span>
        <span>{{tgcAmount}}</span> 元
      </div>
    </section>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
export default {
  components: {
    BasePageTable,
  },
  data() {
    return {
      tableData: [],
      dishTotal: 0,
      priceTotal: 0,
      tableCol: [
        { label: '序号', type: 'index', width: '80' },
        { label: '菜品编码', prop: 'tfsCid', width: '120' },
        { label: '菜品名称', prop: 'tfsSkuname', width: '120' },
        { label: '菜品单价', prop: 'tfsPrice', width: '120' },
        { label: '数量', prop: 'tfsNum', width: '120' },
      ],
      tgccComboId: '',
      tgcName: '',
      tgcAmount: '',
      skuInfo: [],
    }
  },
  created() {
    this.tgccComboId = this.$route.query.tgccComboId;
    if (this.tgccComboId) {
      this.getInfo();
    }
  },
  methods: {
    async getInfo() {
      const res = await this.$http('groupmeal.Combo/queryComboById', { tgcId: this.tgccComboId });
      this.tgcName = res.obj.tgcName;
      this.tgcAmount = res.obj.tgcAmount;
      this.tableData = res.obj.skuInfo;
      this.dishTotal = 0;
      this.priceTotal = 0;
      this.tableData.forEach(item => {
        this.dishTotal += Number(item.tfsNum);
        this.priceTotal += (Number(item.tfsNum) * Number(item.tfsPrice));
      });
      this.priceTotal = this.priceTotal.toFixed(2);
    },
  }
}
</script>

<style lang="less" scoped>
 h3{
   margin-right: 20px;
 }
 h4 {
  margin: 10px 0;
 }
 section {
   padding-top: 30px;
 }
.mini-input {
  width: 100px;
  margin-right: 20px;
}
.medium-picker {
  width: 300px;
}
.medium-input {
  width: 350px;
  margin-right: 20px;
}
.max-input {
  width: 350px;
}
.medium-select {
  width: 70px;
  margin-left: 10px;
}
.rule {
  padding-left: 150px;
}
.tiny-input {
  width: 150px;
  margin: 0 20px;
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
    height: 38px;
    line-height: 5px;
  }
}
.btn-footer {
  text-align: center;
}
.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}

.label-3, h3 {
  margin-left: 22px;
}
</style>
