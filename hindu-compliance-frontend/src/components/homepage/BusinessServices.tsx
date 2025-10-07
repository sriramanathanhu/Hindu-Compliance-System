import Link from 'next/link';
import type { BusinessServices as BusinessServicesType } from '@/types';

interface BusinessServicesProps {
  services: BusinessServicesType;
}

export function BusinessServices({ services }: BusinessServicesProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-12 text-center">
          {services.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.services.map((service) => (
            <div
              key={service.id}
              className="card group hover:border-primary-300 transition-all"
            >
              {service.icon && (
                <div className="mb-4">
                  <img
                    src={service.icon.url}
                    alt={service.icon.alt}
                    className="h-12 w-12 object-contain"
                  />
                </div>
              )}
              <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-neutral-600 mb-4">{service.description}</p>
              {service.link && (
                <Link
                  href={service.link}
                  className="text-primary-600 font-medium hover:text-primary-700 inline-flex items-center gap-2"
                >
                  Learn more
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
