import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
//import 'primevue/resources/themes/aura-light-noir/theme.css'
import 'primevue/resources/themes/lara-light-pink/theme.css'

const app = createApp(App)

app.use(PrimeVue).mount('#app')
