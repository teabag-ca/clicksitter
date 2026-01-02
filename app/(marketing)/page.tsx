import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-600">ClickSitter</h1>
          <div className="space-x-4">
            <Link
              href="/(marketing)/auth"
              className="text-slate-700 hover:text-red-600"
            >
              Sign In
            </Link>
            <Link
              href="/(marketing)/auth"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Trusted Caregivers, Verified & Ready
          </h2>
          <p className="text-xl text-slate-700 mb-8">
            Connect with verified independent caregivers. No agency fees. Just
            trust, transparency, and peace of mind.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/(marketing)/auth"
              className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
            >
              Find a Caregiver
            </Link>
            <Link
              href="/(marketing)/auth"
              className="bg-white text-red-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-red-600 hover:bg-red-50"
            >
              Become a Caregiver
            </Link>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Verified Identity</h3>
            <p className="text-slate-700">
              Every caregiver is identity-verified through Stripe Identity
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-xl font-semibold mb-2">Background Checks</h3>
            <p className="text-slate-700">
              Comprehensive background checks updated annually
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Direct Connection</h3>
            <p className="text-slate-700">
              Chat directly with caregivers, no middleman
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

