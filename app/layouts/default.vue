<script setup lang="ts">
import Sidebar from "~/components/layout/Sidebar.vue"
import Topbar from "~/components/layout/Topbar.vue"
</script>

<template>
  <div class="flex min-h-screen bg-slate-100">

    <Sidebar />

    <div class="flex flex-1 flex-col">

      <Topbar />

      <main class="flex-1 overflow-y-auto p-8">

        <slot />

      </main>

    </div>

  </div>
</template>