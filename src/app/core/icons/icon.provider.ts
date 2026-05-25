import { APP_INITIALIZER, inject, Provider } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';

/** Ensure Angular Material uses the standard Material Icons font set */
export function provideMaterialIcons(): Provider {
  return {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: () => {
      const registry = inject(MatIconRegistry);
      return () => {
        registry.setDefaultFontSetClass('material-icons', 'mat-ligature-font');
      };
    },
  };
}
