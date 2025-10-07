import Link from 'next/link';
import type { FooterSection } from '@/types';

interface FooterProps {
  footer?: FooterSection;
}

export function Footer({ footer }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Tagline */}
          <div>
            {footer?.logo && (
              <img
                src={footer.logo.url}
                alt="Logo"
                className="h-10 w-auto mb-4"
              />
            )}
            {footer?.tagline && (
              <p className="text-sm text-neutral-400 mb-4">{footer.tagline}</p>
            )}
            {footer?.social_links && (
              <div className="flex gap-4">
                {footer.social_links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-white transition-colors"
                    aria-label={link.platform}
                  >
                    {link.icon || link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Footer Columns */}
          {footer?.columns.map((column) => (
            <div key={column.id}>
              <h3 className="font-heading font-semibold text-white mb-4">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center">
          <p className="text-sm text-neutral-500">
            {footer?.copyright || `© ${currentYear} Hindu Compliance System. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
