<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <q-page class="fondo flex flex-center q-pa-lg select-none container-tv">
    <q-card class="shadow-10 radius-20 overflow-hidden full-width card-main glass-container">
      
      <!-- ENCABEZADO TV CON HORA EN VIVO -->
      <q-card-section class="bg-white row items-center justify-between q-px-xl q-py-lg bordered-bottom header-section">
        <div class="row items-center q-gutter-x-md">
          <q-icon name="live_tv" color="primary" size="2.8rem" />
          <div>
            <div class="text-h4 text-weight-bolder text-grey-9 text-uppercase header-title">
              Visualizador de Turnos
            </div>
            <div class="text-caption text-grey-7 text-weight-bold letter-spacing-sm">
              SISTEMA DE ATENCIÓN PRESENCIAL
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
      <q-card-section class="q-py-xl q-px-xl bg-grey-2 main-content flex flex-center">
        <div class="row q-col-gutter-xl justify-center items-center full-width grid-cajas">
          <div
            v-for="caja in cajasActivas"
            :key="caja.id"
            :class="colClass"
          >
            <!-- TARJETAS DE CAJAS (DISEÑO MODERNO CON BORDE LATERAL) -->
            <q-card class="shadow-4 radius-16 text-center q-pa-lg bg-white card-caja">
              <div class="text-h4 text-weight-bolder text-grey-9 q-mb-xs caja-nombre">
                {{ caja.nombre }}
              </div>

              <!-- BADGE COMPLETAMENTE REDONDEADADO -->
              <div class="row justify-center q-mb-md">
                <q-badge color="primary" class="q-px-lg q-py-xs text-caption text-weight-bold badge-redondeado label-atendiendo">
                  ATENDIENDO AHORA
                </q-badge>
              </div>

              <div class="text-weight-bolder text-positive numero-caja">
                #{{ caja.numero }}
              </div>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <!-- PRÓXIMOS NÚMEROS -->
      <q-card-section class="bg-white text-center q-py-lg bordered-top footer-section">
        <div class="text-subtitle1 text-weight-bolder text-grey-8 text-uppercase q-mb-sm letter-spacing-sm">
          Próximos Turnos
        </div>
        <div class="row justify-center items-center q-gutter-md proximos-container">
          <q-badge
            v-for="(num, index) in proximosNumeros"
            :key="index"
            outline
            color="primary"
            class="text-h4 text-weight-bolder q-px-lg q-py-sm radius-12 proximos-badge font-mono"
          >
            #{{ num }}
          </q-badge>
        </div>
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const horaActual = ref('')
let timerHora = null

const actualizarHora = () => {
  const ahora = new Date()
  const horas = String(ahora.getHours()).padStart(2, '0')
  const minutos = String(ahora.getMinutes()).padStart(2, '0')
  horaActual.value = `${horas}:${minutos}`
}

const cajasActivas = ref([
  { id: 1, nombre: 'Caja 1', numero: 25 },
  { id: 2, nombre: 'Caja 2', numero: 26 }
])

const proximosNumeros = ref([27, 28, 29, 30, 31])

const colClass = computed(() => {
  const total = cajasActivas.value.length
  if (total <= 2) return 'col-12 col-sm-6'
  if (total === 3) return 'col-12 col-sm-4'
  return 'col-12 col-sm-6 col-md-3'
})

onMounted(() => {
  actualizarHora()
  timerHora = setInterval(actualizarHora, 1000)
})

onUnmounted(() => {
  if (timerHora) clearInterval(timerHora)
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

/* CLASE PARA BORDES TOTALMENTE REDONDEADOS (TIPO PÍLDORA) */
.badge-redondeado {
  border-radius: 50px !important;
}

.select-none { user-select: none; }
.bordered-bottom { border-bottom: 2px solid #e2e8f0; }
.bordered-top { border-top: 2px solid #e2e8f0; }
.font-mono { font-family: monospace; }
.letter-spacing-sm { letter-spacing: 2px; }

/* EFECTO CARD CAJA */
.card-caja {
  border-top: 6px solid #21ba45;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* NÚMERO EN TAMAÑO TV HORIZONTAL */
.numero-caja { 
  font-size: 7rem; 
  line-height: 1; 
}

/* ADAPTACIÓN AUTOMÁTICA PARA PANTALLAS VERTICALES */
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
    font-size: 1.6rem !important;
  }

  .header-clock {
    font-size: 2.2rem !important;
  }

  .main-content {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 1rem !important;
  }

  .grid-cajas {
    margin-top: -8px !important;
    margin-bottom: -8px !important;
  }

  .grid-cajas > div {
    padding-top: 8px !important;
    padding-bottom: 8px !important;
  }

  .col-12, .col-sm-6, .col-sm-4, .col-md-3 {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }

  .card-caja {
    padding: 1rem !important;
  }

  .caja-nombre {
    font-size: 1.8rem !important;
    margin-bottom: 0.2rem !important;
  }

  .numero-caja {
    font-size: 4.8rem !important;
  }

  .footer-section {
    padding: 0.75rem !important;
  }

  .proximos-badge {
    font-size: 1.3rem !important;
    padding: 4px 10px !important;
  }
}
</style>