<script setup>
const asc = defineModel('asc')
const sortBy = defineModel('sortBy')
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-xl border border-gray-100 [&_button]:hover:bg-[var(--nav-hover-blue)]"
  >
    <div class="[&>*]:py-2 [&>*]:px-4 flex flex-col">
      <button @click="sortBy = 'createdAt'" :class="sortBy == 'createdAt' ? 'text-blue-500' : ''">
        createdAt
      </button>
      <button @click="sortBy = 'updatedAt'" :class="sortBy == 'updatedAt' ? 'text-blue-500' : ''">
        updatedAt
      </button>
      <button @click="sortBy = 'deadline'" :class="sortBy == 'deadline' ? 'text-blue-500' : ''">
        deadline
      </button>
      <button @click="sortBy = 'title'" :class="sortBy == 'title' ? 'text-blue-500' : ''">
        title
      </button>
    </div>
    <div class="[&>*]:py-2 [&>*]:px-4 grid grid-cols-2">
      <button @click="asc = true">
        <i class="fa-solid fa-arrow-down-short-wide" , :class="asc ? 'text-blue-500' : ''"></i>
      </button>
      <button @click="asc = false">
        <i class="fa-solid fa-arrow-up-short-wide" , :class="asc ? '' : 'text-blue-500'"></i>
      </button>
    </div>
  </div>
</template>
