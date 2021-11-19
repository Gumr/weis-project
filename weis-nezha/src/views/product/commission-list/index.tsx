import { defineComponent, reactive, inject, computed, Ref, ref } from 'vue';
import req, { requestFactor } from '@/utils/request';
import dayjs from 'dayjs';
import exportExcel from '@/utils/export-excel';
import SubmitButton from '@/components/SubmitButton.vue';

const { request, http } = requestFactor('data.SaleProfit', true);

export default defineComponent({
  name: 'business_commission-list',
  setup() {
    const page = reactive({
      // pageNo: 1,
      // pageSize: 20,
    });
    const loading = inject('vloading') as Ref<boolean>;
    const data = reactive({
      list: [],
      total: 0,
    });
    const today = new Date()
    const queryParams = reactive({
      phone: '',
      departmentId: '',
      date: [today, today],
      startTime: dayjs(today).format('YYYYMMDD'),
      endTime: dayjs(today).format('YYYYMMDD'),
    });

    const departmentList = ref([])

    const querys = computed(() => [
      {
        component: 'el-date-picker',
        label: '日期区间',
        key: 'date',
        props: {
          type: 'daterange',
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期',
          clearable: false
        },
        listeners: {
          change(dates: Date[]) {
            queryParams.startTime = dayjs(dates[0]).format('YYYYMMDD');
            queryParams.endTime = dayjs(dates[1]).format('YYYYMMDD');
          },
        },
      },
      {
        component: 'NumberInput',
        label: '手机号',
        key: 'phone',
        placeholder: '请输入手机号',
        props: {
          precision: 11
        }
      },
      {
        component: 'BaseSelect',
        label: '部门',
        key: 'departmentId',
        props: {
          clearable: true,
          props: { label: 'departmentName', value: 'departmentId' },
          options: departmentList.value
        }
      },
      {
        slot: 'motion',
      },
    ]);

    const tableColumns = [
      {
        width: '60px',
        align: 'center',
        type: 'index',
        label: '序号',
      },
      {
        label: '手机号码',
        prop: 'personnelPhone',
      },
      {
        label: '内/外部',
        prop: 'personnelType',
      },
      {
        label: '部门',
        prop: 'departmentName'
      },
      {
        label: '成员',
        prop: 'personnelName',
      },
      {
        label: '提成',
        prop: 'profitPrice',
      },
      {
        label: '操作',
        slots: {
          default: ({ row }: { row: any }) => (<span class="table-action-label" onClick={() => detailClick(row)}>明细</span>)
        }
      }
    ];

    function querySaleDepartmentTree() {
      request('querySaleDepartment', {})
        .thenwrap((err, data) => {
          if (!err) {
            departmentList.value = data.SaleDepartmentList
          }
        })
    }


    function detailClick(row: any) {
      console.log(row, 'row')
      request('querySaleProfitDetailsData', {
        phone: row.personnelPhone,
        startTime: queryParams.startTime,
        endTime: queryParams.endTime
      }).thenwrap((err, data) => {
        if (!err) {
          const detailColumns = [
            {
              type: 'index',
              label: '序号'
            },
            {
              prop: 'orderNumber',
              label: '餐单编码'
            },
            {
              prop: 'saleType',
              label: '2B/2C'
            },
            {
              prop: 'unionType',
              label: '类型'
            },
            {
              prop: 'roleName',
              label: '角色'
            },
            {
              prop: 'shipTime',
              label: '配送日期'
            },
            {
              prop: 'userName',
              label: '微信名称'
            },
            {
              prop: 'userPhone',
              label: '手机号'
            },
            {
              prop: 'orderCategory',
              label: '餐别'
            },
            {
              prop: 'orderPrice',
              label: '实际价格'
            },
            {
              prop: 'payPrice',
              label: '余额（本金/微信）'
            },
            {
              prop: 'profitRatio',
              label: '提成比例'
            },
            {
              prop: 'profitPrice',
              label: '提成'
            },
            {
              prop: 'personnelName',
              label: '成员'
            },
            {
              prop: 'personnelPhone',
              label: '手机号码'
            }
          ]
          exportExcel({
            data: data.saleProfitDetailsDataList,
            columns: detailColumns,
            filename: `提成统计详情-导出`
          })
        }
      })
    }

    const getList = () => {
      http('querySaleProfitData', {
        ...page,
        ...queryParams,
      }).thenwrap((err, res) => {
        if (!err) {
          data.list = res.saleProfitDataList;
          // data.total = res.totalRecordCount;
        }
      });
    };

    function exportClick(done: () => void) {
      http('querySaleProfitData', {
        ...queryParams,
        pageNo: 1,
        pageSize: 9999,
      })
        .thenwrap((err, res) => {
          if (!err) {
            exportExcel({
              data: res.saleProfitDataList,
              columns: tableColumns,
            });
          }
        })
        .finally(done)
    }

    const querySlots = {
      motion: () => (
        <>
          <el-button onClick={getList}>搜索</el-button>
          <SubmitButton type="primary" onClick={exportClick}>
            导出
          </SubmitButton>
        </>
      ),
    };
    querySaleDepartmentTree();
    // getList();

    return () => (
      <div class="page-container padding-0-20">
        <div class="query-bar">
          <QueryComponents
            query-list={querys.value}
            v-model={queryParams}
            v-slots={querySlots}
            action={false}
          ></QueryComponents>
        </div>
        <BasePageTable
          v-loading={loading.value}
          v-models={[
            [page.pageNo, 'current-page'],
            [page.pageSize, 'page-size']
          ]}
          data={data.list}
          total={data.total}
          onCurrentPageChange={getList}
          onSizeChange={getList}
          visible={false}
        >
          {tableColumns.map((col, index) => (
            <el-table-column {...col} key={index} v-slots={col.slots}></el-table-column>
          ))}
        </BasePageTable>
      </div>
    );
  },
});
