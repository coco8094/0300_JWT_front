import api from '@/api/axios'

export async function searchUsers(keyword: string) {
  const response = await api.get('/jwt/admin/viewAllUsers', {
    params: {
      page: 1,
      limit: 100,
      search: keyword,
    },
  })
  return response.data
}
