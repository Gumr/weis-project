<template>
  <div class="page-container">
    <div style="margin-top: 20px;">
      <ButtonTabs
        v-model="activeTab"
        :tabs="tabs"      
      />
    </div>
    <div v-if="activeTab === '00'">
      <Development />
    </div>
     <div v-if="activeTab === '01'">
      <DietitianReview />
    </div>
     <div v-if="activeTab === '02'">
      <OperationAudit />
    </div>
    <div v-if="activeTab === '03'">
      <Warehousing />
    </div>  
     <div v-if="activeTab === '04'">
      <Eliminate />
    </div>  

  </div>
</template>

<script>


import ButtonTabs from "@/components/ButtonTabs.vue";
import Development from "./development.vue";
import DietitianReview from "./dietitianReview.vue";
import OperationAudit from "./operationAudit.vue";
import Warehousing from "./warehousing.vue";
import Eliminate from "./eliminate.vue";
export default {
  name:'Kitchen_foodAdministration_foodList',
  components: {
    ButtonTabs,
    Development,
    DietitianReview,
    OperationAudit,
    Warehousing,
    Eliminate
  },
  computed: {
   
  },
  created() {
    // this.getList();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      activeTab: "00",
      tabs: [
        {
          label: "研发中",
          value: "00",
        },
        {
          label: "营养师审核中",
          value: "01",
        },
        {
          label: "运营审核中",
          value: "02",
        },
        {
          label: "已入库",
          value: "03",
        },
        {
          label: "已淘汰",
          value: "04",
        },
      ],
     
    };
  },
  methods: {
   
  },
};
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
</style>
