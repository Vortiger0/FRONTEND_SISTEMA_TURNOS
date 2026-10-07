<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <q-page class="fondo flex flex-center q-pa-md select-none">
    <q-card class="shadow-4 radius-16 text-center" style="width: 100%; max-width: 420px;">
      
      <!-- ENCABEZADO CON SUCURSAL -->
      <q-card-section class="row items-center justify-between q-pb-none">
        <div class="text-subtitle1 text-weight-bolder text-grey-9 text-uppercase">
          MIS TURNOS
        </div>
        <div class="text-caption text-grey-7">
          Abitab, Aparicio Saravia 598
        </div>
      </q-card-section>

      <q-separator class="q-my-sm" />

      <!-- ESTADO 1: TIENE TURNO ACTIVO -->
      <div v-if="tieneTurno">
        <!-- TU NÚMERO -->
        <q-card-section class="q-py-xs">
          <q-card flat bordered class="q-pa-sm radius-12 bg-grey-1" style="max-width: 220px; margin: 0 auto;">
            <div class="text-caption text-grey-7 text-weight-medium">Tu número:</div>
            <div class="text-weight-bolder text-positive" style="font-size: 4rem; line-height: 1;">
              {{ miTurno }}
            </div>
          </q-card>
        </q-card-section>

        <!-- CAJAS EN VIVO -->
        <q-card-section class="q-py-sm">
          <div class="row q-col-gutter-sm justify-center">
            <div v-for="caja in cajas" :key="caja.id" class="col-5">
              <q-card flat bordered class="q-pa-xs bg-white radius-8">
                <div class="text-caption text-weight-bold text-grey-8">{{ caja.nombre }}</div>
                <div class="text-h5 text-weight-bolder text-primary">{{ caja.numero }}</div>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <!-- PRÓXIMOS NÚMEROS -->
        <q-card-section class="q-py-xs">
          <div class="text-caption text-grey-7 text-weight-bold">Próximos números:</div>
          <div class="text-subtitle1 text-weight-bold text-grey-9 font-mono">
            {{ proximos.join(' ') }}
          </div>
        </q-card-section>

        <!-- BOTÓN CANCELAR TURNO -->
        <q-card-section class="q-pt-md">
          <q-btn
            label="CANCELAR TURNO"
            color="red-3"
            text-color="red-10"
            unelevated
            class="full-width text-bold radius-8"
            @click="confirmarCancelacion = true"
          />
        </q-card-section>
      </div>

      <!-- ESTADO 2: NO TIENE TURNO ACTIVO -->
      <div v-else>
        <q-card-section class="q-py-xl">
          <q-icon name="confirmation_number" color="grey-5" size="4rem" class="q-mb-md" />
          <div class="text-h6 text-weight-bold text-grey-9 q-mb-xs">
            No tienes ningún turno activo
          </div>
          <div class="text-caption text-grey-7 q-mb-lg">
            Elige un lugar para sacar tu número
          </div>

          <q-btn
            label="SACAR TURNO"
            color="primary"
            unelevated
            class="q-px-xl text-bold radius-8"
            to="/"
          />
        </q-card-section>
      </div>

    </q-card>

    <!-- DIÁLOGO DE CONFIRMACIÓN DE CANCELACIÓN -->
    <q-dialog v-model="confirmarCancelacion">
      <q-card class="text-center q-pa-sm card-redondeada" style="max-width: 320px;">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-grey-9">
            ¿Seguro que deseas cancelar tu turno?
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Perderás tu lugar en la fila.
          </div>
        </q-card-section>
        <q-card-actions align="around">
          <q-btn flat label="No, mantener" color="grey-8" v-close-popup />
          <q-btn label="Sí, cancelar" color="negative" unelevated style="border-radius: 10px;" @click="cancelarTurno" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const tieneTurno = ref(true)
const miTurno = ref(28)

const proximos = ref([27, 28, 29, 30, 31])
const confirmarCancelacion = ref(false)

const cancelarTurno = () => {
  tieneTurno.value = false
  confirmarCancelacion.value = false
}
</script>

<style scoped>
.radius-16 { border-radius: 16px; }
.radius-12 { border-radius: 12px; }
.radius-8 { border-radius: 8px; }
.font-mono { font-family: monospace; }
.select-none { user-select: none; }
.card-redondeada { border-radius: 20px; overflow: hidden; }

.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
}
</style>