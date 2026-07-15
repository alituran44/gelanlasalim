<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const search = ref('')
const notificationOpen = ref(false)
const profileOpen = ref(false)

const notifications = ref([
  {
    id: 1,
    title: 'Yeni Teklif',
    message: 'Laptop ihalesine yeni teklif geldi.',
    time: '5 dk önce',
    unread: true
  },
  {
    id: 2,
    title: 'İhale Yayında',
    message: 'Web Yazılım ihalesi başarıyla yayınlandı.',
    time: '1 saat önce',
    unread: true
  },
  {
    id: 3,
    title: 'Abonelik',
    message: 'İlk ücretsiz ihale hakkınız aktif.',
    time: 'Bugün',
    unread: false
  }
])

const unreadCount = computed(() =>
  notifications.value.filter(i => i.unread).length
)

const today = computed(() =>
  new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
)

const user = ref({
  name: 'Ali Turan',
  company: 'BiHocam Eğitim',
  avatar: 'A'
})

function closeMenus() {
  notificationOpen.value = false
  profileOpen.value = false
}

function toggleNotifications() {
  notificationOpen.value = !notificationOpen.value
  profileOpen.value = false
}

function toggleProfile() {
  profileOpen.value = !profileOpen.value
  notificationOpen.value = false
}

function clickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement

  if (!target.closest('.topbar-menu')) {
    closeMenus()
  }
}

onMounted(() => {
  document.addEventListener('click', clickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', clickOutside)
})
</script>

<template>

<header
class="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">

<div class="flex items-center gap-8">

<div>

<div class="text-xs font-bold uppercase tracking-widest text-blue-600">
Firma Paneli
</div>

<h1 class="text-2xl font-black text-slate-800">
Dashboard
</h1>

</div>

<div class="relative">

<input

v-model="search"

type="text"

placeholder="İhale, firma veya teklif ara..."

class="w-[430px] rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-5 outline-none transition focus:border-blue-500 focus:bg-white"
/>

<div
class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">

🔍

</div>

</div>

</div>

<div class="flex items-center gap-4">

<div
class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

<div class="text-xs text-slate-400">
Bugün
</div>

<div class="font-bold">
{{ today }}
</div>

</div>

<div class="relative topbar-menu">

<button

@click.stop="toggleNotifications"

class="relative flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50">

🔔

<span

v-if="unreadCount"

class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-black text-white">

{{ unreadCount }}

</span>

</button>

<div

v-if="notificationOpen"

class="absolute right-0 mt-4 w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

<div class="border-b border-slate-200 p-5">

<div class="flex items-center justify-between">

<h3 class="text-lg font-black">

Bildirimler

</h3>

<span class="text-sm text-blue-600">

{{ unreadCount }} Yeni

</span>

</div>

</div>

<div
v-for="item in notifications"
:key="item.id"
class="border-b border-slate-100 p-5 transition hover:bg-slate-50">

<div class="flex items-center justify-between">

<div class="font-bold">

{{ item.title }}

</div>

<div

v-if="item.unread"

class="h-2.5 w-2.5 rounded-full bg-blue-600"/>

</div>

<p class="mt-2 text-sm text-slate-500">

{{ item.message }}

</p>

<div class="mt-2 text-xs text-slate-400">

{{ item.time }}

</div>

</div>

<div class="p-4 text-center">
        <NuxtLink
          to="/panel/bildirimler"
          class="block border-t border-slate-200 p-4 text-center font-semibold text-blue-600 hover:bg-slate-50"
        >
          Tüm Bildirimleri Gör
        </NuxtLink>

      </div>

    </div>

    <!-- Profil -->
    <div class="relative topbar-menu">

      <button
        @click.stop="toggleProfile"
        class="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
      >

        <div
          class="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-black text-white"
        >
          {{ user.avatar }}
        </div>

        <div class="text-left">

          <div class="font-bold text-slate-800">
            {{ user.name }}
          </div>

          <div class="text-xs text-slate-500">
            {{ user.company }}
          </div>

        </div>

        <span class="text-slate-400">
          ▼
        </span>

      </button>

      <div
        v-if="profileOpen"
        class="absolute right-0 mt-4 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
      >

        <div class="border-b border-slate-200 p-5">

          <div class="font-black text-slate-800">
            {{ user.name }}
          </div>

          <div class="mt-1 text-sm text-slate-500">
            {{ user.company }}
          </div>

        </div>

        <NuxtLink
          to="/panel"
          class="block px-5 py-4 transition hover:bg-slate-50"
        >
          🏠 Dashboard
        </NuxtLink>

        <NuxtLink
          to="/panel/firma"
          class="block px-5 py-4 transition hover:bg-slate-50"
        >
          🏢 Firma Bilgileri
        </NuxtLink>

        <NuxtLink
          to="/panel/ihaleler"
          class="block px-5 py-4 transition hover:bg-slate-50"
        >
          📄 İhalelerim
        </NuxtLink>

        <NuxtLink
          to="/panel/abonelik"
          class="block px-5 py-4 transition hover:bg-slate-50"
        >
          💳 Abonelik
        </NuxtLink>

        <NuxtLink
          to="/panel/ayarlar"
          class="block px-5 py-4 transition hover:bg-slate-50"
        >
          ⚙️ Ayarlar
        </NuxtLink>

        <div class="border-t border-slate-200"></div>

        <button
          class="w-full px-5 py-4 text-left font-semibold text-red-600 transition hover:bg-red-50"
        >
          🚪 Güvenli Çıkış
        </button>

      </div>

    </div>

  </div>

</header>

</template>