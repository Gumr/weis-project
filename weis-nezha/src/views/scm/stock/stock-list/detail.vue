<template>
  <div class="page-container">
    <section>
      <h3>订单详情</h3>
      <div class="section-item">
        <span class="section-label label-1">配送单编码：</span>
        <span class="section-label lablel-2">{{baseInfo.tdotOrderId}}</span>
        <span class="section-label label-1">关联点餐订单编码：</span>
        <span>{{baseInfo.tdotSoid}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">订单菜品金额：</span>
        <span class="section-label lablel-2">{{baseInfo.tdotOrderPrice}}</span>
        <span class="section-label label-1">配送费：</span>
        <span>{{baseInfo.tdotFoodDeliveryPrice}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">合计应付：</span>
        <span
          class="section-label lablel-2"
        >{{ (+baseInfo.tdotOrderPrice + +baseInfo.tdotFoodDeliveryPrice).toFixed(2)}}</span>
        <span class="section-label label-1">实付：</span>
        <span>{{ baseInfo.tdotActualPrice || 0 }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">支付方式：</span>
        <span class="section-label lablel-2">{{baseInfo.tdotPayWay}}</span>
        <span class="section-label label-1">支付明细：</span>
        <span style="margin-right: 12px;">{{baseInfo.tdotPayWay}}支付 {{ baseInfo.tcfAmount }}</span>
        <span>赠送金支付 {{ baseInfo.tcfDonation }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">下单人id：</span>
        <span class="section-label lablel-2">{{baseInfo.tdotUid}}</span>
        <span class="section-label label-1">下单人手机：</span>
        <span>{{ baseInfo.tdotContactNumber }}</span>
      </div>
      <div class="section-item" v-if="$route.query.type != 'take'">
        <span class="section-label label-1">收货地址：</span>
        <span class="section-label lablel-2">{{ baseInfo.tdotReceivingAddress }}</span>
        <span class="section-label label-1">配送时间：</span>
        <span>{{ baseInfo.tdotDate }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">配送单状态：</span>
        <span class="section-label lablel-2">{{ baseInfo.tdotOrderStt }}</span>
        <span class="section-label label-1">客户经理：</span>
        <span>{{ baseInfo.counselorName }}({{baseInfo.counselorPhone}})</span>
      </div>
    </section>
    <section>
      <h3>商品详情</h3>
      <BasePageTable
        ref="table"
        :data="baseInfo.orderDetailInfo"
        :visible="false"
        :row-style="rowStyle"
        :stripe="false"
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="菜品编码" prop="tfsCid"></el-table-column>
        <el-table-column label="菜品名称" prop="tfsSuggestedSkuname" align="center"></el-table-column>
        <el-table-column label="规格" prop="tfsQuality" width="100">
          <template v-slot="{ row }">{{row.tfsQuality}}g</template>
        </el-table-column>
        <el-table-column label="用餐日期" prop="date">
          <template v-slot="{ row }">{{$day(row.date).format('YYYY-MM-DD')}}</template>
        </el-table-column>
        <el-table-column label="餐别" prop="category"></el-table-column>
        <el-table-column label="订货量" prop="tdodNum"></el-table-column>
        <el-table-column label="单价" prop="tdodPrice"></el-table-column>
        <el-table-column label="订单金额" prop="tdodPriceSum"></el-table-column>
        <el-table-column label="下单人">
          <template #default="{row}">{{row.uname}}（{{row.phone}}）</template>
        </el-table-column>
      </BasePageTable>
    </section>
    <section v-if="tableData.length">
      <h3>异常情况</h3>
      <BasePageTable ref="table" :data="tableData" :visible="false">
        <el-table-column label="订单编码" prop="tsmeOrderId"></el-table-column>
        <el-table-column label="异常需求" prop="tsmeTypeDesc"></el-table-column>
        <el-table-column label="原因" prop="tsmeCauseDesc"></el-table-column>
        <el-table-column label="状态" prop="tsmeSttDesc"></el-table-column>
        <el-table-column label="供餐点" prop="tsmeHeatingPointName"></el-table-column>
        <el-table-column label="提交人" prop="tsmeCreatorName"></el-table-column>
        <el-table-column label="提交时间" prop="tsmeCtime"></el-table-column>
        <el-table-column label="审批完成时间" prop="tsmeAuditTime"></el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template v-slot="{ row }">
            <span class="brand-color cursor-pointer optr-label" @click="toDetail(row)">详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </section>
    <section v-if="shipInfoDTO">
      <h3>配送状态</h3>
      <div class="section-item">
        <span class="section-label label-1">物流服务商：</span>
        <span class="section-label" style="margin-right: 20px;">{{ shipInfoDTO.tsoShipTypeDesc }}</span>
        <el-button type="primary" @click="showDialog" v-if="shipInfoDTO.cancelable">取消配送</el-button>
      </div>
      <div class="section-item" v-if="shipInfoDTO.shipDistance">
        <span class="section-label label-1">预计配送距离：</span>
        <span class="section-label" style="margin-right: 20px;">{{ shipInfoDTO.shipDistance }}m</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">联系骑手：</span>
        <span
          class="section-label"
        >{{ shipInfoDTO.shiperName || '' }} {{'\xa0\xa0\xa0\xa0\xa0'}} {{ shipInfoDTO.shiperPhone || '' }}</span>
        <span
          class="section-label label-1"
          style="color: #409EFF;cursor: pointer;"
          @click="riderH5"
          v-if="shipInfoDTO.shiperName"
        >骑手位置</span>
      </div>
      <div class="section-item" style="align-items: flex-start;">
        <span class="section-label label-1">物流详情：</span>
        <span class="section-label" v-if="shipInfoDTO.sttRecords">
          <el-steps direction="vertical" :active="shipInfoDTO.sttRecords.length">
            <el-step
              v-for="(item, index) in shipInfoDTO.sttRecords"
              :key="index"
              :title="item.createTime + '\xa0\xa0\xa0\xa0\xa0'  + item.content"
            ></el-step>
          </el-steps>
        </span>
      </div>
    </section>
    <section v-if="hasMap">
      <div id="container"></div>
    </section>
    <ConfirmDialog
      v-model="hasDialog"
      title="备注"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="cancelShip"
    >
      <div class="section-item">
        <span class="section-label label-1">
          <span style="color:red">*</span>备注：
        </span>
        <el-input
          clearable
          class="medium-input"
          style="width: 400px;"
          type="textarea"
          :rows="6"
          placeholder="备注"
          v-model="remark"
        ></el-input>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import { dinnerOptions } from '@/utils/data-map';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import BasePageTable from '@/components/BasePageTable.vue';

export default {
  components: {
    ConfirmDialog,
    BasePageTable
  },
  props: {
    routeQuery: {
      type: Object
    }
  },
  created() {
    this.tableRowStyle = {}
    this.getload();
    this.getErrInfo();
  },
  data() {
    return {
      map: null,
      hasMap: false,
      hasDialog: false,
      remark: '',
      indeximg: 1,
      baseInfo: {},
      skuname: '',
      skut: '1',
      skuprice: '',
      shipInfoDTO: null,
      url: '',
      putawayDishModel: {
        topCatalog: '',
        secCatalog: '',
        supply: ''
      },
      tableData: [],
      putawayDishRules: {},
      catalogOptions: [
        {
          label: '营养素',
          value: '1'
        },
        {
          label: '食物',
          value: '2'
        }
      ],
      dinnerOptions
    };
  },
  unmounted() {
    if (this.map) { this.map.destroy(); }
  },
  methods: {
    rowStyle({ row }) {
      const {tableRowStyle} = this
      if (!tableRowStyle[row.phone]) {
        tableRowStyle[row.phone] = `rgba(${255 * Math.random() | 0}, ${255 * Math.random() | 0}, ${255 * Math.random() | 0}, 0.1)`
      }
      console.log(tableRowStyle[row.phone])
      return {
        backgroundColor: tableRowStyle[row.phone]
      }
    },
    async riderH5() {
      if (this.shipInfoDTO.tsoShipTypeDesc.includes('美团')) {
        const res = await this.$request('cn.ship.api.ShipAdmin/queryRiderPosition', { tsoId: this.baseInfo.tdotTradeNo }, true);
        this.hasMap = true;
        this.$nt(() => {
          this.initMap(res.data.obj.positionDTO);
        });
      } else {
        const res = await this.$request('cn.ship.api.ShipAdmin/riderViewH5', { tsoId: this.baseInfo.tdotTradeNo }, true);
        this.url = res.data.obj.riderViewStr;
        window.open(this.url, '_blank');
      }
    },
    initMap(data) {
      this.map = new AMap.Map('container', {
        zoom: 14, // 级别
        center: [Number(data.userLng), Number(data.userLat)],
        viewMode: '3D'// 使用3D视图
      });
      const hpIcon = new AMap.Icon({
        size: new AMap.Size(58, 63),
        image: 'https://prodstatic.weis1606.cn/api/mini/weis_head_icon.png',
        imageSize: new AMap.Size(58, 63),
      });
      const hpMarker = new AMap.Marker({
        position: new AMap.LngLat(Number(data.hpLng), Number(data.hpLat)),
        icon: hpIcon,
        title: '商家'
      });
      const userIcon = new AMap.Icon({
        size: new AMap.Size(40, 63),
        image: 'https://prodstatic.weis1606.cn/api/mini/map_marker.png',
        imageSize: new AMap.Size(40, 63),
      });
      const userMarker = new AMap.Marker({
        position: new AMap.LngLat(Number(data.userLng), Number(data.userLat)),
        icon: userIcon,
        title: '用户',
      });
      this.map.add(hpMarker);
      this.map.add(userMarker);
      if (data.shiperLng) {
        const shipIcon = new AMap.Icon({
          size: new AMap.Size(58, 63),
          imageSize: new AMap.Size(58, 63),
          image: 'https://prodstatic.weis1606.cn/api/mini/rider_head_icon.png',
        });
        const shipMarker = new AMap.Marker({
          position: new AMap.LngLat(Number(data.shiperLng), Number(data.shiperLat)),
          icon: shipIcon,
          title: '配送员',
        });
        this.map.add(shipMarker);
      }
    },
    async getload() {
      const res = await this.$http('ServeMealsOperation/orderDetails', { orderid: this.$route.query.id });
      this.baseInfo = res.obj;
      if (res.obj.shipInfoDTO) {
        this.shipInfoDTO = res.obj.shipInfoDTO;
        if (this.shipInfoDTO.sttRecords.length) {
          this.shipInfoDTO.sttRecords.sort((a, b) => (a.createTime < b.createTime ? 1 : -1));
        }
      }
    },
    getErrInfo() {
      this.$request('shoperror.ShopManagerError/shopManagerErrorList', { orderId: this.$route.query.id }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.tableData = dataPage.record;
          }
        })
      );
    },
    toDetail(row) {
      this.$router.push({
        path: '/scm/serving-meals/exception/detail',
        query: {
          id: row.tsmeId
        }
      });
    },
    showDialog() {
      this.remark = '';
      this.hasDialog = true;
    },
    async cancelShip(done) {
      if (!this.remark) {
        this.$msg('请输入备注', 'error');
        done();
        return;
      }
      const res = await this.$http('ServeMealsOperation/cancelShipOrder', { tsoId: this.baseInfo.tdotTradeNo, remark: this.remark });
      if (!res.errMsg) {
        this.$msg('取消成功', 'success');
        this.hasDialog = false;
        this.baseInfo.shipInfoDTO.cancelable = false;
        this.$nt(() => {
          setTimeout(done, 500);
        });
      } else {
        this.$msg(res.errMsg, 'error');
        done();
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import "../../../../styles/base";
:deep(.el-step__icon-inner) {
  display: none;
}
:deep(.el-step__title.is-finish) {
  color: #666666;
}
:deep(.el-step__head.is-finish) {
  color: #666666;
  border-color: #666666;
}
:deep(.el-step__icon) {
  width: 10px;
  height: 10px;
}
:deep(.el-step.is-vertical .el-step__line) {
  width: 2px;
  top: 15px;
  bottom: -7px;
  left: 4px;
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
.section-label {
  display: inline-block;
}
.actions-wrap {
  text-align: center;
}

.step-bar-wrap {
  padding: 24px 18px;
  background-color: @level4-border;
}

.display-flex p:first-child {
  margin-right: 4%;
}
.label-1 {
  width: 150px;
  text-align-last: right;
}
.lablel-2 {
  width: 280px;
  margin-right: 30px;
}
#container {
  min-width: 600px;
  min-height: 767px;
}
</style>
