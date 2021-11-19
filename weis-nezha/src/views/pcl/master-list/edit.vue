<template>
  <Edit :routeQuery="$route.query" />
</template>

<script>
import Edit from "./components/edit.vue";

export default {
 
  components: {
    Edit
  }
};
</script>
