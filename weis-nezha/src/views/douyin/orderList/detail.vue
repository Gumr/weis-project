<template>
  <div class="page-container">
    <el-divider>
      <h3>支付信息</h3>
    </el-divider>
    <section>
      <div class="section-item">
        <span class="section-label label-1">订单号:</span>
        <span>{{dataList.orderNo}}</span>
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">下单人手机:</span>
        <span>{{dataList.payPhone}}</span>
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">下单时间:</span>
        <span>{{dataList.payDate}}</span>
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">实付金额:</span>
        <span>{{dataList.actualPrice}}</span>
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">支付方式:</span>
        <span>{{dataList.payMode}}</span>
      </div>
    </section>
    <el-divider>
      <h3>套餐包信息</h3>
    </el-divider>
    <section>
      <div class="section-item">
        <span class="section-label label-1">套餐包名称:</span>
        <span>{{dataList.douCombo.douPackName}}</span>
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">封面:</span>
         <el-image
          v-for="(url, inx) in dataList.douCombo.coverImg"
          :key="inx"
          style="width: 200px;margin-right:10px"
          :src="url"
          :preview-src-list="[url]"
        ></el-image>
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">详情图:</span>
        <el-image
          v-for="(url, inx) in dataList.douCombo.detailsImg"
          :key="inx"
          style="width: 200px;margin-right:10px"
          :src="url"
          :preview-src-list="[url]"
        ></el-image>
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">上架类目:</span>
        <span>{{ dataList.douCombo.classifyStr}}</span>
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">售卖天数餐数:</span>
        <span>{{ dataList.douCombo.daysNum}}天,{{dataList.douCombo.mealsNum}}餐</span>
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">套餐包内容:</span>
        <BasePageTable
          ref="table"
          :data="dataList.douCombo.douComboInfo"
          :visible='false'
          border
        >
          <el-table-column
            v-for="col in tableCol"
            :key="col.prop"
            v-bind="col"
            align="center"
          ></el-table-column>
        </BasePageTable>

      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">套餐合计:</span>
        <span>{{ dataList.douCombo.comboTotalPrice}}</span>
      </div>
    </section>
    <section>
      <div class="section-item">
        <span class="section-label label-1">套餐包价格(含配送费):</span>
        <span>{{ dataList.douCombo.sellPrice}}</span>
      </div>
    </section>
    <el-divider>
      <h3>核销餐单信息</h3>
    </el-divider>
    <section>
      <div class="section-item">

        <BasePageTable
          ref="table"
          :data="dataList.subOrder"
          :visible='false'
          border
        >
          <el-table-column
            v-for="col in tableList"
            :key="col.prop"
            v-bind="col"
            align="center"
          ></el-table-column>
        </BasePageTable>

      </div>
    </section>

  </div>
</template>

<script>
export default {
  data() {
    return {
      dataList:{
        douCombo:{},   
      },
      
      tableList: [
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "关联的订单号",
          prop: "orderNo",
        },
        {
          label: "餐单号",
          prop: "subOrderNo",
        },
        {
          label: "餐别",
          prop: "category",
        },
        {
          label: "套餐名称",
          prop: "comboName",
        },
        {
          label: "菜品",
          prop: "content",
        },
        {
          label: "套餐原价",
          prop: "comboPrice",
        },
        {
          label: "用餐日期",
          prop: "useDate",
        },
        {
          label: "收货地址",
          prop: "takeAddress",
        },
        {
          label: "收货人手机",
          prop: "consigneePhone",
        },
        {
          label: "下单人手机",
          prop: "payPhone",
        },
        {
          label: "下单时间",
          prop: "payDate",
        },
        {
          label: "当前状态",
          prop: "stt",
        },
      ],
      tableCol: [
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "餐别序号",
          prop: "showSort",
        },
        {
          label: "套餐ID",
          prop: "comboId",
        },
        {
          label: "套餐名称",
          prop: "comboName",
        },
        {
          label: "套餐内容",
          prop: "comboContent",
        },
        {
          label: "套餐类型",
          prop:'category'
        },
        {
          label: "商品合计价格",
          prop: "totalPrice",
        },
        {
          label: "套餐价格",
          prop: "actualPrice",
        },
        {
          label: "当前状态",
          prop: "stt",
         
        },
      ],
    };
  },
  created() {
    if (this.$route.query.recordId) {
      // 编辑 查询详情
      this.queryPayDouOrderInfo(this.$route.query.recordId);
    }
  },
  methods: {
    async queryPayDouOrderInfo(id) {
      const res = await this.$http("doupack.OrderManage/queryPayDouOrderInfo", {
        recordId: id,
      });
      if (!res.errMsg) {
       this.dataList ={ ...res.obj}
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
  },
};
</script>

<style>
</style>