<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="4"
        :label-width="50"
        :action="false"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="create()">添加任务</el-button>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        :visible="false"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column type="index" label="序号" align="center"></el-table-column>
        <el-table-column prop="jobId" label="任务id" align="center"></el-table-column>
        <el-table-column prop="jobName" label="任务名称" align="center"></el-table-column>
        <el-table-column prop="intro" label="任务简介" align="center"></el-table-column>
        <el-table-column prop="className" label="任务调用类" align="center"></el-table-column>
        <el-table-column prop="methodName" label="调用方法" align="center"></el-table-column>
        <el-table-column prop="stt" label="任务状态" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.stt === '正常'" type="success">{{ row.stt }}</el-tag>
            <el-tag v-if="row.stt === '暂停'" type="danger">{{ row.stt }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cron" label="任务调度cron" align="center"></el-table-column>
        <el-table-column prop="methodParams" label="调用参数" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span class="brand-color cursor-pointer action-label" @click="editClick(row)">编辑</span>
            <span
              v-if="row.stt !== '正常'"
              class="brand-color cursor-pointer action-label"
              @click="open(row)"
            >开启</span>
            <span
              v-if="row.stt !== '暂停'"
              class="brand-color cursor-pointer action-label"
              @click="pause(row)"
            >暂停</span>
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
      <el-form label-width="130px">
        <el-form-item label="任务名称">
          <el-input v-model="formData.jobName" class="small-input" style="width: 350px;"></el-input>
        </el-form-item>
        <el-form-item label="任务调用类">
          <el-input v-model="formData.className" class="small-input" style="width: 350px;"></el-input>
        </el-form-item>
        <el-form-item label="任务调用方法">
          <el-input v-model="formData.methodName" class="small-input" style="width: 350px;"></el-input>
        </el-form-item>
        <el-form-item label="调用参数">
          <el-input v-model="formData.methodParams" class="small-input" style="width: 350px;"></el-input>
        </el-form-item>
        <el-form-item label="调度cron">
          <el-input v-model="formData.cron" class="small-input" style="width: 350px;"></el-input>
        </el-form-item>
        <el-form-item label="任务简介">
          <el-input
            v-model="formData.intro"
            class="small-input"
            type="textarea"
            :rows="6"
            style="width: 350px;"
          ></el-input>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'goods_dish-unit',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
  },
  data() {
    return {
      box: false,
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      formData: {
        jobName: '',
        intro: '',
        className: '',
        methodName: '',
        methodParams: '',
        cron: ''
      },
      page: {
        pageNo: 1,
        pageSize: 999
      },
      queryParams: {},
      queryComps: []
    }
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps]
      return list
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async deleteById(row) {
      this.$confirm('确定删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('Dietitian/deleteAdminDietitianById', { jobId: row.jobId })
        if (!res.errMsg) {
          this.$msg('删除成功', 'success')
          this.getList()
        } else {
          this.msg(res.errMsg, 'error')
        }
      })
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      }
      this.$store.state.vloading = true
      const res = await this.$http('wjob.Wjob/getJobConfs', params)
      this.tableData = res.obj.record
      this.tableDataTotal = res.obj.totalRecordCount
      this.$nt(() => {
        this.$refs.table.doLayout()
      })
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
      this.formData = {
        jobName: '',
        intro: '',
        className: '',
        methodName: '',
        methodParams: '',
        cron: ''
      }
      this.box = true
    },
    async onconfirm(done) {
      if (!this.formData.className) {
        this.$msg('请填写调用类', 'error')
        done()
        return
      }
      if (!this.formData.methodName) {
        this.$msg('请填写调用方法', 'error')
        done()
        return
      }
      if (!this.formData.cron) {
        this.$msg('请填写调度cron', 'error')
        done()
        return
      }
      const res = this.edit ? await this.$http('wjob.Wjob/editJobConf', this.formData) : await this.$http('wjob.Wjob/addJobConf', this.formData)
      done()
      if (!res.errMsg) {
        this.$msg('操作成功', 'success')
        this.box = false
        this.getList()
      } else {
        this.$msg(res.errMsg, 'error')
      }
    },
    editClick(row) {
      this.edit = true
      Object.keys(this.formData).forEach((key) => {
        this.formData[key] = row[key]
      })
      this.formData.jobId = row.jobId
      this.box = true
    },
    async open(row) {
      const res = await this.$http('wjob.Wjob/resumeJob', { jobId: row.jobId })
      if (!res.errMsg) {
        this.$msg('操作成功', 'success')
        this.getList()
      } else {
        this.$msg(res.errMsg, 'error')
      }
    },
    async pause(row) {
      const res = await this.$http('wjob.Wjob/pauseJob', { jobId: row.jobId })
      if (!res.errMsg) {
        this.$msg('操作成功', 'success')
        this.getList()
      } else {
        this.$msg(res.errMsg, 'error')
      }
    },
    async del(row) {
      const res = await this.$http('wjob.Wjob/delJobConf', { jobId: row.jobId })
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
