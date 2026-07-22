  // src/wisdom-web/app/components/AIBanner.tsx
export default function AIBanner() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-gradient-to-r
        from-blue-700
        via-indigo-700
        to-purple-700
        py-24
      "
    >
      {/* Background Glow */}
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-blue-400 opacity-20 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-pink-400 opacity-20 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-8">

        {/* Left */}
        <div className="max-w-xl">

          <span
            className="
              inline-block
              rounded-full
              bg-white/20
              px-4
              py-2
              text-sm
              font-semibold
              text-white
            "
          >
            ✨ Powered by Wisdom AI
          </span>

          <h2
            className="
              mt-8
              text-5xl
              font-bold
              leading-tight
              text-white
            "
          >
            Talk Naturally.
            <br />
            Book Effortlessly.
          </h2>

          <p
            className="
              mt-6
              text-lg
              leading-8
              text-blue-100
            "
          >
            Search listings with your voice, ask questions naturally,
            and let Wisdom understand exactly what you need.
          </p>

          <button
            className="
              mt-10
              rounded-full
              bg-orange-500
              px-8
              py-4
              text-lg
              font-semibold
              text-white
              transition
              hover:scale-105
              hover:bg-orange-600
            "
          >
            🎤 Try Voice Search
          </button>

        </div>

        {/* Right */}

        <div className="relative hidden lg:flex items-center justify-center">

          {/* Glow */}
          <div className="absolute h-72 w-72 rounded-full bg-cyan-400 opacity-30 blur-3xl" />

          {/* Ring */}
          <div
            className="
              absolute
              h-56
              w-56
              animate-ping
              rounded-full
              border
              border-white/30
            "
          />

          {/* Second Ring */}
          <div
            className="
              absolute
              h-72
              w-72
              rounded-full
              border
              border-white/20
            "
          />

          {/* AI Orb */}

          <div
            className="
              relative
              flex
              h-40
              w-40
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-cyan-300
              via-blue-400
              to-indigo-600
              shadow-2xl
            "
          >
            <span className="text-6xl">
              🤖
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}