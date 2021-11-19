<template>
  <div class="page-container">
    <section>
      <h3>基础信息</h3>
      <div>
        <div class="display-flex">
          <p>
            <span>套餐订单编号：</span> <span>{{ infolist.tuoOrderId }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>套餐名称：</span> <span>{{ infolist.tuoUcname }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>套餐价格：</span> <span>{{ infolist.tuoUcamount }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>付款用户昵称：</span> <span>{{ infolist.tuoUname }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>付款用户手机：</span> <span>{{ infolist.tuoUphone }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>报名人姓名：</span> <span>{{ infolist.tuoUserName }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>报名人手机：</span> <span>{{ infolist.tuoUserPhone }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>实付金额：</span> <span>{{ infolist.tuoActualAmount }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>支付方式：</span> <span>{{ infolist.tuoPayway }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>付款时间：</span> <span>{{ infolist.tuoCtime }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>当前状态：</span> <span>{{ infolist.tuoUsedSttDesc }}</span>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>

export default {
  components: {
  },
  created() {
    this.infolist.tuoOrderId = this.$route.query.id;
    this.getInfo();
  },
  data() {
    return {
      infolist: {
        tuoId: '',
        tuoOrderId: '',
        tuoUcid: '',
        tuoUcname: '',
        tuoUcamount: '',
        tuoActualAmount: '',
        tuoUid: '',
        tuoUname: '',
        tuoUphone: '',
        tuoCtime: '',
        tuoPayway: '',
        tuoUsedStt: '',
        tuoUsedSttDesc: '',
        tuoUserName: '',
        tuoUserPhone: ''
      },
    };
  },
  methods: {
    getInfo() {
      this.$request('fitness.Fitness/queryUnionOrderDetail', {tuoOrderId: this.infolist.tuoOrderId}).then(
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

<style scoped>
  .page-container {
    font-size: 14px;
  }
  .display-flex{
    padding-left: 30px;
  }
</style>
