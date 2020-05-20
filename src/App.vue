<template>
  <div id="app">
    <div v-for="item in sortedItems" :key="item.id">
      <a :href="item.link" target="_blank">{{ item.title }}</a>
      {{ item.source }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      items: [],
    }
  },
  components: {},
  watch: {
    items(val) {
      console.debug(`${val.length} items recieved`)
    },
  },
  computed: {
    sortedItems() {
      return this.items.slice().sort((a, b) => {
        return b.publishedAt.localeCompare(a.publishedAt)
      })
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

<style></style>
