<template>
  <div class="page-container">

    <h3>个人信息</h3>
    <div class="section-item">
      <span class="section-label label-1">性别:</span>
      <el-select
        clearable
        type="text"
        v-model="clientClassName"
      >
        <el-option
          label="男"
          value="0"
        ></el-option>
        <el-option
          label="女"
          value="1"
        ></el-option>
      </el-select>
      <span class="section-label label-1">年龄(岁):</span>
      <el-input
        clearable
        class="medium-input"
        :rows="6"
        type="text"
        v-model="reqMethod"
      ></el-input>
      <span class="section-label label-1">体重(公斤):</span>
      <el-input
        clearable
        class="medium-input"
        :rows="6"
        type="text"
        v-model="reqMethod"
      ></el-input>
    </div>
    <div class="section-item">
      <span class="section-label label-1">工作强度:</span>
      <el-select
        clearable
        type="text"
        v-model="clientClassName"
      >
        <el-option
          label="男"
          value="0"
        ></el-option>
        <el-option
          label="女"
          value="1"
        ></el-option>
      </el-select>
      <span class="section-label label-1">身高(厘米):</span>
      <el-input
        clearable
        class="medium-input"
        :rows="4"
        type="text"
        v-model="reqMethod"
        placeholder="例: syncStockOutPlus"
      ></el-input>
    </div>
    <el-divider></el-divider>
    <h3>方案</h3>
    <div class="section-item">
      <span class="section-label label-1">早中晚:</span>
      <el-select
        clearable
        type="text"
        v-model="clientClassName"
      >
        <el-option
          label="男"
          value="0"
        ></el-option>
        <el-option
          label="女"
          value="1"
        ></el-option>
      </el-select>
    </div>
    <el-divider></el-divider>
    <h3>价格区间</h3>
    <div class="section-item">
      <span class="section-label label-1">最低(元):</span>
      <el-input
        clearable
        class="medium-input"
        :rows="6"
        type="text"
        v-model="reqMethod"
        placeholder="例: syncStockOutPlus"
      ></el-input>
      <span class="section-label label-1">最高(元):</span>
      <el-input
        clearable
        class="medium-input"
        :rows="6"
        type="text"
        v-model="reqMethod"
        placeholder="例: syncStockOutPlus"
      ></el-input>
    </div>
    <el-divider></el-divider>
    <h3>目标</h3>
    <div class="section-item">
      <span class="section-label label-1">目标:</span>
      <el-select
        clearable
        class="medium-input"
        :rows="6"
        type="text"
        v-model="reqMethod"
        placeholder="例: syncStockOutPlus"
      ></el-select>
    </div>
    <el-divider></el-divider>
    <h3>供应链</h3>
    <div class="section-item">
      <span class="section-label label-1">门店:</span>
      <el-select
        clearable
        class="medium-input"
        :rows="6"
        type="text"
        v-model="reqMethod"
        placeholder="例: syncStockOutPlus"
      ></el-select>
      <span class="section-label label-1">日期:</span>
      <el-select
        clearable
        class="medium-input"
        :rows="6"
        type="text"
        v-model="reqMethod"
        placeholder="例: syncStockOutPlus"
      ></el-select>

    </div>
    <el-divider></el-divider>
    <h3>推荐算法</h3>
    <div class="section-item">
      <span class="section-label label-1">算法:</span>
      <el-select
        clearable
        class="medium-input"
        :rows="6"
        type="text"
        v-model="reqMethod"
        placeholder="例: syncStockOutPlus"
      ></el-select>
      <span class="section-label label-1">允许超出误差(%):</span>
      <el-select
        clearable
        class="medium-input"
        :rows="6"
        type="text"
        v-model="reqMethod"
        placeholder="例: syncStockOutPlus"
      ></el-select>
      <span class="section-label label-1">允许不及误差(%):</span>
      <el-select
        clearable
        class="medium-input"
        :rows="6"
        type="text"
        v-model="reqMethod"
        placeholder="例: syncStockOutPlus"
      ></el-select>
    </div>
    <div class="section-item">
      <span class="section-label label-1">期望返回套餐数:</span>
      <el-select
        clearable
        class="medium-input"
        :rows="6"
        type="text"
        v-model="reqMethod"
        placeholder="例: syncStockOutPlus"
      ></el-select>
    </div>
    <el-divider></el-divider>
    <h3>想吃什么</h3>
    <div class="section-item">
      <span class="section-label label-1">主食:</span>
      <el-checkbox v-model="checked2" :indeterminate="isIndeterminate"  @change="handleCheckAllChange">不限  </el-checkbox>
      <el-checkbox-group v-model="tmfDays">     
        <el-checkbox label="monday">周一</el-checkbox>
        <el-checkbox label="tuesday">周二</el-checkbox>
        <el-checkbox label="wednesday">周三</el-checkbox>
        <el-checkbox label="thursday">周四</el-checkbox>
        <el-checkbox label="friday">周五</el-checkbox>
        <el-checkbox label="saturday">周六</el-checkbox>
        <el-checkbox label="sunday">周日</el-checkbox>
      </el-checkbox-group>
    
    </div>
    <div class="section-item">
      <span class="section-label label-1">荤菜:</span>
      <el-checkbox-group v-model="tmfDays">
        <el-checkbox label="monday">周一</el-checkbox>
        <el-checkbox label="tuesday">周二</el-checkbox>
        <el-checkbox label="wednesday">周三</el-checkbox>
        <el-checkbox label="thursday">周四</el-checkbox>
        <el-checkbox label="friday">周五</el-checkbox>
        <el-checkbox label="saturday">周六</el-checkbox>
        <el-checkbox label="sunday">周日</el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="section-item">
      <span class="section-label label-1">豆类:</span>
      <el-checkbox-group v-model="tmfDays">
        <el-checkbox label="monday">周一</el-checkbox>
        <el-checkbox label="tuesday">周二</el-checkbox>
        <el-checkbox label="wednesday">周三</el-checkbox>
        <el-checkbox label="thursday">周四</el-checkbox>
        <el-checkbox label="friday">周五</el-checkbox>
        <el-checkbox label="saturday">周六</el-checkbox>
        <el-checkbox label="sunday">周日</el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="section-item">
      <span class="section-label label-1">蔬菜:</span>
      <el-checkbox-group v-model="tmfDays">
        <el-checkbox label="monday">周一</el-checkbox>
        <el-checkbox label="tuesday">周二</el-checkbox>
        <el-checkbox label="wednesday">周三</el-checkbox>
        <el-checkbox label="thursday">周四</el-checkbox>
        <el-checkbox label="friday">周五</el-checkbox>
        <el-checkbox label="saturday">周六</el-checkbox>
        <el-checkbox label="sunday">周日</el-checkbox>
      </el-checkbox-group>
    </div>
    <el-divider></el-divider>
    <h3>不吃什么</h3>
    <div class="section-item">
      <span class="section-label label-1">口味:</span>
      <el-checkbox-group v-model="tmfDays">
        <el-checkbox label="monday">周一</el-checkbox>
        <el-checkbox label="tuesday">周二</el-checkbox>
        <el-checkbox label="wednesday">周三</el-checkbox>
        <el-checkbox label="thursday">周四</el-checkbox>
        <el-checkbox label="friday">周五</el-checkbox>
        <el-checkbox label="saturday">周六</el-checkbox>
        <el-checkbox label="sunday">周日</el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="section-item">
      <span class="section-label label-1">过敏源:</span>
      <el-checkbox-group v-model="tmfDays">
        <el-checkbox label="monday">周一</el-checkbox>
        <el-checkbox label="tuesday">周二</el-checkbox>
        <el-checkbox label="wednesday">周三</el-checkbox>
        <el-checkbox label="thursday">周四</el-checkbox>
        <el-checkbox label="friday">周五</el-checkbox>
        <el-checkbox label="saturday">周六</el-checkbox>
        <el-checkbox label="sunday">周日</el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="section-item">
      <span class="section-label label-1">健康考虑排除:</span>
      <el-checkbox-group v-model="tmfDays">
        <el-checkbox label="monday">周一</el-checkbox>
        <el-checkbox label="tuesday">周二</el-checkbox>
        <el-checkbox label="wednesday">周三</el-checkbox>
        <el-checkbox label="thursday">周四</el-checkbox>
        <el-checkbox label="friday">周五</el-checkbox>
        <el-checkbox label="saturday">周六</el-checkbox>
        <el-checkbox label="sunday">周日</el-checkbox>
      </el-checkbox-group>
    </div>
    <el-button
      type="primary"
      @click="create()"
      style="margin-left:300px;margin-top:40px"
    >确定</el-button>

    <div
      class="section-item"
      v-for="col in result"
      :key="col.prop"
      v-bind="col"
    >
      <div>{{col}}</div>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      tmfDays:[],
      reqMethod: "",
      reqParams: [],
      clientClassName: "",
      result: "",
    };
  },
  methods: {
    create() {
      this.$request("tools.ServiceTools/call", {
        reqMethod: this.reqMethod,
        reqParams: this.reqParams,
        clientClassName: this.clientClassName,
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.result = data.obj.results;
        } else {
          this.$msg(data.errMsg, "error");
        }
      });
    },
  },
};
</script>

<style>
</style>