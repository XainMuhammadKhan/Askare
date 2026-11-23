import { create } from 'zustand';
import { Appearance } from 'react-native';
import {
  ThemeMode,
  ColorPalette,
  LightColors,
  applyThemePalette,
  resolveIsDark,
} from '../theme/colors';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  colors: ColorPalette;
  version: number;
  setMode: (mode: ThemeMode) => void;
  syncSystemScheme: (scheme: 'light' | 'dark' | null | undefined) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  isDark: false,
  colors: LightColors,
  version: 0,

  setMode: (mode: ThemeMode) => {
    const isDark = resolveIsDark(mode);
    const colors = applyThemePalette(isDark);
    set((s) => ({ mode, isDark, colors, version: s.version + 1 }));
  },

  syncSystemScheme: (scheme) => {
    const { mode } = get();
    if (mode !== 'system') return;
    const isDark = resolveIsDark('system', scheme ?? Appearance.getColorScheme());
    const colors = applyThemePalette(isDark);
    set((s) => ({ isDark, colors, version: s.version + 1 }));
  },
}));
