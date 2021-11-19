<template>
  <div class="page-container">
    <section>
      <ReturnButton :back="true" />
    </section>
    <section>
      <h3>基本信息</h3>
      <div class="section-item">
        <span class="section-label label-1">配送单编码：</span>
        <span class="section-label lablel-2">{{ baseInfo.tdotShipOid }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">订单菜品金额：</span>
        <span class="section-label lablel-2">{{ baseInfo.tdotOrderPrice }}</span>
        <span class="section-label label-1">实付金额：</span>
        <span>{{ baseInfo.tdotActualPrice || 0 }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">下单人ID：</span>
        <span class="section-label lablel-2">{{ baseInfo.tdotUid }}</span>
        <span class="section-label label-1">收货人：</span>
        <span class="section-label lablel-2">{{ baseInfo.tdotConsignee }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">收货人手机：</span>
        <span class="section-label lablel-2">{{ baseInfo.tdotContactNumber }}</span>
        <span class="section-label label-1">下单人企业：</span>
        <span class="section-label lablel-2">{{ baseInfo.tdotGroupCorpName }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">当前状态：</span>
        <span class="section-label lablel-2">{{ formatOrderStatus(baseInfo.tdotOrderStt) }}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">配送地址：</span>
        <span>{{ baseInfo.tdotReceivingAddress }}</span>
      </div>
    </section>
    <section>
      <h3>商品信息</h3>
      <BasePageTable ref="table" :data="baseInfo.orderDetailInfo">
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="菜品" prop="tdodSkuname"></el-table-column>
        <el-table-column label="明细" prop="tdodContent"></el-table-column>
        <el-table-column label="数量" prop="tdodNum"></el-table-column>
        <el-table-column label="单价" prop="tdodPrice"></el-table-column>
        <el-table-column label="合计" prop="tdodPriceSum"></el-table-column>
      </BasePageTable>
    </section>
    <section v-if="shipInfoDTO">
      <h3>配送状态</h3>
      <div class="section-item">
        <span class="section-label label-1">物流服务商：</span>
        <span class="section-label" style="margin-right: 20px;">{{ shipInfoDTO.tsoShipTypeDesc }}</span>
        <el-button v-if="shipInfoDTO.cancelable" type="primary" @click="showDialog">取消配送</el-button>
      </div>
      <div v-if="shipInfoDTO.shipDistance" class="section-item">
        <span class="section-label label-1">预计配送距离：</span>
        <span class="section-label" style="margin-right: 20px;">{{ shipInfoDTO.shipDistance }}m</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">联系骑手：</span>
        <span
          class="section-label"
        >{{ shipInfoDTO.shiperName || '' }} {{ '\xa0\xa0\xa0\xa0\xa0' }} {{ shipInfoDTO.shiperPhone || '' }}</span>
        <span
          v-if="shipInfoDTO.shiperName"
          class="section-label label-1"
          style="color: #409EFF;cursor: pointer;"
          @click="riderH5"
        >骑手位置</span>
      </div>
      <div class="section-item" style="align-items: flex-start;">
        <span class="section-label label-1">物流详情：</span>
        <span v-if="shipInfoDTO.sttRecords" class="section-label">
          <el-steps direction="vertical" :active="shipInfoDTO.sttRecords.length">
            <el-step
              v-for="(item, index) in shipInfoDTO.sttRecords"
              :key="index"
              :title="item.createTime + '\xa0\xa0\xa0\xa0\xa0' + item.content"
            ></el-step>
          </el-steps>
        </span>
      </div>
    </section>
    <div v-if="hasMap" id="container"></div>
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
          v-model="remark"
          clearable
          class="medium-input"
          style="width: 400px;"
          type="textarea"
          :rows="6"
          placeholder="备注"
        ></el-input>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import ReturnButton from '@/components/ReturnButton.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { orderStatusMap } from '@/utils/data-map'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
export default {
  components: {
    ConfirmDialog,
    ReturnButton,
    BasePageTable
  },
  data() {
    return {
      remark: '',
      tdotShipOid: '',
      shipInfoDTO: null,
      hasDialog: false,
      hasMap: false,
      baseInfo: {}
    }
  },
  created() {
    this.tdotShipOid = this.$route.query.id
    this.getInfo()
  },
  methods: {
    showDialog() {
      this.remark = ''
      this.hasDialog = true
    },
    formatOrderStatus(status) {
      return orderStatusMap[status]
    },
    async getInfo() {
      const res = await this.$http('ServeMealsOperation/corpOrderDetails', { tdotShipOid: this.tdotShipOid })
      if (res.obj.shipInfoDTO) {
        this.shipInfoDTO = res.obj.shipInfoDTO
        if (this.shipInfoDTO.sttRecords.length) {
          this.shipInfoDTO.sttRecords.sort((a, b) => (a.createTime < b.createTime ? 1 : -1))
        }
      }
      this.baseInfo = res.obj
    },
    async cancelShip(done) {
      if (!this.remark) {
        this.$msg('请输入备注', 'error')
        done()
        return
      }
      const res = await this.$http('ServeMealsOperation/cancelShipOrder', { tsoId: this.baseInfo.tdotTradeNo, remark: this.remark })
      if (!res.errMsg) {
        this.$msg('取消成功', 'success')
        this.hasDialog = false
        this.baseInfo.shipInfoDTO.cancelable = false
        this.$nt(() => {
          setTimeout(done, 500)
        })
      } else {
        this.$msg(res.errMsg, 'error')
        done()
      }
    },
    async riderH5() {
      if (this.shipInfoDTO.tsoShipTypeDesc.includes('美团')) {
        const res = await this.$request('cn.ship.api.ShipAdmin/queryRiderPosition', { tsoId: this.baseInfo.tdotTradeNo }, true)
        this.hasMap = true
        this.$nextTick(() => {
          this.initMap(res.data.obj.positionDTO)
        })
      } else {
        const res = await this.$request('cn.ship.api.ShipAdmin/riderViewH5', { tsoId: this.baseInfo.tdotTradeNo }, true)
        this.url = res.data.obj.riderViewStr
        window.open(this.url, '_blank')
      }
    },
    initMap(data) {
      this.map = new AMap.Map('container', {
        zoom: 14, // 级别
        // center: new AMap.LngLat(113.953045, 22.54097),
        center: [Number(data.userLng), Number(data.userLat)],
        viewMode: '3D'// 使用3D视图
      })

      const hpIcon = new AMap.Icon({
        size: new AMap.Size(58, 63),
        image: 'https://prodstatic.weis1606.cn/api/mini/weis_head_icon.png',
        imageSize: new AMap.Size(58, 63)
      })
      const hpMarker = new AMap.Marker({
        position: [Number(data.hpLng), Number(data.hpLat)],
        icon: hpIcon,
        title: '商家'
      })
      const userIcon = new AMap.Icon({
        size: new AMap.Size(40, 63),
        image: 'https://prodstatic.weis1606.cn/api/mini/map_marker.png',
        imageSize: new AMap.Size(40, 63)
      })
      const userMarker = new AMap.Marker({
        position: [Number(data.userLng), Number(data.userLat)],
        icon: userIcon,
        title: '用户'
      })
      this.map.add(hpMarker)
      this.map.add(userMarker)
      if (data.shiperLng) {
        const shipIcon = new AMap.Icon({
          size: new AMap.Size(58, 63),
          imageSize: new AMap.Size(58, 63),
          image: 'https://prodstatic.weis1606.cn/api/mini/rider_head_icon.png'
        })
        const shipMarker = new AMap.Marker({
          position: [Number(data.shiperLng), Number(data.shiperLat)],
          icon: shipIcon,
          title: '配送员'
        })
        this.map.add(shipMarker)
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../../styles/base";
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
