import api from '@/api/axios'

export async function getTodayTasks(userID: string) {
  const response = await api.get('/jwt/task', {
    params: {
      page: 1,
      limit: 100,
      deadlineFrom: '2026-08-31', // 要改成今天日期
      deadlineTo: '2026-09-01',
      owner: userID,
    },
  })
  return response.data
}

export async function getAllTasks(userID: string) {
  const response = await api.get('/jwt/task', {
    params: {
      page: 1,
      limit: 100,
    },
  })
  return response.data
}

export async function updateTask(taskId: String, updateInfo: Object) {
  const response = await api.patch(`/jwt/task/${taskId}`, updateInfo)
  return response.data
}

export async function deleteTask(taskId: String) {
  await api.delete(`/jwt/task/${taskId}`)
}

export async function createTask(info: Object) {
  const response = await api.post(`/jwt/task`, info)
  return response.data
}
