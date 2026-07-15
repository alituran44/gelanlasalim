<script setup lang="ts">
import {
  Eye,
  Building2,
  BadgeCheck,
  Clock3,
  ArrowRight,
} from "lucide-vue-next"

const offers = [
  {
    id: 1,
    company: "ABC Teknoloji A.Ş.",
    tender: "Web Yazılım Hizmeti",
    amount: "₺148.500",
    delivery: "15 Gün",
    status: "Yeni",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: 2,
    company: "XYZ Bilişim",
    tender: "Sunucu Alımı",
    amount: "₺236.000",
    delivery: "20 Gün",
    status: "İncelendi",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: 3,
    company: "Delta Güvenlik",
    tender: "Kamera Sistemi",
    amount: "₺82.900",
    delivery: "10 Gün",
    status: "Bekliyor",
    color: "bg-orange-100 text-orange-700",
  },
]
</script>

<template>
  <div class="rounded-2xl border bg-white shadow-sm">

    <div class="flex items-center justify-between border-b p-6">

      <div>

        <h2 class="text-xl font-bold">
          Gelen Teklifler
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Son gelen teklifler
        </p>

      </div>

      <NuxtLink
        to="/panel/gelen-teklifler"
        class="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
      >
        Tümünü Gör

        <ArrowRight class="h-4 w-4"/>
      </NuxtLink>

    </div>

    <div
      v-for="offer in offers"
      :key="offer.id"
      class="flex items-center justify-between border-b p-5 transition hover:bg-slate-50"
    >

      <div class="flex items-center gap-4">

        <div
          class="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100"
        >
          <Building2 class="h-7 w-7 text-blue-700"/>
        </div>

        <div>

          <h3 class="font-bold">
            {{ offer.company }}
          </h3>

          <div class="mt-1 text-sm text-slate-500">
            {{ offer.tender }}
          </div>

        </div>

      </div>

      <div class="text-center">

        <div class="font-bold">
          {{ offer.amount }}
        </div>

        <div class="text-xs text-slate-500">
          Teklif
        </div>

      </div>

      <div class="text-center">

        <div class="font-bold">
          {{ offer.delivery }}
        </div>

        <div class="text-xs text-slate-500">
          Teslimat
        </div>

      </div>

      <div>

        <span
          :class="offer.color"
          class="rounded-full px-3 py-1 text-xs font-bold"
        >
          {{ offer.status }}
        </span>

      </div>

      <div class="flex gap-2">

        <button
          class="rounded-xl border p-2 hover:bg-slate-100"
        >
          <Eye class="h-5 w-5"/>
        </button>

        <button
          class="rounded-xl border p-2 hover:bg-slate-100"
        >
          <BadgeCheck class="h-5 w-5 text-emerald-600"/>
        </button>

        <button
          class="rounded-xl border p-2 hover:bg-slate-100"
        >
          <Clock3 class="h-5 w-5 text-orange-500"/>
        </button>

      </div>

    </div>

  </div>
</template>