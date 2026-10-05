import { create } from 'zustand';
import { tokenStorage } from '../utils/tokenStorage';
import i18n from '../locales/i18n';

interface User {
  userId: number;
  email: string;
  nickname: string;
  friendCode: string;
  languageSetting: string;
  unlockedWorldLevel: string;
  role?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isInitialized: boolean;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setAuth: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
  updateUser: (user: User) => void;
  setLanguage: (lang: 'ko' | 'en') => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isInitialized: false,

  setTokens: async (accessToken, refreshToken) => {
    await tokenStorage.setItem('accessToken', accessToken);
    await tokenStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken });
  },

  setAuth: async (accessToken, refreshToken, user) => {
    await tokenStorage.setItem('accessToken', accessToken);
    await tokenStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken, user });
  },

  updateUser: (user) => {
    set({ user });
  },

  setLanguage: async (lang) => {
    i18n.changeLanguage(lang);
    set((state) => {
      if (state.user) {
        return {
          user: { ...state.user, languageSetting: lang.toUpperCase() }
        };
      }
      return {};
    });
  },

  logout: async () => {
    await tokenStorage.deleteItem('accessToken');
    await tokenStorage.deleteItem('refreshToken');
    set({ accessToken: null, refreshToken: null, user: null });
  },

  initializeAuth: async () => {
    try {
      const accessToken = await tokenStorage.getItem('accessToken');
      const refreshToken = await tokenStorage.getItem('refreshToken');
      if (accessToken && refreshToken) {
        set({ accessToken, refreshToken });

        try {
          // api imports this store, so load it lazily after the store is initialized.
          const { api } = await import('../api/api');
          const response = await api.get('/api/v1/users/me');
          set({ user: (response as any).data });
        } catch (error: any) {
          const status = error?.response?.status;
          const code = error?.code;

          // A valid-looking token can still point to a user removed by a DB reset.
          if (status === 401 || status === 404 || code === 'NOT_FOUND') {
            await tokenStorage.deleteItem('accessToken');
            await tokenStorage.deleteItem('refreshToken');
            set({ accessToken: null, refreshToken: null, user: null });
          }
        }
      } else if (accessToken || refreshToken) {
        // A partial session cannot be refreshed safely.
        await tokenStorage.deleteItem('accessToken');
        await tokenStorage.deleteItem('refreshToken');
      }
    } catch (e) {
      console.warn('Failed to restore tokens', e);
    } finally {
      set({ isInitialized: true });
    }
  }
}));
