<template>
  <div class="page-container">
    <section>
      <h3>企业信息</h3>

      <div class="section-item">
        <span class="section-label label-1">合作类型：</span>
        <span>{{ companyInfo.corpInfo.tgcType == '00' ? '普通企业' : '对私企业' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">企业类型：</span>
        <span>{{ companyInfo.corpInfo.tgcAreaTypeDesc }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">企业封面：</span>
        <div style="display: flex;align-items: center;flex-wrap: wrap;">
          <el-image
            v-for="(url, inx) in companyInfo.corpInfo.tgcLogoImg"
            :key="inx"
            style="width: 200px"
            :src="url"
            :preview-src-list="[url]"
          ></el-image>
        </div>
      </div>
      <div class="section-item">
        <span class="section-label label-1">企业名称：</span>
        <span>{{ companyInfo.corpInfo.tgcName }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">点餐时间：</span>
        <span>{{ companyInfo.corpInfo.week }}</span>
      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">承包渠道：</span>
        <span>{{ companyInfo.corpInfo.$tgcPartnerChannelType }}</span>
      </div>-->
      <div v-if="companyInfo.corpInfo.tgcPartnerName" class="section-item">
        <span class="section-label label-1">维士销售人员：</span>
        <span>{{ companyInfo.corpInfo.tgcPartnerName }}</span>
      </div>
      <div v-if="companyInfo.corpInfo.tgcProfitRatio" class="section-item">
        <span class="section-label label-1">维士销售人员提成比例：</span>
        <span>{{ companyInfo.corpInfo.tgcProfitRatio }} %</span>
      </div>
      <!-- <div class="section-item">
        <span class="section-label label-1">手机：</span>
        <span>{{ companyInfo.corpInfo.tgcWeisPhone }}</span>
      </div>-->
      <div class="section-item">
        <span class="section-label label-1">配送时间：</span>
        <span style="margin-right: 20px;">早餐</span>
        <span>{{ companyInfo.corpInfo.tgcBreakfastTime }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1"></span>
        <span style="margin-right: 20px;">午餐</span>
        <span>{{ companyInfo.corpInfo.tgcLunchTime }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1"></span>
        <span style="margin-right: 20px;">晚餐</span>
        <span>{{ companyInfo.corpInfo.tgcDinnerTime }}</span>
      </div>
    </section>
    <section v-show="companyInfo.corpInfo.corpWeis && (companyInfo.corpInfo.corpWeis.length > 0)">
      <h3>企业接口人</h3>
      <div v-for="(item, index) in companyInfo.corpInfo.corpWeis" :key="index">
        <div class="section-item">
          <span class="section-label label-1">企业接口人：</span>
          <span>{{ item.tgeName }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">企业接口人手机：</span>
          <span>{{ item.tgePhone }}</span>
        </div>
      </div>
    </section>
    <section v-show="companyInfo.corpInfo.tgcType == '00'">
      <h3>组织信息</h3>
      <div v-for="(item, index) in companyInfo.orgInfo" :key="index">
        <div class="section-item">
          <span class="section-label label-1">部门：</span>
          <span>{{ item.tgoOrgName }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">部门接口人：</span>
          <span>{{ item.tgoLeaderName }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">接口人手机：</span>
          <span>{{ item.tgoLeaderPhone }}</span>
        </div>
      </div>
    </section>
    <section>
      <h3>优惠</h3>
      <h4>限制规则</h4>
      <div class="section-item">
        <span class="section-label label-1" style="width: 250px;">员工单日优惠点餐餐数上限：</span>
        <span>{{ companyInfo.discountInfo.tgcEmpOrderLimit ? companyInfo.discountInfo.tgcEmpOrderLimit + '餐' : '无' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1" style="width: 250px;">（选填）早餐：</span>
        <span>{{ companyInfo.discountInfo.tgcBreakfastLimit ? companyInfo.discountInfo.tgcBreakfastLimit + '餐' : '无' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1" style="width: 250px;">（选填）午餐：</span>
        <span>{{ companyInfo.discountInfo.tgcLunchLimit ? companyInfo.discountInfo.tgcLunchLimit + '餐' : '无' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1" style="width: 250px;">（选填）晚餐：</span>
        <span>{{ companyInfo.discountInfo.tgcDinnerLimit ? companyInfo.discountInfo.tgcDinnerLimit + '餐' : '无' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1" style="width: 250px;">接口人团膳单餐金额：</span>
        <span>{{ companyInfo.discountInfo.tgcGroupSingleAmount ? companyInfo.discountInfo.tgcGroupSingleAmount + '元' : '无' }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1" style="width: 350px;">（选填）员工团膳点餐享受折扣门槛：</span>
        <span>{{ companyInfo.corpInfo.tgcDiscountThreshold ? companyInfo.corpInfo.tgcDiscountThreshold + '元' : '无' }}</span>
      </div>
      <h4>优惠规则</h4>
      <div class="section-item">
        <span class="section-label label-1" style="width: 350px;">（选填）员工团膳点餐享受折扣：</span>
        <span>{{ companyInfo.discountInfo.tgcEmpDiscount ? companyInfo.discountInfo.tgcEmpDiscount + '折' : '无' }}</span>
      </div>
      <div v-if="companyInfo.corpInfo.tgcSubsidyType === '00'">
        <div class="section-item">
          <span class="section-label label-1" style="width: 350px;">（选填）单日补助上线：</span>
          <span>{{ companyInfo.discountInfo.tgcEmpSubsidy ? companyInfo.discountInfo.tgcEmpSubsidy + '元' : '无' }}</span>
        </div>
      </div>
      <div v-if="companyInfo.corpInfo.tgcSubsidyType === '01'">
        <div class="section-item">
          <span class="section-label label-1" style="width: 350px;">（选填）三餐补助上限：</span>
          <span style="margin-right: 20px;">早餐</span>
          <span>{{ companyInfo.discountInfo.tgcEmpBreakfastSubsidy ? companyInfo.discountInfo.tgcEmpBreakfastSubsidy + '元' : '无' }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1" style="width: 350px;"></span>
          <span style="margin-right: 20px;">午餐</span>
          <span>{{ companyInfo.discountInfo.tgcEmpLunchSubsidy ? companyInfo.discountInfo.tgcEmpLunchSubsidy + '元' : '无' }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1" style="width: 350px;"></span>
          <span style="margin-right: 20px;">晚餐</span>
          <span>{{ companyInfo.discountInfo.tgcEmpDinnerSubsidy ? companyInfo.discountInfo.tgcEmpDinnerSubsidy + '元' : '无' }}</span>
        </div>
      </div>
    </section>
    <section>
      <h3>维士服务人员</h3>
      <BasePageTable
        height="500"
        :data="companyInfo.corpInfo.attendantList"
        :visible="false"
        border
      >
        <el-table-column v-for="col in attendantCols" :key="col.prop" v-bind="col"></el-table-column>
      </BasePageTable>
    </section>
    <section>
      <h3>企业套餐</h3>
      <BasePageTable ref="mealTable" height="500" :data="tableData" :visible="false" border>
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
      </BasePageTable>
    </section>
    <section v-show="companyInfo.corpInfo.tgcType == '00'">
      <h3>员工</h3>
      <BasePageTable ref="staffTable" height="500" :data="staffData" :visible="false" border>
        <el-table-column v-for="col in staffCol" :key="col.prop" v-bind="col"></el-table-column>
      </BasePageTable>
    </section>
    <section>
      <h3>企业地址</h3>
      <BasePageTable ref="addressTable" height="500" :data="addressData" :visible="false" border>
        <el-table-column v-for="col in addressCol" :key="col.prop" v-bind="col"></el-table-column>
      </BasePageTable>
    </section>
    <!-- <section>
      <h3>企业码</h3>
      <div class="row">
        <div class="item" v-for="(item, index) in companyInfo.channelCode" :key="index">
          <img class="img" :src="item.channelUrl" />
          <div class="txt">{{item.channelName}}</div>
        </div>
      </div>
    </section>-->
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue'
import { channelTypeMap } from '@/utils/data-map'
export default {
  components: {
    BasePageTable
  },
  data() {
    return {
      tgcType: '',
      heatPoint: '',
      companyInfo: {
        corpInfo: {},
        orgInfo: [],
        discountInfo: {},
        channelCode: []
      },
      week: ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      tableData: [],
      tableCol: [
        { label: '序号', type: 'index', width: '80' },
        { label: '套餐ID', prop: 'tgccPageComboId' },
        { label: '套餐名称', prop: 'tgccName' },
        { label: '套餐内容', prop: 'tgccContent' },
        { label: '商品合计价格', prop: 'tgccTotalAmount' },
        { label: '套餐价格', prop: 'tgccAmount' },
        { label: '当前状态', prop: 'tgccSttDesc' }
      ],
      staffData: [],
      staffCol: [
        { label: '序号', type: 'index', width: '80' },
        { label: '员工ID', prop: 'tgePageId' },
        { label: '员工姓名', prop: 'tgeName' },
        { label: '员工手机', prop: 'tgePhone' },
        { label: '所属部门', prop: 'tgeOrgName' },
        { label: '企业角色', prop: 'tgeRole', formatter: row => row.tgeRole == '00' ? '接口人' : '员工' }
      ],
      addressData: [],
      // attendantList: [],
      attendantCols: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '姓名',
          prop: 'tgcaName'

        },
        {
          label: '微信手机号',
          prop: 'tgcaPhone'
        }
      ]
      // addressCol: [
      //   { label: '序号', type: 'index', width: '80' },
      //   { label: '名称', prop: 'tgcaName' },
      //   { label: '地址', prop: 'tgcaAddress' },
      //   { label: '对应供餐点', prop: 'tgcaHeatingPointName' }
      // ]
    }
  },
  computed: {
    addressCol() {
      return [
        { label: '序号', type: 'index', width: '80' },
        { label: '名称', prop: 'tgcaName' },
        { label: '地址', prop: 'tgcaAddress' },
        { label: '对应供餐点', prop: 'tgcaHeatingPointName' },
        { label: '配送方式', prop: 'tgcaDistributionTypeDesc' },
        { label: '配送费', prop: 'tgcaDistributionPrice' }
      ]

    }
  },
  created() {
    this.tgcId = this.$route.query.id
    this.getInfo()
    this.getMealList()
    this.getStaffList()
    this.getAddress()
  },
  methods: {
    async getInfo() {
      const res = await this.$http('groupmeal.Corp/queryCorpById', { tgcId: this.tgcId })
      this.companyInfo = res.obj
      this.tgcType = res.obj.corpInfo.tgcType
      const week = []
      this.companyInfo.corpInfo.tgcMealDays.forEach(item => {
        week.push(this.week[item])
      })
      this.companyInfo.corpInfo.$tgcPartnerChannelType = channelTypeMap[this.companyInfo.corpInfo.$tgcPartnerChannelType]
      this.companyInfo.corpInfo.week = week.join('，')
      this.companyInfo.corpInfo.tgcLogoImg = [this.companyInfo.corpInfo.tgcLogoImg]
    },
    async getMealList() {
      const params = {
        tgcId: this.tgcId,
        pageNo: 0,
        pageSize: 9999
      }
      const res = await this.$http('groupmeal.Corp/queryComboList', params)
      this.tableData = res.obj.record
      this.$nt(() => {
        this.$refs.mealTable.doLayout()
      })
    },
    async getStaffList() {
      const params = {
        tgcId: this.tgcId,
        pageNo: 0,
        pageSize: 9999
      }
      const res = await this.$http('groupmeal.Corp/queryEmployeeList', params)
      this.staffData = res.obj.record
      this.$nt(() => {
        this.$refs.staffTable.doLayout()
      })
    },
    async getAddress() {
      const params = {
        tgcId: this.tgcId,
        pageNo: 0,
        pageSize: 9999
      }
      const res = await this.$http('groupmeal.CorpAddress/queryCorpAddressList', params)
      this.addressData = res.obj.record
      this.$nt(() => {
        this.$refs.addressTable.doLayout()
      })
    }
  }
}
</script>

<style lang="less" scoped>
h3 {
  margin-right: 20px;
}
h4 {
  padding: 0 50px;
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

.label-3,
h3 {
  margin-left: 22px;
}
.row {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.item {
  width: 300px;
  height: 350px;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-top: 30px;
  margin-right: 30px;
}
.img {
  width: 300px;
  height: 300px;
}
.txt {
  width: 300px;
  height: 50px;
  text-align: center;
  line-height: 50px;
}
</style>
