<template>
  <q-page class="bg-grey-2 q-pa-md flex justify-center">
    <div style="width: 100%; max-width: 520px;">

      <!-- Tarjeta principal refinada con esquinas redondeadas -->
      <q-card class="shadow-3 radius-16 overflow-hidden bg-white">
        
        <!-- Cabecera de la sección -->
        <q-card-section class="flex items-center justify-between q-pa-lg border-bottom">
          <div>
            <div class="text-h5 text-weight-bolder text-grey-10">
              Funcionarios
            </div>
            <div class="text-subtitle2 text-weight-bold text-grey-8">
              Gestión del personal y cajas asignadas
            </div>
          </div>

          <q-btn
            color="primary"
            unelevated
            no-caps
            class="btn-action text-weight-bold"
            @click="abrirNuevo"
          >
            <div class="flex items-center q-gutter-x-xs">
              <q-icon name="add" size="20px" />
              <span>Agregar</span>
            </div>
          </q-btn>
        </q-card-section>

        <!-- Lista de funcionarios refinada con etiquetas de alto contraste -->
        <q-list separator class="q-py-xs">
          <q-item
            v-for="funcionario in funcionarios"
            :key="funcionario.usuario"
            class="q-py-md q-px-lg"
          >
            <q-item-section avatar>
              <q-avatar color="blue-1" text-color="primary" icon="person" font-size="24px" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1 text-weight-bolder text-grey-10">
                {{ funcionario.nombre }}
              </q-item-label>
              
              <q-item-label class="text-body2 text-weight-bold text-grey-8 flex items-center gap-1 q-mt-xs">
                <q-chip
                  dense
                  color="grey-3"
                  text-color="grey-10"
                  class="text-weight-bold q-px-sm"
                  size="12px"
                >
                  Caja {{ funcionario.caja }}
                </q-chip>
                <span class="text-grey-7 q-ml-xs">{{ funcionario.usuario }}</span>
              </q-item-label>
            </q-item-section>

            <!-- Botones de edición y eliminación bien definidos -->
            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="primary"
                  @click="abrirEdicion(funcionario)"
                >
                  <q-tooltip>Editar funcionario</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click="eliminarFuncionario(funcionario)"
                >
                  <q-tooltip>Eliminar funcionario</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

      </q-card>
    </div>

    <!-- Ventana de diálogo moderna -->
    <q-dialog v-model="mostrarDialogo" persistent>
      <q-card style="width: 100%; max-width: 440px;" class="radius-16 q-pa-sm">

        <q-card-section class="q-pb-xs">
          <div class="text-h6 text-weight-bolder text-grey-10">
            {{ funcionarioEditando ? 'Editar funcionario' : 'Nuevo funcionario' }}
          </div>
          <div class="text-caption text-weight-bold text-grey-8">
            {{ funcionarioEditando ? 'Modifica las credenciales o caja' : 'Ingresa los datos para dar de alta' }}
          </div>
        </q-card-section>

        <!-- Formulario accesible y con alto contraste -->
        <q-card-section class="q-gutter-y-md q-pt-md">
          <q-input
            v-model="nuevoNombre"
            label="Nombre y apellido"
            outlined
            dense
            color="primary"
            label-color="grey-9"
            input-class="text-weight-bold text-grey-10 text-body1"
          >
            <template #prepend>
              <q-icon name="badge" color="primary" size="22px" />
            </template>
          </q-input>

          <q-input
            v-model="nuevoUsuario"
            label="Usuario de acceso"
            outlined
            dense
            color="primary"
            label-color="grey-9"
            input-class="text-weight-bold text-grey-10 text-body1"
          >
            <template #prepend>
              <q-icon name="alternate_email" color="primary" size="22px" />
            </template>
          </q-input>

          <q-input
            v-model="nuevaContra"
            label="Contraseña"
            :type="verContra ? 'text' : 'password'"
            outlined
            dense
            color="primary"
            label-color="grey-9"
            input-class="text-weight-bold text-grey-10 text-body1"
          >
            <template #prepend>
              <q-icon name="lock" color="primary" size="22px" />
            </template>
            <template #append>
              <q-icon
                :name="verContra ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                color="grey-7"
                @click="verContra = !verContra"
              />
            </template>
          </q-input>

          <q-select
            v-model="nuevaCaja"
            :options="opcionesCajas"
            label="Caja asignada"
            outlined
            dense
            color="primary"
            label-color="grey-9"
            popup-content-class="text-weight-bold"
            options-selected-class="text-primary text-weight-bolder"
          >
            <template #prepend>
              <q-icon name="point_of_sale" color="primary" size="22px" />
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right" class="q-pt-sm q-pb-md q-px-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-8"
            no-caps
            class="text-weight-bold"
            v-close-popup
            @click="limpiarFormulario"
          />
          <q-btn
            :label="funcionarioEditando ? 'Guardar' : 'Crear'"
            color="primary"
            unelevated
            no-caps
            class="btn-submit text-weight-bolder q-px-md"
            @click="agregarFuncionario"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useSucursalStore } from '../../stores/sucursal-store'
import { ref, computed } from 'vue'

const sucursalStore = useSucursalStore()

const funcionarios = ref([
  { nombre: 'Lucía Fernández', usuario: '@lucia.fernandez', caja: 1, contra: '1234' },
  { nombre: 'Martín Souza', usuario: '@martin.souza', caja: 2, contra: '1234' }
])

const mostrarDialogo = ref(false)
const verContra = ref(false)

const nuevoNombre = ref('')
const nuevoUsuario = ref('')
const nuevaCaja = ref(null)
const nuevaContra = ref('')

const funcionarioEditando = ref(null)

const opcionesCajas = computed(() => {
  const total = sucursalStore.cantidadCajas || 4
  return Array.from({ length: total }, (_, i) => i + 1)
})

const abrirNuevo = () => {
  limpiarFormulario()
  mostrarDialogo.value = true
}

const abrirEdicion = (funcionario) => {
  funcionarioEditando.value = funcionario
  nuevoNombre.value = funcionario.nombre
  nuevoUsuario.value = funcionario.usuario
  nuevaContra.value = funcionario.contra || ''
  nuevaCaja.value = funcionario.caja
  mostrarDialogo.value = true
}

const limpiarFormulario = () => {
  nuevoNombre.value = ''
  nuevoUsuario.value = ''
  nuevaCaja.value = null
  nuevaContra.value = ''
  funcionarioEditando.value = null
  verContra.value = false
}

const agregarFuncionario = () => {
  if (funcionarioEditando.value) {
    funcionarioEditando.value.nombre = nuevoNombre.value
    funcionarioEditando.value.usuario = nuevoUsuario.value
    funcionarioEditando.value.caja = nuevaCaja.value
    funcionarioEditando.value.contra = nuevaContra.value
  } else {
    funcionarios.value.push({
      nombre: nuevoNombre.value,
      usuario: nuevoUsuario.value,
      caja: nuevaCaja.value,
      contra: nuevaContra.value
    })
  }

  limpiarFormulario()
  mostrarDialogo.value = false
}

const eliminarFuncionario = (funcionario) => {
  funcionarios.value = funcionarios.value.filter(f => f !== funcionario)
}
</script>

<style scoped>
.radius-16 {
  border-radius: 16px;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.btn-action {
  border-radius: 10px;
  height: 40px;
  padding: 0 16px;
}

.btn-submit {
  border-radius: 10px;
  height: 42px;
  font-size: 15px;
}

/* Tipografía e intensidad reforzada en inputs */
:deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
  border-color: #b0b0b0;
}

:deep(.q-field__label) {
  font-weight: 700 !important;
  font-size: 15px !important;
}

:deep(.q-field__native) {
  font-size: 15px !important;
  font-weight: 600 !important;
  color: #1a1a1a !important;
}
</style>