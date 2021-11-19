import { defineComponent, reactive } from 'vue'
import exportExcel from '@/utils/export-excel'
import request from '@/utils/request'
import dayjs from 'dayjs'
export default defineComponent({
  name: 'product_user-meal-data-list',
  setup() {
    const table = reactive({
      list: []
    })
    const queryValue = reactive({
      date: [],
      phone: ''
    })

    const columns = [
      {
        label: '序号',
        type: 'index'
      },
      {
        label: '日期',
        prop: 'date'
      },
      {
        label: '客户姓名',
        prop: 'userName'
      },
      {
        label: '手机号',
        prop: 'phone'
      },
      {
        label: '性别',
        prop: 'sex'
      },
      {
        label: '身高cm',
        prop: 'height'
      },
      {
        label: '年龄',
        prop: 'age'
      },
      {
        label: '体重kg',
        prop: 'weight'
      },
      {
        label: '记步数',
        prop: 'step'
      },
      {
        label: '凉开水ml',
        prop: 'water'
      },
      {
        label: '维士餐',
        prop: 'weisMeal'
      },
      {
        label: '餐别',
        prop: 'category'
      },
      {
        label: '配餐',
        prop: 'catering'
      },
      {
        label: '实际重量g',
        prop: 'cateringQuality'
      },
      {
        label: '碳水g',
        prop: 'cateringCarbonwater'
      },
      {
        label: '蛋白质g',
        prop: 'cateringProtein'
      },
      {
        label: '脂肪g',
        prop: 'cateringFat'
      },
      {
        label: '盐g',
        prop: 'cateringSalt'
      },
      {
        label: '碳水占比%',
        prop: 'cateringCarbonwaterRatio'
      },
      {
        label: '蛋白质占比%',
        prop: 'cateringProteinRatio'
      },
      {
        label: '脂肪占比%',
        prop: 'cateringFatRatio'
      },
      {
        label: '实际摄入kcal',
        prop: 'cateringEnergy'
      },
      {
        label: '方案当餐摄入kcal',
        prop: 'planEnergy'
      },
      {
        label: '热量差kcal',
        prop: 'energyDiff'
      },
      {
        label: '方案碳水g',
        prop: 'planCarbonwater'
      },
      {
        label: '方案蛋白质g',
        prop: 'planProtein'
      },
      {
        label: '方案脂肪g',
        prop: 'planFat'
      },
      {
        label: '方案盐g',
        prop: 'planSalt'
      },
      {
        label: '方案碳水占比%',
        prop: 'planCarbonwaterRatio'
      },
      {
        label: '方案蛋白质占比%',
        prop: 'planProteinRatio'
      },
      {
        label: '方案脂肪占比%',
        prop: 'planFatRatio'
      }
    ]

    function exportClick() {
      exportExcel({
        data: table.list,
        columns
      })
    }

    function getList() {
      const params: Record<string, any> = { ...queryValue }
      const { date } = params
      delete params.date
      if (date.length) {
        params.startDate = dayjs(date[0]).format('YYYYMMDD')
        params.endDate = dayjs(date[1]).format('YYYYMMDD')
      }
      request('data.SingleUserData/querySingleUserData', params)
        .thenwrap((err, data) => {
          if (!err) {
            table.list = data
          }
        })
    }
    const queryList = [
      {
        label: '日期',
        component: 'el-date-picker',
        key: 'date',
        props: {
          type: 'daterange',
          clearable: true,
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期'
        }
      },
      {
        label: '手机号',
        component: 'el-input',
        key: 'phone',
        props: {
          clearable: true
        }
      },
      {
        slot: () => (
          <>
            <el-button type="primary" onClick={getList}>搜索</el-button>
            <el-button onClick={exportClick}>导出</el-button>
          </>
        )
      }
    ]
    return () => (
      <div class="page-container padding-20">
        <div class="query-bar">
          <QueryComponents v-model={queryValue} query-list={queryList} action={false}/>
        </div>
        <el-table data={table.list} max-height={window.innerHeight - 240} border stripe>
          {
            columns.map(col => <el-table-column {...col} key={col.prop}></el-table-column>)
          }
        </el-table>
      </div>
    )
  }
})