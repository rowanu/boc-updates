<template>
  <div id="app">
    <div class="text-2xl px-4 pt-1">
      <a href="https://bigorange.cloud/updates">
        Big<span class="-lg text-orange-500">Orange</span>.Cloud/Updates</a
      >
    </div>
    <div class="">
      <div v-for="item in groupedItems" :key="item.id" class="px-3 py-1">
        <div v-if="item.title" :class="{ 'font-bold': item.isNew }">
          <a :href="item.link" target="_blank" class="text-lg">
            {{ item.title }}
          </a>
          <span class="text-sm px-2 font-thin text-gray-500">
            {{ item.source }}
          </span>
        </div>
        <div v-else>
          <div class="pt-1 text-xs float-left w-full text-gray-500">
            {{ friendlyDate(item.date) }}
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
  methods: {
    friendlyDate(date) {
      return new Date(date).toUTCString().slice(0, 11)
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
    console.debug({ env: window.env })
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
