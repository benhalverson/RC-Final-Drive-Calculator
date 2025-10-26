import { Component, signal, effect, ChangeDetectionStrategy, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  isDark = signal(false);
  private readonly document = typeof document !== 'undefined' ? (inject(DOCUMENT) as Document) : null;

  constructor() {
    // Check for saved theme preference or system preference
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDark.set(savedTheme === 'dark' || (!savedTheme && prefersDark));
    }

    // Apply theme changes to document
    effect(() => {
      const dark = this.isDark();
      if (this.document) {
        const root = this.document.documentElement;
        root.classList.toggle('dark', dark);
        root.setAttribute('data-theme', dark ? 'dark' : 'light');
        this.setThemeColorMeta(dark);
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', dark ? 'dark' : 'light');
      }
    });
  }

  toggleTheme(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    // Ensure immediate DOM effect even before Angular runs effects
    if (this.document) {
      const root = this.document.documentElement;
      root.classList.toggle('dark', next);
      root.setAttribute('data-theme', next ? 'dark' : 'light');
      this.setThemeColorMeta(next);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    }
  }

  private setThemeColorMeta(dark: boolean): void {
    if (!this.document) return;
    const color = dark ? '#1f2937' : '#ffffff';
    let meta = this.document.head.querySelector<HTMLMetaElement>('meta#theme-color[name="theme-color"]');
    if (!meta) {
      meta = this.document.createElement('meta');
      meta.id = 'theme-color';
      meta.name = 'theme-color';
      this.document.head.appendChild(meta);
    }
    meta.content = color;
  }

}
