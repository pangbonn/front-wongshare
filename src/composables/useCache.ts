import { ref } from 'vue'

export interface CacheData {
  id: string
  title: string
  content: string
  timestamp: number
  category: string
  author: string
  views: number
  likes: number
  imageUrl: string
}

export interface CacheStats {
  totalItems: number
  lastUpdated: number
  storageUsed: string
}

export function useCache() {
  const cacheKey = 'vue-pwa-cache'
  const cacheStatsKey = 'vue-pwa-cache-stats'
  
  // Reactive state
  const cachedData = ref<CacheData[]>([])
  const isLoading = ref(false)
  const lastRefresh = ref<number>(0)
  
  // Load data from localStorage
  const loadFromCache = (): CacheData[] => {
    try {
      const stored = localStorage.getItem(cacheKey)
      if (stored) {
        const data = JSON.parse(stored)
        cachedData.value = data
        return data
      }
    } catch (error) {
      console.error('Error loading from cache:', error)
    }
    return []
  }
  
  // Save data to localStorage
  const saveToCache = (data: CacheData[]): void => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data))
      cachedData.value = data
      updateCacheStats()
    } catch (error) {
      console.error('Error saving to cache:', error)
    }
  }
  
  // Generate sample data
  const generateSampleData = (): CacheData[] => {
    const categories = ['ข่าว', 'เทคโนโลยี', 'กีฬา', 'บันเทิง', 'สุขภาพ']
    const authors = ['สมชาย ใจดี', 'สมหญิง รักงาน', 'วิชัย เก่งมาก', 'มาลี สวยงาม', 'ประยุทธ์ ทำงาน']
    const sampleData: CacheData[] = []
    
    const newsTitles = [
      'ข่าวด่วน: ราคาน้ำมันปรับขึ้น',
      'เทคโนโลยี AI ใหม่ล่าสุด',
      'ผลการแข่งขันฟุตบอลโลก',
      'หนังใหม่ที่กำลังฮิต',
      'เคล็ดลับสุขภาพดี',
      'เศรษฐกิจไทยเติบโต',
      'สมาร์ทโฟนรุ่นใหม่',
      'กีฬาโอลิมปิก 2024',
      'ดาราเปิดตัวหนังใหม่',
      'อาหารเพื่อสุขภาพ',
      'การเมืองไทยวันนี้',
      'แอปพลิเคชันใหม่',
      'ฟุตบอลไทยลีก',
      'คอนเสิร์ตใหญ่',
      'วิตามินเสริม',
      'ตลาดหุ้นไทย',
      'เกมใหม่มาแรง',
      'กีฬาฟุตซอล',
      'ละครยอดนิยม',
      'โยคะเพื่อสุขภาพ'
    ]
    
    const newsContent = [
      'นี่คือเนื้อหาข่าวที่สำคัญและน่าสนใจ ข้อมูลนี้ถูก cache ไว้ในระบบเพื่อให้โหลดเร็วขึ้น',
      'เทคโนโลยีใหม่ที่กำลังมาแรงในปีนี้ มีการพัฒนาอย่างต่อเนื่อง',
      'ผลการแข่งขันที่สร้างความตื่นเต้นให้กับแฟนกีฬาทั่วโลก',
      'ความบันเทิงที่กำลังได้รับความนิยมจากผู้ชม',
      'เคล็ดลับการดูแลสุขภาพที่ทุกคนควรรู้',
      'สถานการณ์เศรษฐกิจที่ส่งผลกระทบต่อประชาชน',
      'นวัตกรรมใหม่ในโลกเทคโนโลยี',
      'การแข่งขันกีฬาระดับโลก',
      'ความบันเทิงที่สร้างความสุข',
      'การดูแลสุขภาพที่ถูกต้อง'
    ]
    
    for (let i = 1; i <= 20; i++) {
      sampleData.push({
        id: `news-${i}`,
        title: newsTitles[i - 1] || 'ข่าวสารทั่วไป',
        content: newsContent[Math.floor(Math.random() * newsContent.length)] || 'เนื้อหาข่าวสาร',
        timestamp: Date.now() - (i * 1000 * 60 * 30), // 30 นาทีต่อรายการ
        category: categories[Math.floor(Math.random() * categories.length)] || 'ทั่วไป',
        author: authors[Math.floor(Math.random() * authors.length)] || 'ผู้เขียน',
        views: Math.floor(Math.random() * 10000) + 100,
        likes: Math.floor(Math.random() * 500) + 10,
        imageUrl: `https://picsum.photos/400/300?random=${i}`
      })
    }
    
    return sampleData
  }
  
  // Load fresh data (simulate API call)
  const loadFreshData = async (): Promise<CacheData[]> => {
    isLoading.value = true
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const freshData = generateSampleData()
    lastRefresh.value = Date.now()
    
    isLoading.value = false
    return freshData
  }
  
  // Initialize cache on first load
  const initializeCache = async (): Promise<void> => {
    const existingData = loadFromCache()
    
    if (existingData.length === 0) {
      // First time - load fresh data
      console.log('🔄 กำลังโหลดข้อมูลครั้งแรก...')
      const freshData = await loadFreshData()
      saveToCache(freshData)
      console.log('✅ โหลดข้อมูลเสร็จสิ้นและเก็บใน cache แล้ว')
    } else {
      // Load from cache
      console.log('📦 โหลดข้อมูลจาก cache')
      cachedData.value = existingData
    }
  }
  
  // Force refresh data
  const refreshData = async (): Promise<void> => {
    const freshData = await loadFreshData()
    saveToCache(freshData)
  }
  
  // Clear cache
  const clearCache = (): void => {
    localStorage.removeItem(cacheKey)
    localStorage.removeItem(cacheStatsKey)
    cachedData.value = []
    lastRefresh.value = 0
  }
  
  // Update cache statistics
  const updateCacheStats = (): void => {
    try {
      const stats: CacheStats = {
        totalItems: cachedData.value.length,
        lastUpdated: lastRefresh.value,
        storageUsed: `${(JSON.stringify(cachedData.value).length / 1024).toFixed(2)} KB`
      }
      localStorage.setItem(cacheStatsKey, JSON.stringify(stats))
    } catch (error) {
      console.error('Error updating cache stats:', error)
    }
  }
  
  // Get cache statistics
  const getCacheStats = (): CacheStats | null => {
    try {
      const stored = localStorage.getItem(cacheStatsKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error getting cache stats:', error)
    }
    return null
  }
  
  // Filter data by category
  const filterByCategory = (category: string): CacheData[] => {
    if (category === 'ทั้งหมด') {
      return cachedData.value
    }
    return cachedData.value.filter(item => item.category === category)
  }
  
  // Search data
  const searchData = (query: string): CacheData[] => {
    if (!query.trim()) {
      return cachedData.value
    }
    
    const lowercaseQuery = query.toLowerCase()
    return cachedData.value.filter(item => 
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.content.toLowerCase().includes(lowercaseQuery)
    )
  }
  
  return {
    // State
    cachedData,
    isLoading,
    lastRefresh,
    
    // Methods
    initializeCache,
    refreshData,
    clearCache,
    filterByCategory,
    searchData,
    getCacheStats,
    updateCacheStats
  }
}
