<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="4"
        :label-width="50"
        :action="false"
        semi
      ></QueryComponents>
      <el-button type="primary" @click="create()">添加任务</el-button>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :data="tableData"
        :total="tableDataTotal"
        :visible="false"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column type="index" label="序号" align="center"></el-table-column>
        <el-table-column prop="recordId" label="记录id" align="center"></el-table-column>
        <el-table-column prop="confKey" label="配置项" align="center"></el-table-column>
        <el-table-column prop="confValue" label="配置内容" align="center"></el-table-column>
        <el-table-column prop="decipher" label="配置说明" align="center"></el-table-column>
        <el-table-column prop="sttStr" label="任务状态" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.stt === '01'" type="success">{{ row.sttStr }}</el-tag>
            <el-tag v-if="row.stt === '00'" type="danger">{{ row.sttStr }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cuser" label="创建人" align="center"></el-table-column>
        <el-table-column prop="uuser" label="编辑人" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span class="brand-color cursor-pointer action-label" @click="editClick(row)">编辑</span>
            <span
              v-if="row.stt === '00'"
              class="brand-color cursor-pointer action-label"
              @click="open(row)"
            >上线</span>
            <span
              v-if="row.stt === '01'"
              class="brand-color cursor-pointer action-label"
              @click="pause(row)"
            >下线</span>
            <span class="brand-color cursor-pointer action-label" @click="del(row)">删除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="box"
      title="任务"
      :close-on-click-modal="false"
      :async-confirm="true"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <el-form ref="form" label-width="130px" :model="formData" :rules="rules">
        <el-form-item label="配置项" prop="confKey">
          <el-input v-model="formData.confKey" class="small-input" style="width: 350px;"></el-input>
        </el-form-item>
        <el-form-item label="配置内容" prop="confValue">
          <el-input
            v-model="formData.confValue"
            type="textarea"
            :rows="4"
            class="small-input"
            style="width: 350px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="配置说明" prop="decipher">
          <el-input
            v-model="formData.decipher"
            type="textarea"
            :rows="4"
            class="small-input"
            style="width: 350px;"
          ></el-input>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import { transformDaterange } from '@/utils/transform'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { defineComponent } from 'vue'
function initFormData() {
  return {
    confKey: '',
    confValue: '',
    decipher: ''
  }
}

export default defineComponent({
  name: 'eveloper_system-config',
  components: {
    ConfirmDialog
  },
  data() {
    return {
      box: false,
      tableData: [],
      tableDataTotal: 0,
      formData: initFormData(),
      page: {
        pageNo: 1,
        pageSize: 999
      },
      rules: {
        confKey: { required: true, message: '请输入配置项', trigger: 'blur' },
        confValue: { required: true, message: '请输入配置内容', trigger: 'blur' },
        decipher: { required: true, message: '请输入配置说明', trigger: 'blur' }
      },
      queryParams: {},
      queryComps: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.$store.state.vloading = true
      this.$http('sys.SysConf/querySysConf', { stt: '01' })
      const res = await this.$http('sys.SysConf/querySysConf', {})
      this.tableData = res.obj.record
      this.tableDataTotal = res.obj.totalRecordCount
    },
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    genQueryParams() {
      const params = { ...this.queryParams }
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date)
        params.startDate = startDate.format('YYYY-MM-DD')
        params.endDate = endDate.format('YYYY-MM-DD')
      }
      delete params.date
      return params
    },
    create() {
      this.edit = false
      this.formData = initFormData()
      this.box = true
    },
    onconfirm(done) {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          const res = this.edit
            ? await this.$http('sys.SysConf/editSysConf', { recordId: this.recordId, ...this.formData })
            : await this.$http('sys.SysConf/addSysConf', this.formData)

          if (!res.errMsg) {
            this.$msg('操作成功', 'success')
            this.box = false
            this.getList()
          } else {
            this.$msg(res.errMsg, 'error')
          }
        }
        done()
      })
    },
    editClick(row) {
      this.edit = true

      this.recordId = row.recordId
      Object.keys(this.formData).forEach((key) => {
        this.formData[key] = row[key]
      })
      this.box = true
    },
    async open(row) {
      const res = await this.$http('sys.SysConf/openSysConf', { recordId: row.recordId })
      if (!res.errMsg) {
        this.$msg('操作成功', 'success')
        this.getList()
      } else {
        this.$msg(res.errMsg, 'error')
      }
    },
    async pause(row) {
      const res = await this.$http('sys.SysConf/closeSysConf', { recordId: row.recordId })
      if (!res.errMsg) {
        this.$msg('操作成功', 'success')
        this.getList()
      } else {
        this.$msg(res.errMsg, 'error')
      }
    },
    async del(row) {
      const res = await this.$http('sys.SysConf/delSysConf', { recordId: row.recordId })
      if (!res.errMsg) {
        this.$msg('操作成功', 'success')
        this.getList()
      } else {
        this.$msg(res.errMsg, 'error')
      }
    }
  }
})
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.medium-input {
  width: 250px;
  margin-right: 20px;
}

.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}
.action-label {
  margin-right: 10px;
}
</style>
