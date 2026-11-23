import { create } from 'zustand';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeMode,
  ColorPalette,
  LightColors,
  applyThemePalette,
  resolveIsDark,
} from '../theme/colors';

const THEME_STORAGE_KEY = '@askcare/theme_mode_v1';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  colors: ColorPalette;
  version: number;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => void;
  syncSystemScheme: (scheme: 'light' | 'dark' | null | undefined) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  isDark: false,
  colors: LightColors,
  version: 0,

  hydrate: async () => {
    try {
      const saved = (await AsyncStorage.getItem(THEME_STORAGE_KEY)) as ThemeMode | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        const isDark = resolveIsDark(saved);
        const colors = applyThemePalette(isDark);
        set((s) => ({ mode: saved, isDark, colors, version: s.version + 1 }));
      }
    } catch {
      // Ignore storage errors
    }
  },

  setMode: (mode: ThemeMode) => {
    const isDark = resolveIsDark(mode);
    const colors = applyThemePalette(isDark);
    set((s) => ({ mode, isDark, colors, version: s.version + 1 }));
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
  },

  syncSystemScheme: (scheme) => {
    const { mode } = get();
    if (mode !== 'system') return;
    const isDark = resolveIsDark('system', scheme ?? Appearance.getColorScheme());
    const colors = applyThemePalette(isDark);
    set((s) => ({ isDark, colors, version: s.version + 1 }));
  },
}));
