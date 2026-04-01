import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden animated-bg min-h-screen flex items-center">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-tiktok-pink/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-tiktok-cyan/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tiktok-pink/10 border border-tiktok-pink/30 text-tiktok-pink text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse" />
            The #1 TikTok Growth Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 animate-slide-up">
            <span className="gradient-text">Grow Your TikTok</span>
            <br />
            <span className="text-white">Following Today</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-in">
            Earn coins by following creators, then spend them to grow your own audience.
            100% organic growth with real TikTok accounts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-tiktok-pink hover:bg-tiktok-pink/80 text-white font-semibold rounded-xl transition-all glow-pink text-lg"
            >
              Start for Free — Get 100 Coins 🎉
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-xl transition-all text-lg"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: '50K+', label: 'Active Users' },
              { value: '2M+', label: 'Coins Earned' },
              { value: '500K+', label: 'Follows Completed' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Three simple steps to grow your TikTok following</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '🎁',
                title: 'Get 100 Free Coins',
                description:
                  'Sign up and receive 100 coins instantly. No credit card required.',
                color: 'from-tiktok-pink/20 to-transparent',
                border: 'border-tiktok-pink/20',
              },
              {
                step: '02',
                icon: '👥',
                title: 'Follow Creators',
                description:
                  'Browse ads and follow TikTok creators. Submit a screenshot proof to earn 50 coins each.',
                color: 'from-tiktok-cyan/20 to-transparent',
                border: 'border-tiktok-cyan/20',
              },
              {
                step: '03',
                icon: '🚀',
                title: 'Grow Your Account',
                description:
                  'Create an ad campaign and spend your coins to get real followers on your TikTok.',
                color: 'from-brand-500/20 to-transparent',
                border: 'border-brand-500/20',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`relative p-8 rounded-2xl glass border ${item.border} hover:scale-105 transition-transform`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${item.color} opacity-50`} />
                <div className="relative">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Step {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose TikTok Coins?</h2>
            <p className="text-gray-400 text-lg">Built for creators, by creators</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🔒', title: 'Verified Follows', desc: 'Every follow is manually verified by our admin team with screenshot proof.' },
              { icon: '⚡', title: 'Fast Processing', desc: 'Verifications are processed quickly, so you earn coins fast.' },
              { icon: '💰', title: 'Fair Coin System', desc: '50 coins per follow earned. 2 coins per target follower for campaigns.' },
              { icon: '📊', title: 'Real Analytics', desc: 'Track your coin balance, transaction history, and campaign progress.' },
              { icon: '🛡️', title: 'Secure Platform', desc: 'Your account is protected with email verification and JWT auth.' },
              { icon: '📱', title: 'Mobile Friendly', desc: 'Access the platform from any device, anywhere, anytime.' },
            ].map((feat) => (
              <div key={feat.title} className="p-6 rounded-xl glass hover:border-tiktok-pink/30 transition-all">
                <div className="text-3xl mb-3">{feat.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-tiktok-pink/10 via-brand-600/5 to-tiktok-cyan/10" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Grow Your{' '}
            <span className="gradient-text">TikTok Following?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join thousands of creators already using TikTok Coins to grow their audience.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-tiktok-pink to-brand-600 hover:from-tiktok-pink/80 hover:to-brand-600/80 text-white font-bold rounded-2xl transition-all text-xl glow-pink"
          >
            🎵 Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} TikTok Coins. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
