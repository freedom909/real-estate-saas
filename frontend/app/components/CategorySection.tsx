// src/wisdom-web/app/components/CategorySection.tsx

// src/app/components/CategorySection.tsx

import {
  Mountain,
  Trees,
  Waves,
  Building2,
  Flower2,
  Castle,
  Tent,
  Snowflake,
} from "lucide-react";

const categories = [
  {
    icon: Mountain,
    title: "Mountain",
    subtitle: "Nature Escape",
  },
  {
    icon: Trees,
    title: "Forest",
    subtitle: "Fresh Air",
  },
  {
    icon: Waves,
    title: "Ocean",
    subtitle: "Sea View",
  },
  {
    icon: Castle,
    title: "Traditional",
    subtitle: "Japanese Style",
  },
  {
    icon: Building2,
    title: "City",
    subtitle: "Urban Life",
  },
  {
    icon: Tent,
    title: "Camping",
    subtitle: "Adventure",
  },
  {
    icon: Snowflake,
    title: "Hot Spring",
    subtitle: "Relax",
  },
  {
    icon: Flower2,
    title: "Garden",
    subtitle: "Peaceful",
  },
];

export default function CategorySection() {
  return (
    <section className="bg-gradient-to-b from-white via-rose-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">

          <p className="text-pink-500 text-xl mb-3">
            🌸 Explore Japan
          </p>

          <h2 className="text-5xl font-bold text-slate-800">
            Find Your Favorite Style
          </h2>

          <p className="mt-5 text-slate-500 text-lg">
            Beautiful stays carefully selected by AI
          </p>

        </div>

        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">

          {categories.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="
                  group
                  rounded-3xl
                  bg-white
                  p-8
                  shadow-md
                  transition
                  duration-300
                  hover:-translate-y-2
                  hover:shadow-2xl
                "
              >

                <div
                  className="
                    mx-auto
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-pink-100
                    to-blue-100
                    transition
                    group-hover:scale-110
                  "
                >
                  <Icon
                    size={38}
                    className="text-blue-600"
                  />
                </div>

                <h3 className="mt-6 text-center text-2xl font-semibold text-slate-800">
                  {item.title}
                </h3>

                <p className="mt-2 text-center text-slate-500">
                  {item.subtitle}
                </p>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}