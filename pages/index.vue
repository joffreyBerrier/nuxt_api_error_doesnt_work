<script setup>
import { ref } from 'vue';

const { $api } = useNuxtApp();

const email = ref('test@nuxt.com');
const success = ref({});
const error = ref({});

const sendEmail = async () => {
  await $api.v1.auth
    .invitationData(email.value)
    .then((res) => {
      success.value = res;
    })
    .catch((err) => {
      error.value = err;
    });
};

// If I call this function in the setup, I have this error : data.toJSON is not a function
// sendEmail()
</script>

<template>
  <div>
    <p>Welcome Nuxt</p>
    <input v-model="email" />

    <p>{{ success }}</p>
    <p>{{ error }}</p>

    <button @click="sendEmail">Send email</button>
  </div>
</template>
