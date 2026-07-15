<script setup lang="ts">
const route = useRoute()

const menu = [
  {
    title: "GENEL",
    items: [
      {
        name: "Dashboard",
        icon: "🏠",
        to: "/panel"
      }
    ]
  },
  {
    title: "İHALE",
    items: [
      {
        name: "Yeni İhale",
        icon: "➕",
        to: "/ihale-olustur"
      },
      {
        name: "İhalelerim",
        icon: "📄",
        to: "/panel/ihaleler"
      },
      {
        name: "Gelen Teklifler",
        icon: "📨",
        to: "/panel/gelen-teklifler"
      },
      {
        name: "Verdiğim Teklifler",
        icon: "📤",
        to: "/panel/verdigim-teklifler"
      }
    ]
  },
  {
    title: "İLETİŞİM",
    items: [
      {
        name: "Mesajlar",
        icon: "💬",
        to: "/panel/mesajlar"
      },
      {
        name: "Bildirimler",
        icon: "🔔",
        to: "/panel/bildirimler"
      }
    ]
  },
  {
    title: "FİRMA",
    items: [
      {
        name: "Firma Bilgileri",
        icon: "🏢",
        to: "/panel/firma"
      },
      {
        name: "Abonelik",
        icon: "💳",
        to: "/panel/abonelik"
      },
      {
        name: "Faturalar",
        icon: "🧾",
        to: "/panel/faturalar"
      }
    ]
  },
  {
    title: "SİSTEM",
    items: [
      {
        name: "Ayarlar",
        icon: "⚙️",
        to: "/panel/ayarlar"
      }
    ]
  }
]
</script>

<template>
  <aside
    class="flex h-screen w-[270px] flex-col border-r border-slate-200 bg-white"
  >
    <!-- Logo -->

    <div class="border-b border-slate-200 p-6">

      <NuxtLink
        to="/"
        class="flex items-center gap-3"
      >

        <div
          class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl text-white"
        >
          🤝
        </div>

        <div>

          <div class="text-xl font-black">
            Gel<span class="text-blue-600">Anlaşalım</span>
          </div>

          <div
            class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400"
          >
            İhale Ver. Teklif Al. Anlaş.
          </div>

        </div>

      </NuxtLink>

    </div>

    <!-- Menü -->

    <div class="flex-1 overflow-y-auto px-4 py-6">

      <div
        v-for="group in menu"
        :key="group.title"
        class="mb-8"
      >

        <div
          class="mb-3 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400"
        >
          {{ group.title }}
        </div>

        <NuxtLink
          v-for="item in group.items"
          :key="item.name"
          :to="item.to"
          class="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition"
          :class="
            route.path === item.to
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          "
        >

          <span class="text-lg">
            {{ item.icon }}
          </span>

          <span>
            {{ item.name }}
          </span>

        </NuxtLink>

      </div>

    </div>

    <!-- Ücretsiz Hak -->

    <div class="border-t border-slate-200 p-5">

      <div
        class="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white"
      >

        <div class="text-xs font-bold uppercase tracking-widest text-blue-100">
          ÜCRETSİZ HAK
        </div>

        <div class="mt-2 text-4xl font-black">
          1
        </div>

        <div class="mt-1 text-sm text-blue-100">
          İlk ihalenizi ücretsiz yayınlayabilirsiniz.
        </div>

        <NuxtLink
          to="/ihale-olustur"
          class="mt-5 block rounded-xl bg-white py-3 text-center font-black text-blue-700 transition hover:bg-blue-50"
        >
          Yeni İhale Oluştur
        </NuxtLink>

      </div>

    </div>

    <!-- Profil -->

    <div class="border-t border-slate-200 p-5">

      <div class="flex items-center gap-3">

        <div
          class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-black text-blue-700"
        >
          A
        </div>

        <div class="flex-1">

          <div class="font-black">
            Ali Turan
          </div>

          <div class="text-xs text-slate-500">
            Firma Yetkilisi
          </div>

        </div>

      </div>

      <button
        class="mt-5 w-full rounded-xl border border-slate-200 py-3 font-black transition hover:bg-slate-100"
      >
        Çıkış Yap
      </button>

    </div>

  </aside>
</template>