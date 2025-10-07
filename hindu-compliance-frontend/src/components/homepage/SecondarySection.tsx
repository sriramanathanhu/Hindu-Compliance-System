import type { SecondarySection as SecondarySectionType } from '@/types';

interface SecondarySectionProps {
  section: SecondarySectionType;
}

export function SecondarySection({ section }: SecondarySectionProps) {
  return (
    <section className="py-16 md:py-24 bg-neutral-50">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4">
            {section.title}
          </h2>
          <p className="text-lg text-neutral-600">{section.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {section.features.map((feature) => (
            <div key={feature.id} className="card text-center">
              {feature.icon && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={feature.icon.url}
                    alt={feature.icon.alt}
                    className="h-16 w-16 object-contain"
                  />
                </div>
              )}
              <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
