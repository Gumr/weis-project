
import {
  defineComponent, reactive, inject, computed
} from 'vue'
import { requestFactor } from '@/utils/request'
import { useRoute } from 'vue-router'
import ButtonTabs from '@/components/ButtonTabs.vue';
import { round } from '@/utils/common'
import exportExcel from '../../../utils/export-excel';

const { http } = requestFactor('marketing.activity.CompanyLoseWeight');

export default defineComponent({
  name: 'om_enterprise-cam_rank-detail',
  setup() {
    const route = useRoute();
    const activityId = route.query.id;

    const loading = inject('vloading');
    const tabValue = reactive({
      range: '01',
      scoreType: '01'
    })
    const tabs = {
      range: [
        {
          label: '个人排名榜',
          value: '01'
        },
        {
          label: '小组排名榜',
          value: '02'
        }
      ],
      scoreType: [
        {
          label: '过程积分榜',
          value: '01'
        },
        {
          label: '最终效果榜',
          value: '02'
        }
      ],
    }
    const data = reactive({
      list: []
    })

    function getList() {
      http('getRanking', {
        tclwrClwId: activityId,
        ...tabValue,
      })
        .thenwrap((err, res) => {
          if (!err) {
            data.list = res.intakeScoreReposeList;
            // data.total = res.totalRecordCount;
          }
        })
    }

    const tableColumns = computed(() => {
      const baseCol = tabValue.range === '01'
        ? [
          {
            label: '排名',
            prop: 'rankings'
          },
          {
            label: '组员昵称',
            prop: 'uname'
          },
          {
            label: '组员手机号',
            prop: 'tclwrPhone'
          },
          {
            label: '所在小组',
            prop: 'groupName'
          }
        ]
        : [
          {
            label: '排名',
            prop: 'rankings'
          },
          {
            label: '小组名字',
            prop: 'uname'
          },
          {
            label: '小组人数',
            prop: 'tclwrStep'
          },
          {
            label: '所在小组',
            prop: 'groupName'
          }
        ]

      if (tabValue.scoreType === '02') {
        baseCol.push(
          {
            label: '减重百分比',
            prop: 'rankPart',
            formatter: row => `${row.rankPart}%`
          },
          {
            label: '累计减重',
            prop: 'rankScore',
            formatter: row => `${round(row.rankScore * 2, 1)}斤`
          }
        )
      } else {
        baseCol.push({
          label: '当前积分',
          prop: 'rankScore'
        })
      }
      return baseCol
    })

    function exportClick() {
      exportExcel({
        columns: tableColumns.value,
        data: data.list
      })
    }
    getList();
    return () => (
      <div class="page-container padding-0-20">
        <div class="query-bar">
          <ButtonTabs v-model={tabValue.range} tabs={tabs.range} onChange={getList}></ButtonTabs>
        </div>
        <div class="flex-content-between" style="margin: 20px 0;">
          <ButtonTabs v-model={tabValue.scoreType} tabs={tabs.scoreType} onChange={getList}></ButtonTabs>
          <el-button onClick={exportClick}>导出</el-button>
        </div>
        <BasePageTable
          v-loading={loading.value}
          visible={false}
          data={data.list}
          onCurrentPageChange={getList}
          onSizeChange={getList}
        >
          {
            tableColumns.value.map(col => <el-table-column {...col} v-slots={col.slots} key={col.label}></el-table-column>)
          }
        </BasePageTable>
      </div>
    )
  }
})
