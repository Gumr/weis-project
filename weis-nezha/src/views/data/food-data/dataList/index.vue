<template>
  <!--时间和全屏-->
  <div class="food-list">
    <!-- 非全屏状态 -->
    <div class="notfullscreen" v-if="!fullscreen">
      <div class="foodhead">
        <label>
          {{nowdate}}
          <img src="/images/icon_time.png" />
          {{date}}
        </label>
        <el-button size="mini" round class="minbtn" @click="handleFullScreen">全屏</el-button>
      </div>
      <!--销售额数据模块-->
      <div class="datarow">
        <el-row class="row" :gutter="16">
          <el-col :span="12">
            <div class="bg-purple">
              <div>
                {{orderData.salesVolume}}
                <span>元</span>
              </div>
              <div>
                销售额相比昨天
                <img src="/images/icon_main_up.png" v-if="orderData.salesVolumeDiffValue>0" />
                <img src="/images/icon_minor_down.png" v-else />
                <span>{{orderData.salesVolumeDiffValue}}</span>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="bg-div2">
              <el-row>
                <el-col :span="10" class="rightLine">
                  <div class="datalabel">
                    <label>
                      {{orderData.placeOrderUserNum}}
                      <span>人</span>
                    </label>
                    <div>
                      支付用户数
                      <img
                        src="/images/icon_minor_up.png"
                        alt
                        v-if="orderData.placeOrderUserNumDiffValue>0"
                      />
                      <img src="/images/icon_minor_down.png" alt v-else />
                      <span>{{orderData.placeOrderUserNumDiffValue}}</span>
                    </div>
                  </div>
                </el-col>
                <el-col :span="10">
                  <div class="datalabel">
                    <label>
                      {{orderData.orderNum}}
                      <span>单</span>
                      /{{orderData.orderUserNum}}
                      <span>人</span>
                    </label>
                    <div>
                      订单数
                      <img
                        src="/images/icon_minor_up.png"
                        alt
                        v-if="orderData.orderNumDiffValue>0"
                      />
                      <img src="/images/icon_minor_down.png" alt v-else />
                      <span>{{orderData.orderNumDiffValue}}</span>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
            <div class="bg-div3">
              <el-row>
                <el-col :span="10" class="rightLine">
                  <div class="datalabel">
                    <label>
                      {{conversionRate.conversionRate}}
                      <span>%</span>
                    </label>
                    <div>
                      转化率
                      <img
                        src="/images/icon_minor_up.png"
                        alt
                        v-if="conversionRate.conversionRateDiffValue>0"
                      />
                      <img src="/images/icon_minor_down.png" alt v-else />
                      <span>{{conversionRate.conversionRateDiffValue}}%</span>
                    </div>
                  </div>
                </el-col>
                <el-col :span="10">
                  <div class="datalabel">
                    <label>
                      {{customerUnitPrice.customerUnitPrice}}
                      <span>元</span>
                    </label>
                    <div>
                      客单价
                      <img
                        src="/images/icon_minor_up.png"
                        alt
                        v-if="customerUnitPrice.customerUnitPriceDiffValue>0"
                      />
                      <img src="/images/icon_minor_down.png" alt v-else />
                      <span>{{customerUnitPrice.customerUnitPriceDiffValue}}</span>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 访问数数据 -->
      <div class="udata">
        <el-row type="flex" justify="flex-start">
          <el-col :span="8">
            <div class="data-im">
              <img src="/images/div_4.png" alt srcset />
              <div class="geayline">
                <div>
                  {{userData.registerNum}}
                  <span>人 注册用户数</span>
                </div>
                <div>
                  相比昨天
                  <img src="/images/icon_few_up.png" alt v-if="userData.registerNumDiffValue>0" />
                  <img src="/images/down.png" alt srcset v-else />

                  <span>{{userData.registerNumDiffValue}} 人</span>
                </div>
              </div>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="data-im">
              <img src="/images/div_4.png" alt srcset />
              <div class="geayline">
                <div>
                  {{userData.visitNum}}
                  <span>人 访问用户数</span>
                </div>
                <div>
                  相比昨天
                  <img src="/images/icon_few_up.png" alt v-if="userData.visitNumDiffValue>0" />
                  <img src="/images/down.png" alt v-else />
                  <span>{{userData.visitNumDiffValue}} 人</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="data-im">
              <img src="/images/div_4.png" alt srcset />
              <div class="geayline">
                <div>
                  {{survivalRate.survivalRate}}
                  <span>% 次日留存率</span>
                </div>
                <div>
                  相比昨天
                  <img
                    src="/images/icon_few_up.png"
                    alt
                    v-if="survivalRate.survivalRateDiffValue>0"
                  />
                  <img src="/images/down.png" alt v-else />
                  <span>{{survivalRate.survivalRateDiffValue}} %</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="tab">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="销售视角" name="first"></el-tab-pane>
          <el-tab-pane label="运营视角" name="second"></el-tab-pane>
        </el-tabs>
      </div>
      <!-- 表格数据 -->
      <div class="datarow" v-show="activeName == 'first'">
        <el-row class="row" :gutter="20">
          <el-col :span="12">
            <div class="bggray">
              <div class="chart-info">
                <label>支付用户数</label>
                <br />
                <label>统计时间：{{chartData01.orderTable.stime}} - {{chartData01.orderTable.etime}} | 过去{{chartData01.orderTable.days}}天</label>
              </div>
              <div class="last-data">
                <el-row :gutter="20">
                  <el-col :span="15">
                    <div class="data-s">
                      <label>
                        相比昨天
                        <span>{{chartData01.result.placeOrderUserNumDiffValue>0?'+'+chartData01.result.placeOrderUserNumDiffValue:chartData01.result.placeOrderUserNumDiffValue}}</span>
                      </label>
                      <br />
                      <label>
                        {{chartData01.result.placeOrderUserNum}}
                        <span>人</span>
                      </label>
                    </div>
                  </el-col>
                  <el-col :span="9">
                    <div class="data-f">
                      <label>
                        累计
                        <span>{{chartData01.result.cumulativePlaceOrderUserNum}}</span> 人
                      </label>
                      <br />
                      <label>
                        日均
                        <span>{{chartData01.result.avgPlaceOrderUserNum}}</span> 人
                      </label>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div>
                <el-radio-group v-model="cycle01" @change="changeCycle('01', cycle01)">
                  <el-radio-button label="day">按日</el-radio-button>
                  <el-radio-button label="week">按周</el-radio-button>
                  <el-radio-button label="month">按月</el-radio-button>
                </el-radio-group>
              </div>
              <div class="flextips">
                <div
                  class="engview bgblue"
                >{{cycle01 == 'day'?'日':cycle01 == 'week'?'周':cycle01 == 'month'?'月':''}}支付用户数</div>
                <!-- <div class="engview  bgorange">累计支付用户数</div> -->
              </div>
              <div id="eachChart" ref="chart01"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="bggray">
              <div class="chart-info">
                <label>订单数</label>
                <br />
                <label>统计时间：{{chartData02.orderTable.stime}} - {{chartData02.orderTable.etime}} | 过去{{chartData02.orderTable.days}}天</label>
              </div>
              <div class="last-data">
                <el-row :gutter="20">
                  <el-col :span="15">
                    <div class="data-s">
                      <label>
                        相比昨天
                        <span>{{chartData02.result.orderNumDiffValue>0?'+'+chartData02.result.orderNumDiffValue:chartData02.result.orderNumDiffValue}}</span>
                      </label>
                      <br />
                      <label>
                        {{chartData02.result.orderNum}}
                        <span>单</span>
                      </label>
                    </div>
                  </el-col>
                  <el-col :span="9">
                    <div class="data-f">
                      <label>
                        累计
                        <span>{{chartData02.result.cumulativeOrderNum}}</span> 单
                      </label>
                      <br />
                      <label>
                        日均
                        <span>{{chartData02.result.avgOrderNum}}</span> 单
                      </label>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div>
                <el-radio-group v-model="cycle02" @change="changeCycle('02', cycle02)">
                  <el-radio-button label="day">按日</el-radio-button>
                  <el-radio-button label="week">按周</el-radio-button>
                  <el-radio-button label="month">按月</el-radio-button>
                </el-radio-group>
              </div>
              <div class="flextips">
                <div
                  class="engview bgblue"
                >{{cycle02 == 'day'?'日':cycle02 == 'week'?'周':cycle02 == 'month'?'月':''}}订单数</div>
                <!-- <div class="engview  bgorange">累计订单数</div> -->
              </div>
              <div id="eachChart" ref="chart02"></div>
            </div>
          </el-col>
        </el-row>
        <el-row class="row" :gutter="20">
          <el-col :span="12">
            <div class="bggray">
              <div class="chart-info">
                <label>销售额</label>
                <br />
                <label>统计时间：{{chartData03.orderTable.stime}} - {{chartData03.orderTable.etime}} | 过去{{chartData03.orderTable.days}}天</label>
              </div>
              <div class="last-data">
                <el-row :gutter="20">
                  <el-col :span="13">
                    <div class="data-s">
                      <label>
                        相比昨天
                        <span>{{chartData03.result.salesVolumeDiffValue>0? '+' + chartData03.result.salesVolumeDiffValue: chartData03.result.salesVolumeDiffValue}}</span>
                      </label>
                      <br />
                      <label>
                        {{chartData03.result.salesVolume}}
                        <span>元</span>
                      </label>
                    </div>
                  </el-col>
                  <el-col :span="11">
                    <div class="data-f">
                      <label>
                        累计
                        <span>{{chartData03.result.cumulativeSalesVolume}}</span> 元
                      </label>
                      <br />
                      <label>
                        日均
                        <span>{{chartData03.result.avgSalesVolume}}</span> 元
                      </label>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div>
                <el-radio-group v-model="cycle03" @change="changeCycle('03', cycle03)">
                  <el-radio-button label="day">按日</el-radio-button>
                  <el-radio-button label="week">按周</el-radio-button>
                  <el-radio-button label="month">按月</el-radio-button>
                </el-radio-group>
              </div>
              <div class="flextips">
                <div
                  class="engview bgblue"
                >{{cycle03 == 'day'?'日':cycle03 == 'week'?'周':cycle03 == 'month'?'月':''}}销售额</div>
                <!-- <div class="engview  bgorange">累计销售额</div> -->
              </div>
              <div id="eachChart" ref="chart03"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="bggray">
              <div class="chart-info">
                <label>客单价</label>
                <br />
                <label>统计时间：{{chartData04.orderTable.stime}} - {{chartData04.orderTable.etime}} | 过去{{chartData04.orderTable.days}}天</label>
              </div>
              <div class="last-data nodata">
                <el-row :gutter="20">
                  <el-col :span="15">
                    <div class="data-s pd30">
                      <label>
                        相比昨天
                        <span>{{chartData04.result.customerUnitPriceDiffValue>0?'+'+chartData04.result.customerUnitPriceDiffValue:chartData04.result.customerUnitPriceDiffValue}}</span>
                      </label>
                      <br />
                      <label>
                        {{chartData04.result.customerUnitPrice}}
                        <span>元</span>
                      </label>
                    </div>
                  </el-col>
                  <el-col :span="9">
                    <div class="data-f">
                      <label>
                        平均
                        <span>{{chartData04.result.avgCustomerUnitPrice}}</span> 元
                      </label>
                      <br />
                      <label>
                        当周
                        <span>{{chartData04.result.thisWeekCustomerUnitPrice}}</span> 元
                      </label>
                      <br />
                      <label>
                        当月
                        <span>{{chartData04.result.thisMonthCustomerUnitPrice}}</span> 元
                      </label>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div>
                <el-radio-group v-model="cycle04" @change="changeCycle('04', cycle04)">
                  <el-radio-button label="day">按日</el-radio-button>
                  <el-radio-button label="week">按周</el-radio-button>
                  <el-radio-button label="month">按月</el-radio-button>
                </el-radio-group>
              </div>
              <div class="flextips">
                <div
                  class="engview bgblue"
                >{{cycle04 == 'day'?'日':cycle04 == 'week'?'周':cycle04 == 'month'?'月':''}}客单价</div>
                <!-- <div class="engview  bgorange">累计访问用户数</div> -->
              </div>
              <div id="eachChart" ref="chart04"></div>
            </div>
          </el-col>
        </el-row>
        <el-row class="row" :gutter="20">
          <el-col :span="12">
            <div class="bggray">
              <div class="chart-info">
                <label>转化率</label>
                <br />
                <label>统计时间：{{chartData05.orderTable.stime}} - {{chartData05.orderTable.etime}} | 过去{{chartData05.orderTable.days}}天</label>
              </div>
              <div class="last-data">
                <el-row :gutter="20">
                  <el-col :span="15">
                    <div class="data-s">
                      <label>
                        相比昨天
                        <span>{{chartData05.result.conversionRateDiffValue>0?'+' + chartData05.result.conversionRateDiffValue : chartData05.result.conversionRateDiffValue }}%</span>
                      </label>
                      <br />
                      <label>
                        {{chartData05.result.conversionRate}}
                        <span>%</span>
                      </label>
                    </div>
                  </el-col>
                  <el-col :span="9">
                    <div class="data-f">
                      <label>
                        当周
                        <span>{{chartData05.result.thisWeekConversionRate}}</span> %
                      </label>
                      <br />
                      <label>
                        当月
                        <span>{{chartData05.result.thisMonthConversionRate}}</span> %
                      </label>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div>
                <el-radio-group v-model="cycle05" @change="changeCycle('05', cycle05)">
                  <el-radio-button label="day">按日</el-radio-button>
                  <el-radio-button label="week">按周</el-radio-button>
                  <el-radio-button label="month">按月</el-radio-button>
                </el-radio-group>
              </div>
              <div class="flextips">
                <div
                  class="engview bgblue"
                >{{cycle05 == 'day'?'日':cycle05 == 'week'?'周':cycle05 == 'month'?'月':''}}转化率</div>
                <!-- <div class="engview  bgorange">累计支付用户数</div> -->
              </div>
              <div id="eachChart" ref="chart05"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="bggray">
              <div class="chart-info">
                <label>周复购用户数</label>
                <br />
                <label>统计时间：{{chartData06.orderTable.stime}} - {{chartData06.orderTable.etime}} | 过去{{chartData06.orderTable.days}}天</label>
              </div>
              <div class="last-data">
                <el-row :gutter="20">
                  <el-col :span="6">
                    <div class="data-s">
                      <label>
                        当周购买1单
                        <br />相比上周
                        <span>{{chartData06.result.repeatPurchaseNumOfOneDiffValue>0?'+'+chartData06.result.repeatPurchaseNumOfOneDiffValue:chartData06.result.repeatPurchaseNumOfOneDiffValue}}</span>
                      </label>
                      <br />
                      <label>
                        {{chartData06.result.repeatPurchaseNumOfOne}}
                        <span>人</span>
                      </label>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="data-s">
                      <label>
                        当周购买2-5单
                        <br />相比上周
                        <span>{{chartData06.result.repeatPurchaseNumOfTwoDiffValue>0?'+'+chartData06.result.repeatPurchaseNumOfTwoDiffValue:chartData06.result.repeatPurchaseNumOfTwoDiffValue}}</span>
                      </label>
                      <br />
                      <label>
                        {{chartData06.result.repeatPurchaseNumOfTwo}}
                        <span>人</span>
                      </label>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="data-s">
                      <label>
                        当周购买6-10单
                        <br />相比上周
                        <span>{{chartData06.result.repeatPurchaseNumOfFiveDiffValue>0?'+'+chartData06.result.repeatPurchaseNumOfFiveDiffValue:chartData06.result.repeatPurchaseNumOfFiveDiffValue}}</span>
                      </label>
                      <br />
                      <label>
                        {{chartData06.result.repeatPurchaseNumOfFive}}
                        <span>人</span>
                      </label>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="data-s">
                      <label>
                        当周购买10单以上
                        <br />相比上周
                        <span>{{chartData06.result.repeatPurchaseNumOfTenDiffValue>0?'+'+chartData06.result.repeatPurchaseNumOfTenDiffValue:chartData06.result.repeatPurchaseNumOfTenDiffValue}}</span>
                      </label>
                      <br />
                      <label>
                        {{chartData06.result.repeatPurchaseNumOfTen}}
                        <span>人</span>
                      </label>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <div class="flextips margin50">
                <div class="engview bgblue">周买1单</div>
                <div class="engview bgsque">周买2-5单</div>
                <div class="engview bgorange">周买6-10单</div>
                <div class="engview bgyel">周买10单以上</div>
              </div>
              <div id="eachChart" ref="chart06"></div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="datarow" v-show="activeName == 'second'">
        <el-row class="row" :gutter="20">
          <el-col :span="12">
            <div class="bggray">
              <div class="chart-info">
                <label>注册用户数</label>
                <br />
                <label>统计时间：{{chartData07.orderTable.stime}} - {{chartData07.orderTable.etime}} | 过去{{chartData07.orderTable.days}}天</label>
              </div>
              <div class="last-data">
                <el-row :gutter="20">
                  <el-col :span="16">
                    <div class="data-s">
                      <label>
                        相比昨天
                        <span>{{chartData07.result.registerNumDiffValue>0?'+'+chartData07.result.registerNumDiffValue:chartData07.result.registerNumDiffValue}}</span>
                      </label>
                      <br />
                      <label>
                        {{chartData07.result.registerNum}}
                        <span>人</span>
                      </label>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="data-f">
                      <label>
                        累计
                        <span>{{chartData07.result.cumulativeRegisterNum}}</span> 人
                      </label>
                      <br />
                      <label>
                        日均
                        <span>{{chartData07.result.avgRegisterNum}}</span> 人
                      </label>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div>
                <el-radio-group v-model="cycle07" @change="changeCycle('07', cycle07)">
                  <el-radio-button label="day">按日</el-radio-button>
                  <el-radio-button label="week">按周</el-radio-button>
                  <el-radio-button label="month">按月</el-radio-button>
                </el-radio-group>
              </div>
              <div class="flextips">
                <div
                  class="engview bgblue"
                >{{cycle07 == 'day'?'日':cycle07 == 'week'?'周':cycle07 == 'month'?'月':''}}注册用户数</div>
                <!-- <div class="engview  bgorange">累计注册用户数</div> -->
              </div>
              <div id="eachChart" ref="chart07"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="bggray">
              <div class="chart-info">
                <label>访问用户数</label>
                <br />
                <label>统计时间：{{chartData08.orderTable.stime}} - {{chartData08.orderTable.etime}} | 过去{{chartData08.orderTable.days}}天</label>
              </div>
              <div class="last-data">
                <el-row :gutter="20">
                  <el-col :span="16">
                    <div class="data-s">
                      <label>
                        相比昨天
                        <span>{{chartData08.result.visitNumDiffValue>0?'+'+chartData08.result.visitNumDiffValue:chartData08.result.visitNumDiffValue}}</span>
                      </label>
                      <br />
                      <label>
                        {{chartData08.result.visitNum}}
                        <span>人</span>
                      </label>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="data-f">
                      <label>
                        累计
                        <span>{{chartData08.result.cumulativeVisitNum}}</span> 人
                      </label>
                      <br />
                      <label>
                        日均
                        <span>{{chartData08.result.avgVisitNum}}</span> 人
                      </label>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div>
                <el-radio-group v-model="cycle08" @change="changeCycle('08', cycle08)">
                  <el-radio-button label="day">按日</el-radio-button>
                  <el-radio-button label="week">按周</el-radio-button>
                  <el-radio-button label="month">按月</el-radio-button>
                </el-radio-group>
              </div>
              <div class="flextips">
                <div
                  class="engview bgblue"
                >{{cycle08 == 'day'?'日':cycle08 == 'week'?'周':cycle08 == 'month'?'月':''}}访问用户数</div>
                <!-- <div class="engview  bgorange">累计访问用户数</div> -->
              </div>
              <div id="eachChart" ref="chart08"></div>
            </div>
          </el-col>
        </el-row>
        <el-row class="row" :gutter="20">
          <el-col :span="12">
            <div class="bggray">
              <div class="chart-info">
                <label>留存率</label>
                <br />
                <label>统计时间：{{chartData09.orderTable.stime}} - {{chartData09.orderTable.etime}} | 过去{{chartData09.orderTable.days}}天</label>
              </div>
              <div class="last-data">
                <el-row :gutter="20">
                  <el-col :span="16">
                    <div class="data-s">
                      <label>
                        相比昨天
                        <span>{{chartData09.result.survivalRateDiffValue>0?'+'+chartData09.result.survivalRateDiffValue:chartData09.result.survivalRateDiffValue}}</span>%
                      </label>
                      <br />
                      <label>
                        {{chartData09.result.survivalRate}}
                        <span>%</span>
                      </label>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="data-f">
                      <label>
                        当周
                        <span>{{chartData09.result.thisWeekSurvivalRate}}</span> %
                      </label>
                      <br />
                      <label>
                        当月
                        <span>{{chartData09.result.thisMonthSurvivalRate}}</span> %
                      </label>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div>
                <el-radio-group v-model="cycle09" @change="changeCycle('09', cycle09)">
                  <el-radio-button label="day">按日</el-radio-button>
                  <el-radio-button label="week">按周</el-radio-button>
                  <el-radio-button label="month">按月</el-radio-button>
                </el-radio-group>
              </div>
              <div class="flextips">
                <div
                  class="engview bgblue"
                >{{cycle09 == 'day'?'日':cycle09 == 'week'?'周':cycle09 == 'month'?'月':''}}留存率</div>
                <!-- <div class="engview  bgorange">累计支付用户数</div> -->
              </div>
              <div id="eachChart" ref="chart09"></div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <Fullscreen v-else></Fullscreen>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import format from '@/utils/format';
import Fullscreen from './components/Fullscreen.vue';
// 引入基本模板
import echarts from 'echarts/lib/echarts';

// 引入柱状图组件
import 'echarts/lib/chart/line';

// 引入提示框和title组件
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
// 根据设计稿的宽度来传参 比如640 750 1125
export default {
  name: 'foodDataList-list',
  components: {
    BasePageTable,
    ConfirmDialog,
    Fullscreen
  },
  mounted() {
    const _this = this;
    this.timer = setInterval(() => {
      _this.date = this.getTime(); // 修改当前时间date
    }, 1000);
    this.realTimeOrderData();
    this.realTimeConversionRate();
    this.realTimeCustomerUnitPrice();
    this.realTimeUserData();
    this.realTimeSurvivalRate();

    // this.getBackstageHomeDataPunch(); //统计数据
    this.$nt(function () {
      for (let i = 1; i <= 6; i++) {
        this[`_chartPage0${i}`] = 1;
        this[`_chartData0${i}`] = [];
        // 01支付用户数 02订单数  03销售额 04客单价 05转化率 06复购用户数 07注册用单数 08访问用户数 09转留存率
        this[`getChartOpt0${i}`] = this.getDifferentChartOpt(`0${i}`);
        this[`setChartOpt0${i}`] = this.setDifferentChartOpt(`0${i}`);
        this.getChartData(`0${i}`);
      }
    });

    window.onresize = () => {
      // 全屏下监控是否按键了ESC
      if (!this.checkFull()) {
        // 全屏下按键esc后要执行的动作
        this.closeFullScreen();
      }
    };
  },
  activated() {},
  data() {
    return {
      orderData: {},
      conversionRate: {},
      customerUnitPrice: {},
      userData: {},
      survivalRate: {},

      dataList: {},
      fullscreen: false,
      date: '',
      nowdate: '',
      activeName: 'first',
      cycle01: 'day',
      cycle02: 'day',
      cycle03: 'day',
      cycle04: 'day',
      cycle05: 'day',
      cycle06: 'day',
      cycle07: 'day',
      cycle08: 'day',
      cycle09: 'day',
      chartData01: {
        orderTable: {},
        result: {}
      },
      chartData02: {
        orderTable: {},
        result: {}
      },
      chartData03: {
        orderTable: {},
        result: {}
      },
      chartData04: {
        orderTable: {},
        result: {}
      },
      chartData05: {
        orderTable: {},
        result: {}
      },
      chartData06: {
        orderTable: {},
        result: {}
      },
      chartData07: {
        orderTable: {},
        result: {}
      },
      chartData08: {
        orderTable: {},
        result: {}
      },
      chartData09: {
        orderTable: {},
        result: {}
      }
    };
  },
  filters: {
    addPointForDate(longdate, start = 0) {
      // start分割开始的位置
      return `${longdate.slice(start, start + 4)}.${longdate.slice(
        start + 4,
        start + 6
      )}.${longdate.slice(start + 6, start + 8)}`;
    }
  },
  methods: {
    // 实时 -- 下单用户数、订单数、销售额
    realTimeOrderData() {
      this.$request('data.DataPunch/realTimeOrderData', {}).then((res) => {
        this.orderData = res.data.obj;
      });
    },
    // 实时 -- 转化率
    realTimeConversionRate() {
      this.$request('data.DataPunch/realTimeConversionRate', {}).then((res) => {
        this.conversionRate = res.data.obj;
      });
    },
    // 实时 -- 客单价
    realTimeCustomerUnitPrice() {
      this.$request('data.DataPunch/realTimeCustomerUnitPrice', {}).then((res) => {
        this.customerUnitPrice = res.data.obj;
      });
    },
    // 实时 -- 注册数、访问数
    realTimeUserData() {
      this.$request('data.DataPunch/realTimeUserData', {}).then((res) => {
        this.userData = res.data.obj;
      });
    },
    // 实时 -- 存留率
    realTimeSurvivalRate() {
      this.$request('data.DataPunch/realTimeSurvivalRate', {}).then((res) => {
        this.survivalRate = res.data.obj;
      });
    },

    getBackstageHomeDataPunch() {
      // 统计数据
      const _this = this;
      this.$request('data.DataPunch/backstageHomeDataPunch', {}).then((res) => {
        _this.dataList = res.data.obj;
      });
    },
    // 切换tab
    handleClick(tab, event) {
      (this.cycle01 = 'day'),
      (this.cycle02 = 'day'),
      (this.cycle03 = 'day'),
      (this.cycle04 = 'day'),
      (this.cycle05 = 'day'),
      (this.cycle06 = 'day'),
      (this.cycle07 = 'day'),
      (this.cycle08 = 'day'),
      (this.cycle09 = 'day');
      if (this.activeName == 'first') {
        this.$nt(function () {
          for (let i = 1; i <= 6; i++) {
            this[`_chartPage0${i}`] = 1;
            this[`_chartData0${i}`] = [];
            // 01支付用户数 02订单数  03销售额 04客单价 05转化率 06复购用户数 07注册用单数 08访问用户数 09转留存率
            this[`getChartOpt0${i}`] = this.getDifferentChartOpt(`0${i}`);
            this[`setChartOpt0${i}`] = this.setDifferentChartOpt(`0${i}`);
            this.getChartData(`0${i}`);
          }
        });
      } else {
        this.$nt(function () {
          for (let i = 7; i <= 9; i++) {
            this[`_chartPage0${i}`] = 1;
            this[`_chartData0${i}`] = [];
            // 01支付用户数 02订单数  03销售额 04客单价 05转化率 06复购用户数 07注册用单数 08访问用户数 09转留存率
            this[`getChartOpt0${i}`] = this.getDifferentChartOpt(`0${i}`);
            this[`setChartOpt0${i}`] = this.setDifferentChartOpt(`0${i}`);
            this.getChartData(`0${i}`);
          }
        });
      }
    },
    /* 获取当前时间 */
    getTime() {
      const date1 = new Date();
      const year = date1.getFullYear();
      const month = date1.getMonth() + 1;
      const day = date1.getDate();
      const hours = date1.getHours();
      const minutes = date1.getMinutes() < 10 ? `0${date1.getMinutes()}` : date1.getMinutes();
      const seconds = date1.getSeconds() < 10 ? `0${date1.getSeconds()}` : date1.getSeconds();
      this.nowdate = `${year}年${month}月${day}日`;
      return `${hours}:${minutes}:${seconds}`;
    },
    changeCycle(which, cycle) {
      this[`_chartData${which}`] = [];
      this[`chartData${which}`].result = {};
      this[`_chartPage${which}`] = 1;
      this.getChartData(which, cycle);
    },
    // 获取表数据
    getChartData(which = '01', cycle = 'day', pageNo = 1, pageSize = 10) {
      const that = this;
      const { addPointForDate } = this.$options.filters;
      if (which == '06') {
        cycle = 'week';
      }
      const url = which === '01'
        ? 'data.DataPunch/placeOrderUserNumberForSale'
        : which === '02'
          ? 'data.DataPunch/orderNumberForSale'
          : which === '03'
            ? 'data.DataPunch/salesVolumeForSale'
            : which === '04'
              ? 'data.DataPunch/customerUnitPriceForSale'
              : which === '05'
                ? 'data.DataPunch/conversionRateForSale'
                : which === '06'
                  ? 'data.DataPunch/repeatPurchaseNumberForSale'
                  : which === '07'
                    ? 'data.DataPunch/registerNumberForOperate'
                    : which === '08'
                      ? 'data.DataPunch/visitNumberForOperate'
                      : which === '09'
                        ? 'data.DataPunch/survivalRateForOperate'
                        : '';

      this.$request(url, {
        cycle,
        pageNo,
        pageSize
      }).then((res) => {
        if (res.data.errCode === 0) {
          if (which === '07') {
            res.data.obj.orderTable = res.data.obj.userTable;
          } else if (which === '05' || which === '08' || which === '09') {
            res.data.obj.orderTable = res.data.obj.visitTable;
          }
          const {
            orderTable,
            orderTable: { etime, stime },
            results = []
          } = res.data.obj;
          orderTable.stime = `${addPointForDate(stime)}`;
          orderTable.etime = `${addPointForDate(etime)}`;
          orderTable.etime = `${orderTable.etime}(${format.week(
            +new Date(orderTable.etime)
          )})`;

          // 根据不同统计周期，处理数据
          switch (cycle) {
            case 'day':
              results.forEach((v) => {
                v.dateTime = `${addPointForDate(v.dateTime)}`;
                v.dateTime = `${v.dateTime} ${format.week(
                  +new Date(v.dateTime)
                )}`;
              });
              break;
            case 'week':
              results.forEach((v) => {
                v.dateTime = `${addPointForDate(v.dateTime)} ${addPointForDate(
                  v.dateTime,
                  8
                )}`;
              });
              break;
            case 'month':
              results.forEach((v) => {
                v.dateTime = `${v.dateTime.slice(0, 4)}.${v.dateTime.slice(
                  4,
                  6
                )}`;
              });
              break;
          }

          results.reverse();
          if (pageNo > 1) {
            that[`_chartData${which}`] = that[`_chartData${which}`].length > 0
              ? results.concat(that[`_chartData${which}`])
              : results;
            that.setLazyLoadChart(
              which,
              that[`cycle${which}`],
              that[`_chartData${which}`]
            );
          } else {
            that[`_chartData${which}`] = results;
            that.setDefaultChart(which, that[`_chartData${which}`]);
            that[`chartData${which}`] = { orderTable };
            that[`chartData${which}`].result = res.data.obj;
          }
        }
      });
    },

    // 页面刚加载时的默认表格数据
    setDefaultChart(type, chartData) {
      const chartOpt = this.getDefaultChartOpt(type);
      const xData = chartData.map(({ dateTime }) => dateTime);
      this[`getChartOpt${type}`](chartOpt);
      this[`setChartOpt${type}`](chartOpt, chartData);
      chartOpt.xAxis.data = xData;
      // chartOpt.dataZoom[0].startValue = xData.length - 5;
      // chartOpt.dataZoom[0].endValue = xData.length - 1;
      if (this[`chart${type}`]) {
        this[`chart${type}`].clear();
        this[`chart${type}`].setOption(chartOpt, true);
      } else {
        this.renderChart(this.$refs[`chart${type}`], chartOpt, type);
      }
    },
    // 拖动加载更多数据
    setLazyLoadChart(type = '01', cycle = 'day', chartData) {
      // type表格指针、cycle统计周期、chartData表格数据
      const chartOpt = this[`chart${type}`].getOption();
      const dataZoom = chartOpt.dataZoom[0];
      const xData = chartData.map(({ dateTime }) => dateTime);
      this[`setChartOpt${type}`](chartOpt, chartData);
      chartOpt.xAxis[0].data = xData;
      dataZoom.start = 50;
      // dataZoom.end = 100;
      // dataZoom.startValue = xData.length - 5 * this[`_chartPage${type}`];
      // dataZoom.endValue = xData.length - 1 * this[`_chartPage${type}`];
      this[`chart${type}`].setOption(chartOpt, true);
    },
    // 获取表格通用配置
    getDefaultChartOpt(type) {
      // type表格指针
      const options = {
        color: ['#37a2da', '#32c5e9', '#67e0e3'],
        tooltip: {
          trigger: 'axis',
          triggerOn: 'click',
          backgroundColor: 'rgba(50, 123, 253, 1)',
          renderMode: 'html',
          borderRadius: 2,
          padding: 6,
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'line', // 默认为直线，可选为：'line' | 'shadow'
            lineStyle: {
              color: '#327BFD',
              width: 0.5
            }
          },
          position: (point, params, dom, rect, { contentSize, viewSize }) => {
            const viewWidth = viewSize[0];
            const tooltipWidth = contentSize[0];
            const distance = viewWidth - point[0];
            const offsetLeft = tooltipWidth * (1 - distance / viewWidth);
            // 固定在顶部
            return [point[0] - offsetLeft, '10%'];
          },
          textStyle: {
            color: '#fff',
            fontSize: 12
          },
          formatter: this.tooltipFormatter(type)
        },
        grid: {
          left: '6%',
          right: '6%',
          top: 10,
          bottom: 120
        },
        xAxis: {
          data: [],
          type: 'category',
          boundaryGap: false,
          axisTick: {
            show: false
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#1F407B'
            }
          },
          axisLabel: {
            interval: 0,
            margin: 16,
            textStyle: {
              color: '#3D3D3F',
              fontSize: 14,
              lineHeight: 14,
              fontWeight: 'normal'
            },
            formatter(value) {
              let returnVal = '';
              let strArr = '';
              if (value.length === 21) {
                strArr = value.split(' ');
                returnVal = `${strArr[0].slice(5)}-${strArr[1].slice(5)}`;
              } else if (value.length === 7) {
                returnVal = value;
              } else {
                strArr = value.split(' ');
                returnVal = `{${strArr[0].length}|${strArr[0].slice(5)}}\n{${
                  strArr[1].length
                }|${strArr[1]}}`;
              }
              return returnVal;
            },
            rich: {
              5: {
                color: 'rgba(61, 61, 63, 1)',
                lineHeight: 20
              },
              2: {
                color: 'rgba(61, 61, 63, .5)',
                lineHeight: 20
              }
            }
          },
          splitLine: {
            show: false,
            lineStyle: {
              color: '#1F407B'
            }
          }
        },
        yAxis: {
          show: true,
          lineStyle: {
            color: '#1F407B'
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(31, 64, 123, .08)'
            }
          },
          axisLabel: {
            textStyle: {
              color: '#3D3D3F',
              fontSize: 14
            },
            formatter: this.yAxisFormatter(type)
          }
        },
        dataZoom: [
          {
            type: 'inside',
            start: 30,
            end: 100,
            minValueSpan: 6,
            maxValueSpan: 6,
            zoomLock: true
          }
        ]
      };
      return options;
    },
    // 获取不同表设置不同表类型
    getDifferentChartOpt(type) {
      // type表格指针
      let handler;
      switch (type) {
        case '01':
          handler = (opt) => {
            opt.series = [
              {
                name: '日支付用户数',
                type: 'line',
                data: [],
                lineStyle: {
                  color: '#327BFD'
                },
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: 'rgba(126,173,255,.3)' // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: 'rgba(50,123,253, 0)' // 100% 处的颜色
                      }
                    ]
                  }
                },
                symbol: 'circle',
                smooth: true,
                symbolSize: 10,
                itemStyle: {
                  color: '#327BFD',
                  borderWidth: 1,
                  borderColor: '#fff'
                }
              }
            ];
          };
          break;
        case '02':
          handler = (opt) => {
            opt.series = [
              {
                name: '日访问人数',
                type: 'line',
                data: [],
                lineStyle: {
                  color: '#327BFD'
                },
                smooth: true,
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: 'rgba(126,173,255,.3)' // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: 'rgba(50,123,253, 0)' // 100% 处的颜色
                      }
                    ]
                  }
                },
                symbol: 'circle',
                symbolSize: 10,
                itemStyle: {
                  color: '#327BFD',
                  borderWidth: 1,
                  borderColor: '#fff'
                }
              }
            ];
          };
          break;
        case '03':
          handler = (opt) => {
            opt.series = [
              {
                name: '日支付用户数',
                type: 'line',
                data: [],
                lineStyle: {
                  color: '#327BFD'
                },
                smooth: true,
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: 'rgba(126,173,255,.3)' // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: 'rgba(50,123,253, 0)' // 100% 处的颜色
                      }
                    ]
                  }
                },
                symbol: 'circle',
                symbolSize: 10,
                itemStyle: {
                  color: '#327BFD',
                  borderWidth: 1,
                  borderColor: '#fff'
                }
              }
            ];
          };
          break;
        case '04':
          handler = (opt) => {
            opt.series = [
              {
                name: '示例',
                type: 'line',
                data: [],
                lineStyle: {
                  color: '#327BFD'
                },
                smooth: true,
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: 'rgba(126,173,255,.3)' // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: 'rgba(50,123,253, 0)' // 100% 处的颜色
                      }
                    ]
                  }
                },
                symbol: 'circle',
                symbolSize: 10,
                itemStyle: {
                  color: '#327BFD',
                  borderWidth: 1,
                  borderColor: '#fff'
                }
              }
            ];
          };
          break;
        case '05':
          handler = (opt) => {
            opt.series = [
              {
                name: '示例',
                type: 'line',
                data: [],
                lineStyle: {
                  color: '#327BFD'
                },
                smooth: true,
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: 'rgba(126,173,255,.3)' // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: 'rgba(50,123,253, 0)' // 100% 处的颜色
                      }
                    ]
                  }
                },
                symbol: 'circle',
                symbolSize: 10,
                itemStyle: {
                  color: '#327BFD',
                  borderWidth: 1,
                  borderColor: '#fff'
                }
              }
            ];
          };
          break;
        case '06':
          handler = (opt) => {
            opt.series = [
              {
                name: '示例1',
                type: 'line',
                data: [],
                lineStyle: {
                  color: '#327BFDFF'
                },
                smooth: true,
                symbol: 'circle',
                symbolSize: 10,
                itemStyle: {
                  color: '#327BFDFF',
                  borderWidth: 1,
                  borderColor: '#fff'
                }
              },

              {
                name: '示例2',
                type: 'line',
                data: [],
                lineStyle: {
                  color: '#42C6FFFF'
                },
                symbol: 'circle',
                symbolSize: 10,
                smooth: true,
                itemStyle: {
                  color: '#42C6FFFF',
                  borderWidth: 1,
                  borderColor: '#fff'
                }
              },
              {
                name: '示例3',
                type: 'line',
                data: [],
                lineStyle: {
                  color: '#FDA532FF'
                },
                symbol: 'circle',
                symbolSize: 10,
                smooth: true,
                itemStyle: {
                  color: '#FDA532FF',
                  borderWidth: 1,
                  borderColor: '#fff'
                }
              },
              {
                name: '示例4',
                type: 'line',
                data: [],
                lineStyle: {
                  color: '#FEC734FF'
                },
                symbol: 'circle',
                symbolSize: 10,
                smooth: true,
                itemStyle: {
                  color: '#FEC734FF',
                  borderWidth: 1,
                  borderColor: '#fff'
                }
              }
            ];
          };
          break;
        case '07':
          handler = (opt) => {
            opt.series = [
              {
                name: '',
                type: 'line',
                data: [],
                lineStyle: {
                  color: '#327BFD'
                },
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: 'rgba(126,173,255,.3)' // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: 'rgba(50,123,253, 0)' // 100% 处的颜色
                      }
                    ]
                  }
                },
                symbol: 'circle',
                smooth: true,
                symbolSize: 10,
                itemStyle: {
                  color: '#327BFD',
                  borderWidth: 1,
                  borderColor: '#fff'
                }
              }
            ];
          };
          break;
        case '08':
          handler = (opt) => {
            opt.series = [
              {
                name: '日支付用户数',
                type: 'line',
                data: [],
                lineStyle: {
                  color: '#327BFD'
                },
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: 'rgba(126,173,255,.3)' // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: 'rgba(50,123,253, 0)' // 100% 处的颜色
                      }
                    ]
                  }
                },
                symbol: 'circle',
                smooth: true,
                symbolSize: 10,
                itemStyle: {
                  color: '#327BFD',
                  borderWidth: 1,
                  borderColor: '#fff'
                }
              }
            ];
          };
          break;
        case '09':
          handler = (opt) => {
            opt.series = [
              {
                name: '示例',
                type: 'line',
                data: [],
                lineStyle: {
                  color: '#327BFD'
                },
                smooth: true,
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: 'rgba(126,173,255,.3)' // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: 'rgba(50,123,253, 0)' // 100% 处的颜色
                      }
                    ]
                  }
                },
                symbol: 'circle',
                symbolSize: 10,
                itemStyle: {
                  color: '#327BFD',
                  borderWidth: 1,
                  borderColor: '#fff'
                }
              }
            ];
          };
      }
      return handler;
    },
    // 设置不同表格数值
    setDifferentChartOpt(type) {
      // type表格指针
      let handler;
      switch (type) {
        case '01':
          handler = (opt, data) => {
            const data1 = [];
            data.forEach((v) => {
              data1.push(v.placeOrderUserNum);
              // data2.push(v.dayCumulativePlaceOrderUserNum);
            });
            opt.series[0].data = data1;
            // opt.series[1].data = data2;
          };
          break;
        case '02':
          handler = (opt, data) => {
            const data1 = [];
            data.forEach((v) => {
              data1.push(v.orderNum);
              // data2.push(v.dayCumulativeOrderNum);
            });
            opt.series[0].data = data1;
            // opt.series[1].data = data2;
          };
          break;
        case '03':
          handler = (opt, data) => {
            const data1 = [];
            data.forEach((v) => {
              data1.push(v.salesVolume);
              // data2.push(v.dayCumulativeSalesVolume);
            });
            opt.series[0].data = data1;
            // opt.series[1].data = data2;
          };
          break;
        case '04':
          handler = (opt, data) => {
            const arr = data.map(v => v.customerUnitPrice);
            opt.series[0].data = arr;
          };
          break;
        case '05':
          handler = (opt, data) => {
            const arr = data.map(v => v.conversionRate);
            opt.series[0].data = arr;
          };
          break;
        case '06':
          handler = (opt, data) => {
            const data1 = [];
            const data2 = [];
            const data3 = [];
            const data4 = [];
            data.forEach((v) => {
              data1.push(v.repeatPurchaseNumOfOne);
              data2.push(v.repeatPurchaseNumOfTwo);
              data3.push(v.repeatPurchaseNumOfFive);
              data4.push(v.repeatPurchaseNumOfTen);
            });
            opt.series[0].data = data1;
            opt.series[1].data = data2;
            opt.series[2].data = data3;
            opt.series[3].data = data4;
          };
          break;
        case '07':
          handler = (opt, data) => {
            const data1 = [];
            data.forEach((v) => {
              data1.push(v.registerNum);
              // data2.push(v.dayCumulativeRegisterNum);
            });
            opt.series[0].data = data1;
            // opt.series[1].data = data2;
          };
          break;
        case '08':
          handler = (opt, data) => {
            const data1 = [];
            data.forEach((v) => {
              data1.push(v.visitNum);
              // data2.push(v.dayCumulativeVisitNum);
            });
            opt.series[0].data = data1;
            // opt.series[1].data = data2;
          };
          break;
        case '09':
          handler = (opt, data) => {
            const data1 = [];
            data.forEach((v) => {
              data1.push(v.survivalRate);
            });
            opt.series[0].data = data1;
          };
          break;
      }
      return handler;
    },
    // 渲染图表
    renderChart(chartCpt, chartOpt, type) {
      const that = this;
      // chartCpt表元素、chartOpt表配置、type表格指针
      !this[`chart${type}`] && (this[`chart${type}`] = echarts.init(chartCpt));
      this[`chart${type}`].setOption(chartOpt, true);
      this[`chart${type}`].on('datazoom', (e) => {
        const startDatazoom = e.batch[0].start;
        const endDatazoom = e.batch[0].end;
        if (startDatazoom === 0) {
          that[`_chartPage${type}`]++;
          that.getChartData(
            type,
            that[`cycle${type}`],
            that[`_chartPage${type}`],
            10
          );
        }
      });
    },

    // formatter
    tooltipFormatter(type) {
      const formatter = (params) => {
        let tooltip = '';
        switch (type) {
          case '01':
            // let tips = this._tips[params[0].dataIndex]
            tooltip += `${
              this.cycle01 == 'day'
                ? '日'
                : this.cycle01 == 'week'
                  ? '周'
                  : this.cycle01 == 'month'
                    ? '月'
                    : ''
            }支付用户数: ${params[0].value}`;
            break;
          case '02':
            tooltip += `${
              this.cycle02 == 'day'
                ? '日'
                : this.cycle02 == 'week'
                  ? '周'
                  : this.cycle02 == 'month'
                    ? '月'
                    : ''
            }订单数: ${params[0].value}`;
            break;
          case '03':
            tooltip += `${
              this.cycle03 == 'day'
                ? '日'
                : this.cycle03 == 'week'
                  ? '周'
                  : this.cycle03 == 'month'
                    ? '月'
                    : ''
            }销售额: ${params[0].value}`;
            break;
          case '04':
            tooltip += `${
              this.cycle04 == 'day'
                ? '日'
                : this.cycle04 == 'week'
                  ? '周'
                  : this.cycle04 == 'month'
                    ? '月'
                    : ''
            }客单价: ${params[0].value}`;
            break;
          case '05':
            // let tips = this._tips[params[0].dataIndex]
            tooltip += `${
              this.cycle05 == 'day'
                ? '日'
                : this.cycle05 == 'week'
                  ? '周'
                  : this.cycle05 == 'month'
                    ? '月'
                    : ''
            }转化率: ${params[0].value} %`;
            break;
          case '06':
            tooltip += `周买一单: ${params[0].value}人 <br/>周买2-5单: ${params[1].value}人<br/>周买6-10单: ${params[2].value}人<br/>周买10单以上: ${params[3].value}人 `;
            break;
          case '07':
            // let tips = this._tips[params[0].dataIndex]
            tooltip += `${
              this.cycle07 == 'day'
                ? '日'
                : this.cycle07 == 'week'
                  ? '周'
                  : this.cycle07 == 'month'
                    ? '月'
                    : ''
            }注册用户数: ${params[0].value}`;
            break;
          case '08':
            // let tips = this._tips[params[0].dataIndex]
            tooltip += `${
              this.cycle08 == 'day'
                ? '日'
                : this.cycle08 == 'week'
                  ? '周'
                  : this.cycle08 == 'month'
                    ? '月'
                    : ''
            }访问用户数: ${params[0].value}`;
            break;
          case '09':
            // let tips = this._tips[params[0].dataIndex]
            tooltip += `${
              this.cycle09 == 'day'
                ? '日'
                : this.cycle09 == 'week'
                  ? '周'
                  : this.cycle09 == 'month'
                    ? '月'
                    : ''
            }留存率: ${params[0].value} %`;
            break;
        }
        return tooltip;
      };
      return formatter;
    },
    yAxisFormatter(type) {
      const formatter = (params) => {
        if (params === 0) {
          const value = type === '01' || type === '06' || type === '07' || type === '08'
            ? '人/0'
            : type === '02'
              ? '单/0'
              : type === '05' || type === '09'
                ? '%/0'
                : '元/0';
          return value;
        }
        return params;
      };
      return formatter;
    },
    handleFullScreen() {
      const element = document.documentElement;
      if (this.fullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        // IE11
        element.msRequestFullscreen();
      }
      this.fullscreen = true;
    },
    closeFullScreen() {
      this.fullscreen = false;
      location.reload();
    },
    // 检测是否是全屏
    checkFull() {
      return (
        document.isFullScreen
        || document.mozIsFullScreen
        || document.webkitIsFullScreen
      );
    }
  },
  beforeUnmount() {
    this.timer && clearInterval(this.timer); // 清除定时器
  }
};
</script>

<style lang="less" scoped>
@import "../../../../styles/base.less";
.notfullscreen {
  z-index: 9999;
}
#eachChart {
  width: 100%;
  height: 50%;
}
:deep(#eachChart > div:nth-of-type(2)) {
  background: rgba(50, 123, 253, 0.69);
  border-radius: 4px;
  box-shadow: -2px 4px 10px 0px rgba(50, 123, 253, 1);
}
:deep(#eachChart > div:nth-of-type(2) span) {
  display: none !important;
}
.rightLine {
  border-right: 1px solid #4083fa;
}
.foodhead {
  padding: 30px;
  padding-bottom: 10px;
  .minbtn {
    float: right;
    border-color: #218ef4;
    color: #218ef4;
  }
  img {
    vertical-align: middle;
  }
}
.datarow {
  .row {
    margin: 0 !important;
  }
  .bggray {
    width: 100%;
    height: 822px;
    margin: 0 20px 40px 0;
    padding-left: 50px;
    box-shadow: 0px 3px 20px 0px rgba(76, 88, 99, 0.06);
    box-sizing: border-box;
    #eachChart {
      margin-left: -30px;
    }
    .chart-info {
      padding-top: 40px;
      label:nth-child(1) {
        font-size: unit(26 / 1920 * 100, vw);
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(52, 60, 79, 1);
      }
      label:nth-child(3) {
        font-size: 13px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(51, 51, 51, 1);
      }
    }
    .last-data {
      padding-top: unit(26 / 1920 * 100, vw);
      margin-right: unit(34 / 1920 * 100, vw);
      border-bottom: 1px solid #eeeeee;
      margin-bottom: unit(24 / 1920 * 100, vw);
      padding-bottom: unit(30 / 1920 * 100, vw);
      .data-s label:nth-child(1) {
        font-size: unit(14 / 1920 * 100, vw);
        span {
          font-size: unit(18 / 1920 * 100, vw);
          color: #327bfd;
        }
      }
      .data-s label:nth-child(3) {
        color: #327bfd;
        font-size: unit(60 / 1920 * 100, vw);
        font-family: DIN-Bold, DIN;
        font-weight: bold;
        span {
          font-size: unit(30 / 1920 * 100, vw);
        }
      }
      .data-f {
        text-align: right;
        border-left: 1px solid #eaebed;
        label {
          font-size: unit(18 / 1920 * 100, vw);
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: rgba(52, 60, 79, 1);
          span {
            font-size: unit(40 / 1920 * 100, vw);
            font-family: DIN-Black, DIN;
            font-weight: 900;
            color: rgba(52, 60, 79, 1);
          }
        }
      }
    }
  }
  .el-col {
    position: relative;
  }
  .bg-purple {
    background-image: url("../../../../images/bg1.png");
    background-size: cover;
    height: 33vh;
    background-repeat: no-repeat;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    div {
      width: 90%;
    }
    div:nth-child(1) {
      font-size: unit(90 / 1920 * 100, vw);
      font-family: DIN-Bold, DIN;
      font-weight: bold;
      color: rgba(255, 255, 255, 1);
      text-shadow: 0px 4px 11px rgba(6, 40, 118, 0.3);
      span {
        font-size: unit(50 / 1920 * 100, vw);
      }
    }
    div:nth-child(2) {
      font-size: unit(22 / 1920 * 100, vw);
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
      img {
        // vertical-align: middle;
      }
      span {
        font-size: unit(44 / 1920 * 100, vw);
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: rgba(255, 255, 255, 1);
      }
    }
  }

  .bg-div2 {
    background-image: url("../../../../images/bg2.png");
    background-size: cover;
    height: 15.95vh;
    background-repeat: no-repeat;
    width: 100%;
    text-align: center;
    position: relative;
    margin-bottom: 1.1vh;
    .el-row {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
    }
  }
  .bg-div3 {
    background-image: url("../../../../images/bg3.png");
    background-size: cover;
    height: 15.95vh;
    background-repeat: no-repeat;
    width: 100%;
    text-align: center;
    position: relative;
    .el-row {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
    }
  }
  .datalabel label {
    font-size: unit(40 / 1920 * 100, vw);
    font-family: DIN-Bold, DIN;
    font-weight: bold;
    color: rgba(255, 255, 255, 1);
    text-shadow: 0px 2px 3px rgba(0, 124, 221, 1);
    span {
      font-size: unit(30 / 1920 * 100, vw);
    }
  }
  .datalabel div {
    font-size: unit(16 / 1920 * 100, vw);
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(255, 255, 255, 1);
    img {
      width: 15px;
      height: 18px;
    }
    span {
      font-size: unit(26 / 1920 * 100, vw);
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: rgba(255, 255, 255, 1);
      text-shadow: 0px 2px 3px rgba(16, 109, 236, 0.7);
    }
  }
}
.margin50 {
  margin-top: 55px !important;
  margin-bottom: 50px !important;
}
.flextips {
  font-size: 12px;
  font-family: PingFang SC;
  font-weight: 400;
  color: rgba(169, 169, 169, 1);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 40px;
  margin-left: 10px;
  .engview {
    margin-right: 30px;
    position: relative;
  }
  .engview::after {
    content: "";
    width: 7px;
    height: 7px;
    border: 1px solid rgba(255, 255, 255, 1);
    border-radius: 50%;
    display: block;
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
  }
  .engview.bgblue::after {
    background: #327bfd;
  }
  .engview.bgorange::after {
    background: #fda532;
  }
  .engview.bgsque::after {
    background: #42c6ffff;
  }
  .engview.bgyel::after {
    background: #fec734ff;
  }
}
.udata {
  margin-top: 40px;
  position: relative;
  padding-bottom: 50px;
  .el-col {
    position: relative;
    &::after {
      content: "";
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      border-right: 1px solid #eaebed;
      height: 52px;
    }
  }
  img {
    vertical-align: middle;
  }
  .data-im {
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    div:nth-child(1) {
      color: #218ef4;
      font-size: unit(26 / 1920 * 100, vw);
      font-family: DINAlternate-Bold, DINAlternate;
      font-weight: bold;
      span {
        font-size: unit(16 / 1920 * 100, vw);
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(51, 51, 51, 1);
      }
    }
    div:nth-child(2) {
      font-size: unit(14 / 1920 * 100, vw);
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(51, 51, 51, 1);
      span {
        font-size: unit(14 / 1920 * 100, vw);
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: rgba(51, 51, 51, 1);
      }
    }
  }
}
.pd30 {
  padding-top: 30px;
}
.udata::after {
  content: "";
  position: absolute;
  width: 100%;
  left: 0;
  bottom: 0;
  display: block;
  border-top: 42px solid #fafafe;
  content: " ";
}
.geayline div:nth-child(1) {
  margin-bottom: 10px;
}
.tab {
  margin-bottom: 14px;
  box-shadow: 0px 3px 20px 0px rgba(76, 88, 99, 0.06);
  height: 40px;
  padding-left: 40px;
  padding-top: 10px;
  position: relative;
  padding-bottom: 12px;
}
.tab::after {
  content: "";
  position: absolute;
  width: 100%;
  left: 0;
  bottom: 0;
  display: block;
  border-top: 16px solid #fafafe;
  content: " ";
}
.nodata {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}
</style>
<style lang="less">
.tab {
  .el-tabs__nav-wrap::after {
    height: 0 !important;
    // background: #fafafe;
  }
}
</style>
