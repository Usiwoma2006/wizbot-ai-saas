import Image from "next/image";

export default function ProductMockup() {
  return (
    <div className="mx-auto max-w-6xl">

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">

        {/* Browser Top Bar */}
        <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-5 py-4">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />

          <div className="ml-6 rounded-full bg-white px-4 py-1 text-sm text-gray-400 shadow-sm">
            https://app.wizai.com/dashboard
          </div>
        </div>

        {/* Dashboard Screenshot */}
        <Image
          src="/images/LiveWizAI.png"
          alt="Wiz AI Dashboard Preview"
          width={1600}
          height={900}
          className="w-full"
          priority
        />

      </div>

    </div>
  );
}