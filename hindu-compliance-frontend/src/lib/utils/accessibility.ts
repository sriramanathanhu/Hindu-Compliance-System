/**
 * Accessibility utilities and testing helpers
 */

/**
 * Check if axe-core is available for accessibility testing
 */
export function isAxeAvailable(): boolean {
  return typeof window !== 'undefined' && 'axe' in window;
}

/**
 * Initialize accessibility testing in development
 */
export async function initAccessibilityTesting() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    const React = await import('react');
    const ReactDOM = await import('react-dom');
    const axe = await import('@axe-core/react');

    axe.default(React, ReactDOM, 1000);
    console.log('✅ Accessibility testing enabled with axe-core');
  } catch (error) {
    console.warn('Failed to initialize accessibility testing:', error);
  }
}

/**
 * ARIA live region announcer for screen readers
 */
export class LiveAnnouncer {
  private element: HTMLDivElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.element = document.createElement('div');
      this.element.setAttribute('role', 'status');
      this.element.setAttribute('aria-live', 'polite');
      this.element.setAttribute('aria-atomic', 'true');
      this.element.className = 'sr-only';
      document.body.appendChild(this.element);
    }
  }

  announce(message: string) {
    if (this.element) {
      this.element.textContent = message;
      setTimeout(() => {
        if (this.element) {
          this.element.textContent = '';
        }
      }, 1000);
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}

/**
 * Trap focus within a modal or dialog
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable?.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Generate unique ID for ARIA attributes
 */
let idCounter = 0;
export function generateAriaId(prefix: string = 'aria'): string {
  idCounter++;
  return `${prefix}-${idCounter}`;
}
