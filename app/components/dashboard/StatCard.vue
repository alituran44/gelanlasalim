<script setup lang="ts">
import {
  Briefcase,
  FileText,
  Clock3,
  Crown
} from "lucide-vue-next"

const cards = [
  {
    title: "Aktif İhale",
    value: "12",
    icon: Briefcase,
    color: "bg-blue-500"
  },
  {
    title: "Gelen Teklif",
    value: "84",
    icon: FileText,
    color: "bg-emerald-500"
  },
  {
    title: "Bekleyen Karar",
    value: "7",
    icon: Clock3,
    color: "bg-orange-500"
  },
  {
    title: "Abonelik",
    value: "Ücretsiz",
    icon: Crown,
    color: "bg-violet-500"
  }
]
</script>

<template>
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
    <div
      v-for="card in cards"
      :key="card.title"
      class="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-slate-500">
            {{ card.title }}
          </p>

          <h2 class="mt-2 text-3xl font-bold">
            {{ card.value }}
          </h2>
        </div>

        <div
          :class="card.color"
          class="rounded-xl p-4 text-white"
        >
          <component
            :is="card.icon"
            class="h-6 w-6"
          />
        </div>
      </div>
    </div>
  </div>
</template>