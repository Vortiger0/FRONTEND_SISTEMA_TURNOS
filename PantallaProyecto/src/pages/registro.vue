<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <q-page class="bg-grey-2 flex flex-center q-pa-md">
    <q-card class="shadow-3 q-pa-md" style="width: 100%; max-width: 400px;">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-bold text-grey-9">
          Registro
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <q-input
          v-model="nombre"
          label="Nombre y apellido"
          outlined
          dense
        />

        <q-input
          v-model="correo"
          label="Correo"
          type="email"
          outlined
          dense
        />

        <q-input
          v-model="password"
          label="Ingresar contraseña"
          type="password"
          outlined
          dense
        />

        <q-input
          v-model="repeatPassword"
          label="Repetir contraseña"
          type="password"
          outlined
          dense
        />

        <q-btn
          label="Crearse cuenta"
          color="primary"
          unelevated
          class="full-width q-py-sm"
          to="/login"
        />
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <q-btn
          flat
          dense
          no-caps
          label="(¿Ya tienes una cuenta? Inicia aquí)"
          color="primary"
          class="text-caption"
          to="/login"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const nombre = ref('')
const correo = ref('')
const password = ref('')
const repeatPassword = ref('')

</script>