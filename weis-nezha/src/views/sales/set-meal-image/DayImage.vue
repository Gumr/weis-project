<template>
  <div class="day-image">
    <div class="skutop" v-if="date&&name">
      <div class="font-size-55 family-ximaiti image-text-color  pd40 pl20">{{ date }}</div>
      <div class="name image-text-color pd40 pl20">{{ name }}</div>
    </div>
    <div class="energy-list display-flex flex-content-between">
      <div class="energy-box bg1" style="border-radius: 10px; width: 175px;">
        <div class="energy__name font-size-24">总热量</div>
        <div class="energy__value">
          <span class="font-size-24">{{ kcal }}</span>
          <span class="font-size-24">kcal</span>
        </div>
      </div>
      <div>
        <div class="energy bg2" style="border-radius: 10px 0px 0px 10px;">
          <span class="energy__name font-size-24">蛋白质</span>
          <div class="energy__value">
            <span class="font-size-24">{{ protein }}</span>
            <span class="font-size-24">g</span>
          </div>
        </div>
        <div class="energy bg3">
          <span class="energy__name font-size-24">脂肪</span>
          <div class="energy__value">
            <span class="font-size-24">{{ fat }}</span>
            <span class="font-size-24">g</span>
          </div>
        </div>
        <div class="energy bg4">
          <span class="energy__name font-size-24">碳水</span>
          <div class="energy__value">
            <span class="font-size-24">{{ carbon }}</span>
            <span class="font-size-24">g</span>
          </div>
        </div>
        <div class="energy bg5" style="border-radius: 0px 10px 10px 0px;">
          <dispanv class="energy__name font-size-24">盐量</dispanv>
          <div class="energy__value">
            <span class="font-size-24">{{ salt }}</span>
            <span class="font-size-24">g</span>
          </div>
        </div>
      </div>
    </div>
    <div class="sku-list">
      <div v-for="item in splitSkus" :key="item.skuId" class="sku">
        <img class="sku__image" :src="formatUrl(item.skuImg)" crossorigin="anonymous" />
        <div>
          <div class="sku__header">
            <span class="sku__name font-size-30">{{ item.skuName }}</span>
            <span class="font-size-24 gray-label">（{{ item.quality }}{{ item.unit }}）</span>
          </div>
          <div
            class="font-size-20 gray-label"
            style="margin: 14px 0 13px;"
          >能量{{ item.energy }}kcal/蛋白质{{ item.protein }}g/碳水{{ item.carbonwater }}g/脂肪{{ item.fat }}g/盐量{{ item.salt }}g/</div>
          <div class="font-size-20 gray-label">配料：{{ item.dosing }}</div>
          <div v-if="item.taste" class="font-size-20 gray-label">口味：{{ item.taste }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import type { Sku } from './types'
export default defineComponent({
  props: {
    date: String,
    name: String,
    kcal: [String, Number],
    protein: [String, Number],
    fat: [String, Number],
    carbon: [String, Number],
    salt: [String, Number],
    skus: {
      type: Array as PropType<Sku[]>,
      default: () => ([])
    }
  },
  computed: {
    splitSkus(): Sku[] {
      const skus: Sku[] = []
      for (const item of this.skus) {
        const items: Sku[] = new Array<Sku>(Number(item.skuNum)).fill(item)
        skus.push(...items)
      }

      return skus
    }
  },
  methods: {
    formatUrl(str: string | void) {
      if (!str) return ''
      const url = new URL(str)
      // console.log(`${url.origin}${url.pathname}`)
      return `${url.origin}${url.pathname}`
    }
  }
})
</script>

<style lang="less">
@import "/src/styles/common.less";
@font-face {
  font-family: "XiMaiTi";
  src: url("/src/views/sales/set-meal-image/ZiZhiQuXiMaiTi-2.ttf")
    format("truetype");
}
.family-ximaiti {
  font-family: "XiMaiTi";
  white-space: nowrap;
}
.pd40{
  padding-top: 220px;
}
.pl40{
  padding-left: 44px;
}
.gray-label {
  color: #666;
}

.font-size-20 {
  font-size: 20px;
}
.font-size-24 {
  font-size: 24px;
}
.font-size-30 {
  font-size: 30px;
}
.font-size-32 {
  font-size: 32px;
}
.font-size-40 {
  font-size: 40px;
}
.font-size-55 {
  font-size: 55px;
}
.pl20{
  padding-left: 20px;
}

.day-image {
  width: 624px;
  padding-left: 19px;
  // background-color: #ffe3d4;
}
.bg1{
  background-color: #BDF6EE;
}
.bg2{
  background-color: #F6A29E;
}
.bg3{
  background-color: #FDE4D5;
}
.bg4{
  background-color: #E4ECFA;
}
.bg5{
  background-color: #1FE1C4;
}

.image-text-color {
  color: #fff;
}
.sku-list {
  background-color: #fff;
  border-radius: 10px;
  width: 702px;
  z-index: -1;
 margin-bottom: 20px;

}

.skutop{
    // width: 720px;
    margin-left: -26px;
    height: 338px;
    margin-top: -6px;
    margin-right: -2px;
    margin-bottom: 20px;
    border-top-right-radius: 20px;

   display: flex;
    // width: auto;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url("/public/images/skutop.png");

}
.sku {
  display: flex;
  padding: 24px 24px 30px;
  border-bottom: 2px solid #EFF3FA;
  &:last-child {
    border-bottom: none;
  }
  &__header {
    line-height: 30px;
  }
  &__name {
    font-weight: 600;
  }
  &__image {
    margin-right: 30px;
    width: 160px;
    height: 160px;
    border-radius: 4px;
  }
}

.name {
  margin: 6px 0 24px;
  max-width: 500px;
  font-size: 40px;
  word-wrap: break-word;
  line-height: 45px;
}

.energy-list {
  padding-bottom: 38px;
  width: 702px;
  // border-bottom: 4px solid #d7916d;
}

.energy-box {
  display: inline-block;
  // background: #ffd3bc;
  padding: 25px 14px 22px;
  text-align: center;

}

.energy {
  .energy-box();
  width: 90px;
  margin-right: 2px;
  &:last-child {
    margin-right: 0;
  }
  &__name {
    display: inline-block;
    margin-bottom: 9px;
    color: #12337C;
    font-weight: bold;
  }
  &__value {
    white-space: nowrap;
    color: #12337C;
  }
}
</style>