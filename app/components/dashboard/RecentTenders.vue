<script setup lang="ts">
import { Eye, Pencil, Trash2 } from "lucide-vue-next"

const tenders = [
  {
    id: "IH-2026-001",
    title: "Okul Mobilyası Alımı",
    company: "Çanakkale Koleji",
    deadline: "22 Temmuz 2026",
    status: "Yayında"
  },
  {
    id: "IH-2026-002",
    title: "Web Yazılım Hizmeti",
    company: "BiHocam Eğitim",
    deadline: "25 Temmuz 2026",
    status: "Teklif Bekliyor"
  },
  {
    id: "IH-2026-003",
    title: "Kamera Sistemi",
    company: "ABC Güvenlik",
    deadline: "30 Temmuz 2026",
    status: "Tamamlandı"
  }
]
</script>

<template>
  <div class="rounded-2xl border bg-white shadow-sm">

    <div class="border-b p-6">
      <h2 class="text-xl font-bold">
        Son İhaleler
      </h2>

      <p class="mt-1 text-sm text-slate-500">
        Son oluşturduğunuz ihaleler
      </p>
    </div>

    <table class="w-full">

      <thead class="bg-slate-50">

        <tr class="text-left text-sm">

          <th class="p-4">Kod</th>

          <th>İhale</th>

          <th>Firma</th>

          <th>Son Tarih</th>

          <th>Durum</th>

          <th class="text-center">
            İşlem
          </th>

        </tr>

      </thead>

      <tbody>

        <tr
          v-for="item in tenders"
          :key="item.id"
          class="border-t hover:bg-slate-50"
        >

          <td class="p-4 font-bold">
            {{ item.id }}
          </td>

          <td>
            {{ item.title }}
          </td>

          <td>
            {{ item.company }}
          </td>

          <td>
            {{ item.deadline }}
          </td>

          <td>

            <span
              class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
            >
              {{ item.status }}
            </span>

          </td>

          <td>

            <div class="flex justify-center gap-3">

              <button class="text-blue-600 hover:text-blue-800">
                <Eye class="h-5 w-5"/>
              </button>

              <button class="text-orange-500 hover:text-orange-700">
                <Pencil class="h-5 w-5"/>
              </button>

              <button class="text-red-500 hover:text-red-700">
                <Trash2 class="h-5 w-5"/>
              </button>

            </div>

          </td>

        </tr>

      </tbody>

    </table>

  </div>
</template>