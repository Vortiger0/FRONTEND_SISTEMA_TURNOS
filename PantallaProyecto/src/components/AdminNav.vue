<template>
  <!--lo que hace q-header es fijar la barra arriba de la pantalla, incluso con scroll -->
  <q-header elevated class="bg-primary text-white-9">
    <!-- lo que hace toolbar es alinear todos los elementos en una fila horizontal -->
    <q-toolbar>
      <q-toolbar-title class="text-weight-bold" style="flex: none;">
        Abitab Centro - Admin
      </q-toolbar-title>

      <q-btn flat label="Inicio" to="/admin" />
      <q-btn flat label="Horarios" to="/admin/horarios" />
      <q-btn flat label="Funcionarios" to="/admin/datosFuncionario" />
      <q-btn flat label="Datos del local" to="/admin/datos-local" />
      <q-space></q-space>
      
      <!-- Se reemplaza 'to="/login"' por el evento que abre el diálogo -->
      <q-btn flat icon="logout" @click="mostrarConfirmacion = true" />
    </q-toolbar>
  </q-header>

  <!-- DIÁLOGO DE CONFIRMACIÓN DE CERRAR SESIÓN -->
  <q-dialog v-model="mostrarConfirmacion" persistent>
    <q-card style="min-width: 300px;">
      <q-card-section class="row items-center">
        <q-avatar icon="logout" color="primary" text-color="white" size="md" />
        <span class="q-ml-sm text-subtitle1 text-weight-bold">Confirmar salida</span>
      </q-card-section>

      <q-card-section class="q-pt-none text-grey-8">
        ¿Estás seguro de que deseas cerrar sesión y salir del panel?
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
        <q-btn label="Cerrar sesión" color="negative" unelevated @click="cerrarSesion" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mostrarConfirmacion = ref(false)

const cerrarSesion = () => {
  mostrarConfirmacion.value = false
  router.push('/login')
}

</script>

<style>
</style>