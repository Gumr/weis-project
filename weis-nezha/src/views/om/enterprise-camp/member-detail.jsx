
import {
  defineComponent, reactive, inject, computed
} from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ImportExcel from '@/components/ImportExcel.vue'
import { requestFactor } from '@/utils/request'
import { useRoute } from 'vue-router'
import exportExcel from '@/utils/export-excel'
import { ElMessage } from 'element-plus'

const { request, http } = requestFactor('marketing.activity.CompanyLoseWeight');

export default defineComponent({
  name: 'om_enterprise-cam_detail',
  setup() {
    const route = useRoute();
    const groupId = route.query.id;
    const status = route.query.status;
    const page = reactive({
      pageNo: 1,
      pageSize: 20,
    })
    const loading = inject('vloading');

    const dialogVisible = reactive({
      create: false,
      import: false,
      weight: false
    });
    const importTable = reactive({
      data: [],
      joined: [] // 已经加入过的
    })
    const user = reactive({
      startWeight: 0,
      phone: '',
      name: ''
    })

    const data = reactive({
      list: [],
      total: 0
    })

    function downloadTemplateClick() {
      exportExcel({
        columns: [
          {
            label: '序号',
            type: 'index'
          },
          { label: '手机号', prop: '' },
          { label: '初始体重', prop: '' }
        ],
        filename: '组员导入模板',
        data: []
      })
    }

    const queryProps = {
      modelValue: reactive({
        phone: '',
      }),
      queryList: [
        {
          component: 'el-input',
          label: '组员手机号',
          key: 'phone',
          placeholder: '组员手机号',
          props: {
            clearable: true
          }
        },
        {
          slot: 'search'
        },
        {
          slot: 'edit'
        }
      ]
    }
    function roundWeight(num) {
      // eslint-disable-next-line
      return (num * 10 | 0) / 10
    }
    function getList() {
      return http('getCroupRecordVo', {
        groupId,
        ...page,
        ...queryProps.modelValue
      })
        .thenwrap((err, res) => {
          if (!err) {
            data.list = res.record.map((i) => {
              i.startWeight = roundWeight(i.startWeight * 2)
              i.endWeight = roundWeight(i.endWeight * 2)
              return i
            });
            data.total = res.totalRecordCount;
          }
        })
    }

    function removeUser(ph) {
      return http('removeUser', {
        groupId,
        phone: ph
      })
    }
    function removeClick(row) {
      removeUser(row.phone)
        .thenwrap((err) => {
          if (!err) {
            getList();
          } else {
            ElMessage.error(err.errMsg)
          }
        })
    }
    function addWeightForStart(weightInfo) {
      weightInfo.weight = roundWeight(weightInfo.weight / 2)
      return http('addWeightForStart', {
        groupId,
        weightInfo: [weightInfo]
      })
    }

    function addWeightForEnd(weightInfo) {
      weightInfo.weight = roundWeight(weightInfo.weight / 2)
      return http('addWeightForEnd', {
        groupId,
        weightInfo: [weightInfo]
      })
    }

    function handleUpdate(row, type) {
      const updateReq = type === 'startWeight'
        ? addWeightForStart({
          phone: row.phone,
          weight: row[type]
        })
        : addWeightForEnd({
          phone: row.phone,
          weight: row[type]
        })

      row[type] = roundWeight(row[type])
      updateReq.thenwrap((err) => {
        if (!err) {
          ElMessage.success('修改成功')
        }
      })
    }

    const tableColumns = computed(() => {
      const cols = [
        {
          width: '60px',
          align: 'center',
          type: 'index',
          label: '序号',
        },
        {
          label: '组员昵称',
          prop: 'uname'
        },
        {
          label: '组员手机号',
          prop: 'phone'
        },
        {
          label: '初始体重(斤)',
          prop: 'startWeight',
          slots: {
            default: ({ row }) => (
              <>
                {
                  status === '03'
                    ? <NumberInput v-model={row.startWeight} mode="digit" onBlur={() => handleUpdate(row, 'startWeight')}></NumberInput>
                    : row.startWeight
                }
              </>
            )
          }
        },
        {
          label: '加入时间',
          prop: 'ctime'
        },
        {
          label: '操作',
          slots: {
            default: ({ row }) => (
              <>
                <span class="table-action-label" style="margin-right: 8px;" onClick={() => removeClick(row)}>移除</span>
              </>
            )
          }
        }
      ]
      if (status === '05') {
        cols.splice(4, 0, {
          label: '最终体重',
          prop: 'endWeight',
          slots: {
            default: ({ row }) => <NumberInput v-model={row.endWeight} mode="digit" onBlur={() => handleUpdate(row, 'endWeight')}></NumberInput>
          }
        })
      }
      return cols
    })
    const importTableColumns = [
      {
        label: '序号',
        prop: '序号'
      },
      {
        label: '手机号',
        prop: '手机号'
      },
      {
        label: '昵称',
        prop: '昵称'
      }
    ]

    function exportClick() {
      if (data.list.length <= 0) {
        ElMessage.error('没有组员数据可导出')
        return;
      }
      http('getCroupRecordVo', {
        groupId,
        pageNo: 1,
        pageSize: 999,
        ...queryProps.modelValue
      }).thenwrap((err, res) => {
        if (!err) {
          exportExcel({
            columns: tableColumns.value,
            filename: '企业减脂营-组员列表',
            data: res.record.map((i) => {
              i.startWeight = roundWeight(i.startWeight * 2)
              i.endWeight = roundWeight(i.endWeight * 2)
              return i
            }),
          })
        }
      })
    }
    function handleBatchClick() {
      importTable.data = []
      importTable.joined = []
      dialogVisible.import = true;
    }

    function handleImport(importData) {
      importTable.data = importData;

      request('verifyUser', {
        groupId,
        userPhone: importData.map(item => item['手机号'])
      }).thenwrap((err, res) => {
        if (!err) {
          importTable.joined = res.notJoin;
        } else {
          ElMessage.error(err.errMsg)
        }
      })
    }

    function editClick() {
      dialogVisible.create = true;
    }

    function handlePhoneInput() {
      if (user.phone.length === 11) {
        request('getUnameForPhone', {
          phone: user.phone
        }).thenwrap((err, res) => {
          if (!err) {
            user.name = res;
          }
        })
      }
    }

    function addGroupRecord(userInfo) {
      return http('addGroupRecord', {
        groupId,
        userInfo: userInfo.map((i) => {
          i.weight = roundWeight(i.weight / 2)
          return i
        })
      })
    }

    function handleCreateConfirm() {
      addGroupRecord([{
        phone: user.phone,
        weight: user.startWeight
      }])
        .thenwrap((err) => {
          if (!err) {
            ElMessage.success('添加成功')
            dialogVisible.create = false;
            getList();
          } else {
            ElMessage.error(err.errMsg)
          }
        })
    }

    function handleImportConfirm() {
      const userData = importTable.data
        .filter(it => !importTable.joined.includes(String(it['手机号'])))
        .map(it => ({
          phone: it['手机号'],
          weight: it['初始体重']
        }))

      addGroupRecord(userData)
        .thenwrap((err) => {
          if (!err) {
            ElMessage.success('导入成功')
            dialogVisible.import = false;
            getList();
          }
        })
    }

    const querySlots = {
      search: () => (
        <>
          <el-button onClick={getList}>搜索</el-button>
          <el-button type="success" onClick={exportClick}>导出</el-button>
        </>
      ),
      edit: () => (
        <div v-show={status !== '05'} class="text-right">
          <el-button type="primary" onClick={editClick}>手动编辑</el-button>
          <el-button onClick={handleBatchClick}>批量添加</el-button>
          <span class="table-action-label nowrap" style="margin-left: 8px;" onClick={downloadTemplateClick}>下载模板</span>
        </div>
      )
    }

    getList();
    return () => (
      <div class="page-container padding-0-20">
        <div class="query-bar">
          <QueryComponents queryList={queryProps.queryList} v-model={queryProps.modelValue} v-slots={querySlots} action={false} semi></QueryComponents>
        </div>
        <BasePageTable
          v-loading={loading.value}
          v-model={[page.pageNo, 'current-page']}
          v-model={[page.pageSize, 'page-size']}
          data={data.list}
          total={data.total}
          onCurrentPageChange={getList}
          onSizeChange={getList}
        >
          {
            tableColumns.value.map((col, index) => <el-table-column {...col} v-slots={col.slots} key={index}></el-table-column>)
          }
        </BasePageTable>
        <ConfirmDialog v-model={dialogVisible.create} title="新建组员" auto-confirm={false} center onOnConfirm={handleCreateConfirm}>
          <div class="flex-items-center" style="margin: 12px 0;">
            <span class="asterisk" style="width: 100px; display: inline-block;">人员手机号</span>
            <number-input v-model={user.phone} presicion={11} onInput={handlePhoneInput} />
          </div>
          <div class="flex-items-center" style="margin: 12px 0;">
            <span class="asterisk" style="width: 100px; display: inline-block;">人员昵称</span>
            <span>{user.name}</span>
          </div>
          <div class="flex-items-center" style="margin: 12px 0;">
            <span class="asterisk" style="width: 100px; display: inline-block;">初始体重(斤)</span>
            <number-input v-model={user.startWeight} mode="digit" />
          </div>
        </ConfirmDialog>
        <ConfirmDialog v-model={dialogVisible.import} title="未注册的手机号在注册后会自动导入" auto-confirm={false} center onOnConfirm={handleImportConfirm}>
          {
            importTable.data.length <= 0
              ? <ImportExcel onImport={handleImport}>
                <el-button icon="el-icon-upload" type="success">选取文件导入</el-button>
              </ImportExcel>
              : <div>
                <el-table data={importTable.data} border>
                  {
                    importTableColumns.map(col => (<el-table-column {...col}></el-table-column>))
                  }
                </el-table>
                <div>
                  <p>本次导入：{importTable.data.length}</p>
                  <p>可加入其他小组：{
                    importTable.joined.map(p => (<span style="margin-right: 8px;">{p}</span>))
                  }</p>
                  <p>可导入：{importTable.data.length - importTable.joined.length}</p>
                </div>
              </div>
          }
        </ConfirmDialog>
      </div>
    )
  }
})
