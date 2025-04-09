'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Import FontAwesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: "/" })
    router.push(data.url)
  }

  return (
    <header className="header z-[10000000000]">
      <nav className="nav-container">
        <Link href="/" className="logo h-[40px] w-[100px]">
          <Image src='/assets/logo.png' alt="Logo" width={100} height={100}/>
        </Link>

        <button
          className="hamburger-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link href="/" className="nav-link">
            Home
          </Link>
          <Link href="/review" className="nav-link">
            Review
          </Link>
          <Link href="/about" className="nav-link">
            About Us
          </Link>
          <Link href="/customOrder" className="nav-link">
            Custom Order
          </Link>
          {session ? (
            <>
              {session.user.email === 'camargo_co@outlook.com' && (
                <Link href="/admin" className="nav-link">
                  Admin
                </Link>
              )}
              <button onClick={handleSignOut} className="btn p-0 sign-out">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Login
              </Link>
              <Link href="/signup" className="btn p-0 sign-up">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
