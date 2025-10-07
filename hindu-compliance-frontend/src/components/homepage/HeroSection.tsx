'use client';

import { useState } from 'react';
import type { HeroSection as HeroSectionType } from '@/types';

interface HeroSectionProps {
  hero: HeroSectionType;
}

export function HeroSection({ hero }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality will be implemented later
    console.log('Search:', searchQuery);
  };

  return (
    <section
      className="relative bg-gradient-to-br from-primary-700 to-primary-900 text-white py-20 md:py-32"
      style={
        hero.background_image
          ? {
              backgroundImage: `url(${hero.background_image.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
            {hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            {hero.subtitle}
          </p>

          {/* Search Bar */}
          {hero.search_placeholder && (
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-2">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={hero.search_placeholder}
                  className="input-field flex-1 text-neutral-900"
                  aria-label="Search temples"
                />
                <button
                  type="submit"
                  className="btn-secondary whitespace-nowrap"
                >
                  Search
                </button>
              </div>
            </form>
          )}

          {/* CTA Button */}
          {hero.cta_text && hero.cta_link && (
            <a href={hero.cta_link} className="btn-primary inline-block">
              {hero.cta_text}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
