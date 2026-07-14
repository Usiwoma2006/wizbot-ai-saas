import Image from "next/image";

export default function HeroMockup() {
  return (
    <div className="relative w-full max-w-lg">
      {/* Browser chrome frame */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
        {/* Fake browser top bar */}
        <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>

        {/* Real dashboard screenshot */}
        <Image
          src="/images/dashboard-preview.png"
          alt="Wiz AI chat widget preview in browser"
          width={1200}
          height={800}
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  );
}