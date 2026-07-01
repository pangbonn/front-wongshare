# Vue.js PWA with DaisyUI

แอปพลิเคชัน Vue.js 3 พร้อม PWA (Progressive Web App) และ DaisyUI ที่สวยงามและใช้งานง่าย

## 🚀 ฟีเจอร์

- ✅ **Vue.js 3** - ใช้ Composition API และ TypeScript
- ✅ **PWA** - ติดตั้งเป็นแอปและใช้งานออฟไลน์ได้
- ✅ **DaisyUI** - UI components ที่สวยงามและใช้งานง่าย
- ✅ **Tailwind CSS** - Utility-first CSS framework
- ✅ **ธีม** - รองรับ light, dark, และ cupcake theme
- ✅ **Responsive** - รองรับทุกขนาดหน้าจอ
- ✅ **TypeScript** - Type safety และ IntelliSense

## 📋 ความต้องการของระบบ

- Node.js 20.19+ หรือ 22.12+
- npm หรือ yarn

## 🛠️ การติดตั้ง

### 1. สร้างโปรเจกต์ Vue.js

```bash
# สร้างโปรเจกต์ Vue.js ใหม่
npm create vite@latest vue-pwa-app -- --template vue-ts
cd vue-pwa-app
```

### 2. ติดตั้ง dependencies พื้นฐาน

```bash
# ติดตั้ง dependencies ที่จำเป็น
npm install
```

### 3. ติดตั้ง PWA plugin

```bash
# ติดตั้ง vite-plugin-pwa และ workbox
npm install -D vite-plugin-pwa workbox-window
```

### 4. ติดตั้ง Tailwind CSS และ DaisyUI

```bash
# ติดตั้ง Tailwind CSS, PostCSS, Autoprefixer และ DaisyUI
npm install -D tailwindcss postcss autoprefixer daisyui
```

### 5. ตั้งค่า Tailwind CSS

```bash
# สร้างไฟล์ config
npx tailwindcss init -p
```

หรือสร้างไฟล์ `tailwind.config.js` ด้วยตนเอง:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
}
```

### 6. ตั้งค่า PostCSS

สร้างไฟล์ `postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 7. ตั้งค่า Vite สำหรับ PWA

แก้ไขไฟล์ `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Vue PWA App',
        short_name: 'VuePWA',
        description: 'Vue.js PWA with DaisyUI',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'vite.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
})
```

### 8. ตั้งค่า CSS

แก้ไขไฟล์ `src/style.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 9. ตั้งค่า PWA Service Worker

แก้ไขไฟล์ `src/main.ts`:

```typescript
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('มีเวอร์ชันใหม่ของแอป คุณต้องการรีเฟรชเพื่ออัปเดตหรือไม่?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('แอปพร้อมใช้งานแบบออฟไลน์')
  },
})

createApp(App).mount('#app')
```

### 10. ตั้งค่า HTML

แก้ไขไฟล์ `index.html`:

```html
<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue PWA App</title>
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#ffffff" />
    <meta name="description" content="Vue.js PWA with DaisyUI" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### 11. สร้าง PWA Manifest

สร้างไฟล์ `public/manifest.json`:

```json
{
  "name": "Vue PWA App",
  "short_name": "VuePWA",
  "description": "Vue.js PWA with DaisyUI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ffffff",
  "icons": [
    {
      "src": "vite.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

## 🎨 สร้าง UI ด้วย DaisyUI

ตัวอย่างการสร้าง UI ที่สวยงามด้วย DaisyUI:

```vue
<template>
  <div class="min-h-screen bg-base-100">
    <!-- Navigation -->
    <div class="navbar bg-base-200 shadow-lg">
      <div class="navbar-start">
        <a class="btn btn-ghost text-xl">Vue PWA</a>
      </div>
      <div class="navbar-end">
        <button @click="toggleTheme" class="btn btn-ghost btn-circle">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Hero Section -->
      <div class="hero min-h-[60vh] bg-base-200 rounded-lg">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">Vue.js PWA</h1>
            <p class="py-6 text-lg">
              แอปพลิเคชัน Vue.js พร้อม PWA และ DaisyUI ที่สวยงามและใช้งานง่าย
            </p>
            <button @click="count++" class="btn btn-primary">
              คลิกที่นี่! ({{ count }})
            </button>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Vue.js 3</h2>
            <p>ใช้ Vue.js 3 พร้อม Composition API และ TypeScript</p>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">PWA</h2>
            <p>รองรับการติดตั้งเป็นแอปและใช้งานแบบออฟไลน์</p>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">DaisyUI</h2>
            <p>UI components ที่สวยงามและใช้งานง่าย</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const theme = ref('light')

const themes = ['light', 'dark', 'cupcake']

const toggleTheme = () => {
  const currentIndex = themes.indexOf(theme.value)
  const nextIndex = (currentIndex + 1) % themes.length
  theme.value = themes[nextIndex]
  document.documentElement.setAttribute('data-theme', theme.value)
}

// ตั้งค่า theme เริ่มต้น
document.documentElement.setAttribute('data-theme', theme.value)
</script>
```

## 🚀 การรันแอป

```bash
# รันแอปในโหมด development
npm run dev

# Build สำหรับ production
npm run build

# Preview production build
npm run preview
```

## 📱 การใช้งาน PWA

1. เปิดเบราว์เซอร์ไปที่ `http://localhost:5173/`
2. คลิกปุ่ม "ติดตั้งแอป" ใน address bar
3. แอปจะถูกติดตั้งและสามารถใช้งานได้แบบออฟไลน์

## 🎨 ธีมที่รองรับ

- **Light** - ธีมสว่าง
- **Dark** - ธีมมืด
- **Cupcake** - ธีมสีชมพู

## 🔧 การแก้ไขปัญหา

### PostCSS Error
หากพบ error เกี่ยวกับ PostCSS:

```bash
# ลบ node_modules และ package-lock.json
rm -rf node_modules package-lock.json

# ติดตั้งใหม่
npm install
```

### Tailwind CSS ไม่ทำงาน
ตรวจสอบว่าไฟล์ `tailwind.config.js` และ `postcss.config.js` ถูกต้อง

### PWA ไม่ทำงาน
ตรวจสอบว่าไฟล์ `manifest.json` และ `vite.config.ts` ถูกต้อง

## 📚 เอกสารเพิ่มเติม

- [Vue.js 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [DaisyUI Documentation](https://daisyui.com/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## 🤝 การมีส่วนร่วม

1. Fork โปรเจกต์
2. สร้าง feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📄 License

โปรเจกต์นี้ใช้ MIT License - ดูรายละเอียดในไฟล์ [LICENSE](LICENSE)

## 👨‍💻 ผู้พัฒนา

สร้างด้วย ❤️ โดยใช้ Vue.js, PWA, และ DaisyUI

---

**หมายเหตุ:** โปรเจกต์นี้เหมาะสำหรับการเรียนรู้และพัฒนาแอปพลิเคชัน Vue.js พร้อม PWA และ DaisyUI