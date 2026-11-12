<template>
  <q-page class="fondo flex q-pa-md">
    <div class="contenedor-dashboard q-mx-auto q-py-md" style="width: 100%; max-width: 1100px;">

      <!-- CABECERA Y SELECTOR DE PERÍODO -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5 text-weight-bold text-white">
          Estadísticas
        </div>

        <q-select
          v-model="periodoSeleccionado"
          :options="opcionesPeriodo"
          emit-value
          map-options
          dense
          outlined
          bg-color="white"
          class="selector-periodo text-weight-bold"
          popup-content-class="menu-periodo text-weight-bold"
        >
          <template #prepend>
            <q-icon name="calendar_today" color="primary" size="18px" />
          </template>
        </q-select>
      </div>

      <!-- FILA 1: TARJETAS KPI SUPERIORES -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-4">
          <q-card class="shadow-3 q-pa-md card-redondeada text-center text-weight-bold">
            <div class="text-caption text-bold text-grey-7 text-uppercase">
              Turnos emitidos
            </div>
            <div class="text-h4 text-weight-bold text-primary q-mt-xs">
              {{ datosActuales.kpis.emitidos }}
            </div>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="shadow-3 q-pa-md card-redondeada text-center text-weight-bold">
            <div class="text-caption text-bold text-grey-7 text-uppercase">
              Espera promedio
            </div>
            <div class="text-h4 text-weight-bold text-primary q-mt-xs">
              {{ datosActuales.kpis.esperaPromedio }}
            </div>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="shadow-3 q-pa-md card-redondeada text-center text-weight-bold">
            <div class="text-caption text-bold text-grey-7 text-uppercase">
              Turnos atendidos
            </div>
            <!-- Cambia a color rojo dinámicamente si supera el 70% -->
            <div 
              class="text-h4 text-weight-bold q-mt-xs"
              :class="esAlertaAtendidos ? 'text-negative' : 'text-primary'"
            >
              {{ datosActuales.kpis.porcentajeAtendidos }}
            </div>
          </q-card>
        </div>
      </div>

      <!-- FILA 2: GRÁFICAS DE DÍA DE LA SEMANA Y FRANJA HORARIA -->
      <div class="row q-col-gutter-md q-mb-md">
        <!-- Turnos por día de la semana -->
        <div class="col-12 col-md-6">
          <q-card class="shadow-3 q-pa-md card-redondeada column justify-between full-height text-weight-bold">
            <div>
              <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-md">
                Turnos por día de la semana
              </div>
              <div class="contenedor-grafico">
                <Bar :data="chartDiasData" :options="barOptionsDias" />
              </div>
            </div>
            <div class="row items-center q-mt-md text-caption text-grey-8 text-weight-bold">
              <q-icon name="event_available" color="primary" size="18px" class="q-mr-xs" />
              <span>Día más concurrido: <strong>{{ datosActuales.resumen.diaMasConcurrido }}</strong></span>
            </div>
          </q-card>
        </div>

        <!-- Turnos por franja horaria -->
        <div class="col-12 col-md-6">
          <q-card class="shadow-3 q-pa-md card-redondeada column justify-between full-height text-weight-bold">
            <div>
              <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-md">
                Turnos por horario
              </div>
              <div class="contenedor-grafico">
                <Bar :data="chartHorasData" :options="barOptionsHoras" />
              </div>
            </div>
            <div class="row items-center q-mt-md text-caption text-grey-8 text-weight-bold">
              <q-icon name="schedule" color="primary" size="18px" class="q-mr-xs" />
              <span>Horas pico: <strong>{{ datosActuales.resumen.horasPico }}</strong></span>
            </div>
          </q-card>
        </div>
      </div>

      <!-- FILA 3: GRÁFICAS DE TURNOS POR MES Y TURNOS POR ESTADO -->
      <div class="row q-col-gutter-md">
        <!-- Turnos por mes -->
        <div class="col-12 col-md-6">
          <q-card class="shadow-3 q-pa-md card-redondeada column justify-between full-height text-weight-bold">
            <div>
              <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-md">
                Turnos por mes
              </div>
              <div class="contenedor-grafico">
                <Bar :data="chartMesesData" :options="barOptionsMeses" />
              </div>
            </div>
            <div class="row items-center q-mt-md text-caption text-grey-8 text-weight-bold">
              <q-icon name="bar_chart" color="primary" size="18px" class="q-mr-xs" />
              <span>Mes más concurrido: <strong>{{ datosActuales.resumen.mesMasConcurrido }}</strong></span>
            </div>
          </q-card>
        </div>

        <!-- Turnos por estado -->
        <div class="col-12 col-md-6">
          <q-card class="shadow-3 q-pa-md card-redondeada column justify-between full-height text-weight-bold">
            <div>
              <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-sm">
                Turnos por estado
              </div>
              <div class="contenedor-dona flex flex-center">
                <Doughnut :data="chartEstadoData" :options="doughnutOptions" />
              </div>

              <!-- Leyenda personalizada de 2 columnas -->
              <div class="row q-col-gutter-sm q-mt-sm q-px-md text-weight-bold">
                <div
                  v-for="(item, index) in leyendaEstados"
                  :key="index"
                  class="col-6 row items-center text-caption text-grey-9 text-weight-bold"
                >
                  <span
                    class="punto-leyenda q-mr-xs"
                    :style="{ backgroundColor: item.color }"
                  ></span>
                  <span>{{ item.label }} <strong>{{ item.porcentaje }} %</strong></span>
                </div>
              </div>
            </div>

            <div class="row items-center q-mt-md text-caption text-grey-8 text-weight-bold">
              <q-icon name="person_off" color="primary" size="18px" class="q-mr-xs" />
              <span>Ausentes: <strong>{{ datosActuales.estados[1] }} %</strong> de los turnos</span>
            </div>
          </q-card>
        </div>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
)

// Selector por defecto en 15 días
const periodoSeleccionado = ref(15)
const opcionesPeriodo = [
  { label: 'Últimos 15 días', value: 15 },
  { label: 'Últimos 30 días', value: 30 },
  { label: 'Últimos 90 días', value: 90 }
]

const datosMockPorPeriodo = {
  15: {
    kpis: { emitidos: '245', esperaPromedio: '6 min', porcentajeAtendidos: '86 %' },
    dias: [45, 38, 42, 40, 62, 18, 0],
    horas: [10, 24, 38, 32, 18, 15, 28, 36, 26, 18],
    mesesLabels: ['Oct', 'Nov'],
    mesesValores: [110, 135],
    estados: [86, 6, 5, 3],
    resumen: {
      diaMasConcurrido: 'viernes',
      horasPico: '10 y 15 h',
      mesMasConcurrido: 'noviembre'
    }
  },
  30: {
    kpis: { emitidos: '490', esperaPromedio: '7 min', porcentajeAtendidos: '84 %' },
    dias: [95, 82, 78, 85, 120, 30, 0],
    horas: [22, 48, 72, 65, 38, 32, 54, 70, 52, 37],
    mesesLabels: ['Oct', 'Nov'],
    mesesValores: [230, 260],
    estados: [84, 8, 5, 3],
    resumen: {
      diaMasConcurrido: 'viernes',
      horasPico: '10 y 15 h',
      mesMasConcurrido: 'noviembre'
    }
  },
  90: {
    kpis: { emitidos: '1.310', esperaPromedio: '8 min', porcentajeAtendidos: '82 %' },
    dias: [290, 240, 210, 220, 310, 40, 0],
    horas: [60, 140, 190, 170, 100, 90, 150, 190, 150, 70],
    mesesLabels: ['Ago', 'Sep', 'Oct'],
    mesesValores: [380, 410, 520],
    estados: [82, 9, 6, 3],
    resumen: {
      diaMasConcurrido: 'viernes',
      horasPico: '10 y 15 h',
      mesMasConcurrido: 'octubre'
    }
  }
}

const datosActuales = computed(() => datosMockPorPeriodo[periodoSeleccionado.value])

// Propiedad computada que evalúa si el porcentaje atendidos supera el 70%
const esAlertaAtendidos = computed(() => {
  const textoPorcentaje = datosActuales.value.kpis.porcentajeAtendidos
  // Extrae los números del string (ej: "86 %" -> 86)
  const valorNumerico = parseInt(textoPorcentaje.replace(/\D/g, ''), 10)
  return valorNumerico > 70
})

const COLOR_AZUL_FUERTE = '#1967d2'
const COLOR_AZUL_SUAVE = '#b3d1f7'

const chartDiasData = computed(() => {
  const valores = datosActuales.value.dias
  const maximo = Math.max(...valores)

  return {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        data: valores,
        backgroundColor: valores.map(v => (v === maximo && v > 0 ? COLOR_AZUL_FUERTE : COLOR_AZUL_SUAVE)),
        borderRadius: 6,
        barPercentage: 0.65
      }
    ]
  }
})

const chartHorasData = computed(() => {
  const valores = datosActuales.value.horas
  const maximo = Math.max(...valores)

  return {
    labels: ['8', '9', '10', '11', '12', '13', '14', '15', '16', '17'],
    datasets: [
      {
        data: valores,
        backgroundColor: valores.map(v => (v === maximo && v > 0 ? COLOR_AZUL_FUERTE : COLOR_AZUL_SUAVE)),
        borderRadius: 6,
        barPercentage: 0.7
      }
    ]
  }
})

const chartMesesData = computed(() => ({
  labels: datosActuales.value.mesesLabels,
  datasets: [
    {
      data: datosActuales.value.mesesValores,
      backgroundColor: COLOR_AZUL_FUERTE,
      borderRadius: 6,
      barThickness: 34
    }
  ]
}))

const coloresEstado = ['#1967d2', '#e55934', '#189e59', '#f5a623']
const nombresEstado = ['Atendidos', 'Ausentes', 'Cancelados', 'Expirados']

const chartEstadoData = computed(() => ({
  labels: nombresEstado,
  datasets: [
    {
      data: datosActuales.value.estados,
      backgroundColor: coloresEstado,
      borderWidth: 2,
      borderColor: '#ffffff'
    }
  ]
}))

const leyendaEstados = computed(() =>
  nombresEstado.map((label, idx) => ({
    label,
    color: coloresEstado[idx],
    porcentaje: datosActuales.value.estados[idx]
  }))
)

const opcionesBaseBarras = (stepSize, maxSuggested) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.parsed.y} turnos`
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: '#1f2937', font: { size: 11, weight: 'bold' } }
    },
    y: {
      beginAtZero: true,
      suggestedMax: maxSuggested,
      border: { display: false },
      ticks: {
        stepSize,
        color: '#1f2937',
        font: { size: 11, weight: 'bold' }
      },
      grid: { color: '#e5e7eb' }
    }
  }
})

const barOptionsDias = computed(() =>
  periodoSeleccionado.value === 90 ? opcionesBaseBarras(100, 400) : opcionesBaseBarras(20, 140)
)
const barOptionsHoras = computed(() =>
  periodoSeleccionado.value === 90 ? opcionesBaseBarras(50, 200) : opcionesBaseBarras(20, 80)
)
const barOptionsMeses = computed(() =>
  periodoSeleccionado.value === 90 ? opcionesBaseBarras(200, 600) : opcionesBaseBarras(50, 300)
)

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '58%',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.label}: ${ctx.parsed} %`
      }
    }
  }
}
</script>

<style scoped>
.fondo {
  background: linear-gradient(to bottom, #3993fa, #1c4779);
  min-height: 100vh;
}

.card-redondeada {
  border-radius: 20px;
  overflow: hidden;
  background-color: #ffffff;
}

.selector-periodo {
  border-radius: 15px;
  min-width: 200px;
  font-weight: bold;
}

:deep(.q-field--outlined .q-field__control) {
  border-radius: 15px;
}

.q-page {
  font-weight: bold;
}

.contenedor-grafico {
  height: 185px;
  position: relative;
}

.contenedor-dona {
  height: 145px;
  position: relative;
}

.punto-leyenda {
  width: 11px;
  height: 11px;
  border-radius: 3px;
  display: inline-block;
}
</style>