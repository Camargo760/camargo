import Link from 'next/link'
import Header from '../components/Header'

export default async function Home() {
  return (
    <div className='overflow-hidden'>
      <Header />
      <main
        style={{ height: 'calc(100vh - 60px)' }}
        className='bg-black h-screen overflow-hidden'
      >
        {/* Banner Section */}
        <div className="relative text-white py-32 bg-banner h-screen">
          <div className="relative z-10 container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-shadow-md tracking-wide sm:tracking-wider">
              Welcome To Camargo's World, We Can Customize Apparel For You.
            </h1>
            <p className="text-xl mb-8 text-shadow-sm">
              ☆♧◇♡♤
            </p>
            <Link
              href="/products"
              className="bg-black hover:bg-blue-200 hover:text-black text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
