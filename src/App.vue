<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  data() {
    return {
      items: [],
    }
  },
  components: {
    HelloWorld,
  },
  watch: {
    items(val) {
      console.debug(`${val.length} items recieved`)
    },
  },
  mounted() {
    console.log('window.env.API', window.env.API)
    fetch(`${window.env.API}/items`)
      .then(response => response.json())
      .then(items => (this.items = items))
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
