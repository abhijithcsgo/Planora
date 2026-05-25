import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { map } from 'rxjs';
import { NoteService } from '../../services/note.service';
import { Note } from '../../models/note.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
})
export class NotesComponent {
  private readonly noteService = inject(NoteService);
  private readonly fb = inject(FormBuilder);

  readonly notes$ = this.noteService.notes$.pipe(
    map((notes) =>
      [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned)),
    ),
  );
  readonly colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  showForm = false;
  editingNote: Note | null = null;

  form = this.fb.group({
    title: ['', Validators.required],
    content: [''],
    color: ['#6366f1'],
  });

  openAdd(): void {
    this.editingNote = null;
    this.form.reset({ title: '', content: '', color: '#6366f1' });
    this.showForm = true;
  }

  openEdit(note: Note): void {
    this.editingNote = note;
    this.form.patchValue({
      title: note.title,
      content: note.content,
      color: note.color,
    });
    this.showForm = true;
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    if (this.editingNote) {
      this.noteService.update(this.editingNote.id, {
        title: v.title!,
        content: v.content ?? '',
        color: v.color!,
      });
    } else {
      this.noteService.add({
        title: v.title!,
        content: v.content ?? '',
        color: v.color!,
        pinned: false,
      });
    }
    this.showForm = false;
  }

  cancel(): void {
    this.showForm = false;
  }

  delete(note: Note): void {
    this.noteService.delete(note.id);
  }

  togglePin(note: Note): void {
    this.noteService.togglePin(note.id);
  }
}
