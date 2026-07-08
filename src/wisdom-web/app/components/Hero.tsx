import SearchBar from "./SearchBar";

export default function Hero() {
  return (
    <section className="flex h-[650px] items-center justify-center bg-gradient-to-r from-blue-700 to-sky-500">
      <div className="w-full max-w-6xl px-6 text-center text-white">

        <h1 className="text-6xl font-bold">
          Find your next stay
        </h1>

        <p className="mt-6 text-2xl">
          AI Powered Vacation Rentals
        </p>

        <SearchBar />

      </div>
    </section>
  );
}