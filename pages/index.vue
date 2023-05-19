<script setup>
import { ref } from 'vue';

const { $api } = useNuxtApp();

const email = ref('test@nuxt.com');

const lastEmailResponse = ref()

const sendEmail = async () => {
  lastEmailResponse.value = await $api.v1.auth.invitationData(email.value)
};

// If I call this function in the setup, I have this error : data.toJSON is not a function
// sendEmail()
</script>

<template>
<div>
  <p>Welcome Nuxt</p>
  <form @submit.prevent="sendEmail">
    <input v-model="email" />

    <template v-if="lastEmailResponse">
    <div v-if="!lastEmailResponse.success">
      <p>Oops like there was some errors :(</p>
      <p>{{ lastEmailResponse.errorMessage }}</p>
    </div>
    <p v-else>Thanks for the email!</p>
    </template>
    <button type="submit">Send email</button>
  </form>
</div>
</template>
