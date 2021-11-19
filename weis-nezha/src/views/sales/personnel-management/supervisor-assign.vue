<template>
  <div class="page-container">
    <div>
      <ReturnButton back />
    </div>
    <div style="margin: 14px 0">
      <ButtonTabs v-model="activeTab" :tabs="tabs"></ButtonTabs>
    </div>
    <!-- 客户经理 -->
    <div v-show="activeTab === 1" class="tree-select-wrap display-flex">
      <Transfer type="04"></Transfer>
    </div>
  </div>
</template>

<script>
import ReturnButton from '@/components/ReturnButton.vue'
import ButtonTabs from '@/components/ButtonTabs.vue'
import Transfer from './components/Transfer.vue'

export default {
  components: {
    ReturnButton,
    ButtonTabs,
    Transfer
  },
  data() {
    return {
      activeTab: 1,
      activeRadio: 1,
      tabs: [
        {
          label: '客户关系',
          value: 1
        }
      ]
    }
  },
  computed: {

  },
  created() {

  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
.page-container {
  padding-top: 20px;
}
.name-bar {
  align-items: center;
  .name-label {
    flex-shrink: 0;
  }
  .name-input {
    width: 260px;
  }
}

.tree-select-wrap {
  width: 100%;
  margin: 0;
  padding: 0;
  justify-content: space-between;
  .tree-select-section {
    flex-grow: 1;
    width: 40%;
  }
  .tree-select-control {
    width: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}

.tree-box {
  padding: 16px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  box-sizing: border-box;
}
.btn {
  margin-top: 20px;
  width: 150px;
}
.txtDiv {
  width: 100%;
  margin: 0;
}
.txt {
  width: 300px;
  margin-bottom: 20px;
  margin-right: 20px;
}
.label {
  width: 100%;
  padding-left: 5px;
  height: 40px;
  color: #666666;
}
.action-label {
  margin-right: 10px;
}
</style>
