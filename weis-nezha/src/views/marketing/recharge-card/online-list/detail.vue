<template>
  <div class="page-container">
    <section>
      <h3>基础信息</h3>
      <div>
        <div class="display-flex">
          <p>
            <span style="vertical-align: top;">购买人昵称：</span>
            <span>{{infolist.uname}}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span style="vertical-align: top;">购买人手机：</span>
            <span>{{infolist.phone}}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>购买时间：</span> <span>{{ infolist.buyTime }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>订单卡张数：</span> <span>{{ infolist.count }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>卡面总金额：</span> <span>{{ infolist.denomination }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>支付金额：</span> <span>{{ infolist.paymentAmount }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>支付方式：</span> <span>{{ infolist.payType }}</span>
          </p>
        </div>
        <div class="display-flex">
          <p>
            <span>卡信息：</span>
          </p>
        </div>
        <div style="padding-left: 30px">
          <p>
            <BasePageTable
              :visible="false"
              :data="infolist.card"
              border>
              <el-table-column
                v-for="col in tableCol"
                :key="col.prop"
                v-bind="col"
              ></el-table-column>
            </BasePageTable>
          </p>
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
  created() {
    this.infolist.id = this.$route.query.id;
    this.getInfo();
  },
  data() {
    return {
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '卡ID',
          prop: 'cid'
        },
        {
          label: '卡名称',
          prop: 'name'
        },
        {
          label: '卡面金额',
          prop: 'amount'
        },
        {
          label: '当前状态',
          prop: 'strStt'
        }
      ],
      infolist: {
        id: '',
        oid: '',
        count: '',
        denomination: '',
        paymentAmount: '',
        uname: '',
        phone: '',
        buyTime: '',
        useCount: '',
        notUsedCount: '',
        stt: '',
        buyType: '',
        card: [],
      },
    };
  },
  methods: {
    getInfo() {
      this.$request('card.Order/get', {id: this.infolist.id}).then(
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

<style>
  .display-flex{
    padding-left: 30px;
  }
</style>
