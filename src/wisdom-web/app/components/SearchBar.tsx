import { Mic, Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="mx-auto mt-10 flex max-w-3xl items-center gap-4 rounded-2xl bg-white p-4 shadow-2xl">

      {/* Search Icon */}
      <Search className="text-gray-500" size={24} />

      {/* Input */}
      <input
        type="text"
        placeholder="Where would you like to stay?"
        className="flex-1 border-none text-lg outline-none"
      />

      {/* Voice Button */}
      <div className="relative">

        {/* Animated Ring */}
        <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>

        {/* Main Button */}
        <button
          className="
            relative
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-blue-600
            shadow-xl
            transition
            duration-300
            hover:scale-110
            hover:bg-blue-700
            active:scale-95
          "
        >
          <Mic
            className="text-white"
            size={30}
          />
        </button>
      </div>
    </div>
  );
}