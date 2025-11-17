import axios from 'axios'
const API = axios.create({
  baseURL: 'http://47.109.41.86:8080',
  timeout: 10000
})

// interceptor to attach JWT if present
API.interceptors.request.use(cfg=>{
  const token = localStorage.getItem('jwt_token')
  if(token) cfg.headers.Authorization = 'Bearer ' + token
  return cfg
})

export default {
  register(data){ return API.post('/api/v1/auth/register', data) },
  login(data){ return API.post('/api/v1/auth/login', data) },
  getWallpapers(page=1){ return API.get('/api/v1/wallpapers?page='+page) },
  search(q,page=1){ return API.get('/api/v1/wallpapers/search?q='+encodeURIComponent(q)+'&page='+page) },
  detail(uuid) {
    const token = localStorage.jwt_token;
    return API.get(`/api/v1/wallpapers/${uuid}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    }) },
  download(uuid){ return API.get('/api/v1/wallpapers/'+uuid+'/download') },
  upload(formData){ return API.post('/api/v1/wallpapers/upload', formData, { headers:{ 'Content-Type':'multipart/form-data' } }) },
  me() { return API.get('/api/v1/users/me') },
  getMyWallpapers(jwt, page = 1) {
    return API.get(`/api/v1/users/me/wallpapers?page=${page}`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
  },
  favorite(uuid, jwt) { return API.post(`/api/v1/wallpapers/${uuid}/favorite?jwt=${jwt}`) },
  unfavorite(uuid, jwt){return API.delete(`/api/v1/wallpapers/${uuid}/favorite?jwt=${jwt}`)},
  purchase(uuid) { return API.post('/api/v1/wallpapers/' + uuid + '/purchase') },
  deleteWallpaper(uuid, jwt) {
    return API.delete(`/api/v1/wallpapers/${uuid}`, {
      headers: { Authorization: jwt ? `Bearer ${jwt}` : '' }
    })
  },
  recharge(amount) {
    const token = localStorage.jwt_token
    return API.post('/api/v1/users/me/recharge', { amount }, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
  },
  checkPurchase(uuid, jwt) { return API.get(`/api/v1/wallpapers/${uuid}/check-purchase`, {
      headers: { Authorization: jwt ? `Bearer ${jwt}` : '' }
    })
  },
  buyWallpaper(uuid) {
    const token = localStorage.jwt_token
    return API.post(`/api/v1/wallpapers/${uuid}/buy`, null, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
  },
  aichat(payload) {
    const token = localStorage.jwt_token
    const data = typeof payload === 'string' ? { message: payload } : payload
    return API.post(`/api/v1/ai/chat`, data, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
  },
  myRecommendations(size = 4) {
    return API.get(`/api/v1/users/me/recommendations?size=${size}`)
  },
  similarWallpapers(uuid, size = 4) {
    return API.get(`/api/v1/wallpapers/${uuid}/similar?size=${size}`)
  },

  updateUsername(newUsername) {
    const token = localStorage.jwt_token
    return API.post(`/api/v1/users/me/username`, { newUsername:newUsername },{
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
  },

  // 更新邮箱
  updateEmail(newEmail) {
    const token = localStorage.jwt_token
      return API.post(`/api/v1/users/me/email`, { newEmail:newEmail },{
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
  },

  // 更新密码
  updatePassword(newPassword) {
    const token = localStorage.jwt_token
      return API.post(`/api/v1/users/me/password`, { newPassword:newPassword },{
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
  },
  adminSetRole(uuid, role) {
    const token = localStorage.jwt_token
    return API.post(`/api/v1/admin/users/${uuid}/role`, { role }, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
  },
  adminGetUserLogs(uuid, page = 1, size = 20) {
    const token = localStorage.jwt_token
    return API.get(`/api/v1/admin/users/${uuid}/logs?page=${page}&size=${size}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
  },
  listComments(uuid, page = 1, size = 20) {
    const token = localStorage.jwt_token
    return API.get(`/api/v1/wallpapers/${uuid}/comments?page=${page}&size=${size}&_=${Date.now()}`,{
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
  },
  addComment(uuid, content, parentId = null) {
    const token = localStorage.jwt_token
    const data = { content }
    if (parentId != null) data.parent_id = parentId
    return API.post(`/api/v1/wallpapers/${uuid}/comments`, data, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
  },
  likeComment(id) {
    const token = localStorage.jwt_token
    return API.post(`/api/v1/comments/${id}/like`, null, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
  },
  dislikeComment(id) {
    const token = localStorage.jwt_token
    return API.post(`/api/v1/comments/${id}/dislike`, null, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
  },
  deleteComment(id) {
    const token = localStorage.jwt_token
    return API.delete(`/api/v1/comments/${id}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
  },
  adminStats() {
    const token = localStorage.jwt_token
    return API.get(`/api/v1/admin/stats`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
  }
}
