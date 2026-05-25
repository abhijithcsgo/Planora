import { APP_INITIALIZER, inject, Provider } from '@angular/core';
import { StorageMigrationService } from '../services/storage-migration.service';

export function provideStorageMigration(): Provider {
  return {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: () => {
      const migration = inject(StorageMigrationService);
      return () => migration.run();
    },
  };
}
