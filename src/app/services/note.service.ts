import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Note } from '../models/note.model';
import { StorageService } from './storage.service';
const STORAGE_KEY = 'taskflow_notes';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private readonly storage = inject(StorageService);
  private readonly notesSubject = new BehaviorSubject<Note[]>([]);

  readonly notes$ = this.notesSubject.asObservable();

  constructor() {
    this.load();
  }

  private load(): void {
    const notes = this.storage.get<Note[]>(STORAGE_KEY) ?? [];
    this.notesSubject.next(notes);
  }

  clearAll(): void {
    this.persist([]);
  }

  private persist(notes: Note[]): void {
    this.storage.set(STORAGE_KEY, notes);
    this.notesSubject.next(notes);
  }

  add(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.persist([newNote, ...this.notesSubject.value]);
    return newNote;
  }

  update(id: string, updates: Partial<Note>): void {
    this.persist(
      this.notesSubject.value.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n,
      ),
    );
  }

  delete(id: string): void {
    this.persist(this.notesSubject.value.filter((n) => n.id !== id));
  }

  togglePin(id: string): void {
    const note = this.notesSubject.value.find((n) => n.id === id);
    if (note) {
      this.update(id, { pinned: !note.pinned });
    }
  }
}
