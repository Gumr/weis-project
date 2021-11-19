<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="4"
        :label-width="50"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >
            {{ $store.state.bloading ? '导出中' : '导出' }}
          </el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="create">上传营养师</el-button>
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
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column label="头像" align="center">
          <template #default="{ row }" class="action-cell">
            <el-image
              v-if="row.headImageUrl"
              style="width: 100px;height:100px"
              :src="row.headImageUrl"
              :preview-src-list="[row.headImageUrl]"
            />
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column prop="uname" label="名称"></el-table-column>
        <el-table-column prop="phone" label="手机"></el-table-column>
        <el-table-column prop="field" label="目标"></el-table-column>
        <el-table-column prop="introduction" label="简介"></el-table-column>
        <el-table-column prop="editor" label="编辑人"></el-table-column>
        <el-table-column prop="utime" label="编辑时间"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span class="brand-color cursor-pointer action-label" @click="create(row)">编辑</span>
            <span class="brand-color cursor-pointer action-label" @click="qrCode(row)">用户二维码</span>
            <span class="brand-color cursor-pointer action-label" @click="deleteById(row)">删除</span>
          </template>
        </el-table-column>
      </BasePageTable>
      <ConfirmDialog
        v-model="box"
        title="二维码"
        :close-on-click-modal="false"
        :async-confirm="true"
        :auto-confirm="false"
        :comfirm-visible="false"
      >
        <el-form label-width="130px">
          <el-form-item label="发给用户的二维码: ">
            <el-image v-if="imgUrl" class="qrbg" :src="imgUrl"></el-image>
            <div v-else ref="imageWrapper" class="qrbg">
              <div class="qrc">
                <img style="width: 270px; height: 270px;" :src="qrcodeUrl" />
                <!-- <canvas
                  id="qrcode"
                  class="qrcode"
                  ref="qrCodeUrl"
                  style="width: 270px; height: 270px;"
                ></canvas>-->
              </div>
              <div class="uname">
                {{ uname }}
                <br />
                {{ phone }}
              </div>
            </div>
          </el-form-item>
        </el-form>
      </ConfirmDialog>
    </div>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel'
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
// import QRCode from 'qrcodejs2'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import { defineComponent } from 'vue'

// const html2canvas = import('html2canvas')

export default defineComponent({
  name: 'sales_H5',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
  },
  data() {
    return {
      qrcodeUrl: '',
      box: false,
      uname: '',
      phone: '',
      imgUrl: '',
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '名称',
          prop: 'uname'
        },
        {
          label: '目标',
          prop: 'field'
        },
        {
          label: '简介',
          prop: 'introduction'
        },
        {
          label: '编辑人',
          prop: 'editor'
        },
        {
          label: '编辑时间',
          prop: 'utime'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        uname: '',
        phone: ''
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'uname',
          label: '姓名',
          placeholder: '姓名',
          props: {
            clearable: true
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '手机',
          placeholder: '手机',
          props: {
            clearable: true
          }
        }
      ]
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
    create(row) {
      this.$router.push({
        path: `${this.$route.path}/edit`,
        query: {
          id: row.id
        }
      })
    },
    async deleteById(row) {
      this.$confirm('确定删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('Dietitian/deleteAdminDietitianById', { id: row.id })
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
      const res = await this.$http('Dietitian/queryAdminDietitian', params)
      if (!res.errMsg) {
        this.tableData = res.obj.dietitianList
        this.tableDataTotal = res.obj.totalRecordCount
        this.tableData.forEach((val) => {
          val.utime = this.$day(val.utime).format('YYYY-MM-DD')
          let field = JSON.parse(val.field)
          field = field.join(',')
          val.field = field.replace('01', '减脂').replace('02', '增肌').replace('03', '控糖')
        })
        this.$nt(() => {
          this.$refs.table.doLayout()
        })
      }
    },
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    async handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const params = {
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal
      }
      const res = await this.$http('Dietitian/queryAdminDietitian', params)
      const data = res.obj.dietitianList
      data.forEach((val) => {
        val.utime = this.$day(val.utime).format('YYYY-MM-DD')
        let field = JSON.parse(val.field)
        field = field.join(',')
        val.field = field.replace('01', '减脂').replace('02', '增肌').replace('03', '控糖')
      })
      exportExcel({
        columns: this.tableCol,
        filename,
        data
      })
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
    async qrCode(row) {
      this.imgUrl = ''
      this.box = true
      this.uname = row.uname
      this.phone = row.phone
      setTimeout(() => {
        // document.getElementById('qrcode').innerHTML = '';
        let url = ''
        if (window.location.href.includes('prodnezha')) {
          url = `https://prodchannel.weis1606.cn?id=${row.id}`
        } else {
          url = `https://channel.weis1606.cn?id=${row.id}`
        }
        QRCode.toDataURL(url, (err, url) => {
          if (!err) {
            this.qrcodeUrl = url
          }
        })
        //  new QRCode(this.$refs.qrCodeUrl, {
        //   text: url, // 需要转换为二维码的内容
        //   width: 270,
        //   height: 270,
        //   colorDark: '#000000',
        //   colorLight: '#ffffff',
        //   correctLevel: QRCode.CorrectLevel.H
        // });
        setTimeout(() => {
          html2canvas(this.$refs.imageWrapper).then(canvas => {
            const image = canvas.toDataURL('image/png')
            this.imgUrl = image
          })
        }, 10)
      }, 100)
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
.qrbg {
  width: 590px;
  height: 819px;
  background-image: url(/images/qr_bj@2x.png);
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  box-sizing: border-box;
}
.qrc {
  width: 290px;
  height: 290px;
  background-color: white;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 80px;
}
.uname {
  width: 100%;
  color: white;
  font-size: 30px;
  text-align: center;
  line-height: 55px;
  margin-bottom: 40px;
}
.qrcode {
  display: inline-block;
  padding: 10px 0;
  img {
    width: 270px;
    height: 270px;
    background-color: #fff; //设置白色背景色
    box-sizing: border-box;
  }
}
</style>
