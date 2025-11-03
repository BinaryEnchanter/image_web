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
  detail(uuid){ return API.get('/api/v1/wallpapers/'+uuid) },
  download(uuid){ return API.get('/api/v1/wallpapers/'+uuid+'/download') },
  upload(formData){ return API.post('/api/v1/wallpapers/upload', formData, { headers:{ 'Content-Type':'multipart/form-data' } }) },
  me() { return API.get('/api/v1/users/me') },
  getMyWallpapers(jwt, page = 1) {
    return API.get(`/api/v1/users/me/wallpapers?page=${page}`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
  },
  favorite(uuid, jwt){return API.post(`/api/v1/wallpapers/${uuid}/favorite?jwt=${jwt}`)},
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
}
