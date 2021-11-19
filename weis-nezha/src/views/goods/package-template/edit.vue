<template>
  <div class="page-container">
    <section>
      <h2>基础信息</h2>
      <div class="section-item">
        <span class="section-label label-1">列表封面图</span>
        <ImageUpload
          :upload-data="{ flag: 'package-template' }"
          :limit="1"
          v-model:file-list="infolist.tucImgUrl"
        />
        <span style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 690 X 218</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">详情图</span>
        <ImageUpload
          :upload-data="{ flag: 'package-template' }"
          :limit="1"
          v-model:file-list="infolist.tucImgDetailUrl"
        />
        <span style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 690 X 300</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">训练营套装名称</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入营套装名称"
          v-model="infolist.tucName"
        ></el-input>
      </div>
      <div class="section-item">
        <span class="section-label label-1">训练营套装价格</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入营套装价格"
          min="0"
          type="number"
          oninput="if(value.length>5)value=value.slice(0,10)"
          @blur="onInputChange('tucPrice')"
          v-model="infolist.tucPrice"
        ></el-input>元
      </div>
    </section>
    <section>
      <h2>训练营套餐配置</h2>
      <div class="section-item">
        <span class="section-label label-1">设置运动金额</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入运动金额"
          min="0"
          type="number"
          oninput="if(value.length>5)value=value.slice(0,10)"
          @blur="onInputChange('tucExerPrice')"
          v-model="infolist.tucExerPrice"
        ></el-input>元
        <!-- onkeyup= "return value=value.replace(/^(0+)|[^\d]+/g, '')" -->
      </div>
      <div class="section-item">
        <span class="section-label label-1">饮食消费金额</span>
        <!-- {{infolist.tucConsPrice}} -->
        {{(infolist.tucPrice - infolist.tucExerPrice).toFixed(2)}} 元
      </div>
      <div class="section-item">
        <span class="section-label label-1">设置私教课数</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入私教课程数"
          min="0"
          type="number"
          oninput="if(value.length>5)value=value.slice(0,10)"
          @blur="onInputChange('tucCurrNum')"
          v-model="infolist.tucCurrNum"
        ></el-input> 节
      </div>
      <div class="section-item">
        <span class="section-label label-1">设置限购次数</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入限购次数"
          min="0"
          type="number"
          oninput="if(value.length>5)value=value.slice(0,10)"
          v-model="infolist.tucBuyLimit"
        ></el-input> 次
      </div>
    </section>
    <section>
      <h2>运营类信息</h2>
      <div class="section-item" style="min-height: 100px;">
        <span class="section-label label-1">选择上架健身房</span>
        <el-checkbox-group v-model="infolist.tucUnionIds" style="width: 1100px;">
          <el-checkbox style="width: 230px;height: 30px;" v-for="(item, index) in checkboxGroup" :label="item.tuId"  :key="index">{{item.tuName}}</el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="section-item">
        <span class="section-label label-1">设置初始参与人数</span>
        <el-input
          clearable
          class="medium-input"
          placeholder="请输入初始参与人数"
          type="number"
          oninput="if(value.length>5)value=value.slice(0,10)"
          v-model="infolist.tucJoinNum"
        ></el-input> 人
      </div>

      <div v-for="(item, index) in infolist.tucDetailInfo" :key="index">
        <div class="section-item">
          <span class="section-label label-1">标题</span>
          <el-input
            clearable
            class="medium-input"
            placeholder="请输入标题"
            v-model="item.title"
          ></el-input>
        </div>
        <div class="section-item">
          <div class="section-item">
            <span class="section-label label-1">图片</span>
            <ImageUpload
              :upload-data="{ flag: 'package-template' }"
              v-model:file-list="item.img_url"
            />
          </div>
        </div>
      </div>

      <div class="section-item">
        <span class="section-label label-1"></span>
        <el-button style="width: 115px;" type="primary" @click="add">添加</el-button>
        <el-button style="width: 115px;" type="danger" @click="del">删除</el-button>
      </div>

    </section>
    <footer class="btn-footer">
      <el-button type="primary" @click="submit" :disabled="disabled">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </footer>
  </div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload.vue';

export default {
  components: {
    ImageUpload
  },
  props: {
    mode: String
  },
  data() {
    return {
      checkBoxValue: '',
      disabled: false,
      infolist: {
        tucId: '',
        tucName: '',
        tucPrice: '',
        tucImgUrl: [],
        tucImgDetailUrl: [],
        tucExerPrice: '',
        tucConsPrice: 0,
        tucCurrNum: '',
        tucBuyLimit: '',
        tucUnionIds: [],
        tucJoinNum: '',
        tucDetailInfo: [{
          title: '',
          img_url: []
        }]
      },
      checkboxGroup: [],
    };
  },
  created() {
    this.queryUnionAll();
  },
  methods: {
    onInputChange(type) {
      if (type === 'tucCurrNum') {
        this.infolist[type] = Number(this.infolist[type]).toFixed(0);
      } else {
        this.infolist[type] = Number(this.infolist[type]).toFixed(2);
      }
    },
    add() {
      this.infolist.tucDetailInfo.push({
        title: '',
        img_url: []
      });
    },
    del(index) {
      if (this.infolist.tucDetailInfo.length === 1) return;
      this.infolist.tucDetailInfo.pop();
      // const params = this.$deepClone(this.infolist.tucDetailInfo);
      // params.splice(index, 1);
      // this.infolist.tucDetailInfo = params;
    },
    tucConsPrice() {
      this.infolist.tucConsPrice = Number(this.infolist.tucPrice) - Number(this.infolist.tucExerPrice);
    },
    cancel() {
      this.$confirm('确认取消操作吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('点击确定');
        this.$closeRoute();
      }).catch(() => {
        console.log('点击取消');
      });
    },
    queryUnionAll() {
      this.$request('fitness.Fitness/queryUnionAll', { tdmId: this.infolist.tdmId }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.checkboxGroup = dataPage;
            const { type } = this.$route.query;
            if (type === 'edit') {
              this.infolist.tucId = this.$route.query.id;
              this.getInfo();
            }
          }
        })
      );
    },
    getInfo() {
      this.$request('fitness.Fitness/queryUnionComboById', { tucId: this.infolist.tucId }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            Object.assign(this.infolist, dataPage);
            this.infolist.tucImgUrl = [{ url: this.infolist.tucImgUrl }];
            this.infolist.tucImgDetailUrl = [{ url: this.infolist.tucImgDetailUrl }];
            // 健身房处理
            if (dataPage.tucUnionIds) {
              const unionIds = this.infolist.tucUnionIds.split(',');
              this.infolist.tucUnionIds = [];
              unionIds.forEach(item => {
                const gym = this.checkboxGroup.find(gym => gym.tuId === item);
                if (gym) {
                  this.infolist.tucUnionIds.push(item);
                }
              });
            }

            // 标题图片处理
            for (const item of this.infolist.tucDetailInfo) {
              const imgUrl = this.$deepClone(item.img_url);
              item.img_url = [];
              for (const url of imgUrl) {
                item.img_url.push({ url: url });
              }
            }
          }
        })
      )
    },
    submit() {
      const params = this.$deepClone(this.infolist);
      if (!params.tucImgUrl[0]) {
        this.$message({ type: 'error', message: '请上传封面图！' });
        return;
      }
      if (!params.tucImgDetailUrl[0]) {
        this.$message({ type: 'error', message: '请上传详情图！' });
        return;
      }
      if (!params.tucName) {
        this.$message({ type: 'error', message: '请输入套装名称！' });
        return;
      }
      if (!params.tucPrice || params.tucPrice < 0) {
        this.$message({ type: 'error', message: '请输入正确的套餐价格！' });
        return;
      }
      if (!params.tucExerPrice || params.tucExerPrice < 0) {
        this.$message({ type: 'error', message: '请输入正确的运动金额！' });
        return;
      }
      if (!params.tucExerPrice > params.tucPrice) {
        this.$message({ type: 'error', message: '运动金额不能大于套餐价格！' });
        return;
      }
      if (!params.tucCurrNum || params.tucCurrNum < 0) {
        this.$message({ type: 'error', message: '请输入正确的私教课程数！' });
        return;
      }
      if (!params.tucBuyLimit || params.tucBuyLimit < 0) {
        this.$message({ type: 'error', message: '请输入正确的限购次数！' });
        return;
      }
      if (!params.tucUnionIds.length) {
        this.$message({ type: 'error', message: '请选择健身房！' });
        return;
      }
      if (!params.tucJoinNum || params.tucJoinNum < 0 ) {
        this.$message({ type: 'error', message: '请输入正确的参与人数！' });
        return;
      }
      if (!params.tucId) {
        delete params.tucId;
      }
      params.tucImgUrl = params.tucImgUrl[0].response ? params.tucImgUrl[0].response.obj.imageUrl : params.tucImgUrl[0].url;
      params.tucImgDetailUrl = params.tucImgDetailUrl[0].response ? params.tucImgDetailUrl[0].response.obj.imageUrl : params.tucImgDetailUrl[0].url;
      params.tucUnionIds = params.tucUnionIds.join(',');
      params.tucConsPrice = (params.tucPrice - params.tucExerPrice).toFixed(2);
      params.tucDetailInfo.forEach(item => {
        const imgUrl = this.$deepClone(item.img_url);
        item.img_url = [];
        imgUrl.forEach(img => {
          item.img_url.push(img.response ? img.response.obj.imageUrl : img.url);
        });
      });
      this.disabled = true;
      this.$request('fitness.Fitness/updateUnionCombo', params).then(
        this.$rw((err) => {
          if (!err) {
            this.$closeRoute();
            this.$message({ type: 'success', message: '操作成功！' });
          } else {
            this.$message(err.errMsg);
            this.disabled = false;
          }
        })
      );
    }
  }
};
</script>

<style lang="less" scoped>


.label-1 {
  width: 130px;
  margin-right: 12px;
  text-align: right;
}

</style>
