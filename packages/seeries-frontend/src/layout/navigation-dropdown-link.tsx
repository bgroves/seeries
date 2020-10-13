import React from 'react';
import {Link} from 'react-navi';

export interface NavigationDropdownLinkProps {
  href: string;
  exact?: boolean;
  children: any;
}

export default function NavigationDropdownLink({href, exact, children}: NavigationDropdownLinkProps) {
  return (
    <Link href={href}
          exact={exact}
          className="dropdown-item"
          activeClassName="selected">{children}</Link>
  );
}
