<template>
  <div class="page-container">
    <section>
      <ReturnButton back />
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">活动名称：</span>
        <el-input class="medium-input" v-model="formData.tfdName" />
      </div>
      <div class="section-item">
        <span class="section-label label-1">选择商品：</span>
        <el-button type="primary" @click="showDialog">{{tableData.length ? '编辑商品' : '选择商品'}}</el-button>
      </div>
      <div class="section-item">
        <span class="section-label label-1"></span>
        <BasePageTable height="500" ref="table" :data="tableData" :visible="false" border>
          <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        </BasePageTable>
      </div>
      <div class="section-item">
        <span class="section-label label-1">设置特惠：</span>
        <el-radio-group v-model="formData.tfdDiscountType">
          <el-radio class="radio" label="01">打</el-radio>
          <el-radio class="radio" label="02">减</el-radio>
          <el-radio class="radio" label="03">固定</el-radio>
        </el-radio-group>
      </div>
      <div class="section-item">
        <span class="section-label label-1"></span>
        <el-input class="mini-input" v-model="formData.tfdDiscountValue" @blur="checkText" />
        <span>{{formData.tfdDiscountType == '01' ? '折' : '元'}}</span>
      </div>
    </section>
    <footer class="btn-footer">
      <el-button type="primary" @click="submit" :loading="loading">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </footer>
    <ConfirmDialog
      v-model:selection="tableSelection"
      v-model="box"
      :title="tableData.length ? '编辑商品' : '选择商品'"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <BasePageTable
        ref="boxTable"
        height="600"
        empty-text="当前没有可关联菜品，请先到erp系统新建一款菜品"
        :visible="false"
        :data="boxTable"
        v-loading="boxloading"
        border
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="菜品编码" prop="tfddCid"></el-table-column>
        <el-table-column label="菜品名称" prop="tfddSkuName"></el-table-column>
        <el-table-column label="菜品原价" prop="tfddSkuPrice"></el-table-column>
        <el-table-column label="供应时间" prop="tfddSaletime"></el-table-column>
        <el-table-column label="上架端口" prop="tfddOpenMarket"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="scope">
            <span
              class="brand-color cursor-pointer action-label"
              @click="change(scope, scope.row.tfddSelect)"
            >{{scope.row.tfddSelect == '1' ? '取消选择' : '选择'}}</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </ConfirmDialog>
  </div>
</template>

<script>
import ReturnButton from '@/components/ReturnButton.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
export default {
  components: {
    ReturnButton,
    BasePageTable,
    ConfirmDialog
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
    checkText() {
      let number = this.formData.tfdDiscountValue;
      number = isNaN(number) ? '' : Math.abs(Number(number).toFixed(2));
      number = number == 0 ? '' : number;
      this.formData.tfdDiscountValue = number;
    },
    async getInfo() {
      const res = await this.$http('FoodDiscount/queryFoodDiscountInfo', {tfdId: this.$route.query.tfdId});
      this.formData.tfdName = res.obj.tfdName;
      this.formData.tfdDiscountType = res.obj.tfdDiscountType;
      this.formData.tfdDiscountValue = res.obj.tfdDiscountValue;
      this.tableData = res.obj.foodList;
    },
    async showDialog() {
      this.box = true;
      this.boxloading = true;
      const res = await this.$http('FoodDiscount/queryFoodList', {tfdId: ''});
      this.boxTable = res.obj;
      const arr = this.tableData.map(val => val.tfddCid);
      for (const item of this.boxTable) {
        if (arr.includes(item.tfddCid)) {
          item.tfddSelect = '1';
        }
      }
      this.boxloading = false;
      setTimeout(() => {
        this.$refs.boxTable.doLayout();
      }, 300);
    },
    change(scope, type) {
      this.boxTable[scope.$index].tfddSelect = type == '1' ? '0' : '1';
    },
    onconfirm() {
      const arr = this.boxTable.filter(val => val.tfddSelect == '1');
      this.tableData = arr;
      this.box = false;
    },
    async submit() {
      if (!this.formData.tfdName) {
        this.$msg('请输入活动名称', 'error');
        return;
      }
      if (!this.tableData.length) {
        this.$msg('请选择菜品', 'error');
        return;
      }
      if (!this.formData.tfdDiscountValue) {
        this.$msg('请输入折扣', 'error');
        return;
      }
      const params = {
        tfdName: this.formData.tfdName,
        tfdDiscountType: this.formData.tfdDiscountType,
        tfdDiscountValue: this.formData.tfdDiscountValue,
        foodList: this.tableData.map(val => val.tfddCid)
      };
      if (this.$route.query.tfdId) {
        params.tfdId = this.$route.query.tfdId;
      }
      this.loading = true;
      const res = await this.$http('FoodDiscount/editFoodDiscount', params);
      this.loading = false;
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.$closeRoute();
      } else {
        this.$msg(res.errMsg, 'error');
      }
    },
    cancel() {
      this.$confirm(`确认取消？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        this.$closeRoute();
      });
    }
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
