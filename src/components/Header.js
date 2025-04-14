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
    <header className="sticky top-0 left-0 w-full h-[60px] bg-gradient-to-r from-black to-gray-800 shadow-md px-10 py-4 flex items-center justify-center z-50">
      <nav className="max-w-[1200px] w-full flex justify-between items-center">
        <Link href="/" className="h-10 w-[120px]">
          <Image src='/assets/logo.png' alt="Logo" width={120} height={40}/>
        </Link>

        <button
          className="block md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
        </button>

        <div className={`md:flex items-center justify-between gap-10 ${menuOpen ? 'flex' : 'hidden'} 
          md:relative md:top-auto md:right-auto md:w-auto md:flex-row md:bg-transparent md:shadow-none md:p-0
          absolute top-[58px] right-0 bg-black w-full flex-col items-center gap-8 shadow-md py-10`}>
          <Link href="/" className="text-white text-sm hover:text-green-400 transition-colors duration-300">
            Home
          </Link>
          <Link href="/review" className="text-white text-sm hover:text-green-400 transition-colors duration-300">
            Review
          </Link>
          <Link href="/about" className="text-white text-sm hover:text-green-400 transition-colors duration-300">
            About Us
          </Link>
          <Link href="/customOrder" className="text-white text-sm hover:text-green-400 transition-colors duration-300">
            Custom Order
          </Link>
          {session ? (
            <>
              {session.user.email === 'camargo_co@outlook.com' && (
                <Link href="/admin" className="text-white text-sm hover:text-green-400 transition-colors duration-300">
                  Admin
                </Link>
              )}
              <button onClick={handleSignOut} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-base cursor-pointer transition-colors duration-300">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white text-sm hover:text-green-400 transition-colors duration-300">
                Login
              </Link>
              <Link href="/signup" className="bg-green-400 hover:bg-green-600 text-white px-5 py-2 rounded-lg text-base cursor-pointer transition-colors duration-300">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}