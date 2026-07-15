<script setup lang="ts">
import {
  PlusCircle,
  FileText,
  Inbox,
  Building2,
  CreditCard,
  BarChart3,
} from "lucide-vue-next"

const actions = [
  {
    title: "Yeni İhale",
    description: "Yeni ihale oluştur",
    icon: PlusCircle,
    color: "bg-blue-500",
    to: "/ihale-olustur",
  },
  {
    title: "İhalelerim",
    description: "Tüm ihaleleri görüntüle",
    icon: FileText,
    color: "bg-indigo-500",
    to: "/panel/ihaleler",
  },
  {
    title: "Gelen Teklifler",
    description: "Yeni teklifleri incele",
    icon: Inbox,
    color: "bg-emerald-500",
    to: "/panel/gelen-teklifler",
  },
  {
    title: "Firma Bilgileri",
    description: "Firma profilini düzenle",
    icon: Building2,
    color: "bg-orange-500",
    to: "/panel/firma",
  },
  {
    title: "Abonelik",
    description: "Paketini yükselt",
    icon: CreditCard,
    color: "bg-violet-500",
    to: "/panel/abonelik",
  },
  {
    title: "Raporlar",
    description: "İstatistikleri görüntüle",
    icon: BarChart3,
    color: "bg-cyan-500",
    to: "/panel/raporlar",
  },
]
</script>

<template>
  <div class="rounded-2xl border bg-white shadow-sm">

    <div class="border-b p-6">
      <h2 class="text-xl font-bold">
        Hızlı İşlemler
      </h2>

      <p class="mt-1 text-sm text-slate-500">
        En sık kullandığınız işlemler
      </p>
    </div>

    <div class="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 xl:grid-cols-3">

      <NuxtLink
        v-for="item in actions"
        :key="item.title"
        :to="item.to"
        class="group rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg"
      >
        <div
          :class="item.color"
          class="mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-white"
        >
          <component
            :is="item.icon"
            class="h-7 w-7"
          />
        </div>

        <h3 class="text-lg font-bold text-slate-800 group-hover:text-blue-600">
          {{ item.title }}
        </h3>

        <p class="mt-2 text-sm text-slate-500">
          {{ item.description }}
        </p>
      </NuxtLink>

    </div>

  </div>
</template>