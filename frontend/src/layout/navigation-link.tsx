import React from 'react';
import {Link} from 'react-navi';

export interface NavigationLinkProps {
  href: string;
  exact?: boolean;
  children: any;
}

export default function NavigationLink({href, exact, children}: NavigationLinkProps) {
  return (
    <Link href={href}
          exact={exact}
          className="nav-link"
          activeClassName="active">{children}</Link>
  );
}
