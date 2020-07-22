import React, { useState } from 'react'
import { NavbarPanel } from './NavbarPanel'
import { Menu } from './SVG-Icons'
import { useLocation, NavLink } from 'react-router-dom'

export const Header = (): JSX.Element => {
  const [isOpenNavbar, setIsOpenNavbar] = useState(false)
  const location = useLocation()
  const here = location.pathname.split('/').filter((item) => item)

  const breadcrumpItems: Array<{ text: string; link: string }> = []

  for (let i = 0; i < here.length; i++) {
    const part = here[i]
    const [first, ...rest] = decodeURIComponent(part)
    const text = [first.toLocaleUpperCase(), ...rest].join('')
    const link = '/' + here.slice(0, i + 1).join('/')
    breadcrumpItems.push({ text: text, link: link })
  }

  const openNavbar = () => {
    setIsOpenNavbar(!isOpenNavbar)
  }
  const dismissNavbar = (): void => setIsOpenNavbar(false)

  return (
    <>
      <header
        className="Header d-flex flex-row align-items-center sticky-top"
        dir="ltr"
      >
        <button
          className="navbar-menu navbar-dark navbar-toggler"
          type="button"
          onClick={openNavbar}
        >
          <Menu />
        </button>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb bg-transparent m-0">
            {breadcrumpItems.map((item, index) =>
              breadcrumpItems.length !== index + 1 ? (
                <NavLink
                  key={item.text}
                  to={item.link}
                  className="breadcrumb-item text-light"
                  aria-current="page"
                >
                  {item.text}
                </NavLink>
              ) : (
                <li
                  key={item.text}
                  className="breadcrumb-item text-light active"
                >
                  {item.text}
                </li>
              )
            )}
          </ol>
        </nav>
      </header>
      <NavbarPanel show={isOpenNavbar} setShow={dismissNavbar} />
    </>
  )
}
