<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <q-page class="fondo flex flex-center q-pa-md select-none">
    <div style="width: 100%; max-width: 450px;">
      
      <!-- PANTALLA 1: ESTADO INICIAL -->
      <q-card v-if="!turnoOtorgado" class="shadow-4 text-center radius-16 q-pa-md">
        <!-- ENCABEZADO LOCAL -->
        <q-card-section class="q-pb-none">
          <div class="text-caption text-grey-8 text-weight-medium">
            Abitab, Aparicio Saravia 598
          </div>
          <div class="text-h4 text-weight-bolder text-grey-10 q-mt-md">
            SACAR TURNO
          </div>
        </q-card-section>

        <!-- RECUADRO NEGRO CENTRAL CON ICONO -->
        <q-card-section class="q-my-md">
          <div class="bg-grey-10 text-white rounded-borders q-pa-lg flex flex-center column">
            <q-icon name="confirmation_number" color="negative" size="4rem" class="q-mb-sm" />
            <div class="text-caption text-weight-medium text-grey-3">
              Tocá el botón para obtener tu número
            </div>
          </div>
        </q-card-section>

        <!-- BOTÓN PRINCIPAL SACAR TURNO -->
        <q-card-section class="q-pt-none">
          <q-btn
            label="SACAR TURNO"
            color="primary"
            text-color="white"
            size="22px"
            unelevated
            class="full-width q-py-md text-bold btn-touch radius-12"
            @click="obtenerTurno"
          />
        </q-card-section>

        <!-- PIE DE PÁGINA -->
        <q-card-section class="q-pt-xs">
          <div class="text-caption text-red-6 italic">
            Anote el número que se le dará luego de pulsar el botón
          </div>
        </q-card-section>
      </q-card>

      <!-- PANTALLA 2: MUESTRA DEL NÚMERO (10 SEGUNDOS) -->
      <q-card v-else class="shadow-4 text-center radius-16 q-pa-md">
        <!-- ENCABEZADO LOCAL -->
        <q-card-section class="q-pb-none">
          <div class="text-caption text-grey-8 text-weight-medium">
            Abitab, Aparicio Saravia 598
          </div>
          <div class="text-h5 text-weight-bold text-grey-9 q-mt-md">
            Tu número es:
          </div>
        </q-card-section>

        <!-- DESPLIEGUE DEL NÚMERO -->
        <q-card-section class="q-py-md">
          <div class="text-weight-bolder text-positive numero-display">
            {{ miNumero }}
          </div>
        </q-card-section>

        <!-- AVISOS Y REGRESO AUTOMÁTICO -->
        <q-card-section class="q-pt-none">
          <div class="text-caption text-red-6 q-mb-md">
            Conservá tu número, se te llamará cuando corresponda
          </div>

          <!-- TEMPORIZADOR Y CONTEO -->
          <q-linear-progress
            :value="segundosRestantes / 10"
            color="positive"
            track-color="grey-3"
            size="6px"
            rounded
            class="q-mb-xs"
          />
          <div class="text-caption text-grey-6 text-weight-bold">
            Volviendo al inicio... ({{ segundosRestantes }}s)
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
.radius-16 {
  border-radius: 16px;
}

.radius-12 {
  border-radius: 12px;
}

.select-none {
  user-select: none;
}

.numero-display {
  font-size: 8rem;
  line-height: 1;
}

.btn-touch {
  transition: transform 0.1s ease;
}

.btn-touch:active {
  transform: scale(0.97);
}

.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
}
</style>