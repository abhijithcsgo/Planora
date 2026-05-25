import { Injectable, inject } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TaskService } from './task.service';

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  private readonly taskService = inject(TaskService);

  exportTasks(): void {
    const tasks = this.taskService.getTasks();
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    doc.setFontSize(18);
    doc.text('Planora — Task Export', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${date}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Title', 'Category', 'Priority', 'Due', 'Status']],
      body: tasks.map((t) => [
        t.title,
        t.category,
        t.priority,
        t.dueDate ? `${t.dueDate}${t.dueTime ? ' ' + t.dueTime : ''}` : '—',
        t.completed ? 'Done' : 'Pending',
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save(`planora-tasks-${date.replace(/\//g, '-')}.pdf`);
  }
}
