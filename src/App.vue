<template>
  <div id="app">
    <div class="">
      <div v-for="item in groupedItems" :key="item.id" class="px-3 py-1">
        <div v-if="item.title">
          <a
            :href="item.link"
            target="_blank"
            class="hover:border-2
                    border-b"
          >
            {{ item.title }}
          </a>
          <span class="text-xs px-2 font-thin"> ({{ item.publishedAt }}) </span>
          <span class="text-xs px-2 font-thin">
            {{ item.source }}
          </span>
        </div>
        <div v-else>
          {{ item.date }}
        </div>
      </div>
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
    groupedItems() {
      const groupedItems = []

      let lastDate = ''
      for (const item of this.sortedItems) {
        const date = item.publishedAt.slice(0, 10)
        if (date !== lastDate) {
          groupedItems.push({ date })
          lastDate = date
        }
        groupedItems.push(item)
      }
      return groupedItems
    },
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
