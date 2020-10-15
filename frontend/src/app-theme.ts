import { useState } from 'react';

export type AnyVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'muted'
  | 'white';
export type NavbarVariant = 'dark' | 'light';

export interface BgTheme {
  bg: AnyVariant;
}

export interface TextTheme {
  text: AnyVariant;
}

export interface NavbarTheme {
  bg: NavbarVariant;
  variant: NavbarVariant;
}

export interface ItemTheme extends BgTheme, TextTheme {}

export interface AppTheme {
  name: string;
  fluid: boolean;
  header: ItemTheme;
  list: ItemTheme;
  page: ItemTheme;
  footer: ItemTheme;
  navbar: NavbarTheme;
}

const appThemes: { [key: string]: AppTheme } = {
  light: {
    name: 'light',
    fluid: true,

    header: {
      bg: 'light',
      text: 'secondary',
    },

    list: {
      bg: 'white',
      text: 'light',
    },

    page: {
      bg: 'light',
      text: 'dark',
    },

    footer: {
      bg: 'secondary',
      text: 'secondary',
    },

    navbar: {
      bg: 'light',
      variant: 'light',
    },
  },

  dark: {
    name: 'dark',
    fluid: true,

    footer: {
      bg: 'secondary',
      text: 'secondary',
    },

    header: {
      bg: 'dark',
      text: 'light',
    },

    list: {
      bg: 'dark',
      text: 'light',
    },

    page: {
      bg: 'dark',
      text: 'light',
    },

    navbar: {
      bg: 'dark',
      variant: 'dark',
    },
  },
};

const SELECTED_THEME_KEY = '__selectedTheme__';

let _selectedTheme = '';

export function currentAppTheme(): AppTheme {
  return appThemes[selectedTheme()];
}

export function selectedTheme(): string {
  if (_selectedTheme === '') {
    _selectedTheme = localStorage.getItem(SELECTED_THEME_KEY) || 'light';
  }
  return _selectedTheme;
}

export function toggleTheme(): string {
  if (_selectedTheme === 'light') {
    _selectedTheme = 'dark';
  } else {
    _selectedTheme = 'light';
  }

  localStorage.setItem(SELECTED_THEME_KEY, _selectedTheme);
  return _selectedTheme;
}

export function useAppTheme(): [AppTheme, () => string] {
  const [currentTheme, setTheme] = useState(currentAppTheme());

  function toggleAppTheme(): string {
    const name = toggleTheme();
    setTheme(currentAppTheme());
    return name;
  }

  return [currentTheme, toggleAppTheme];
}
