<script setup lang="ts">
import {
Bell,
CircleAlert,
CircleCheck,
TriangleAlert
} from "lucide-vue-next"

const notifications = [

{
title:"3 yeni teklif geldi",
type:"Yeni",
icon:Bell,
color:"text-blue-600"
},

{
title:"İhalenizin süresi bitiyor",
type:"Uyarı",
icon:TriangleAlert,
color:"text-orange-500"
},

{
title:"Ödeme başarıyla alındı",
type:"Başarılı",
icon:CircleCheck,
color:"text-emerald-600"
},

{
title:"Profil bilgilerinizi tamamlayın",
type:"Bilgi",
icon:CircleAlert,
color:"text-violet-600"
}

]
</script>

<template>

<div class="rounded-2xl border bg-white shadow-sm">

<div class="border-b p-6">

<h2 class="text-xl font-bold">

Bildirim Merkezi

</h2>

<p class="mt-1 text-sm text-slate-500">

Son sistem bildirimleri

</p>

</div>

<div
v-for="item in notifications"
:key="item.title"
class="flex items-center gap-4 border-b p-5 hover:bg-slate-50 transition">

<component
:is="item.icon"
:class="item.color"
class="h-7 w-7"/>

<div class="flex-1">

<div class="font-semibold">

{{ item.title }}

</div>

<div class="text-xs text-slate-500 mt-1">

{{ item.type }}

</div>

</div>

</div>

</div>

</template>