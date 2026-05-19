import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';

export type ImgFallback = 'car' | 'image' | 'avatar';

// Lightweight inline SVG placeholders. Using data URLs avoids shipping asset
// files and keeps the fallback available even when the network is down.
const PLACEHOLDERS: Record<ImgFallback, string> = {
  car:
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120' preserveAspectRatio='xMidYMid slice'>" +
    "<rect width='200' height='120' fill='%23f0f3ff'/>" +
    "<g fill='%23b8c8de'>" +
    "<rect x='30' y='55' width='140' height='35' rx='6'/>" +
    "<rect x='55' y='40' width='90' height='25' rx='8'/>" +
    "<circle cx='60' cy='92' r='10'/><circle cx='140' cy='92' r='10'/>" +
    "</g>" +
    "<path d='M70 50 L80 65 L120 65 L130 50 Z' fill='%23dce2f3'/>" +
    "</svg>",
  image:
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120' preserveAspectRatio='xMidYMid slice'>" +
    "<rect width='200' height='120' fill='%23f0f3ff'/>" +
    "<g fill='%23b8c8de'>" +
    "<rect x='40' y='30' width='120' height='60' rx='6' stroke='%23b8c8de' stroke-width='2' fill='none'/>" +
    "<circle cx='75' cy='55' r='6'/>" +
    "<path d='M55 80 L85 60 L115 75 L145 50 L145 85 L55 85 Z'/>" +
    "</g></svg>",
  avatar:
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
    "<rect width='100' height='100' fill='%23e7eefe'/>" +
    "<circle cx='50' cy='38' r='18' fill='%23b8c8de'/>" +
    "<path d='M18 90 C18 70, 82 70, 82 90 Z' fill='%23b8c8de'/>" +
    "</svg>",
};

/**
 * Image wrapper that:
 *  1) prepends `environment.mediaUrl` when the path is relative (starts with `/`),
 *  2) shows a typed placeholder when the source is missing or fails to load,
 *  3) accepts any utility classes for sizing/object-fit on the host.
 *
 * Pass null/undefined freely — the component handles it. Use `fallback` to
 * pick which placeholder to show ('car' for vehicle thumbs, 'avatar' for
 * profile pics, 'image' for general).
 */
@Component({
  selector: 'pe-img',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<img [src]="resolved()" [alt]="alt" [class]="imgClass" (error)="onError()" />`,
})
export class ImgComponent {
  private _src?: string | null;

  @Input() set src(value: string | null | undefined) {
    if (value !== this._src) {
      this._src = value;
      this.failed.set(false);
    }
  }
  get src(): string | null | undefined { return this._src; }

  @Input() alt = '';
  @Input() imgClass = 'w-full h-full object-cover';
  @Input() fallback: ImgFallback = 'image';

  readonly failed = signal(false);

  resolved(): string {
    if (this.failed() || !this._src) return PLACEHOLDERS[this.fallback];
    const s = this._src;
    if (s.startsWith('http') || s.startsWith('data:')) return s;
    // Server returns relative paths like `/cars/foo.jpg` — prefix with the
    // configured media origin so the browser can resolve them.
    const base = environment.mediaUrl?.replace(/\/$/, '') ?? '';
    return `${base}${s.startsWith('/') ? '' : '/'}${s}`;
  }

  onError(): void {
    if (!this.failed()) this.failed.set(true);
  }
}
