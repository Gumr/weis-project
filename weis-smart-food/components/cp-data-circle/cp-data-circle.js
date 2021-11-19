// components/cp-data-circle/cp-data-circle.js
import { t, round } from '../../utils/common'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    circleData: Object,
    width: {
      type: String,
      value: '154rpx'
    },
    // {
    //   totalEnergy,
    //   energySupply,
    //   totalCarbonwater,
    //   carbonwaterSupply,
    //   totalProtein,
    //   proteinSupply,
    //   totalFat,
    //   fatSupply,
    // }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  observers: {
    circleData(data) {
      const planData = data;
      planData.energyPercent = round(planData.energySupply/planData.totalEnergy*100, 1);
      planData.carbonwaterPercent = round(planData.carbonwaterSupply/planData.totalCarbonwater*100, 1);
      planData.proteinPercent = Number(round(planData.proteinSupply/planData.totalProtein*100, 1));
      planData.fatPercent = round(planData.fatSupply/planData.totalFat*100, 1);
      this.setData({
        planData,
      })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
