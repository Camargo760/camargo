'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: "/" })
    router.push(data.url)
  }

  return (
    <header className="header">
      <nav className="nav-container">
        <Link href="/" className="logo">
          <Image src='/assets/sleeve.png' width={150} height={20} alt="Logo" />
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">
            Home
          </Link>
          {session ? (
            <>
              {session.user.email === process.env.ADMIN_EMAIL && (
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
    </header>
  )
}
