import axios, { AxiosRequestConfig } from 'axios'

export type returnData<T> = {
  code: number
  msg: string
  data: T
}

type fetch = <T = any>(url: string, options?: AxiosRequestConfig) => Promise<null | returnData<T>>

export const fetch: fetch = async (url, options = {}) => {
  url = `/api${url.startsWith('/') ? url : '/' + url}`
  if (options.headers) {
    options.headers = {
      ...options.headers,
      Authorization: sessionStorage.getItem('token') || ''
    }
  } else {
    options.headers = {
      Authorization: sessionStorage.getItem('token') || ''
    }
  }
  try {
    const response = await axios({
      url,
      ...options
    })
    return response.data
  } catch (error) {
    console.error(error);
    return null
  }
}
