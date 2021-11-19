<template>
  <div class="page-container">
    <div class="section-item">
      <span class="section-label label-1">client对象:</span>
      <el-input
        clearable
        class="medium-input"
        :rows="6"
        type="text"
        v-model="clientClassName"
        placeholder="例: wservice.scm.client.ScmClient"
      ></el-input>
    </div>
    <div class="section-item">
      <span class="section-label label-1">方法名:</span>
      <el-input
        clearable
        class="medium-input"
        :rows="6"
        type="text"
        v-model="reqMethod"
        placeholder="例: syncStockOutPlus"
      ></el-input>
    </div>
    <div class="section-item">
      <span class="section-label label-1">请求参数:</span>
      <el-input
        clearable
        class="medium-input"
        :rows="20"
        type="textarea"
        v-model="reqParams"
        placeholder="请输入json数组
例:[{
    &quot;com.alibaba.fastjson.JSONObject&quot;: &quot;{\&quot;date\&quot;:\&quot;20210701\&quot;,\&quot;type\&quot;:\&quot;01\&quot;}&quot;
  },
  {
    &quot;com.alibaba.fastjson.JSONObject&quot;: &quot;{\&quot;date\&quot;:\&quot;20210702\&quot;,\&quot;type\&quot;:\&quot;01\&quot;}&quot;
  }]"
      ></el-input>
    </div>

    <el-button
      type="primary"
      @click="create()"
      style="margin-left:300px;margin-top:40px"
    >提交</el-button>

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