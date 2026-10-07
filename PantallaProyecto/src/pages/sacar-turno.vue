<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <q-page class="fondo q-pa-md flex flex-center">
    <div style="width: 100%; max-width: 480px;">
      
      <q-btn
        flat
        icon="arrow_back"
        label="Volver a Sedes"
        color="primary"
        class="q-mb-md"
        to="/"
      />

      <q-card class="shadow-3 q-pa-md text-center">
        <!--CABECERA DE LA SEDE -->
        <q-card-section>
          <div class="text-caption text-grey-7">Solicitud de turno para:</div>
          <div class="text-h6 text-primary text-weight-bold">
            {{ nombreSede }}
          </div>
        </q-card-section>

        <q-separator class="q-my-xs" />

        <!-- ESTADO A: SI AÚN NO HA CONFIRMADO -->
        <q-card-section v-if="!turnoOtorgado" class="q-py-lg">
          <q-icon name="warning" color="warning" size="4rem" />
          <div class="text-h6 text-weight-bold q-mt-sm">(mensaje de advertencia)</div>
          <p class="text-body2 text-grey-8 q-mt-md">
            ¿Seguro que quiere sacar un número para colocarse en la fila?
          </p>

          <div class="row justify-around q-mt-xl">
            <q-btn flat label="Rechazar" color="negative" to="/" />
            <q-btn label="Aceptar" color="primary" unelevated @click="confirmarTurno" />
          </div>
        </q-card-section>

        <!-- ESTADO B: NÚMERO OTORGADO -->
        <q-card-section v-else class="q-py-lg">
          <q-icon name="check_circle" color="positive" size="4rem" />
          <div class="text-subtitle2 text-grey-7 q-mt-md">Próximo número en fila:</div>
          <div class="text-h1 text-weight-bolder text-secondary q-my-xs">
            #{{ miTurno }}
          </div>

          <q-separator class="q-my-md" />

          <div class="text-caption text-grey-7">Último número llamado en sala:</div>
          <div class="text-h4 text-weight-bold text-negative">
            {{ ultimoNumeroLlamado }}
          </div>

          <q-btn
            label="Volver al inicio"
            color="primary"
            unelevated
            class="q-mt-xl full-width"
            to="/"
          />
        </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Lee el nombre de la sede enviado desde la página anterior por la URL
const nombreSede = computed(() => route.query.sede || 'Sede de Cobranza')

// Estados para la generación del turno
const turnoOtorgado = ref(false)
const miTurno = ref(null)
const ultimoNumeroLlamado = ref(12)

const confirmarTurno = () => {
  // Simulación del otorgamiento de turno
  miTurno.value = 16
  turnoOtorgado.value = true
}
</script>

<style scoped>
.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
}
</style>