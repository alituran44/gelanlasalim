<script setup lang="ts">
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card"

import {
  Line as LineChart
} from "vue-chartjs"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
)

const chartData = {
  labels: [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz"
  ],

  datasets: [

    {
      label: "Oluşturulan İhaleler",

      data: [
        8,
        11,
        15,
        18,
        22,
        27,
        31
      ],

      borderColor: "#2563eb",

      backgroundColor: "rgba(37,99,235,.12)",

      fill: true,

      tension: .4

    },

    {
      label: "Gelen Teklifler",

      data: [
        25,
        34,
        49,
        58,
        71,
        90,
        112
      ],

      borderColor: "#16a34a",

      backgroundColor: "rgba(22,163,74,.12)",

      fill: true,

      tension: .4

    }

  ]
}

const chartOptions = {

  responsive: true,

  maintainAspectRatio: false,

  plugins: {

    legend: {

      position: "top"

    }

  }

}
</script>

<template>

<Card>

<CardHeader>

<CardTitle>

İhale Performansı

</CardTitle>

<CardDescription>

Son 7 aylık faaliyet grafiği

</CardDescription>

</CardHeader>

<CardContent>

<div class="h-[360px]">

<LineChart

:data="chartData"

:options="chartOptions"

/>

</div>

</CardContent>

</Card>

</template>