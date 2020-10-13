import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import { AppTheme } from '../app-theme';
import rabbitDark from './rabbit-dark.svg';
import rabbitLight from './rabbit-light.svg';

const logos: { [key: string]: string } = {
  dark: rabbitLight,
  light: rabbitDark,
};

export interface NavigationBrandProps {
  theme: AppTheme;
  labels(key: string): string;
}

export default function NavigationBrand({
  labels,
  theme,
}: NavigationBrandProps) {
  const name = labels('applicationName');
  const navTheme = theme.navbar;

  return (
    <Navbar.Brand href="/home">
      <img
        src={logos[navTheme.variant]}
        width="30"
        height="30"
        className="d-inline-block align-top"
        alt={name}
      />
      {' ' + name}
    </Navbar.Brand>
  );
}
