import { Injectable, inject } from '@angular/core';
import { Task } from '../models/task.model';
import { Note } from '../models/note.model';
import { StorageService } from './storage.service';
import { SampleDataService } from './sample-data.service';

const VERSION_KEY = 'taskflow_storage_version';
const CURRENT_VERSION = 4;
const LEGACY_INIT_KEY = 'taskflow_initialized';
const TASKS_KEY = 'taskflow_tasks';
const NOTES_KEY = 'taskflow_notes';

/** Removes legacy demo tasks/notes left from earlier app versions */
@Injectable({ providedIn: 'root' })
export class StorageMigrationService {
  private readonly storage = inject(StorageService);

  run(): void {
    if (this.storage.get<number>(VERSION_KEY) === CURRENT_VERSION) {
      return;
    }

    const tasks = this.storage.get<Task[]>(TASKS_KEY) ?? [];
    const notes = this.storage.get<Note[]>(NOTES_KEY) ?? [];
    const hadLegacySeed = this.storage.has(LEGACY_INIT_KEY);
    const tasksAreOnlySamples = this.isOnlySampleTasks(tasks);
    const notesAreOnlySamples = this.isOnlySampleNotes(notes);

    if (hadLegacySeed || tasksAreOnlySamples) {
      this.storage.set(TASKS_KEY, []);
    }

    if (hadLegacySeed || notesAreOnlySamples) {
      this.storage.set(NOTES_KEY, []);
    }

    this.storage.remove(LEGACY_INIT_KEY);

    const migratedTasks = (this.storage.get<Task[]>(TASKS_KEY) ?? []).map((t) => ({
      ...t,
      category: (t.category as string) === 'shopping' ? 'other' : t.category,
    }));
    this.storage.set(TASKS_KEY, migratedTasks);

    this.storage.set(VERSION_KEY, CURRENT_VERSION);
  }

  private isOnlySampleTasks(tasks: Task[]): boolean {
    if (!tasks.length) {
      return false;
    }
    const sampleTitles = new Set<string>(SampleDataService.SAMPLE_TASK_TITLES);
    return tasks.every((t) => sampleTitles.has(t.title));
  }

  private isOnlySampleNotes(notes: Note[]): boolean {
    if (!notes.length) {
      return false;
    }
    const sampleTitles = new Set<string>(SampleDataService.SAMPLE_NOTE_TITLES);
    return notes.every((n) => sampleTitles.has(n.title));
  }
}
