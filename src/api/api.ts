import axios from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { tokenStorage } from '../utils/tokenStorage';
import i18n from '../locales/i18n';

// 로컬 개발 환경 통신 대응 (Android 에뮬레이터용 10.0.2.2, iOS/Web용 localhost)
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }
  return 'http://localhost:8080';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: 토큰 및 다국어 헤더 주입
api.interceptors.request.use(
  async (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // Accept-Language 헤더에 현재 i18n 언어 주입
    config.headers['Accept-Language'] = i18n.language.substring(0, 2);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 토큰 만료 자동 갱신
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: String | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data, // 공통 ApiResponse 포맷 상 데이터 언래핑
  async (error) => {
    const originalRequest = error.config;

    // 에러 구조 안전하게 파싱
    const errStatus = error.response ? error.response.status : null;
    const errData = error.response ? error.response.data : null;
    const errCode = errData?.error?.code;

    if (errStatus === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token found');
        }

        // 토큰 갱신 API 호출 (인터셉터를 타지 않고 순수 축약 호출)
        const refreshResponse = await axios.post(`${getBaseUrl()}/api/v1/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccess, refreshToken: newRefresh } = refreshResponse.data.data;

        // 스토어 갱신
        await useAuthStore.getState().setTokens(newAccess, newRefresh);

        processQueue(null, newAccess);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        // 리프레시 실패 시 로그아웃
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // 그 외 일반 API 에러 응답 가공하여 가독성 있게 반환
    const fallbackError = {
      code: errCode || 'NETWORK_ERROR',
      message: errData?.error?.message || error.message || '네트워크 오류가 발생했습니다.',
    };

    return Promise.reject(fallbackError);
  }
);
