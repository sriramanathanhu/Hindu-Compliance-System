'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { NavigationItem } from '@/types';

interface HeaderProps {
  navigation?: NavigationItem[];
  siteName?: string;
  logoUrl?: string;
}

export function Header({ navigation = [], siteName = 'Hindu Compliance', logoUrl }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            {logoUrl && (
              <img src={logoUrl} alt={siteName} className="h-10 w-auto" />
            )}
            <span className="text-xl font-heading font-bold text-primary-700">
              {siteName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/auth/sign-in"
              className="btn-primary"
            >
              Sign In
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-neutral-200">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="text-neutral-700 hover:text-primary-600 font-medium transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/auth/sign-in"
                className="btn-primary text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
