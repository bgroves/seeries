import React from 'react';
import { NavLink } from 'react-router-dom';

export interface NavigationDropdownLinkProps {
  href: string;
  exact?: boolean;
  children: any;
}

export default function NavigationDropdownLink({
  href,
  exact,
  children,
}: NavigationDropdownLinkProps) {
  return (
    <NavLink
      to={href}
      exact={exact}
      className="dropdown-item"
      activeClassName="selected"
    >
      {children}
    </NavLink>
  );
}
