<template>
  <CancelOrder :id="id" mode="edit"></CancelOrder>
</template>

<script>
import CancelOrder from './components/CancelOrder.vue';

export default {
  components: {
    CancelOrder
  },
  created() {
    const { query } = this.$route;
    this.id = query && query.id;
  },
  data() {
    return {
      id: null
    };
  }
};
</script>
