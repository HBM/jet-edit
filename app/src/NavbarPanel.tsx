import React from 'react'
import { HbmLogo } from './SVG-Icons'
import { NavLink } from 'react-router-dom'

interface NavbarPanelProps {
  setShow: (show: boolean) => void
  show?: string
}

export const NavbarPanel = (props: NavbarPanelProps): JSX.Element => {
  const onClose = (): void => props.setShow(false)
  return (
    <div
      className={`NavbarPanel ${props.show ? 'Navbar-show' : ''}`}
      onClick={onClose}
    >
      <div className="Navbar-logo d-flex">
        <HbmLogo role="banner" />
      </div>
      <nav className="nav flex-column">
        <NavLink
          to={{ pathname: '/connections', state: { text: 'Connections' } }}
          className="nav-link"
          activeClassName="active"
          aria-current="page"
        >
          Connections
        </NavLink>
        {/* <a className="nav-link" href="#test">
          Search
        </a>
        <a className="nav-link" href="#test2">
          Fav
        </a>
        <a
          className="nav-link disabled"
          href="#"
          tabIndex="-1"
          aria-disabled="true"
        >
          Disabled
        </a> */}
      </nav>
    </div>
  )
}
