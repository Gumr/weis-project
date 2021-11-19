<template>
  <div class="page-container">
    <section>
      <div class="section-item">
        <span class="section-label label-1">取餐码：</span>
        <span>{{ infolist.tsmeTakeMealCode }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">下单人手机：</span>
        <span>{{ infolist.tsmeUphone }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">客户需求：</span>
        <span>{{ infolist.tsmeTypeDesc }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">订单编号：</span>
        <span>{{ infolist.tsmeOrderId }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">配送方式：</span>
        <span>{{ infolist.tsmeDistributionMode == '0' ? '配送' : '自取' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">供餐点：</span>
        <span>{{ infolist.tsmeHeatingPointName }}</span>
      </div>
      <!-- 异常情况 start -->
      <!-- 修改配送时间 -->
      <div v-if="infolist.tsmeType === '04'">
        <div class="section-item">
          <span class="section-label label-1">原配送时间：</span>
          <span>{{ infolist.tsmeOriMealTakingTime }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">更改配送时间：</span>
          <span>{{ infolist.tsmeMealTakingTime }}</span>
        </div>
      </div>
      <!-- 修改配送地址 -->
      <div v-if="infolist.tsmeType === '03'">
        <div class="section-item">
          <span class="section-label label-1">原配送地址：</span>
          <span>{{ infolist.tsmeOriAddress }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">配送地址：</span>
          <span>{{ infolist.tsmeAddress }}</span>
        </div>
      </div>
      <!-- 修改配送地址 -->
      <div v-if="infolist.tsmeType === '05'">
        <div class="section-item">
          <span class="section-label label-1">原手机号：</span>
          <span>{{ infolist.tsmeOriPhone }}</span>
        </div>
        <div v-if="infolist.tsmePhone != ''" class="section-item">
          <span class="section-label label-1">手机号：</span>
          <span>{{ infolist.tsmePhone }}</span>
        </div>
      </div>
      <!-- 退款 -->
      <div>
        <div v-if="infolist.tsmeType === '01'" class="section-item">
          <span class="section-label label-1">请选择菜品：</span>
          <BasePageTable :data="infolist.tsmeSkuJson" :visible="false" border>
            <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col" />
          </BasePageTable>
        </div>
        <div v-if="infolist.tsmeType === '01' || infolist.tsmeType === '02'" class="section-item">
          <span class="section-label label-1">退款原因：</span>
          <span>{{ infolist.tsmeCauseDesc }}</span>
        </div>
        <div v-if="infolist.tsmeType === '02'" class="section-item">
          <span class="section-label label-1">是否返回库存：</span>
          <span>{{ infolist.tsmeIsInventory == '1' ? '是' : '否' }}</span>
        </div>
      </div>
      <!-- 异常情况 end -->
      <div class="section-item">
        <span class="section-label label-1">备注：</span>
        <span>{{ infolist.tsmeRemark }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">附件上传：</span>
        <div style="display: flex;align-items: center;flex-wrap: wrap;">
          <el-image
            v-for="(url, inx) in infolist.tsmeImg"
            :key="inx"
            style="width: 200px"
            :src="url"
            :preview-src-list="[url]"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';

export default {
  components: {
    BasePageTable
  },
  data() {
    return {
      id: '',
      infolist: {
        orderId: '',
        type: '',
        skuJson: [],
        cause: '',
        oriAddress: '',
        address: '',
        longitude: '',
        latitude: '',
        oriMealTakingTime: '',
        mealTakingTime: '',
        remark: '',
        imgs: [],
        tsmeType: '',
      },
      tableCol: [
        { label: '商品编码', prop: 'cid' },
        { label: '商品品名', prop: 'name' },
        { label: '规格', prop: 'quality' },
        { label: '数量', prop: 'num' },
        { label: '单价', prop: 'price' },
        { label: '订单金额 ', prop: 'totalPrice' },
      ],
    }
  },
  created() {
    this.id = this.$route.query.id;
    this.getErrorInfo();
  },
  methods: {
    // 校验订单合法性
    getErrorInfo() {
      this.$request('shoperror.ShopManagerError/queryShopManagerErrorInfo', {tsmeId: this.id }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.infolist, dataPage);
          }
        })
      );
    },

  }
};
</script>

<style lang="less" scoped>
.label-1 {
  width: 120px;
  margin-right: 12px;
  text-align: right;
}
</style>
