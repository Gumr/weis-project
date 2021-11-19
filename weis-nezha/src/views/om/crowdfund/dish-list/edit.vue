<template>
  <div class="page-container">
    <section>
      <h3>菜品基础信息</h3>
      <div class="section-item">
        <span class="section-label label-1">所属期数：</span>
        <span
          class="section-label label-2"
        >{{baseInfo.trPhase == '0' ? '无' : `第${baseInfo.trPhase}期`}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品图片：</span>
        <el-image
          style="width: 200px"
          :src="url"
          :preview-src-list="[url]"
          v-for="(url, inx) in baseInfo.trCoverImageUrl"
          :key="inx"
        ></el-image>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品名称：</span>
        <span class="section-label label-2">{{baseInfo.trName}}</span>
        <span class="section-label label-1">当前状态：</span>
        <span>{{baseInfo.trAuditResultDesc}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品类型：</span>
        <span class="section-label label-2">{{baseInfo.trTypeDesc}}</span>
        <span class="section-label label-1">点赞数：</span>
        <span>{{baseInfo.trCollectNumber}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品故事：</span>
        <span class="section-label label-2">{{baseInfo.trName}}</span>
        <span class="section-label label-1">分享数：</span>
        <span>{{baseInfo.trShareNumber}}</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">关联上架菜品：</span>
        <span class="section-label label-2">{{baseInfo.trSkuname}}</span>
        <span class="section-label label-1">投票数：</span>
        <span>{{baseInfo.trVoteNumber}}</span>
      </div>
    </section>
    <section>
      <h3>菜品营养素</h3>
      <div class="section-item" v-if="type == 'edit'">
        <span class="section-label label-1"></span>
        <span>
          <el-button class="min-input" type="primary" @click="dishEdit" v-if="!isEdit">编辑</el-button>
          <el-button class="min-input" type="primary" @click="confirm" v-if="isEdit">保存</el-button>
          <el-button class="min-input" type="primary" @click="isEdit = false" v-if="isEdit">取消</el-button>
        </span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品重量：</span>
        <span v-if="isEdit">
          <el-input
            class="mini-input"
            v-model="formData.trFoodWeight"
            @blur="checkText('trFoodWeight')"
          />g
        </span>
        <span class="section-label label-2" v-else>{{baseInfo.trFoodWeight}}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">菜品能量：</span>
        <span v-if="isEdit">
          <el-input
            class="mini-input"
            v-model="formData.trEnergy"
            @blur="checkText('trEnergy')"
            v-if="isEdit"
          />Kcal
        </span>
        <span class="section-label label-2" v-else>{{baseInfo.trEnergy}}Kcal</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">蛋白质：</span>
        <span v-if="isEdit">
          <el-input
            class="mini-input"
            v-model="formData.trProtein"
            @blur="checkText('trProtein')"
            v-if="isEdit"
          />g
        </span>
        <span class="section-label label-2" v-else>{{baseInfo.trProtein}}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">脂肪：</span>
        <span v-if="isEdit">
          <el-input
            class="mini-input"
            v-model="formData.trFat"
            @blur="checkText('trFat')"
            v-if="isEdit"
          />g
        </span>
        <span class="section-label label-2" v-else>{{baseInfo.trFat}}g</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1">碳水化合物：</span>
        <span v-if="isEdit">
          <el-input
            class="mini-input"
            v-model="formData.trCarbonWater"
            @blur="checkText('trCarbonWater')"
            v-if="isEdit"
          />g
        </span>
        <span class="section-label label-2" v-else>{{baseInfo.trCarbonWater}}g</span>
      </div>
    </section>
    <section>
      <h3>用料</h3>
      <div class="section-item" v-for="(item, index) in baseInfo.trPractice" :key="index">
        <span class="section-label label-1">用料名称：</span>
        <span class="section-label label-2">{{item.seasoning}}</span>
        <span class="section-label label-1">用料重量：</span>
        <span>{{item.consumption}}</span>
      </div>
    </section>
    <section>
      <h3>小贴士</h3>
      <div class="section-item">
        <span class="section-label label-1">食谱小贴士：</span>
        <span class="section-label">{{baseInfo.trTip}}</span>
      </div>
    </section>
    <section>
      <h3>做法</h3>
      <div class="section-item">
        <span class="section-label label-1" style="width: 60px;"></span>
        <BasePageTable
          :data="baseInfo.trSeasoning"
          :visible="false"
          :border="false"
          style="width: 900px"
        >
          <el-table-column label="步骤" prop="stepInfo"></el-table-column>
          <el-table-column label="步骤说明" prop="description"></el-table-column>
          <el-table-column label="图片">
            <template class="action-cell" v-slot="{ row }">
              <el-image
                :src="row.stepImageUrl"
                :preview-src-list="[row.stepImageUrl]"
                style="width: 200px;max-height: 200px;"
              />
            </template>
          </el-table-column>
        </BasePageTable>
      </div>
    </section>
    <section v-if="baseInfo.trAuditResult == '03'">
      <h3>不通过备注</h3>
      <div class="section-item">
        <span class="section-label label-1">备注：</span>
        <span class="section-label">{{baseInfo.trRemark || '无'}}</span>
      </div>
    </section>
    <section v-if="type == 'edit'">
      <h3>操作</h3>
      <div class="section-item">
        <span class="section-label label-1">操作：</span>
        <!-- 当前状态 00：违规被禁；01：待审核；02：审核中；03：未通过审核；04：通过审核；05：投票中；06：终止投票；07：研发中；08：已上架；09：已下架 -->
        <!-- type 操作类型 -1：取消违规下线 00：违规下线；03：未通过；04：通过审核；07：研发中； -->
        <el-button
          type="primary"
          v-if="baseInfo.trAuditResult == '02'"
          @click="editFoodStt([baseInfo.trId], '04')"
        >通过</el-button>
        <el-button type="danger" v-if="baseInfo.trAuditResult == '02'" @click="failFoodStt">不通过</el-button>
        <el-button
          type="danger"
          v-if="['01', '02', '03', '04', '05', '06', '07', '08', '09'].includes(baseInfo.trAuditResult)"
          @click="editFoodStt([baseInfo.trId], '00')"
        >违规下线</el-button>
        <el-button
          type="danger"
          v-if="baseInfo.trAuditResult == '00'"
          @click="editFoodStt([baseInfo.trId], '-1')"
        >取消违规下线</el-button>
        <el-button
          type="primary"
          v-if="baseInfo.trAuditResult == '06'"
          @click="editFoodStt([baseInfo.trId], '07')"
        >厨房研发</el-button>
        <el-button
          type="primary"
          v-if="baseInfo.trAuditResult == '07' || baseInfo.trAuditResult == '08' || baseInfo.trAuditResult == '09'"
          @click="showDialog()"
        >关联上架菜品</el-button>
        <el-button type="primary" v-if="baseInfo.trCid" @click="foodUnBinding">解除绑定</el-button>
      </div>
    </section>
    <ConfirmDialog
      v-model="hasDialog"
      title="选择菜品"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="onconfirm"
    >
      <BasePageTable
        height="600"
        empty-text="当前没有可关联菜品，请先到erp系统新建一款菜品"
        :visible="false"
        :data="dishTable"
        :stripe="false"
        highlight-current-row
        @current-change="handleCurrentChange"
        border
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="菜品编码" prop="tfsCid"></el-table-column>
        <el-table-column label="菜品名称" prop="tfsSkuname"></el-table-column>
        <el-table-column label="菜品单价" prop="tfsPrice"></el-table-column>
      </BasePageTable>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="hasDialog2"
      title="备注"
      :close-on-click-modal="false"
      :async-confirm="true"
      :auto-confirm="false"
      @on-confirm="onconfirm2"
    >
      <el-input type="textarea" :rows="6" placeholder="请填写拒绝原因" v-model="remark" />
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

export default {
  components: {
    BasePageTable,
    ConfirmDialog
  },
  data() {
    return {
      hasDialog: false,
      hasDialog2: false,
      remark: '',
      dishTable: [],
      currentRow: {},
      type: '',
      isEdit: false,
      formData: {
        trId: '',
        trFoodWeight: '',
        trEnergy: '',
        trProtein: '',
        trCarbonWater: '',
        trFat: '',
      },
      baseInfo: {
        trId: '',
        trCoverImageUrl: [],
        trSeasoning: [],
      }
    };
  },
  created() {
    this.type = this.$route.query.type;
    this.baseInfo.trId = this.$route.query.id;
    this.formData.trId = this.$route.query.id;
    this.getInfo();
  },
  methods: {
    checkText(type) {
      this.formData[type] = isNaN(this.formData[type]) ? '' : this.formData[type];
      this.formData[type] = this.formData[type] == '' ? '' : Number(Math.abs(this.formData[type])).toFixed(2);
    },
    async getInfo() {
      const res = await this.$http('foodfundraising.Recipes/queryFoodRankingDetailList', { trId: this.baseInfo.trId });
      Object.assign(this.baseInfo, res.obj);
      this.baseInfo.trCoverImageUrl = [this.baseInfo.trCoverImageUrl];
    },
    async editFoodStt(trId, type) {
      const params = {
        trId,
        type
      };
      const res = await this.$http('foodfundraising.Recipes/editFoodStt', params);
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.getInfo();
      } else {
        this.$msg(res.errMsg, 'error');
      }
    },
    async showDialog() {
      const res = await this.$http('foodfundraising.Recipes/getPutawayFoodList', {});
      this.dishTable = res.obj;
      this.hasDialog = true;
    },
    failFoodStt() {
      this.remark = '';
      this.hasDialog2 = true;
    },
    handleCurrentChange(val) {
      this.currentRow = val;
    },
    dishEdit() {
      Object.assign(this.formData, this.baseInfo);
      this.isEdit = true;
    },
    async confirm() {
      if (!this.formData.trFoodWeight || !this.formData.trEnergy || !this.formData.trProtein || !this.formData.trCarbonWater || !this.formData.trFat) {
        this.$msg('营养素不全', 'error');
        return;
      }
      const res = await this.$http('foodfundraising.Recipes/updateFoodNutrition', this.formData);
      if (!res.errMsg) {
        this.$msg('保存成功', 'success');
        this.getInfo();
        this.isEdit = false;
      } else {
        this.$msg(res.errMsg, 'error');
      }
    },
    async onconfirm(done) {
      const res = await this.$http('foodfundraising.Recipes/editFoodBinding', { trId: this.baseInfo.trId, cid: this.currentRow.tfsCid });
      if (!res.errMsg) {
        this.$msg('关联成功', 'success');
        this.hasDialog = false;
        this.getInfo();
        this.$nt(() => {
          setTimeout(done, 500);
        });
      } else {
        this.$msg(res.errMsg, 'error');
        done();
      }
    },
    async onconfirm2(done) {
      const res = await this.$http('foodfundraising.Recipes/editFoodStt', { trId: [this.baseInfo.trId], type: '03', remark: this.remark });
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.getInfo();
        this.hasDialog2 = false;
        this.$nt(() => {
          setTimeout(done, 500);
        });
      } else {
        this.$msg(res.errMsg, 'error');
      }
    },
    async foodUnBinding() {
      const res = await this.$http('foodfundraising.Recipes/foodUnBinding', { trId: this.baseInfo.trId });
      if (!res.errMsg) {
        this.$msg('解除成功', 'success');
        this.baseInfo.trSkuname = '';
        this.getInfo();
      } else {
        this.$msg(res.errMsg, 'error');
      }
    }
  }
};
</script>

<style lang="less" scoped>
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
h3 {
  margin-right: 20px;
}
h4 {
  margin: 10px 0;
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
    height: 30px;
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
</style>
