
import {
  defineComponent, reactive, inject, ref
} from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { requestFactor } from '@/utils/request'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const { request, http } = requestFactor('marketing.activity.CompanyLoseWeight');

export default defineComponent({
  name: 'om_enterprise-cam_detail',
  setup() {
    const route = useRoute();
    const router = useRouter()
    const activityId = route.query.id;
    const page = reactive({
      pageNo: 1,
      pageSize: 20,
    })
    const status = ref(null);
    // const pushRoute = inject('pushRoute');
    const loading = inject('vloading');

    const dialog = reactive({
      visible: false
    });

    const data = reactive({
      list: [],
      total: 0
    });

    const editTable = reactive({
      list: []
    })

    const options = ref([]);

    const editTableColumns = [
      {
        label: '序号',
        type: 'index',
        width: '80'
      },
      {
        label: '小组名称',
        slots: {
          default: ({ $index }) => <el-input v-model={editTable.list[$index].groupName} />
        }
      },
      {
        label: '组长名称',
        slots: {
          default: ({ $index }) => <el-input v-model={editTable.list[$index].principal} />
        }
      },
      {
        label: '组长手机号',
        slots: {
          default: ({ $index }) => <number-input v-model={editTable.list[$index].principalPhone} precision={11}></number-input>
        }
      },
      {
        label: '饮食顾问',
        slots: {
          default: ({ $index }) => <base-select v-model={editTable.list[$index].counselor} options={options.value} clearable/>
        }
      }
    ]

    function editClick() {
      editTable.list = data.list.map(item => ({
        groupId: item.groupId,
        groupName: item.groupName,
        principal: item.principal,
        principalPhone: item.principalPhone,
        counselor: item.counselor,
      }))
      dialog.visible = true;
    }

    const queryProps = {
      modelValue: reactive({
        principalPhone: '',
        counselorPhone: ''
      }),
      queryList: [
        {
          component: 'el-input',
          label: '组长手机号',
          key: 'principalPhone',
          placeholder: '组长手机号',
          props: {
            clearable: true
          }
        },
        {
          component: 'el-input',
          label: '顾问手机号',
          key: 'counselorPhone',
          placeholder: '顾问手机号',
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

    function getCounselorInfo() {
      request('getCounselorInfo', {
        activityId
      }).thenwrap((err, res) => {
        if (!err) {
          options.value = res.map(it => ({
            label: it.cname,
            value: it.cid
          }))
        }
      })
    }

    function getList() {
      http('getActivityGroupList', {
        activityId,
        ...page,
        ...queryProps.modelValue
      })
        .thenwrap((err, res) => {
          if (!err) {
            data.list = res.record;
            data.total = res.totalRecordCount;
          }
        })
    }

    function editGroup() {
      return request('editGroup', { form: editTable.list })
    }

    function handleEditConfirm() {
      let valid = true
      let keys
      // eslint-disable-next-line
      for (const item of editTable.list) {
        keys = keys || Object.keys(item).filter(k => k !== 'groupId')
        const firstValid = Boolean(item[keys[0]])
        for (let i = 1; i < keys.length; i += 1) {
          const currentValid = Boolean(item[keys[i]])
          if (firstValid !== currentValid) valid = false
        }
        if (!valid) break;
      }
      if (!valid) {
        ElMessage.error('未输入完整数据');
        return;
      }
      editGroup()
        .thenwrap((err) => {
          if (!err) {
            getList();
            dialog.visible = false;
          } else {
            ElMessage.error(err.errMsg);
          }
        })
    }

    function addGroupClick() {
      request('addGroup', {
        activityId
      }).thenwrap((err, res) => {
        if (!err) {
          editTable.list.push({
            groupId: res,
            groupName: '',
            principal: '',
            principalPhone: '',
            counselor: '',
          })
          getList()
        }
      })
    }
    queryProps.slots = {
      search: () => (
        <el-button onClick={getList}>搜索</el-button>
      ),
      edit: () => (
        <div class="text-right">
          <el-button type="primary" onClick={editClick}>批量编辑</el-button>
        </div>
      )
    }

    function removeGroupClick(row) {
      request('removeUser', {
        groupId: row.groupId
      }).thenwrap((err) => {
        if (!err) {
          getList()
        }
      })
    }

    function getActivityInfo() {
      request('getActivityInfo', {
        activityId
      }).thenwrap((err, res) => {
        if (!err) {
          status.value = res.stt;
        }
      })
    }

    const tableColumns = [
      {
        width: '60px',
        align: 'center',
        type: 'index',
        label: '序号',
      },
      {
        label: '活动名称',
        prop: 'activityName'
      },
      {
        label: '小组名称',
        prop: 'groupName'
      },
      {
        label: '组长名称',
        prop: 'principal'
      },
      {
        label: '组长手机号',
        prop: 'principalPhone'
      },
      {
        label: '顾问名称',
        prop: 'counselorName'
      },
      {
        label: '顾问手机号',
        prop: 'counselorPhone'
      },
      {
        label: '小组人数',
        prop: 'joinNum'
      },
      {
        label: '操作',
        align: 'center',
        slots: {
          default: ({ row }) => (
            <>
              <span v-show={Number(status.value) <= 3} class="table-action-label" style="margin-right: 8px;" onClick={() => removeGroupClick(row)}>移除</span>
              <span class="table-action-label" onClick={() => router.push({
                name: 'om_enterprise-camp_member-detail',
                query: {
                  id: row.groupId,
                  status: status.value
                }
              })}>组员详情</span>
            </>
          )
        }
      }
    ]
    getCounselorInfo();
    getList();
    getActivityInfo();
    return () => (
      <div class="page-container padding-0-20">
        <div class="query-bar">
          <QueryComponents queryList={queryProps.queryList} v-model={queryProps.modelValue} span={4} v-slots={queryProps.slots} action={false} semi></QueryComponents>
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
            tableColumns.map((col, index) => <el-table-column {...col} v-slots={col.slots} key={index}></el-table-column>)
          }
        </BasePageTable>
        <ConfirmDialog width="75%" v-model={dialog.visible} confirm-text="保存" title="批量编辑小组" auto-confirm={false} center onOnConfirm={handleEditConfirm}>
          <div className="text-right" style="margin-bottom: 12px;">
            <el-button onClick={addGroupClick}>添加小组</el-button>
          </div>
          <BasePageTable visible={false} data={editTable.list}>
            {
              editTableColumns.map((col, index) => <el-table-column {...col} v-slots={col.slots} key={index}></el-table-column>)
            }
          </BasePageTable>
        </ConfirmDialog>
      </div>
    )
  }
})
