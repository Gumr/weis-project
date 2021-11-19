<template>
  <div id="app">
    <router-view v-if="isRouterAlive"></router-view>
  </div>
</template>
<script>
import { defineComponent } from 'vue'
import { mapMutations } from 'vuex'
import * as mutationTypes from '@/store/types'
export default defineComponent({
  provide() {
    return {
      reload: this.reload
    }
  },
  data() {
    return {
      isRouterAlive: true
    }
  },
  created() {
    this.querySystemConfig()
  },
  methods: {
    ...mapMutations({
      setSystemConfig: mutationTypes.SET_SYSTEM_CONFIG
    }),
    reload() {
      this.isRouterAlive = false
      this.$nt(() => {
        this.isRouterAlive = true
      })
    },
    querySystemConfig() {
      this.$request('sys.SysConf/querySysConf', { stt: '01' })
        .thenwrap((err, data) => {
          if (!err) {
            this.setSystemConfig(data.record.map(item => item.confKey))
          }
        })
    }
  }
})
</script>
<style>
html,
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>
