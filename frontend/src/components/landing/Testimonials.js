import TestimonialsCard from "./TestimonialsCard";

const testimonials = [
  {
    quote: "Wiz AI reduced our support tickets dramatically.",
    name: "Priya Shah",
    role: "Head of Support",
    company: "Brightbrew",
  },
  {
    quote: "Our customers receive accurate answers instantly.",
    name: "Marcus Lee",
    role: "Founder",
    company: "Nova Goods",
  },
  {
    quote: "The setup took less than five minutes.",
    name: "Elena Rossi",
    role: "COO",
    company: "Fable Studio",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-blue-50/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Testimonials
          </p>
          <h2 className="text-4xl font-bold text-gray-900">
            Loved by Support Teams
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialsCard key={t.name} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}