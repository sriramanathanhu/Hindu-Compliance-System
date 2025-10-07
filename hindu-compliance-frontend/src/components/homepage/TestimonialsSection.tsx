import type { TestimonialsSection as TestimonialsSectionType } from '@/types';

interface TestimonialsSectionProps {
  testimonials: TestimonialsSectionType;
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-12 text-center">
          {testimonials.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.items.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Rating */}
              {testimonial.rating && (
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <svg
                      key={index}
                      className={`w-5 h-5 ${
                        index < testimonial.rating!
                          ? 'text-secondary-500'
                          : 'text-neutral-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              )}

              {/* Content */}
              <p className="text-neutral-700 mb-6 italic">"{testimonial.content}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {testimonial.author_image && (
                  <img
                    src={testimonial.author_image.url}
                    alt={testimonial.author_image.alt}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-neutral-900">
                    {testimonial.author_name}
                  </p>
                  {testimonial.author_role && (
                    <p className="text-sm text-neutral-600">
                      {testimonial.author_role}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
