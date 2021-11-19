<template>
  <div class="page-container">
    <h3>健身房</h3>
    <div class="section-item">
      <span class="section-label label-1">健身房封面</span>
      <ImageUpload
        v-model:file-list="infolist.tuImgs"
        :upload-data="{ flag: 'exception' }"
        :limit="6"
      />
      <span style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 750 X 240</span>
    </div>
    <div class="section-item">
      <span class="section-label label-1">新健身渠道类别</span>
      <el-select v-model="infolist.tuType" class="medium-input" clearable placeholder="选择类别">
        <el-option
          v-for="item in tuTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </div>
    <div class="section-item">
      <span class="section-label label-1">健身房名称</span>
      <el-input
        v-model="infolist.tuName"
        clearable
        class="medium-input"
        placeholder="请输入健身房名称"
        maxlength="30"
      ></el-input>
    </div>
    <div class="section-item">
      <span class="section-label label-1">健身房负责人</span>
      <el-input
        v-model="infolist.tuLeaderName"
        clearable
        class="medium-input"
        placeholder="请输入健身房负责人"
        maxlength="30"
      ></el-input>
    </div>
    <div class="section-item">
      <span class="section-label label-1">负责人手机号</span>
      <el-input
        v-model="infolist.tuLeaderPhone"
        clearable
        class="medium-input"
        placeholder="请输入负责人手机号"
        maxlength="30"
        min="0"
      ></el-input>
    </div>
    <div class="section-item">
      <span class="section-label label-1">健身房描述</span>
      <el-input
        v-model="infolist.tuDesc"
        clearable
        class="medium-input"
        placeholder="请输入描述"
        maxlength="300"
        type="textarea"
        rows="6"
        min="0"
      ></el-input>
    </div>
    <div class="section-item">
      <span class="section-label label-1">健身房地址</span>
      <el-cascader
        v-model="cityValue"
        style="width: 350px;"
        clearable
        size="large"
        :options="cityOptions"
        @change="handleChange"
      ></el-cascader>
    </div>
    <div class="section-item">
      <span class="section-label label-1">详细地址</span>
      <el-input
        v-model="infolist.tuAddress"
        clearable
        class="medium-input"
        placeholder="请输入描述"
        maxlength="50"
        rows="6"
        min="0"
        @blur="getlocation"
      ></el-input>
    </div>
    <div id="container"></div>
    <div class="section-item">
      <span class="section-label label-1">指定客户经理</span>
      <el-select
        v-model="infolist.tuCounselorId"
        class="medium-input"
        clearable
        filterable
        placeholder="输入手机/选择目标客户经理"
      >
        <el-option
          v-for="item in counselorOptions"
          :key="item.value"
          placeholder="输入手机/选择目标客户经理"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </div>
    <section>
      <h3>添加明星教练</h3>
      <div v-for="(item, index) in infolist.tuCoachInfo" :key="item.key">
        <div class="section-item">
          <span class="section-label label-1">头像</span>
          <ImageUpload
            v-model:file-list="item.img"
            :upload-data="{ flag: 'exception' }"
            :limit="1"
          />
          <span style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 96 X 96</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">姓名</span>
          <el-input
            v-model="item.name"
            clearable
            class="medium-input"
            placeholder="请输入姓名"
            maxlength="30"
          ></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">擅长课程</span>
          <el-input
            v-model="item.adeptClass"
            clearable
            class="medium-input"
            placeholder="请输入擅长课程"
            maxlength="30"
          ></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">从业时间</span>
          <el-input
            v-model="item.joinTime"
            clearable
            class="medium-input"
            placeholder="请输入从业时间"
            type="number"
            maxlength="30"
            @blur="inputBlur(index)"
          ></el-input>
          <span style="margin-left: 10px;">年</span>
          <el-button type="danger" style="margin-left: 10px;" @click="delCoach(index)">删除</el-button>
        </div>
      </div>
      <div class="section-item">
        <span class="section-label label-1"></span>
        <el-button class="medium-input" type="primary" @click="addCoach">添加</el-button>
      </div>
    </section>
    <footer class="btn-footer">
      <el-button type="primary" @click="submit">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </footer>
  </div>
</template>

<script>
import { regionData, CodeToText, TextToCode } from '@/utils/regon-data.js'
import ImageUpload from '@/components/ImageUpload.vue'
import { catchNonIntKeydown, catchNonNumberKeydown } from '@/utils/event-catcher'
// import areafrom from '@/utils/select_area.json';

const { qq } = window

export default {
  components: {
    ImageUpload
  },
  data() {
    return {
      map: null,
      marker: [],
      infolist: {
        tuID: '',
        tuName: '',
        tuType: '',
        tuLeaderName: '',
        tuLeaderPhone: '',
        tuDesc: '',
        tuAddress: '',
        tuAddrProvince: '',
        tuAddrCity: '',
        tuAddrArea: '',
        tuCounselorId: '',
        tuImgs: [],
        tuLatitude: '',
        tuLongitude: '',
        tuCoachInfo: [{
          key: Date.now(),
          img: [],
          name: '',
          adeptClass: '',
          joinTime: ''
        }]
      },
      mapMaker: null,
      tuTypeOptions: [{ label: '健身房', value: '01' }],
      counselorOptions: [],
      cityValue: [],
      cityOptions: regionData
    }
  },
  watch: {
  },
  created() {
    this.getCounselor()
    const { type } = this.$route.query
    if (type === 'edit') {
      this.infolist.tuID = this.$route.query.id
      setTimeout(() => {
        this.getInfo()
      }, 300)
    }
  },
  mounted() {
    this.$nt(() => {
      this.initMap()
    })
  },
  unmounted() {
    this.map.destroy()
  },
  methods: {
    catchNonNumberKeydown,
    catchNonIntKeydown,
    // 搜索地址经纬度
    // 地图初始化
    initMap() {
      this.map = new AMap.Map('container', {
        zoom: 14, // 级别
        center: [113.953045, 22.54097],
        resizeEnable: true
      })
      const marker = new AMap.Marker({
        position: [113.930478, 22.533191]
      })
      this.map.add(marker)
    },
    editMap() {
      this.map = new AMap.Map('container', {
        zoom: 14, // 级别
        center: [Number(this.infolist.tuLongitude), Number(this.infolist.tuLatitude)],
        resizeEnable: true
      })
      const marker = new AMap.Marker({
        position: [Number(this.infolist.tuLongitude), Number(this.infolist.tuLatitude)]
      })
      this.map.add(marker)
    },
    getlocation() {
      if (this.cityValue && this.infolist.tuAddress) {
        const address = `中国${this.infolist.tuAddrProvince}${this.infolist.tuAddrCity}${this.infolist.tuAddrArea}`
        AMap.plugin('AMap.PlaceSearch', () => {
          const placeSearch = new AMap.PlaceSearch({
            city: this.infolist.tuAddrCity, autoFitView: true, map: this.map, citylimit: true
          })
          placeSearch.search(this.infolist.tuAddress, (status, result) => {
            if (status == 'no_data') {
              this.$msg('请输入正确的查询地址', 'error')
              return
            }
            this.infolist.tuLatitude = ''
            this.infolist.tuLongitude = ''
            this.map.clearMap()
            this.marker = []
            for (const poi of result.poiList.pois) {
              const marker = new AMap.Marker({
                map: this.map,
                position: poi.location,
                title: poi.name,
                icon: new AMap.Icon({ image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png', size: new AMap.Size(25, 34), imageSize: new AMap.Size(25, 34) })
              })
              marker.on('click', this.markerClick)
              this.marker.push(marker)
            }
            this.map.add(this.marker)
          })
        })
      }
    },
    markerClick(e) {
      let index = 0
      const target = e.target.getPosition()
      for (const i in this.marker) {
        this.marker[i].setIcon(new AMap.Icon({ image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png', size: new AMap.Size(25, 34), imageSize: new AMap.Size(25, 34) }))
        const marker = this.marker[i].getPosition()
        if (marker.lat == target.lat && marker.lng == target.lng) {
          index = i
        }
      }
      this.marker[index].setIcon(new AMap.Icon({ image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png', size: new AMap.Size(25, 34), imageSize: new AMap.Size(25, 34) }))
      this.infolist.tuLongitude = target.lng
      this.infolist.tuLatitude = target.lat
    },

    // 上面为地图相关

    inputBlur(index) {
      this.infolist.tuCoachInfo[index].joinTime = Math.abs(Number(this.infolist.tuCoachInfo[index].joinTime).toFixed(2))
    },
    handleChange(value) {
      this.infolist.tuLatitude = ''
      this.infolist.tuLongitude = ''
      this.infolist.tuAddrProvince = CodeToText[value[0]]
      this.infolist.tuAddrCity = CodeToText[value[1]]
      this.infolist.tuAddrArea = CodeToText[value[2]]
    },
    cancel() {
      this.$confirm('确认取消操作吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('点击确定')
        this.$closeRoute()
      }).catch(() => {
        console.log('点击取消')
      })
    },
    addCoach() {
      this.infolist.tuCoachInfo.push({
        key: Date.now(),
        name: '',
        adeptClass: '',
        joinTime: '',
        img: []
      })
    },
    delCoach(index) {
      if (this.infolist.tuCoachInfo === 1) return
      this.infolist.tuCoachInfo.splice(index, 1)
    },
    getCounselor() {
      this.$request('fitness.Fitness/queryChannelCounselorAll', {}).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            dataPage.forEach((item) => {
              this.counselorOptions.push({
                label: `${item.counselorPhone} (姓名：${item.counselorName} | 类型：${item.counselorType == '02' ? '自有' : '外部'})`,
                name: item.counselorName,
                value: item.counselorId,
                type: item.counselorType
              })
            })
          }
        })
      )
    },
    getInfo() {
      this.$request('fitness.Fitness/queryUnionById', { tuId: this.infolist.tuID }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.infolist, dataPage)
            this.infolist.tuImgs = this.infolist.tuImgs.map(item => ({ url: item }))
            this.infolist.tuCoachInfo = this.infolist.tuCoachInfo.map(item => ({
              adeptClass: item.adeptClass,
              img: [{ url: item.img }],
              joinTime: item.joinTime,
              key: item.key,
              name: item.name
            }))
            this.cityValue = TextToCode[this.infolist.tuAddrProvince][this.infolist.tuAddrCity][this.infolist.tuAddrArea].code
            const counselor = this.counselorOptions.find(item => item.value === this.infolist.tuCounselorId)
            if (!counselor) {
              this.infolist.tuCounselorId = ''
            }
            this.$nt(() => {
              this.editMap()
            })
          }
        })
      )
    },
    submit() {
      const params = this.$deepClone(this.infolist)
      if (!params.tuImgs.length) {
        this.$message({ type: 'error', message: '请上传健身房图片！' })
        return
      }
      if (!params.tuType) {
        this.$message({ type: 'error', message: '请选择渠道类别！' })
        return
      }
      if (!params.tuName) {
        this.$message({ type: 'error', message: '请输入健身房名称！' })
        return
      }
      if (!params.tuLeaderName) {
        this.$message({ type: 'error', message: '请输入负责人！' })
        return
      }
      if (!params.tuLeaderPhone) {
        this.$message({ type: 'error', message: '请输入负责人手机！' })
        return
      }
      if (!(/^1[3456789]\d{9}$/.test(params.tuLeaderPhone))) {
        this.$message({ type: 'error', message: '请输入正确手机！' })
        return
      }
      if (!params.tuDesc) {
        this.$message({ type: 'error', message: '请输入健身房描述！' })
        return
      }
      if (!this.cityValue) {
        this.$message({ type: 'error', message: '请选择地址！' })
        return
      }
      if (!params.tuAddress) {
        this.$message({ type: 'error', message: '请输入地址！' })
        return
      }
      if (!params.tuLongitude) {
        this.$message({ type: 'error', message: '请选择地图上的标点' })
        return
      }
      if (!params.tuCounselorId) {
        this.$message({ type: 'error', message: '请选择客户经理！' })
        return
      }
      if (!params.tuId) {
        delete params.tuId
      }
      params.tuImgs = []
      this.infolist.tuImgs.forEach((item) => {
        const img = item.response ? item.response.obj.imageUrl : item.url
        params.tuImgs.push(img)
      })
      for (const i in this.infolist.tuCoachInfo) {
        const item = this.infolist.tuCoachInfo[i]
        if (!item.name || !item.adeptClass || !item.joinTime || !item.img.length) {
          this.$message({ type: 'error', message: '教练信息不全！' })
          return
        }
        const img = item.img[0].response ? item.img[0].response.obj.imageUrl : item.img[0].url
        params.tuCoachInfo[i].img = img
      }
      this.$request('fitness.Fitness/updateUnion', params).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({ type: 'success', message: '操作成功！' })
            this.$closeRoute()
          } else {
            this.$message(err.errMsg)
          }
        })
      )
    }
  }
}
</script>

<style lang="less" scoped>
#container {
  min-width: 600px;
  min-height: 500px;
}
.label-1 {
  width: 160px;
  margin-right: 12px;
  text-align: right;
}
</style>
