<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <q-page class="fondo flex flex-center q-pa-md relative-position">
    
    <div style="width: 100%; max-width: 500px;">
      <q-card class="shadow-3 q-pa-md">
        
        <!-- ENCABEZADO Y CERRAR SESIÓN -->
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="text-subtitle1 text-weight-bold text-grey-9">
            Panel de Atención
          </div>
          <q-btn flat round dense color="grey-7" icon="logout" @click="mostrarConfirmacion = true">
            <q-tooltip>Cerrar sesión</q-tooltip>
          </q-btn>
        </q-card-section>

        <!-- CAJA ASIGNADA AUTOMÁTICAMENTE (PARA QUE SOLO MUESTRE NÚMERO CAJA) -->
        <q-card-section class="q-pt-sm text-center">
          <div class="text-caption text-grey-7">Atendiendo en:</div>
          <div class="text-h6 text-primary text-weight-bold row items-center justify-center q-gutter-x-xs">
            <q-icon name="point_of_sale" size="22px" />
            <span>{{ cajaAsignada.label }}</span>
          </div>
        </q-card-section>

        <q-separator class="q-mx-md q-my-xs" />

        <!-- ESTADO DE LOS TURNOS (ÚLTIMO FILA Y PENDIENTES) -->
        <q-card-section class="text-center q-py-md">
          <div class="row q-col-gutter-sm justify-center q-mb-md">
            
            <!-- ÚLTIMO FILA -->
            <div class="col-6">
              <q-card flat bordered class="bg-grey-1 q-pa-xs">
                <div class="text-caption text-grey-7">Último Fila</div>
                <div class="text-subtitle1 text-weight-bold text-grey-9">
                  #{{ cajaAsignada.ultimoFila }}
                </div>
              </q-card>
            </div>

            <!-- PENDIENTES -->
            <div class="col-6">
              <q-card flat bordered class="bg-red-1 q-pa-xs border-danger">
                <div class="text-caption text-negative text-bold">Pendientes</div>
                <div class="text-subtitle1 text-weight-bold text-negative">
                  {{ cajaAsignada.ultimoFila - cajaAsignada.numeroAtendido }}
                </div>
              </q-card>
            </div>

          </div>

          <div class="text-subtitle2 text-grey-8 text-weight-bold q-mt-md text-uppercase">
            TURNO ACTUALMENTE EN ATENCIÓN
          </div>
          <div class="text-h1 text-weight-bolder text-primary q-my-xs">
            #{{ cajaAsignada.numeroAtendido }}
          </div>
        </q-card-section>

        <!-- ACCIONES DE ATENCIÓN Y LIBERACIÓN -->
        <q-card-actions align="center" class="q-gutter-y-sm q-pb-md">
          
          <!-- BOTÓN SIGUIENTE -->
          <q-btn
            label="SIGUIENTE / ATENDIDO"
            color="primary"
            icon-right="navigate_next"
            size="lg"
            unelevated
            class="full-width q-py-sm text-bold"
            :disabled="cajaAsignada.numeroAtendido >= cajaAsignada.ultimoFila"
            @click="atenderSiguiente"
          />

          <!-- BOTÓN MARCAR AUSENTE / LIBERAR TURNO -->
          <q-btn
            label="MARCAR AUSENTE / LIBERAR TURNO"
            color="warning"
            text-color="dark"
            icon="person_off"
            outline
            class="full-width q-py-xs text-weight-bold"
            :disabled="cajaAsignada.numeroAtendido >= cajaAsignada.ultimoFila"
            @click="marcarAusente"
          />

        </q-card-actions>

      </q-card>
    </div>

    <!-- DIÁLOGO DE CONFIRMACIÓN DE CERRAR SESIÓN -->
    <q-dialog v-model="mostrarConfirmacion" persistent>
      <q-card style="min-width: 300px;">
        <q-card-section class="row items-center">
          <q-avatar icon="logout" color="primary" text-color="white" size="md" />
          <span class="q-ml-sm text-subtitle1 text-weight-bold">Confirmar salida</span>
        </q-card-section>

        <q-card-section class="q-pt-none text-grey-8">
          ¿Estás seguro de que deseas cerrar sesión y salir del panel de atención?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn label="Cerrar sesión" color="negative" unelevated @click="cerrarSesion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mostrarConfirmacion = ref(false)

const cajaAsignada = ref({
  id: 1,
  label: 'Caja 1',
  numeroAtendido: 1,
  ultimoFila: 8
})

const atenderSiguiente = () => {
  if (cajaAsignada.value.numeroAtendido < cajaAsignada.value.ultimoFila) {
    cajaAsignada.value.numeroAtendido++
  }
}

const marcarAusente = () => {
  if (cajaAsignada.value.numeroAtendido < cajaAsignada.value.ultimoFila) {
    atenderSiguiente()
  }
}

const cerrarSesion = () => {
  mostrarConfirmacion.value = false
  router.push('/login')
}
</script>

<style scoped>
.border-danger {
  border: 1px solid #ef9a9a !important;
}

.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
}
</style>