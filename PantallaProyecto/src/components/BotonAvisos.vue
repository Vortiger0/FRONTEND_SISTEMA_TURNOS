<template>
  <div>
     
   <!-- <div>PRUEBA: {{ diag }}</div> -->
    
    <div v-if="!soportado">
      <q-banner rounded class="bg-grey-3 text-grey-8 radius-12">
        <template #avatar>
          <q-icon name="notifications_off" color="grey-7" />
        </template>
        <div class="text-caption text-weight-bold">
          Este navegador no permite recibir avisos.
        </div>
      </q-banner>
    </div>

    <div v-else>
      <q-banner v-if="estado === 'activo'" rounded class="bg-green-1 text-positive radius-12">
        <template #avatar>
          <q-icon name="notifications_active" color="positive" />
        </template>
        <div class="text-caption text-weight-bold">
          Avisos activados: te notificaremos cuando se acerque tu turno.
        </div>
        <template #action>
          <q-btn flat dense no-caps color="grey-8" label="Desactivar" :loading="cargando" @click="desactivar" />
        </template>
      </q-banner>

      <q-banner v-else-if="estado === 'bloqueado'" rounded class="bg-orange-1 text-orange-9 radius-12">
        <template #avatar>
          <q-icon name="notifications_off" color="orange-9" />
        </template>
        <div class="text-caption text-weight-bold">
          Bloqueaste las notificaciones. Habilitalas desde el candado de la barra de direcciones
          y recargá la página.
        </div>
      </q-banner>

      <q-banner v-else rounded class="bg-blue-1 text-primary radius-12">
        <template #avatar>
          <q-icon name="notifications" color="primary" />
        </template>
        <div class="text-caption text-weight-bold">
          Activá los avisos y te notificamos cuando falten pocos turnos para el tuyo.
        </div>
        <template #action>
          <q-btn unelevated no-caps color="primary" label="Activar avisos" :loading="cargando" @click="activar" />
        </template>
      </q-banner>
    </div>
  </div>
</template>
 
<script setup lang="ts">

import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth-store'
import {
  soportaPush,
  hayDispositivoSuscripto,
  activarAvisos,
  desactivarAvisos,
} from '../utils/push'
 
const $q = useQuasar()
const authStore = useAuthStore()
 
const soportado = soportaPush()
const estado = ref<'inactivo' | 'activo' | 'bloqueado'>('inactivo')
const cargando = ref(false)
 
const diag = JSON.stringify({
  seguro: window.isSecureContext,
  sw: 'serviceWorker' in navigator,
  pm: 'PushManager' in window,
  n: 'Notification' in window,
  url: location.href,
  soportaPush: soportaPush(),
  navegador: navigator.userAgent,
})

// lee el estado real del navegador
const refrescarEstado = async () => {
  if (Notification.permission === 'denied') {
    estado.value = 'bloqueado'
    return
  }
  estado.value = (await hayDispositivoSuscripto()) ? 'activo' : 'inactivo'
}
 
onMounted(async () => {
  if (!soportado) return
  await refrescarEstado()
 
  // si el dispositivo ya estaba suscripto, se re-vincula al usuario actual
  // (cubre el caso de que otra persona haya usado antes este navegador)
  if (estado.value === 'activo' && authStore.token) {
    try {
      await activarAvisos(authStore.token)
    } catch (error) {
      console.error('No se pudo re-vincular la suscripción:', error)
    }
  }
})
 
const activar = async () => {
  if (!authStore.token) return
  cargando.value = true
  try {
    const resultado = await activarAvisos(authStore.token)
    if (resultado === 'denegado') {
      $q.notify({ type: 'warning', message: 'No se dio permiso para las notificaciones' })
    } else {
      $q.notify({ type: 'positive', message: 'Avisos activados' })
    }
    await refrescarEstado()
  } catch (error) {
    console.error('Error al activar avisos:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'No se pudieron activar los avisos',
    })
  } finally {
    cargando.value = false
  }
}
 
const desactivar = async () => {
  if (!authStore.token) return
  cargando.value = true
  try {
    await desactivarAvisos(authStore.token)
    $q.notify({ type: 'info', message: 'Avisos desactivados' })
    await refrescarEstado()
  } finally {
    cargando.value = false
  }
  const diag = JSON.stringify({
  seguro: window.isSecureContext,
  sw: 'serviceWorker' in navigator,
  pm: 'PushManager' in window,
  n: 'Notification' in window,
  url: location.href,
  navegador: navigator.userAgent,
})
}
</script>
 
<style scoped>
.radius-12 { border-radius: 12px; }
</style>