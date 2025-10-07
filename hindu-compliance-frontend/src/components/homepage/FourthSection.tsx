import type { FourthSection as FourthSectionType } from '@/types';

interface FourthSectionProps {
  section: FourthSectionType;
}

export function FourthSection({ section }: FourthSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-neutral-50">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Part 1 */}
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4">
              {section.part1.title}
            </h2>
            <div
              className="text-lg text-neutral-600 prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: section.part1.content }}
            />
            {section.part1.image && (
              <div className="mt-6">
                <img
                  src={section.part1.image.url}
                  alt={section.part1.image.alt}
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            )}
          </div>

          {/* Part 2 */}
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4">
              {section.part2.title}
            </h2>
            <div
              className="text-lg text-neutral-600 prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: section.part2.content }}
            />
            {section.part2.image && (
              <div className="mt-6">
                <img
                  src={section.part2.image.url}
                  alt={section.part2.image.alt}
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
