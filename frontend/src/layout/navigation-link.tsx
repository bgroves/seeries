import React from 'react';
import { NavLink } from 'react-router-dom';

export interface NavigationLinkProps {
  href: string;
  exact?: boolean;
  children: any;
}

export default function NavigationLink({
  href,
  exact,
  children,
}: NavigationLinkProps) {
  return (
    <NavLink
      to={href}
      exact={exact}
      className="nav-link"
      activeClassName="active"
    >
      {children}
    </NavLink>
  );
}
