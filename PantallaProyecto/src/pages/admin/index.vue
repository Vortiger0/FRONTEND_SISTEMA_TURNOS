<template>
  <!-- q-pa-md le da un padding parejo a toda la página -->
  <q-page class="fondo q-pa-md flex justify-center flex-center q-pt-xl">

    <!-- Indicador de carga inicial -->
    <div v-if="cargando" class="flex flex-center q-pa-xl">
      <q-spinner color="primary" size="50px" />
    </div>

    <!-- row + q-col-gutter-md: acomoda las 3 tarjetas en fila -->
    <div v-else class="row q-col-gutter-md">

      <!-- Cada tarjeta ocupa una columna (col-12 en móviles, col-4 en escritorio) -->
      <div class="col-12 col-md-4">
        <q-card class="card-redondeada shadow-2 text-center q-pa-lg" style="min-width: 300px;">
          <div class="text-caption text-weight-bold text-grey-10 q-mt-xs">Turnos hoy</div> 
          <div class="text-h2 text-weight-bold text-primary">
            {{ turnosHoy }}
          </div>
        </q-card>
      </div> 

      <div class="col-12 col-md-4">
        <q-card class="card-redondeada shadow-2 text-center q-pa-lg" style="min-width: 300px;">
          <div class="text-caption text-weight-bold text-grey-10 q-mt-xs">Número actual</div>
          <div class="text-h2 text-weight-bold text-primary">
            {{ numeroActual ? `#${numeroActual}` : '--' }}
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="card-redondeada shadow-2 text-center q-pa-lg" style="min-width: 300px;">
          <div class="text-caption text-weight-bold text-grey-10 q-mt-xs">Estado del local</div>
          <div class="text-h2 text-weight-bold" :class="colorEstado">
            {{ estadoLocal }}
          </div>
        </q-card>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const turnosHoy = ref(0)
const numeroActual = ref(null)
const estadoLocal = ref('Cerrado')

const cargando = ref(true)
let timerPolling = null

const API_URL = 'http://localhost:3000/api/dashboard/resumen'

// El color del texto cambia según el estado
const colorEstado = computed(() => {
  return estadoLocal.value === 'Abierto' ? 'text-positive' : 'text-negative'
})

// GET: Obtener métricas del dashboard en tiempo real
const obtenerMetricas = async (esCargaInicial = false) => {
  if (esCargaInicial) cargando.value = true
  
  try {
    /*
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error('Error al consultar el resumen del dashboard')
    const data = await response.json()

    turnosHoy.value = data.turnosHoy
    numeroActual.value = data.numeroActual
    estadoLocal.value = data.estadoLocal
    */

    // Simulación de respuesta mientras se conecta la API
    turnosHoy.value = 38
    numeroActual.value = 45
    estadoLocal.value = 'Abierto'
  } catch (error) {
    console.error('Error al obtener métricas del dashboard:', error)
  } finally {
    if (esCargaInicial) cargando.value = false
  }
}

onMounted(() => {
  // Carga inicial
  obtenerMetricas(true)

  // Polling: Actualiza los datos cada 10 segundos
  timerPolling = setInterval(() => {
    obtenerMetricas(false)
  }, 10000)
})

onUnmounted(() => {
  // Limpia el intervalo al salir de la vista
  if (timerPolling) clearInterval(timerPolling)
})
</script>

<style scoped>
.card-redondeada {
  border-radius: 20px;
}

.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
}
</style>