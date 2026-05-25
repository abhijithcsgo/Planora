import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../shared/components/confirm-dialog/confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog = inject(MatDialog);

  /** Opens a centered confirmation modal; returns true if user confirms */
  open(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        maxWidth: '95vw',
        panelClass: 'taskflow-confirm-dialog',
        disableClose: true,
        autoFocus: 'first-tabbable',
        restoreFocus: true,
        data,
      })
      .afterClosed()
      .pipe(map((result) => result === true));
  }
}
