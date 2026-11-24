<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <q-page class="fondo flex flex-center q-pa-md">
    <q-card class="shadow-3 card-redondeada" style="width: 100%; max-width: 460px;">

      <!-- ENCABEZADO -->
      <q-card-section class="text-center q-pt-lg">
        <div class="text-h4 text-weight-bolder text-grey-9 q-mt-sm">
          ACTIVAR TOTEM
        </div>
        <div class="text-caption text-grey-7 q-mt-sm">
          Ingresa el código que generó el administrador de la sucursal
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <!-- Código de activación -->
        <q-input
          v-model="codigo"
          label="xxxx-xxxx"
          outlined
          dense
                >
        </q-input>

        <!-- BOTÓN DE PROCEDER -->
        <q-btn
          label="ACTIVAR"
          color="primary"
          unelevated
          class="full-width q-py-sm text-bold"
          style="border-radius: 10px;"
          :loading="cargando"
          @click="activarTotem"
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

const codigo = ref('')
const cargando = ref(false)

const activarTotem = async () => {
  if (!codigo.value) {
    $q.notify({ type: 'warning', message: 'Por favor ingresa el código' })
    return
  }

  cargando.value = true

 // try {
//  const response = await fetch('/api/auth/activar-totem', {
 //     method: 'POST',
//      headers: {
 //       'Content-Type': 'application/json'
 //     },
  //    body: JSON.stringify({
 //       codigo: codigo.value
 //     })
 //   })

 //   const data = await response.json()

 //   if (!response.ok) {
 //     $q.notify({ type: 'negative', message: data.error || 'Error al procesar la solicitud' })
  //    return
 //   }

  //  $q.notify({ type: 'positive', message: data.mensaje || 'Totem activado correctamente' })
//    router.push('/login')

//  } catch (error) {
//    console.error('Error de red:', error)
//    $q.notify({ type: 'negative', message: 'No se pudo conectar con el servidor' })
//  } finally {
//    cargando.value = false
//  }
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

:deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
  border-color: #636868;
}
</style>