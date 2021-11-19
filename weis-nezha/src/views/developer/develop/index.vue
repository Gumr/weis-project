<template>
  <div class="page-container">
    <div class="section-item">
      <span class="section-label label-1">订单打印测试：</span>
      <el-input clearable class="medium-input" :rows="6" type="textarea" v-model="order"></el-input>
      <el-button type="primary" size="medium" class="btn" @click="orderConfirm">打印</el-button>
    </div>
    <div class="section-item">
      <span class="section-label label-1"></span>
      <el-button type="primary" size="medium" class="btn2" @click="updateAuthClick">添加路由权限</el-button>
    </div>
    <div class="section-item">
      <span class="section-label label-1">uid：</span>
      <el-input
        clearable
        class="medium-input"
        :rows="6"
        type="textarea"
        placeholder="可为空,多个以逗号分隔"
        v-model="uid"
      ></el-input>
    </div>
    <div class="section-item">
      <span class="section-label label-1">手机号：</span>
      <el-input
        clearable
        class="medium-input"
        :rows="6"
        type="textarea"
        placeholder="可为空,多个以逗号分隔"
        v-model="phone"
      ></el-input>
      <el-button type="primary" size="medium" class="btn" @click="confirm">提交</el-button>
      <el-button type="primary" size="medium" class="btn2" @click="hanldleExport">导出</el-button>
    </div>
    <div class="section-item">
      <span class="section-label label-1">结果：</span>
      <BasePageTable style="width: 80%;" :data="result" :visible="false" border ref="sku">
        <el-table-column label="序号" type="index" width="80px"></el-table-column>
        <el-table-column label="uid" prop="uid"></el-table-column>
        <el-table-column label="token" prop="token"></el-table-column>
        <el-table-column label="uname" prop="uname"></el-table-column>
        <el-table-column label="phone" prop="phone"></el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import exportExcel from '@/utils/export-excel';
import moduleRoutes from '@/router/module';
import CreateOneFormPage from '@/utils/pushPrint.js';

export default {
  components: {
    BasePageTable,
  },
  data() {
    return {
      result: [],
      uid: '',
      phone: '',
      order: '',
    }
  },
  methods: {
    async confirm() {
      const uid = this.uid.replace(/\，/g, ',');
      const phone = this.phone.replace(/\，/g, ',');
      const res = await this.$http('tools.ServiceTools/generateToken', { uid, phone });
      if (!res.errMsg) {
        this.result = res.obj.userTokenVo;
      } else {
        this.$msg(res.errMsg, 'error');
      }
    },
    hanldleExport() {
      if (!this.result.length) {
        this.$msg('无数据', 'error');
        return;
      }
      const filename = `${this.$route.meta.title}-导出`;
      const columns = [
        { label: '序号', type: 'index' },
        { label: 'uid', prop: 'uid' },
        { label: 'token', prop: 'token' },
        { label: 'uname', prop: 'uname' },
        { label: 'phone', prop: 'phone' },
      ]
      exportExcel({
        columns,
        filename,
        data: this.result
      });
    },
    updateAuthClick() {
      const data = this.$deepClone(moduleRoutes);
      const auth = this.handleData(data);
      this.$request('sys.Menu/addMenu', { routes: auth })
        .then(({ data }) => {
          if (data.errCode === 0) {
            const duration = 1500;
            this.$message({
              type: 'success',
              message: '更新权限菜单成功',
              duration
            });
            // setTimeout(() => {
            //   window.location.reload();
            // }, duration);
          }
        });
    },
    handleData(data) {
      for (const item of data) {
        item.url = item.name;
        item.name = item.meta.title;
        delete item.meta;
        delete item.path;
        delete item.component;
        delete item.hidden;
        if (item.children) {
          this.handleData(item.children);
        }
      }
      return data;
    },
    orderConfirm() {
      const redata = JSON.parse(this.order);
      for (const item of redata) {
        const dish = JSON.parse(item.orderData);
        CreateOneFormPage(dish, item.type);
      }
    }
  }
}
</script>

<style lang="less" scoped>
.label-1 {
  width: 80px;
  margin-right: 12px;
  text-align: right;
}
</style>
