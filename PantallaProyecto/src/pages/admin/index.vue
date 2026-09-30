<template>
  <!-- q-pa-md le da un padding parejo a toda la página -->
  <q-page class="bg-grey-2 q-pa-md flex justify-center flex-center q-pt-xl">

    <!-- row + q-col-gutter-md: acomoda las 3 tarjetas en fila,
         con un espacio parejo entre ellas -->
    <div class="row q-col-gutter-md">

      <!-- Cada tarjeta ocupa una columna. col-4 = un tercio del ancho,
           así entran las 3 en la misma fila -->
      <div class="col-4">
        <q-card class="card-redondeada shadow-2 text-center q-pa-lg" style="min-width: 400px;">
          <div class="text-caption text-weight-bold text-grey-10 q-mt-xs">Turnos hoy</div> 
          <div class="text-h2 text-weight-bold text-primary">
            {{ turnosHoy }}
          </div>
        </q-card>
      </div> 

      <div class="col-4">
        <q-card class="card-redondeada shadow-2 text-center q-pa-lg " style="min-width: 400px;">
          <div class="text-caption text-weight-bold text-grey-10 q-mt-xs">Número actual</div>
          <div class="text-h2 text-weight-bold text-primary">
            {{ numeroActual }}
          </div>
        </q-card>
      </div>

      <div class="col-4">
        <q-card class="card-redondeada shadow-2 text-center q-pa-lg" style="min-width: 400px;">
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
import { ref, computed } from 'vue'

// Datos simulados del panel (más adelante vendrían del backend real)
const turnosHoy = ref(38)
const numeroActual = ref(45)
const estadoLocal = ref('Abierto')

// El color del texto cambia según el estado, para que se note
// "Abierto" en verde y "Cerrado" en rojo
const colorEstado = computed(() => {
  return estadoLocal.value === 'Abierto' ? 'text-positive' : 'text-negative'
})
</script>

<style scoped>
.card-redondeada {
  border-radius: 20px;
}

</style>