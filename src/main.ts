import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuth } from './composables/useAuth'
// import { registerSW } from 'virtual:pwa-register'

// const updateSW = registerSW({
//   onNeedRefresh() {
//     // แสดงการแจ้งเตือนให้ผู้ใช้ทราบว่ามีการอัปเดต
//     if (confirm('มีเวอร์ชันใหม่ของแอป คุณต้องการรีเฟรชเพื่ออัปเดตหรือไม่?')) {
//       updateSW(true)
//     }
//   },
//   onOfflineReady() {
//     console.log('แอปพร้อมใช้งานแบบออฟไลน์')
//   },
// })

const app = createApp(App)

// Initialize authentication
const { initAuth } = useAuth()
initAuth()

app.use(router).mount('#app')
