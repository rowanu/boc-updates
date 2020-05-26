<template>
  <div id="app">
    BigOrange.Cloud/Updates
    <div class="">
      <div v-for="item in groupedItems" :key="item.id" class="px-3 py-1">
        <div v-if="item.title" :class="{ 'font-bold': item.isNew }">
          <a
            :href="item.link"
            target="_blank"
            class="hover:border-2
                    border-b"
          >
            {{ item.title }}
          </a>
          <span class="text-xs px-2 font-thin">
            {{ item.source }}
          </span>
        </div>
        <div v-else>
          <div class="text-sm">
            {{ item.date }}
          </div>
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
      lastVisit: null,
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
        item.isNew = new Date(item.publishedAt) > new Date(this.lastVisit)
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
    console.debug('window.env.API', window.env.API)
    fetch(`${window.env.API}/items`)
      .then(response => response.json())
      .then(items => (this.items = items))

    this.lastVisit = localStorage.getItem('lastVisit')
    console.debug('lastVisit', this.lastVisit)
    setTimeout(() => {
      localStorage.setItem('lastVisit', new Date().toISOString())
      console.debug('localStorage.lastVisit', localStorage.getItem('lastVisit'))
    }, 5000)
  },
}
</script>

<style></style>
