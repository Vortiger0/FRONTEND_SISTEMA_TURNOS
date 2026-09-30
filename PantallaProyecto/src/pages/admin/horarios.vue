<template>
  <q-page class="bg-grey-2 q-pa-md flex justify-center">
    <div style="width: 100%; max-width: 500px;">
      <q-card class="shadow-3" style="border-radius: 16px; overflow: hidden;">

        <!-- para los horarios semanales -->
        <q-card-section>
          <div class="text-subtitle1 text-weight-bolder text-grey-10 q-mb-sm">Horario de atención</div>

          <!-- una fila por cada día, gracias al v-for -->
          <div v-for="horario in horarios" :key="horario.dia" class="row items-center q-mb-sm q-gutter-x-sm">

            <!-- nombre del día, con ancho fijo para que todos queden alineados -->
            <div class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs" style="width: 90px;">{{ horario.dia }}</div>

            <!-- checkbox: si atiende o no ese día -->
            <q-checkbox v-model="horario.atiende" />

            <!-- solo mostramos los horarios si el día está habilitado -->
            <template v-if="horario.atiende">
              <q-input v-model="horario.desde" type="time" dense style="width: 110px;" />
              <span>a</span>
              <q-input v-model="horario.hasta" type="time" dense style="width: 110px;" />
            </template>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Margen de corte -->
        <q-card-section>
          <div class="text-subtitle1 text-weight-bolder text-grey-10 q-mb-md">Dejar de emitir turnos nuevos (minutos antes del cierre)</div>
          <q-select
            v-model="margenCorte"
            :options="[0, 5, 10, 15, 20, 30]"
            dense
            outlined
            style="max-width: 220px;" 
            :option-label="(val) => `${val} min antes`"
          >
            <template v-slot:selected>
              {{ margenCorte }} min antes
            </template>
          </q-select>
        </q-card-section>

        <q-separator />

        <!-- Indicador de concurrencia -->
        <q-card-section>
          <div class="text-subtitle1 text-weight-bolder text-grey-10 q-mb-md">Indicador de concurrencia</div>

          <div class="row items-center q-gutter-x-sm q-mb-xs">
            <div class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs" style="width: 140px;">Poco concurrido:</div>
            <span class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs">Hasta</span>
            <q-input 
            v-model.number="umbralPocoConcurrido" 
            type="number" 
            dense 
            outlined 
            style="width: 90px;" 
            min="0" 
            max="9999"
            @keydown="bloquearSimbolos"
            :rules="[
              val => val >= 0 || 'No puede ser menor a 0',
              val => val <= 9999 || 'El valor es demasiado alto'
            ]" 
                      />
            <span class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs">personas</span>
          </div>

          <div class="row items-center q-gutter-x-sm q-mb-xs">
            <div class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs" style="width: 140px;">Concurrido:</div>
            <span class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs">Hasta</span>
            <q-input v-model.number="umbralConcurrido" type="number" dense outlined style="width: 90px;" min="0" 
            max="9999"
            :rules="[
              val => val >= 0 || 'No puede ser menor a 0',
              val => val <= 9999 || 'El valor es demasiado alto'
            ]" 
            />
            <span class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs">personas</span>
          </div>

          <div class="text-caption text-grey-7">
            Muy concurrido: más de {{ umbralConcurrido }} (valor automático)
          </div>

          <!-- Mensaje de error si Concurrido <= Poco concurrido -->
          <div v-if="umbralConcurrido <= umbralPocoConcurrido" class="text-caption text-negative q-mt-xs">
            "Concurrido" debe ser mayor que "Poco concurrido"
          </div>
        </q-card-section>

        <q-separator />

        <!-- Tope de emisión diaria de turnos -->
        <q-card-section class="q-py-sm">
          <div class="text-subtitle1 text-weight-bolder text-grey-10 q-mb-sm">Tope de emisión diaria</div>
          <div class="row items-center q-gutter-x-sm">
            <q-input
              v-model.number="topeEmisionDiaria"
              type="number"
              dense
              outlined
              style="width: 100px;"
              min = "0"
              max = "9999"
              @keydown="bloquearSimbolos"
              :rules="[
                val => val >= 0 || 'No puede ser menor a 0',
                val => val <= 9999 || 'El valor es demasiado alto'
              ]"
            />
            <span class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs">turnos</span>
          </div>
        </q-card-section>

        
        <!-- Cantidad de cajas -->
        <q-card-section class="q-py-none">
          <div class="text-subtitle1 text-weight-bolder text-grey-10 q-mb-sm">Cantidad de cajas en la sucursal</div>
          <div class="row items-center q-mb-md">
          <q-input
            v-model.number="sucursalStore.cantidadCajas"
            type="number"
            dense
            outlined
            style="max-width: 150px;"
            min="1"
            @keydown="bloquearSimbolos"
            :rules="[
              val => val >= 1 || 'No puede ser menor a 1',
              val => val <= 9999 || 'El valor es demasiado alto'
            ]"
          />
          </div>
        </q-card-section>

        <!-- excepciones -->
        <q-card-section class="q-py-none">
          <div class="text-subtitle1 text-weight-bolder text-grey-10 q-mb-sm">Feriados/días cerrados</div>

          <div class="row items-center q-gutter-x-sm q-mb-sm">
            <q-input v-model="nuevaFechaExcepcion" type="date" dense outlined style="width: 180px;" />
            <q-btn label="Agregar" color="primary" unelevated dense @click="agregarExcepcion" />
          </div>

          <!-- Una fila por cada excepción ya cargada -->
          <div v-for="fecha in excepciones" :key="fecha" class="row items-center justify-between bg-red-1 text-red-9 q-pa-sm q-mb-xs" style="border-radius: 20px;">
            <span>{{ fecha }}</span>
            <q-btn flat round dense icon="close" color="red-9" @click="quitarExcepcion(fecha)" />
          </div>
        </q-card-section>

        <q-card-actions class="q-pa-md">
           <q-btn 
           label="Guardar" 
           color="primary" 
           unelevated 
           rounded
           class="full-width" 
           @click="guardarHorarios" />
        </q-card-actions>

      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useSucursalStore } from '../../stores/sucursal-store'
import { ref } from 'vue'

const sucursalStore = useSucursalStore()

const horarios = ref([
  { dia: 'Lunes', atiende: true, desde: '09:00', hasta: '17:00' },
  { dia: 'Martes', atiende: true, desde: '09:00', hasta: '17:00' },
  { dia: 'Miércoles', atiende: true, desde: '09:00', hasta: '17:00' },
  { dia: 'Jueves', atiende: true, desde: '09:00', hasta: '17:00' },
  { dia: 'Viernes', atiende: true, desde: '09:00', hasta: '17:00' },
  { dia: 'Sábado', atiende: true, desde: '09:00', hasta: '13:00' },
  { dia: 'Domingo', atiende: false, desde: '09:00', hasta: '17:00' }
])

const margenCorte = ref(15) // margen de corte en minutos, para el turno actual

// Umbrales de concurrencia
const umbralPocoConcurrido = ref(10)
const umbralConcurrido = ref(20)

//tope de emisión diaria de turnos, para que no se emitan más de cierta cantidad por día
const topeEmisionDiaria = ref(100)

// excepciones de fechas en las que el local no atiende, por ejemplo feriados
const nuevaFechaExcepcion = ref('')
const excepciones = ref(['2026-08-25'])

const agregarExcepcion = () => {
  if (nuevaFechaExcepcion.value) {
    excepciones.value.push(nuevaFechaExcepcion.value)
    nuevaFechaExcepcion.value = ''
  }
}

const quitarExcepcion = (fecha) => {
  excepciones.value = excepciones.value.filter(f => f !== fecha)
}

// bloquear caracteres especiales
const bloquearSimbolos = (event) => {
  if (['-','_','.', ',', 'e', 'E'].includes(event.key)) {
    event.preventDefault()
  }
}

</script>

<style scoped>

:deep(.q-field--outlined .q-field__control) {
  border-radius: 15px !important;
  border-color: #636868;
}

:deep(.q-field__native) {
  font-size: 15px !important;
  font-weight: 600 !important;
  color: #4b4a4a !important;
}

.row.items-center {
  padding-left: 12px;
}

</style>