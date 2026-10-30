<route lang="yaml">
meta:
  layout: false
  requiereAuth: false
</route>

<template>
  <q-page class="fondo flex flex-center q-pa-lg select-none container-tv" @click="habilitarAudio">
    
    <q-banner v-if="!audioPermitido" class="bg-amber-10 text-white text-center fixed-top z-top q-py-xs shadow-2 cursor-pointer" @click="habilitarAudio">
      <template v-slot:avatar>
        <q-icon name="volume_off" color="white" />
      </template>
      Haz clic en cualquier parte de la pantalla para activar el sonido de alerta (BEEEP) en el monitor.
    </q-banner>

    <q-card class="shadow-10 radius-20 overflow-hidden full-width card-main glass-container">
      
      <!-- ENCABEZADO TV CON NOMBRE DE SUCURSAL REAL -->
      <q-card-section class="bg-white row items-center justify-between q-px-xl q-py-lg bordered-bottom header-section">
        <div class="row items-center q-gutter-x-md">
          <q-icon name="live_tv" color="primary" size="2.8rem" />
          <div>
            <div class="text-h4 text-weight-bolder text-grey-9 text-uppercase header-title">
              Visualizador de Turnos
            </div>
            <div class="text-caption text-grey-7 text-weight-bold letter-spacing-sm">
              {{ nombreSucursal }}
            </div>
          </div>
        </div>

        <div class="row items-center q-gutter-x-sm bg-blue-1 q-px-md q-py-xs radius-12 clock-badge">
          <q-icon name="schedule" color="primary" size="2rem" />
          <div class="text-h3 text-weight-bolder text-primary font-mono header-clock">
            {{ horaActual }}
          </div>
        </div>
      </q-card-section>

      <!-- SECCIÓN DE CAJAS -->
      <q-card-section class="q-py-lg q-px-xl bg-grey-2 main-content">
        <div v-if="cargando" class="flex flex-center q-pa-xl">
          <q-spinner color="primary" size="60px" />
        </div>

        <template v-else>
          <!-- CAJAS ACTIVAS -->
          <div class="row q-col-gutter-lg justify-center items-center full-width grid-cajas q-mb-lg">
            <div
              v-for="caja in cajasActivas"
              :key="caja.numeroCaja"
              :class="colClass"
            >
              <q-card 
                class="shadow-4 radius-16 text-center q-pa-md bg-white card-caja"
                :style="{ borderTopColor: caja.estado === 'ATENDIENDO' ? '#21ba45' : '#adb5bd' }"
              >
                <div class="text-h5 text-weight-bolder text-grey-9 q-mb-xs caja-nombre">
                  Caja {{ caja.numeroCaja }}
                </div>

                <div class="row justify-center q-mb-sm">
                  <q-badge 
                    :color="caja.estado === 'ATENDIENDO' ? 'primary' : 'grey-6'" 
                    class="q-px-md q-py-xs text-caption text-weight-bold badge-redondeado label-atendiendo"
                  >
                    {{ caja.estado === 'ATENDIENDO' ? 'ATENDIENDO AHORA' : 'DISPONIBLE' }}
                  </q-badge>
                </div>

                <div class="text-weight-bolder numero-caja" :class="caja.estado === 'ATENDIENDO' ? 'text-positive' : 'text-grey-5'">
                  {{ caja.numeroTurno ? `#${caja.numeroTurno}` : '--' }}
                </div>
              </q-card>
            </div>

            <div v-if="cajasActivas.length === 0" class="text-h6 text-grey-7 text-center">
              No hay cajas registradas para esta sucursal.
            </div>
          </div>

          <!-- NUEVA SECCIÓN: VISTA PREVIA DE LA FILA (PRÓXIMOS TURNOS) -->
          <q-card flat bordered class="q-pa-md radius-16 bg-white shadow-1 row items-center justify-between q-mt-md queue-preview-card">
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="upcoming" color="primary" size="2rem" />
              <div class="text-subtitle1 text-weight-bold text-grey-9 text-uppercase">
                Próximos en fila:
              </div>
            </div>

            <div class="row q-gutter-x-md items-center">
              <template v-if="proximosTurnos.length > 0">
                <div 
                  v-for="(turno, index) in proximosTurnos" 
                  :key="index"
                  class="bg-blue-1 text-primary text-h6 text-weight-bolder q-px-lg q-py-xs radius-12 border-primary-light"
                >
                  #{{ turno }}
                </div>
              </template>
              <div v-else class="text-body2 text-grey-6 text-italic">
                No hay más turnos en espera
              </div>
            </div>
          </q-card>
        </template>
      </q-card-section>

      <q-card-section class="bg-white text-center q-py-md bordered-top footer-section">
        <div class="text-subtitle1 text-weight-bolder text-grey-8 text-uppercase letter-spacing-sm">
          Manténgase atento a su llamado en pantalla y altoparlante
        </div>
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { socket } from '../../utils/socket'

const route = useRoute()
const sucursalId = ref(route.params.sucursalId || '1')

const nombreSucursal = ref('')
const horaActual = ref('')
const cajasActivas = ref([])
const proximosTurnos = ref([]) // Almacena los próximos números en espera
const cargando = ref(true)

const audioPermitido = ref(false)
const audioBeep = new Audio('/sounds/BEEEP.wav')
const ultimosTurnosSonados = ref({})

let timerHora = null
let timerPolling = null

const actualizarHora = () => {
  const ahora = new Date()
  const horas = String(ahora.getHours()).padStart(2, '0')
  const minutos = String(ahora.getMinutes()).padStart(2, '0')
  horaActual.value = `${horas}:${minutos}`
}

const habilitarAudio = () => {
  audioBeep.play().then(() => {
    audioBeep.pause()
    audioBeep.currentTime = 0
    audioPermitido.value = true
  }).catch(err => {
    console.log("No se pudo habilitar el audio:", err)
  })
}

const reproducirBeep = () => {
  if (!audioPermitido.value) return
  audioBeep.currentTime = 0
  audioBeep.play().catch(error => {
    console.error("Error al reproducir audio BEEEP:", error)
  })
}

const obtenerEstadoTV = async (esCargaInicial = false) => {
  if (esCargaInicial) cargando.value = true

  try {
    const response = await fetch(`/api/tv/${sucursalId.value}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) throw new Error('Error al obtener estado de la TV')

    const data = await response.json()
    
    nombreSucursal.value = data.nombreSucursal || `SUCURSAL ${sucursalId.value}`
    const nuevasCajas = data.cajas || []
    proximosTurnos.value = data.proximosTurnos || [] // Actualiza los próximos turnos

    let huboCambioNuevoTurno = false

    nuevasCajas.forEach(caja => {
      const turnoActual = caja.numeroTurno
      const turnoAnterior = ultimosTurnosSonados.value[caja.numeroCaja]

      if (caja.estado === 'ATENDIENDO' && turnoActual && turnoActual !== turnoAnterior) {
        huboCambioNuevoTurno = true
        ultimosTurnosSonados.value[caja.numeroCaja] = turnoActual
      } else if (caja.estado !== 'ATENDIENDO') {
        ultimosTurnosSonados.value[caja.numeroCaja] = null
      }
    })

    if (huboCambioNuevoTurno && !esCargaInicial) {
      reproducirBeep()
    }

    cajasActivas.value = nuevasCajas

  } catch (error) {
    console.error('Error al sincronizar monitor TV:', error)
  } finally {
    if (esCargaInicial) cargando.value = false
  }
}

const colClass = computed(() => {
  const total = cajasActivas.value.length
  if (total <= 2) return 'col-12 col-sm-6'
  if (total === 3) return 'col-12 col-sm-4'
  return 'col-12 col-sm-6 col-md-3'
})

const alRecibirActualizacion = (payload) => {
  if (String(payload.sucursalId) === String(sucursalId.value)) {
    obtenerEstadoTV(false)
  }
}

onMounted(() => {
  actualizarHora()
  timerHora = setInterval(actualizarHora, 1000)
  obtenerEstadoTV(true)

  socket.on('cola-actualizada', alRecibirActualizacion)
  socket.on('connect', () => obtenerEstadoTV(false))

  timerPolling = setInterval(() => {
    obtenerEstadoTV(false)
  }, 20000)
})

onUnmounted(() => {
  if (timerHora) clearInterval(timerHora)
  if (timerPolling) clearInterval(timerPolling)
  socket.off('cola-actualizada', alRecibirActualizacion)
})
</script>

<style scoped>
.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
}

.container-tv {
  min-height: 100vh;
}

.card-main {
  max-width: 1200px;
}

.radius-20 { border-radius: 20px; }
.radius-16 { border-radius: 16px; }
.radius-12 { border-radius: 12px; }

.badge-redondeado {
  border-radius: 50px !important;
}

.select-none { user-select: none; }
.bordered-bottom { border-bottom: 2px solid #e2e8f0; }
.bordered-top { border-top: 2px solid #e2e8f0; }
.font-mono { font-family: monospace; }
.letter-spacing-sm { letter-spacing: 2px; }

.card-caja {
  border-top: 6px solid #21ba45;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.numero-caja { 
  font-size: 5.5rem; 
  line-height: 1; 
}

.border-primary-light {
  border: 1px solid rgba(33, 150, 243, 0.3);
}

@media (orientation: portrait) {
  .container-tv {
    padding: 1rem !important;
  }

  .card-main {
    max-width: 100% !important;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .header-section {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
    padding: 1rem !important;
  }

  .header-title {
    font-size: 1.5rem !important;
  }

  .header-clock {
    font-size: 2rem !important;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 1rem !important;
  }

  .caja-nombre {
    font-size: 1.5rem !important;
  }

  .numero-caja {
    font-size: 3.8rem !important;
  }

  .footer-section {
    padding: 0.75rem !important;
  }
}
</style>