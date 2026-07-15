<script setup lang="ts">
import {
  FilePlus2,
  BadgeCheck,
  Bell,
  CreditCard,
  Clock3
} from "lucide-vue-next"

const activities = [
  {
    id: 1,
    icon: FilePlus2,
    color: "bg-blue-100 text-blue-600",
    title: "Yeni ihale oluşturuldu",
    description: "Web Yazılım Hizmeti ihalesi yayınlandı.",
    time: "5 dakika önce"
  },
  {
    id: 2,
    icon: BadgeCheck,
    color: "bg-emerald-100 text-emerald-600",
    title: "Yeni teklif geldi",
    description: "ABC Teknoloji teklif gönderdi.",
    time: "18 dakika önce"
  },
  {
    id: 3,
    icon: CreditCard,
    color: "bg-violet-100 text-violet-600",
    title: "Abonelik aktif",
    description: "Premium paket başarıyla yenilendi.",
    time: "Bugün"
  },
  {
    id: 4,
    icon: Bell,
    color: "bg-orange-100 text-orange-600",
    title: "Sistem bildirimi",
    description: "1 ihalenizin süresi yarın doluyor.",
    time: "Bugün"
  }
]
</script>

<template>
<div class="rounded-2xl border bg-white shadow-sm">

<div class="border-b p-6">

<h2 class="text-xl font-bold">
Aktivite Akışı
</h2>

<p class="text-sm text-slate-500 mt-1">
Son sistem hareketleri
</p>

</div>

<div
v-for="item in activities"
:key="item.id"
class="flex gap-4 p-5 border-b last:border-none hover:bg-slate-50 transition">

<div
:class="item.color"
class="flex h-12 w-12 items-center justify-center rounded-xl">

<component
:is="item.icon"
class="w-6 h-6"
/>

</div>

<div class="flex-1">

<div class="font-semibold">
{{ item.title }}
</div>

<div class="text-sm text-slate-500 mt-1">
{{ item.description }}
</div>

<div class="text-xs text-slate-400 mt-2">
{{ item.time }}
</div>

</div>

</div>

</div>
</template>