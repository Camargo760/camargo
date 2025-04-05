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
        <Link href="/" className="logo">
          <Image src='/assets/logo.png' width={150} height={20} alt="Logo" />
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
              <button onClick={handleSignOut} className="btn sign-out">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Login
              </Link>
              <Link href="/signup" className="btn sign-up">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <style jsx>{`
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
          position: relative;
        }
        
        .nav-links {
          display: flex;
          gap: 60px;
          text-align: right;
        }

        .hamburger-menu {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #fff;
          font-size: 30px;
        }

        @media (max-width: 650px)  {              
        .nav-links {
          gap: 20px;
           }
        }

        @media (max-width: 550px) {
          .nav-links {
            display: none;
            position: absolute;
            top: 90px;
            right: 0;
            background: #000;
            width: 100%;
            flex-direction: column;
            align-items: center;
            gap: 30px;
            box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);
            padding: 40px 0;
          }

          .nav-links.open {
            display: flex;
          }

          .hamburger-menu {
            display: block;
          }
        }
      `}</style>
    </header>
  )
}
