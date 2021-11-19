<template>
  <div class="page-container">
    <div style="margin: 14px 0">
      <ButtonTabs v-model="activeTab" :tabs="tabs"></ButtonTabs>
    </div>
    <div  class="tree-select-wrap display-flex" v-show="activeTab === 0">
      <Transfer type="01" tab="0" ></Transfer>
    </div>
    <!-- 客户经理 -->
    <div  class="tree-select-wrap display-flex" v-show="activeTab === 1">
      <Transfer type="02" tab="1" ></Transfer>
    </div>
  </div>
</template>

<script>
import ButtonTabs from '@/components/ButtonTabs.vue';
import Transfer from './components/transfer.vue';

export default {
  components: {
    ButtonTabs,
    Transfer
  },
  computed: {

  },
  data() {
    return {
      activeTab: 0,
      activeRadio: 1,
      tabs: [
        {
          label: '客户关系',
          value: 0
        },
        {
          label: '兼职营养师关系',
          value: 1
        }
      ],
    }
  },
  created() {
    this.type = this.$route.query && this.$route.query.counselorType;
    if (this.type === '02') {
      this.tabs = [
        {
          label: '客户关系',
          value: 0
        },
        {
          label: '兼职营养师关系',
          value: 1
        }
      ]
    } else {
      this.tabs = [
        {
          label: '客户关系',
          value: 0
        },
      ]
    }
  },
  methods: {

  }
};
</script>

<style lang="less" scoped>
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
