export type TaskStatus = 'todo' | 'doing' | 'done'

// ? 代表可以沒有這個欄位

export interface CreateTaskRequest {
  title: string
  description?: string
  owner?: string
  deadline?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  owner?: string
  deadline?: string
}
