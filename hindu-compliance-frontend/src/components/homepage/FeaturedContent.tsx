import Link from 'next/link';
import type { FeaturedContent as FeaturedContentType } from '@/types';

interface FeaturedContentProps {
  content: FeaturedContentType;
}

export function FeaturedContent({ content }: FeaturedContentProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-12 text-center">
          {content.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.items.map((item) => (
            <div key={item.id} className="card group cursor-pointer">
              {item.image && (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img
                    src={item.image.url}
                    alt={item.image.alt}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-neutral-600 mb-4">{item.description}</p>
              )}
              {item.link && (
                <Link
                  href={item.link}
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
