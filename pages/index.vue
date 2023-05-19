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
const firstErrorMessage = computed(() => {
  if (!lastEmailResponse?.value.success && lastEmailResponse.value.data.errors) {
    const data = lastEmailResponse.value.data.errors[0]
    const key = Object.keys(data)[0]
    const value = unref(data[key])
    // format it into a string code, easier to process
    switch(`${key}.${Object.keys(value)[0]}`) {
      case 'user.invitation_token':
        return 'Invalid invitation token'
    }
  }
  return false
})
</script>

<template>
<div>
  <p>Welcome Nuxt</p>
  <form @submit.prevent="sendEmail">
    <input v-model="email" />

    <template v-if="lastEmailResponse">
    <div v-if="firstErrorMessage">
      <p>Oops like there was some errors :(</p>
      <p>{{ firstErrorMessage }}</p>
    </div>
    <p v-else>Thanks for the email!</p>
    </template>
    <button type="submit">Send email</button>
  </form>
</div>
</template>
