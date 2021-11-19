<template>
  <div class="page-container">
    <DividendPolicyDetail :status="0" />
  </div>
</template>

<script>
import DividendPolicyDetail from './components/DividendPolicyDetail.vue';

export default {
  components: {
    DividendPolicyDetail
  }
};
</script>
