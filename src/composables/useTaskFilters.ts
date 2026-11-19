// composables/useTaskFilters.ts
import { ref, computed, type Ref } from 'vue'

// 1. 先定義「允許出現的固定選項」（Union Type，就是「只能是這幾種其中之一」）
export type TaskStatus = 'todo' | 'doing' | 'done'
export type SortBy = 'createdAt' | 'updatedAt' | 'deadline' | 'title'
export type SortOrder = 'asc' | 'desc'

// 2. 定義單筆 task 長什麼樣子（interface = 物件規格書）
export interface Task {
  _id: number | string
  title: string
  status: TaskStatus
  createdAt: string
  updatedAt?: string // 後面加 ? 代表「這個欄位可有可無」
  deadline?: string // 截止日也設成可有可無，避免有些 task 沒填截止日
}

// 3. 定義篩選條件物件長什麼樣子
export interface TaskFilters {
  keyword: string
  status: TaskStatus | null // 沒有 'all'，改成「某個狀態」或是 null（代表沒選/不篩狀態）
  sortBy: SortBy
  sortOrder: SortOrder
}

function createDefaultFilters(): TaskFilters {
  //TaskFilters（寫在 () 後面）→ 規定這個函式「最後一定要回傳符合 TaskFilters 規格的物件」
  return {
    keyword: '',
    status: null, // 預設不篩選 status
    sortBy: 'deadline',
    sortOrder: 'desc',
  }
}

// export function useTaskFilters(tasksRef: Ref<Task[] | undefined>)
// Task：一筆任務的規格（有 id、title、status 等欄位）。
// Task[]：由很多筆 Task 組成的陣列（例如 [task1, task2, task3]）。
// Task[] | undefined：這個陣列可能已經拿到了（Task[]），也可能還沒拿到（undefined）。
// Ref<...>：外面包了一層 Vue 的 ref()！因為在 Vue 裡 ref 包起來的資料，要透過 .value 才能拿到裡面的東西，所以 TS 用 Ref<...> 來表示「這是一個 ref 物件，裡面裝的是 ...」。
// 不加 Ref<...> 就等於直加傳入 .value 的資料，tasksRef 就不用用 tasksRef.value 拿到值
export function useTaskFilters(tasksRef: Ref<Task[] | undefined>) {
  // const filters = ref(createDefaultFilters()) → 呼叫 createDefaultFilters() 拿到預設的篩選條件物件，然後用 Vue 的 ref() 包起來，變成會跟著變動的響應式資料
  // <TaskFilters> → 告訴 TS：「這個 ref 裡面裝的東西，必須符合 TaskFilters 這個規格」
  const filters = ref<TaskFilters>(createDefaultFilters())

  function resetFilters() {
    filters.value = createDefaultFilters()
  }

  // computed<Task[]>(...) 意思是：這個計算屬性最後會回傳 Task[] 陣列
  const visibleTasks = computed<Task[]>(() => {
    const list = tasksRef.value ?? [] // 如果 tasksRef.value 是 undefined 或 null，就當作空陣列 []
    const kw = filters.value.keyword.trim().toLowerCase()

    const filtered = list.filter((task) => {
      const matchTitle = !kw || task.title.toLowerCase().includes(kw)

      // 如果 filters.value.status 是 null，代表沒選狀態，直接算符合（true）
      // 否則就要 task.status 等於使用者選的 status
      const matchStatus = filters.value.status === null || task.status === filters.value.status

      return matchTitle && matchStatus
    })

    return [...filtered].sort((a, b) => {
      let comparison = 0

      if (filters.value.sortBy === 'title') {
        comparison = a.title.localeCompare(b.title, 'zh-Hant')
      } else {
        // 這裡處理 createdAt / updatedAt / deadline 三種時間欄位
        const field = filters.value.sortBy // 此時 TS 知道 field 一定是 'createdAt' | 'updatedAt' | 'deadline'
        const aTime = a[field] ? new Date(a[field]!).getTime() : 0
        const bTime = b[field] ? new Date(b[field]!).getTime() : 0
        comparison = aTime - bTime
      }

      return filters.value.sortOrder === 'asc' ? comparison : -comparison
    })
  })

  return {
    filters,
    visibleTasks,
    resetFilters,
  }
}
