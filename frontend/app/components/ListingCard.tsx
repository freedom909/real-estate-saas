// src/wisdom-web/app/components/ListingCard.tsx

import Link from "next/link";

type ListingCardProps = {
  id: string;
  title: string;
  address: string;
  price: number;
  image?: string;
};

export default function ListingCard({
  id,
  title,
  address,
  price,
  image,
}: ListingCardProps) {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-md
        transition
        duration-300
        hover:-translate-y-2
        hover:shadow-xl
      "
    >
      <img
        src={image || "https://picsum.photos/500/300"}
        alt={title}
        className="h-56 w-full object-cover"
      />

      <div className="space-y-3 p-5">
        <h3 className="text-xl font-bold text-gray-800">
          {title}
        </h3>

        <p className="text-gray-500">
          📍 {address}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">
            ¥{price}
          </span>

          <Link
            href={`/listing/${id}`}
            className="
              rounded-xl
              bg-blue-600
              px-4
              py-2
              font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}