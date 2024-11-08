<!-- src/App.vue -->
<template>
  <div id="app">
    <ShortUrlForm />
  </div>
</template>

<script>
import ShortUrlForm from './components/ShortUrlForm.vue';

export default {
  name: 'App',
  components: {
    ShortUrlForm
  }
};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  color: #333;
}
</style>
