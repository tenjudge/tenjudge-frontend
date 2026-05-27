export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const AGENT_API_BASE_URL = import.meta.env.VITE_AGENT_API_BASE_URL
  || (import.meta.env.PROD ? '/agent-api' : 'http://localhost:8000')
export const API_SUCCESS_CODE = 0
export const API_UNAUTHORIZED_CODE = 10001
