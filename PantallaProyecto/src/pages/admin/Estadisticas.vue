<route lang="yaml">
meta:
  requiereAuth: true
  roles: ["ADMIN"]
</route>

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
          @update:model-value="cargarEstadisticas"
        >
          <template #prepend>
            <q-icon name="calendar_today" color="primary" size="18px" />
          </template>
        </q-select>
      </div>

      <!-- ESTADO DE CARGA -->
      <div v-if="cargando" class="row justify-center q-my-xl">
        <q-spinner color="white" size="40px" />
      </div>

      <template v-else>
        <!-- CASO: NO HAY TURNOS EN ESTE PERÍODO -->
        <div v-if="totalTurnos === 0" class="row justify-center q-my-xl">
          <q-card class="shadow-3 q-pa-lg card-redondeada text-center text-weight-bold" style="width: 100%;">
            <q-icon name="info" color="primary" size="48px" class="q-mb-sm" />
            <div class="text-h6 text-grey-9">No hay turnos en este período</div>
            <div class="text-caption text-grey-7 q-mt-xs">Probá seleccionando un rango de días diferente o esperando nueva actividad.</div>
          </q-card>
        </div>

        <!-- CONTENIDO NORMAL CUANDO HAY DATOS -->
        <template v-else>
          <!-- FILA 1: TARJETAS KPI SUPERIORES -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
              <q-card class="shadow-3 q-pa-md card-redondeada text-center text-weight-bold">
                <div class="text-caption text-bold text-grey-7 text-uppercase">
                  Turnos emitidos
                </div>
                <div class="text-h4 text-weight-bold text-primary q-mt-xs">
                  {{ totalTurnos }}
                </div>
              </q-card>
            </div>

            <div class="col-12 col-md-4">
              <q-card class="shadow-3 q-pa-md card-redondeada text-center text-weight-bold">
                <div class="text-caption text-bold text-grey-7 text-uppercase">
                  Espera promedio
                </div>
                <div class="text-h4 text-weight-bold text-primary q-mt-xs">
                  {{ esperaPromedioFormateada }}
                </div>
              </q-card>
            </div>

            <div class="col-12 col-md-4">
              <q-card class="shadow-3 q-pa-md card-redondeada text-center text-weight-bold">
                <div class="text-caption text-bold text-grey-7 text-uppercase">
                  Turnos atendidos
                </div>
                <div 
                  class="text-h4 text-weight-bold q-mt-xs"
                  :class="esAlertaAtendidos ? 'text-negative' : 'text-primary'"
                >
                  {{ porcentajeAtendidos }} %
                </div>
              </q-card>
            </div>
          </div>

          <!-- FILA 2: GRÁFICAS DE DÍA DE LA SEMANA Y TURNOS POR MES -->
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
                  <span>Día más concurrido: <strong>{{ diaMasConcurrido }}</strong></span>
                </div>
              </q-card>
            </div>

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
                  <span>Mes más concurrido: <strong>{{ mesMasConcurrido }}</strong></span>
                </div>
              </q-card>
            </div>
          </div>

          <!-- FILA 3: GRÁFICA DE TURNOS POR ESTADO -->
          <div class="row q-col-gutter-md justify-center">
            <div class="col-12 col-md-8">
              <q-card class="shadow-3 q-pa-md card-redondeada column justify-between text-weight-bold">
                <div>
                  <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-sm text-center">
                    Turnos por estado
                  </div>
                  <div class="contenedor-dona flex flex-center">
                    <Doughnut :data="chartEstadoData" :options="doughnutOptions" />
                  </div>

                  <!-- Leyenda personalizada de 2 columnas -->
                  <div class="row q-col-gutter-sm q-mt-md q-px-md text-weight-bold justify-center">
                    <div
                      v-for="(item, index) in leyendaEstados"
                      :key="index"
                      class="col-6 col-sm-3 row items-center justify-center text-caption text-grey-9 text-weight-bold"
                    >
                      <span
                        class="punto-leyenda q-mr-xs"
                        :style="{ backgroundColor: item.color }"
                      ></span>
                      <span>{{ item.label }} <strong>{{ item.porcentaje }} %</strong></span>
                    </div>
                  </div>
                </div>

                <div class="row items-center justify-center q-mt-md text-caption text-grey-8 text-weight-bold">
                  <q-icon name="person_off" color="primary" size="18px" class="q-mr-xs" />
                  <span>Ausentes: <strong>{{ porcentajeAusentes }} %</strong> de los turnos</span>
                </div>
              </q-card>
            </div>
          </div>
        </template>
      </template>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
import { useAuthStore } from '../../stores/auth-store'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
)

const authStore = useAuthStore()

// Iniciamos por defecto en 90 días
const periodoSeleccionado = ref(90)
const opcionesPeriodo = [
  { label: 'Últimos 15 días', value: 15 },
  { label: 'Últimos 30 días', value: 30 },
  { label: 'Últimos 90 días', value: 90 }
]

const cargando = ref(false)
const datosBackend = ref({
  dias: 90,
  desde: '',
  total: 0,
  porEstado: { FINALIZADO: 0, AUSENTE: 0, CANCELADO: 0, EXPIRADO: 0 },
  porDiaSemana: [],
  porMes: [],
  esperaPromedioMin: 0
})

const cargarEstadisticas = async () => {
  cargando.value = true
  try {
    const token = authStore.token || localStorage.getItem('token') || ''

    const response = await fetch(`/api/admin/estadisticas?dias=${periodoSeleccionado.value}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    datosBackend.value = data
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarEstadisticas()
})

const totalTurnos = computed(() => {
  const t = datosBackend.value?.total
  return t !== undefined && t !== null ? Number(t) : 0
})

const esperaPromedioFormateada = computed(() => {
  const minutos = datosBackend.value.esperaPromedioMin
  if (!minutos || minutos < 0) return '0 min'
  return `${minutos} min`
})

const porcentajeAtendidos = computed(() => {
  if (totalTurnos.value === 0) return 0
  const finalizados = datosBackend.value.porEstado.FINALIZADO || 0
  return Math.round((finalizados / totalTurnos.value) * 100)
})

const porcentajeAusentes = computed(() => {
  if (totalTurnos.value === 0) return 0
  const ausentes = datosBackend.value.porEstado.AUSENTE || 0
  return Math.round((ausentes / totalTurnos.value) * 100)
})

const esAlertaAtendidos = computed(() => porcentajeAtendidos.value > 70)

const diasReordenados = computed(() => {
  const original = datosBackend.value.porDiaSemana
  if (!original || original.length === 0) return { labels: [], valores: [] }

  const ordenIndices = [1, 2, 3, 4, 5, 6, 0]
  const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const valores = ordenIndices.map(idx => original[idx]?.cantidad || 0)

  return { labels, valores }
})

const diaMasConcurrido = computed(() => {
  const original = datosBackend.value.porDiaSemana
  if (!original || original.length === 0) return '-'
  let maxIdx = 0
  let maxVal = -1
  original.forEach((item, idx) => {
    if (item.cantidad > maxVal) {
      maxVal = item.cantidad
      maxIdx = idx
    }
  })
  return original[maxIdx]?.dia ? original[maxIdx].dia.toLowerCase() : '-'
})

const convertirMesABreviado = (strMes) => {
  if (!strMes || !strMes.includes('-')) return strMes
  const [, mesNum] = strMes.split('-')
  const mesesNombres = {
    '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
    '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
  }
  return mesesNombres[mesNum] || mesNum
}

const mesesProcesados = computed(() => {
  const porMes = datosBackend.value.porMes || []
  const labels = porMes.map(m => convertirMesABreviado(m.mes))
  const valores = porMes.map(m => m.cantidad)
  return { labels, valores }
})

const mesMasConcurrido = computed(() => {
  const porMes = datosBackend.value.porMes || []
  if (porMes.length === 0) return '-'
  let maxItem = porMes[0]
  porMes.forEach(item => {
    if (item.cantidad > maxItem.cantidad) maxItem = item
  })
  return convertirMesABreviado(maxItem.mes).toLowerCase()
})

const COLOR_AZUL_FUERTE = '#1967d2'
const COLOR_AZUL_SUAVE = '#b3d1f7'

const chartDiasData = computed(() => {
  const { labels, valores } = diasReordenados.value
  const maximo = valores.length > 0 ? Math.max(...valores) : 0

  return {
    labels,
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

const chartMesesData = computed(() => {
  const { labels, valores } = mesesProcesados.value
  return {
    labels,
    datasets: [
      {
        data: valores,
        backgroundColor: COLOR_AZUL_FUERTE,
        borderRadius: 6,
        barThickness: 34
      }
    ]
  }
})

const coloresEstado = ['#1967d2', '#e55934', '#189e59', '#f5a623']
const nombresEstado = ['Atendidos', 'Ausentes', 'Cancelados', 'Expirados']
const clavesBackendEstado = ['FINALIZADO', 'AUSENTE', 'CANCELADO', 'EXPIRADO']

const porcentajesEstadosArray = computed(() => {
  const total = totalTurnos.value
  const porEstado = datosBackend.value.porEstado || {}
  if (total === 0) return [0, 0, 0, 0]

  return clavesBackendEstado.map(clave => {
    const cantidad = porEstado[clave] || 0
    return Math.round((cantidad / total) * 100)
  })
})

const chartEstadoData = computed(() => ({
  labels: nombresEstado,
  datasets: [
    {
      data: porcentajesEstadosArray.value,
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
    porcentaje: porcentajesEstadosArray.value[idx]
  }))
)

const opcionesBaseBarras = (valoresData) => {
  const maxVal = valoresData.length > 0 ? Math.max(...valoresData) : 0
  const suggestedMax = maxVal <= 5 ? 10 : Math.ceil(maxVal * 1.3)
  const stepSize = suggestedMax <= 10 ? 2 : Math.ceil(suggestedMax / 5)

  return {
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
        suggestedMax,
        border: { display: false },
        ticks: {
          stepSize,
          color: '#1f2937',
          font: { size: 11, weight: 'bold' }
        },
        grid: { color: '#e5e7eb' }
      }
    }
  }
}

const barOptionsDias = computed(() => opcionesBaseBarras(diasReordenados.value.valores))
const barOptionsMeses = computed(() => opcionesBaseBarras(mesesProcesados.value.valores))

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
  height: 180px;
  position: relative;
}

.punto-leyenda {
  width: 11px;
  height: 11px;
  border-radius: 3px;
  display: inline-block;
}
</style>