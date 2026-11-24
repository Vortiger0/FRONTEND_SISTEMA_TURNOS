<route lang="yaml">
meta:
  requiereAuth: true
  roles: ["ADMIN"]
</route>

<template>
  <q-page class="fondo flex q-pa-lg">
    <div class="contenedor-totem q-mx-auto q-py-md" style="width: 100%; max-width: 1040px;">
      <!-- Título principal -->
      <div class="text-h4 text-weight-bold text-white q-mb-lg">
        Tótem
      </div>

      <!-- Estado de carga -->
      <div v-if="cargando" class="row justify-center q-my-xl">
        <q-spinner color="white" size="52px" />
      </div>

      <template v-else>
        <!-- Etiqueta de estado actual -->
        <div class="q-mb-md">
          <q-badge
            color="white"
            text-color="grey-10"
            class="text-weight-bold q-px-lg q-py-sm pill-estado"
          >
            {{ etiquetaEstadoActual }}
          </q-badge>
        </div>

        <!--
          Tarjeta: Sin tótem configurado
        -->
        <q-card
          v-if="estadoTotem === 'SIN_TOTEM'"
          class="shadow-5 q-pa-xl card-totem"
        >
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h5 text-weight-bold text-grey-10">
              Tótem de la sucursal
            </div>
            <q-chip
              size="md"
              color="grey-3"
              text-color="grey-8"
              class="text-weight-bold q-px-md q-py-xs"
            >
              Sin tótem
            </q-chip>
          </div>

          <div class="text-h6 text-weight-regular text-grey-8 q-mb-xl">
            Esta sucursal todavía no tiene un tótem habilitado.
          </div>

          <q-btn
            unelevated
            color="primary"
            label="GENERAR CÓDIGO DE ACTIVACIÓN"
            class="text-weight-bold text-subtitle1 q-px-xl q-py-md boton-redondeado"
            :loading="procesando"
            @click="generarCodigo(false)"
          />
        </q-card>

        <!--
          Tarjeta: Esperando activación o código vencido
        -->
        <q-card
          v-else-if="estadoTotem === 'ESPERANDO_ACTIVACION'"
          class="shadow-5 q-pa-xl card-totem"
        >
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h5 text-weight-bold text-grey-10">
              Tótem de la sucursal
            </div>

            <q-chip
              v-if="!codigoVencido"
              size="md"
              color="amber-2"
              text-color="amber-10"
              class="text-weight-bold q-px-md q-py-xs"
            >
              Esperando activación
            </q-chip>
            <q-chip
              v-else
              size="md"
              color="negative"
              text-color="white"
              class="text-weight-bold q-px-md q-py-xs"
            >
              Código vencido
            </q-chip>
          </div>

          <div class="text-h6 text-weight-regular text-grey-9 q-mb-xs">
            Código generado {{ infoTotem.generadoTexto || 'el 22/11 a las 21:00' }}.
          </div>
          <div class="text-h6 text-weight-regular text-grey-9 q-mb-lg">
            Vence {{ infoTotem.venceTexto || 'el 23/11 a las 21:00' }}.
          </div>

          <div class="text-subtitle1 text-weight-regular text-grey-7 q-mb-xl">
            El código no se vuelve a mostrar. Si ya venció, la etiqueta pasa a (Código vencido) en rojo.
          </div>

          <div class="row q-gutter-md">
            <q-btn
              outline
              color="primary"
              label="GENERAR CÓDIGO NUEVO"
              class="text-weight-bold text-subtitle1 q-px-lg q-py-sm boton-redondeado"
              :loading="procesando"
              @click="generarCodigo(false)"
            />
            <q-btn
              outline
              color="negative"
              label="CANCELAR"
              class="text-weight-bold text-subtitle1 q-px-lg q-py-sm boton-redondeado"
              :loading="procesando"
              @click="cancelarCodigoPendiente"
            />
          </div>
        </q-card>

        <!--
          Tarjeta: Activo
        -->
        <q-card
          v-else-if="estadoTotem === 'ACTIVO'"
          class="shadow-5 q-pa-xl card-totem"
        >
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h5 text-weight-bold text-grey-10">
              Tótem de la sucursal
            </div>
            <q-chip
              size="md"
              color="green-2"
              text-color="green-10"
              class="text-weight-bold q-px-md q-py-xs"
            >
              Activo
            </q-chip>
          </div>

          <div class="text-h6 text-weight-regular text-grey-9 q-mb-xs">
            Activo desde {{ infoTotem.activoDesdeTexto || 'el 22/11' }}.
          </div>
          <div class="text-h6 text-weight-regular text-grey-9 q-mb-lg">
            Último uso: {{ infoTotem.ultimoUsoTexto || 'hoy 14:32' }}.
          </div>

          <div class="text-subtitle1 text-weight-regular text-grey-7 q-mb-xl">
            «Generar código nuevo» sirve para cambiar de equipo: el dispositivo actual deja de funcionar.
          </div>

          <q-btn
            outline
            color="primary"
            label="GENERAR CÓDIGO NUEVO"
            class="text-weight-bold text-subtitle1 q-px-lg q-py-sm boton-redondeado"
            :loading="procesando"
            @click="confirmarCambioEquipo"
          />
        </q-card>
      </template>

      <!--
        Ventana emergente: Código de activación generado
      -->
      <q-dialog v-model="modalCodigoVisible" persistent>
        <q-card class="card-totem q-pa-lg" style="min-width: 380px; max-width: 480px;">
          <q-card-section class="row items-center justify-between q-pb-sm">
            <div class="text-h6 text-weight-bold text-grey-10">
              Código de activación generado
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="text-center q-py-md">
            <div class="text-body1 text-grey-7 q-mb-md">
              Ingresá este código en el dispositivo del tótem. No se volverá a mostrar al cerrar esta ventana.
            </div>
            <div class="codigo-box q-pa-lg q-my-md text-h4 text-weight-bold text-primary">
              {{ codigoGeneradoActual }}
            </div>
            <q-btn
              flat
              icon="content_copy"
              color="primary"
              label="Copiar código"
              class="q-mt-sm text-weight-bold text-subtitle1"
              @click="copiarCodigo"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              unelevated
              color="primary"
              label="ENTENDIDO"
              class="text-weight-bold q-px-lg q-py-xs boton-redondeado"
              v-close-popup
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { useAuthStore } from '../../stores/auth-store'

const $q = useQuasar()
const authStore = useAuthStore()

// Estados posibles: 'SIN_TOTEM' | 'ESPERANDO_ACTIVACION' | 'ACTIVO'
const estadoTotem = ref('SIN_TOTEM')
const cargando = ref(false)
const procesando = ref(false)

const modalCodigoVisible = ref(false)
const codigoGeneradoActual = ref('')

const infoTotem = ref({
  generadoEn: null,
  venceEn: null,
  activoDesde: null,
  ultimoUso: null,
  generadoTexto: '',
  venceTexto: '',
  activoDesdeTexto: '',
  ultimoUsoTexto: ''
})

const codigoVencido = computed(() => {
  if (!infoTotem.value.venceEn) return false
  return new Date(infoTotem.value.venceEn).getTime() < Date.now()
})

const etiquetaEstadoActual = computed(() => {
  if (estadoTotem.value === 'SIN_TOTEM') return 'Sin tótem configurado'
  if (estadoTotem.value === 'ESPERANDO_ACTIVACION') return 'Esperando activación'
  return 'Activo'
})

const getHeaders = () => {
  const token = authStore.token || localStorage.getItem('token') || ''
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

const formatearFechaCorta = (fechaIso) => {
  if (!fechaIso) return ''
  const fecha = new Date(fechaIso)
  if (Number.isNaN(fecha.getTime())) return ''
  const dia = String(fecha.getDate()).padStart(2, '0')
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const horas = String(fecha.getHours()).padStart(2, '0')
  const minutos = String(fecha.getMinutes()).padStart(2, '0')
  return `el ${dia}/${mes} a las ${horas}:${minutos}`
}

const formatearDiaMes = (fechaIso) => {
  if (!fechaIso) return ''
  const fecha = new Date(fechaIso)
  if (Number.isNaN(fecha.getTime())) return ''
  const dia = String(fecha.getDate()).padStart(2, '0')
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  return `el ${dia}/${mes}`
}

const normalizarEstado = (data) => {
  const rawEstado = String(data?.estado || '').toUpperCase()
  if (rawEstado === 'ACTIVO' || data?.activo === true) {
    estadoTotem.value = 'ACTIVO'
  } else if (rawEstado === 'ESPERANDO_ACTIVACION' || rawEstado === 'PENDIENTE' || data?.codigoPendiente) {
    estadoTotem.value = 'ESPERANDO_ACTIVACION'
  } else {
    estadoTotem.value = 'SIN_TOTEM'
  }

  infoTotem.value = {
    generadoEn: data?.generadoEn || data?.creadoEn || null,
    venceEn: data?.venceEn || data?.expiraEn || null,
    activoDesde: data?.activoDesde || data?.activadoEn || null,
    ultimoUso: data?.ultimoUso || null,
    generadoTexto: formatearFechaCorta(data?.generadoEn || data?.creadoEn),
    venceTexto: formatearFechaCorta(data?.venceEn || data?.expiraEn),
    activoDesdeTexto: formatearDiaMes(data?.activoDesde || data?.activadoEn),
    ultimoUsoTexto: data?.ultimoUso ? formatearFechaCorta(data.ultimoUso).replace(/^el /, '') : ''
  }
}

const cargarEstadoTotem = async () => {
  cargando.value = true
  try {
    const response = await fetch('/api/admin/totem', {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    normalizarEstado(data)
  } catch (error) {
    console.error('Error al cargar estado del tótem:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo obtener el estado del tótem'
    })
  } finally {
    cargando.value = false
  }
}

const generarCodigo = async (esCambioActivo = false) => {
  procesando.value = true
  try {
    const endpoint = esCambioActivo
      ? '/api/admin/totem/regenerar'
      : '/api/admin/totem/codigo'

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    codigoGeneradoActual.value = data?.codigo || data?.codigoActivacion || '------'
    modalCodigoVisible.value = true

    await cargarEstadoTotem()
  } catch (error) {
    console.error('Error al generar código:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo generar el código de activación'
    })
  } finally {
    procesando.value = false
  }
}

const confirmarCambioEquipo = () => {
  $q.dialog({
    title: 'Cambiar equipo del tótem',
    message: 'Si generás un código nuevo, el dispositivo del tótem actual dejará de funcionar y el estado pasará a «Esperando activación». ¿Deseás continuar?',
    cancel: {
      label: 'CANCELAR',
      flat: true
    },
    ok: {
      label: 'GENERAR CÓDIGO NUEVO',
      color: 'primary',
      unelevated: true
    },
    persistent: true
  }).onOk(() => {
    generarCodigo(true)
  })
}

const cancelarCodigoPendiente = async () => {
  procesando.value = true
  try {
    const response = await fetch('/api/admin/totem/codigo', {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    })

    if (response.status === 409) {
      $q.notify({
        type: 'info',
        message: 'El tótem ya fue activado. Actualizando estado...'
      })
      await cargarEstadoTotem()
      return
    }

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    await cargarEstadoTotem()
  } catch (error) {
    console.error('Error al cancelar código pendiente:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo cancelar el código pendiente'
    })
  } finally {
    procesando.value = false
  }
}

const copiarCodigo = async () => {
  if (!codigoGeneradoActual.value) return
  try {
    await copyToClipboard(codigoGeneradoActual.value)
    $q.notify({
      type: 'positive',
      message: 'Código copiado al portapapeles'
    })
  } catch {
    $q.notify({
      type: 'warning',
      message: 'No se pudo copiar automáticamente'
    })
  }
}

onMounted(() => {
  cargarEstadoTotem()
})
</script>

<style scoped>
.fondo {
  background: linear-gradient(to bottom, #3993fa, #1c4779);
  min-height: 100vh;
}

.card-totem {
  border-radius: 22px;
  min-height: 300px;
  background-color: #ffffff;
}

.pill-estado {
  border-radius: 999px;
  font-size: 14px;
}

.boton-redondeado {
  border-radius: 10px;
}

.codigo-box {
  background-color: #eef5ff;
  border: 1px dashed #1967d2;
  border-radius: 14px;
  letter-spacing: 5px;
}
</style>