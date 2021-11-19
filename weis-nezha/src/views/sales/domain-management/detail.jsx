
import {
  defineComponent, reactive, inject
} from 'vue'
import { useRoute } from 'vue-router';
import { http } from '@/utils/request';

export default defineComponent({
  name: 'sales_domin-management_detail',
  setup() {
    const route = useRoute();

    const { id } = route.query;
    const page = reactive({
      pageNo: 1,
      pageSize: 20,
    })

    const loading = inject('vloading');
    const tableColumns = [
      {
        width: '60px',
        align: 'center',
        type: 'index',
        label: '序号'
      },
      {
        label: '人员名称',
        prop: 'tseName'
      },
      {
        label: '手机号',
        prop: 'tsePhone'
      },
      {
        label: '类型',
        prop: 'tseTypeDesc'
      }
    ]
    const data = reactive({
      list: [],
      total: 0
    });
    const queryProps = {
      modelValue: reactive({
        tsePhone: ''
      }),
      queryList: [
        {
          component: 'el-input',
          label: '手机号：',
          key: 'tsePhone',
          placeholder: '输入手机号'
        }
      ]
    }
    function getList() {
      http('sale.SaleGoal/querySaleGoalEmployeePage', {
        tsgId: id,
        ...page,
        ...queryProps.modelValue
      })
        .thenwrap((err, res) => {
          if (!err) {
            data.list = res.dataPage.record;
            data.total = res.dataPage.totalRecordCount;
          }
        })
    }
    queryProps.slots = {
      action: () => (
        <el-button onClick={getList}>搜索</el-button>
      ),
    }

    getList();
    return () => (
      <div class="page-container padding-0-20">
        <div class="query-bar">
          <QueryComponents queryList={queryProps.queryList} v-model={queryProps.modelValue} v-slots={queryProps.slots} ></QueryComponents>
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
            tableColumns.map((col, index) => <el-table-column {...col} key={index}></el-table-column>)
          }
        </BasePageTable>
      </div>
    )
  }
})
