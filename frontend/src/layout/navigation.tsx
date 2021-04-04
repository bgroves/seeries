import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { AppTheme } from '../app-theme';
import Dashboard from '../dashboard/dashboard';
import labels from '../labels';
import NavigationBrand from './navigation-brand';
import NavLink from './navigation-link';

export interface NavigationProps {
  theme: AppTheme;
  dashboards?: Dashboard[];
}

export default function Navigation({ dashboards, theme }: NavigationProps) {
  const navTheme = theme.navbar;

  return (
    <Navbar
      bg={navTheme.bg}
      variant={navTheme.variant}
      expand="lg"
      collapseOnSelect={true}
    >
      <NavigationBrand labels={labels} theme={theme} />
      <Navbar.Toggle aria-controls="seeries-navbar-nav" />
      <Navbar.Collapse id="seeries-navbar-nav">
        <Nav className="mr-auto">
          {dashboards?.map((it) => {
            return (
              <NavLink key={it.name} href={'/dashboards/' + it.name}>
                {it.title}
              </NavLink>
            );
          })}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
