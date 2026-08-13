import getLocal from '@/plugins/local'
import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
const baseURL = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`

const api = axios.create({
    baseURL,
    // withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: {
        Accept: 'application/json',
    },
})

api.interceptors.request.use(config => {
    const token = getLocal()?.token
    // const secretKey = import.meta.env.VITE_API_SECRET_KEY // secret dari .env

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // if (secretKey) {
  //   config.headers['x-secret-key'] = secretKey // header kustom
  // }

  return config
}, error => {
  return Promise.reject(error)
})

export default api
