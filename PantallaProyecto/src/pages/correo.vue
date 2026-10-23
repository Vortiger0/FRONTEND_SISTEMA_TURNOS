<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <q-page class="fondo flex flex-center q-pa-md">
    <q-card class="shadow-3 card-redondeada" style="width: 100%; max-width: 420px;">

      <!-- ENCABEZADO CON BOTÓN DE REGRESO -->
      <q-card-section class="q-pb-none q-pt-md q-px-md">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          color="grey-8"
          @click="router.push('/login')"
        />
      </q-card-section>

      <q-card-section class="text-center q-pt-xs">
        <q-icon name="lock_reset" color="warning" size="4rem" />
        <div class="text-h5 text-weight-bold text-grey-9 q-mt-sm">
          Correo de recuperación
        </div>
        <div class="text-caption text-grey-7 q-mt-xs">
          Ingresa tu correo
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <!-- Correo de recuperación -->
        <q-input
          v-model="correo"
          label="Ingresa tu correo"
          outlined
          dense
        >
          <template #prepend>
            <q-icon name="email" />
          </template>
        </q-input>

        <!-- BOTÓN DE PROCEDER -->
        <q-btn
          label="VERIFICAR"
          color="primary"
          unelevated
          class="full-width q-py-sm text-bold"
          style="border-radius: 10px;"
          :loading="cargando"
          @click="crearCorreo"
        />
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const correo = ref('')
const cargando = ref(false)

const crearCorreo = async () => {
  if (!correo.value) {
    $q.notify({ type: 'warning', message: 'Por favor ingresa tu correo' })
    return
  }

  cargando.value = true

  try {
    const response = await fetch('/api/auth/olvide-contrasena', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correo: correo.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      $q.notify({ type: 'negative', message: data.error || 'Error al procesar la solicitud' })
      return
    }

    $q.notify({ type: 'positive', message: data.mensaje || 'Si el correo existe, te enviamos las instrucciones' })
    router.push('/contraseña')

  } catch (error) {
    console.error('Error de red:', error)
    $q.notify({ type: 'negative', message: 'No se pudo conectar con el servidor' })
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
  min-height: 100vh;
}

.card-redondeada {
  border-radius: 20px;
  overflow: hidden;
}
</style>