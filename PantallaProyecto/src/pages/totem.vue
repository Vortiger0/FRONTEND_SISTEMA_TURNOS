<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <q-page class="fondo flex flex-center q-pa-md select-none">
    <div style="width: 100%; max-width: 460px;">
      
      <!-- PANTALLA 1: ESTADO INICIAL -->
      <q-card v-if="!turnoOtorgado" class="shadow-10 text-center radius-20 q-pa-md bg-white card-totem">
        
        <!-- ENCABEZADO LOCAL CON BADGE INSTITUCIONAL -->
        <q-card-section class="q-pb-xs">
          <div class="row items-center justify-center q-gutter-x-xs text-caption text-grey-7 text-weight-bold text-uppercase letter-spacing-sm q-mb-xs">
            <q-icon name="place" color="primary" size="16px" />
            <span>Abitab — Aparicio Saravia 598</span>
          </div>
          
          <div class="text-h4 text-weight-bolder text-grey-9 q-mt-sm">
            SACAR TURNO
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Aprete el botón para ingresar a la fila virtual
          </div>
        </q-card-section>

        <!-- RECUADRO CENTRAL ESTILIZADO -->
        <q-card-section class="q-my-md">
          <div class="bg-blue-1 text-primary radius-16 q-pa-xl flex flex-center column shadow-inner border-banner">
            <q-icon name="confirmation_number" color="primary" size="5rem" class="q-mb-sm pulse-icon" />
            <div class="text-subtitle2 text-weight-bolder text-uppercase letter-spacing-sm">
              Atención Presencial
            </div>
          </div>
        </q-card-section>

        <!-- BOTÓN PRINCIPAL ACEPTAR/SACAR TURNO -->
        <q-card-section class="q-pt-none">
          <q-btn
            label="OBTENER MI NÚMERO"
            color="primary"
            text-color="white"
            size="20px"
            unelevated
            icon="touch_app"
            class="full-width q-py-md text-bold btn-touch radius-16 shadow-4"
            @click="obtenerTurno"
          />
        </q-card-section>

        <!-- PIE DE PÁGINA / ADVERTENCIA -->
        <q-card-section class="q-pt-xs">
          <q-badge color="grey-2" text-color="grey-9" class="q-px-md q-py-xs badge-redondeado text-caption text-weight-medium">
            <q-icon name="info" color="primary" class="q-mr-xs" />
            Por favor, conserve o anote su número asignado
          </q-badge>
        </q-card-section>
      </q-card>

      <!-- PANTALLA 2: MUESTRA DEL NÚMERO (10 SEGUNDOS) -->
      <q-card v-else class="shadow-10 text-center radius-20 q-pa-md bg-white card-totem">
        
        <!-- ENCABEZADO LOCAL -->
        <q-card-section class="q-pb-none">
          <div class="row items-center justify-center q-gutter-x-xs text-caption text-grey-7 text-weight-bold text-uppercase letter-spacing-sm q-mb-xs">
            <q-icon name="place" color="primary" size="16px" />
            <span>Abitab — Aparicio Saravia 598</span>
          </div>

          <q-badge color="positive" class="q-px-lg q-py-xs text-caption text-weight-bold badge-redondeado q-mt-sm">
            TURNO GENERADO CON ÉXITO
          </q-badge>

          <div class="text-h5 text-weight-bolder text-grey-9 q-mt-md">
            Tu número es:
          </div>
        </q-card-section>

        <!-- DESPLIEGUE DEL NÚMERO -->
        <q-card-section class="q-py-md">
          <div class="bg-grey-2 radius-16 q-py-lg border-numero">
            <div class="text-weight-bolder text-positive numero-display font-mono">
              #{{ miNumero }}
            </div>
          </div>
        </q-card-section>

        <!-- AVISOS Y REGRESO AUTOMÁTICO -->
        <q-card-section class="q-pt-none q-px-md">
          <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-md">
            Aguarde en la sala, será llamado en pantalla
          </div>

          <!-- TEMPORIZADOR Y CONTEO -->
          <q-linear-progress
            :value="segundosRestantes / 10"
            color="primary"
            track-color="blue-1"
            size="8px"
            rounded
            class="q-mb-sm"
          />
          <div class="text-caption text-grey-6 text-weight-bold">
            Reiniciando pantalla en {{ segundosRestantes }}s...
          </div>
        </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const contadorInterno = ref(28)
const turnoOtorgado = ref(false)
const miNumero = ref(null)

const segundosRestantes = ref(10)
let temporizador = null

const obtenerTurno = () => {
  contadorInterno.value++
  miNumero.value = contadorInterno.value
  turnoOtorgado.value = true
  iniciarTemporizador()
}

const iniciarTemporizador = () => {
  segundosRestantes.value = 10
  if (temporizador) clearInterval(temporizador)

  temporizador = setInterval(() => {
    segundosRestantes.value--
    if (segundosRestantes.value <= 0) {
      resetearPantalla()
    }
  }, 1000)
}

const resetearPantalla = () => {
  if (temporizador) {
    clearInterval(temporizador)
    temporizador = null
  }
  turnoOtorgado.value = false
  miNumero.value = null
  segundosRestantes.value = 10
}

onUnmounted(() => {
  if (temporizador) clearInterval(temporizador)
})
</script>

<style scoped>
.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
  min-height: 100vh;
}

.radius-20 {
  border-radius: 20px;
}

.radius-16 {
  border-radius: 16px;
}

.badge-redondeado {
  border-radius: 50px !important;
}

.select-none {
  user-select: none;
}

.letter-spacing-sm {
  letter-spacing: 1px;
}

.font-mono {
  font-family: monospace;
}

.border-banner {
  border: 1px solid #bfdbfe;
}

.border-numero {
  border: 2px dashed #21ba45;
}

.numero-display {
  font-size: 7.5rem;
  line-height: 1;
}

.btn-touch {
  transition: transform 0.15 ease, box-shadow 0.15s ease;
}

.btn-touch:active {
  transform: scale(0.96);
}

/* Efecto sutil de pulso en el ícono */
.pulse-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
</style>