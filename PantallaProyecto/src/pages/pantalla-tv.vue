<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <q-page class="fondo flex flex-center q-pa-xl select-none container-tv">
    <q-card class="shadow-8 radius-16 overflow-hidden full-width card-main">
      
      <!-- ENCABEZADO TV CON HORA EN VIVO -->
      <q-card-section class="bg-white row items-center justify-between q-px-xl q-py-lg bordered-bottom header-section">
        <div class="text-h3 text-weight-bolder text-grey-10 text-uppercase header-title">
          Visualizador de Turnos
        </div>
        <div class="text-h2 text-weight-bolder text-primary font-mono header-clock">
          {{ horaActual }}
        </div>
      </q-card-section>

      <!-- SECCIÓN DE CAJAS -->
      <q-card-section class="q-py-2xl q-px-xl bg-grey-1 main-content flex flex-center">
        <div class="row q-col-gutter-xl justify-center items-center full-width grid-cajas">
          <div
            v-for="caja in cajasActivas"
            :key="caja.id"
            :class="colClass"
          >
            <!-- TARJETAS DE CAJAS  -->
            <q-card class="shadow-3 radius-16 text-center q-pa-lg bg-white border-caja card-caja">
              <div class="text-h3 text-weight-bolder text-grey-9 q-mb-sm caja-nombre">
                {{ caja.nombre }}
              </div>
              <div class="text-h6 text-weight-bold text-grey-7 text-uppercase q-mb-md label-atendiendo">
                Atendiendo número:
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
        <div class="text-h6 text-weight-bolder text-grey-8 text-uppercase q-mb-xs">
          Próximos números
        </div>
        <div class="text-h3 text-weight-bolder text-grey-10 font-mono letter-spacing proximos-text">
          <span v-for="(num, index) in proximosNumeros" :key="index" class="q-mx-md">
            #{{ num }}
          </span>
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
.radius-16 { border-radius: 16px; }
.select-none { user-select: none; }
.bordered-bottom { border-bottom: 2px solid #e0e0e0; }
.bordered-top { border-top: 2px solid #e0e0e0; }
.border-caja { border: 1px solid #d6d6d6; }
.font-mono { font-family: monospace; }
.letter-spacing { letter-spacing: 8px; }

/* NÚMERO EN TAMAÑO TV HORIZONTAL */
.numero-caja { 
  font-size: 7.5rem; 
  line-height: 1; 
}

/* 
   ADAPTACIÓN AUTOMÁTICA PARA PANTALLAS VERTICALES UTILIZANDO CSS
    */
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
    gap: 0.25rem;
    padding: 1rem !important;
  }

  .header-title {
    font-size: 1.8rem !important;
  }

  .header-clock {
    font-size: 2.5rem !important;
  }

  .main-content {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 1rem !important;
  }

  /* Reducción de separación entre tarjetas de cajas */
  .grid-cajas {
    margin-top: -8px !important;
    margin-bottom: -8px !important;
  }

  .grid-cajas > div {
    padding-top: 8px !important;
    padding-bottom: 8px !important;
  }

  /* Apilado vertical ajustado */
  .col-12, .col-sm-6, .col-sm-4, .col-md-3 {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }

  /* Padding interno más ajustado dentro de cada tarjeta */
  .card-caja {
    padding: 1rem !important;
  }

  .caja-nombre {
    font-size: 2rem !important;
    margin-bottom: 0.2rem !important;
  }

  .label-atendiendo {
    font-size: 1rem !important;
    margin-bottom: 0.4rem !important;
  }

  .numero-caja {
    font-size: 5rem !important;
  }

  .proximos-text {
    font-size: 1.8rem !important;
    letter-spacing: 4px !important;
  }

  .footer-section {
    padding: 0.75rem !important;
  }
}

.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
}
</style>