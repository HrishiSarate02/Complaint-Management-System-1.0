import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reason-dialog',
  template: `
    <h2 mat-dialog-title>Enter Reason for Pending</h2>
    <mat-dialog-content>
      <mat-form-field style="width: 100%;">
        <textarea matInput placeholder="Enter reason" [(ngModel)]="reason" rows="4"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onSkip()">Skip</button>
      <button mat-raised-button color="primary" (click)="onAdd()" [disabled]="!reason.trim()">Add</button>
    </mat-dialog-actions>
  `
})
export class ReasonDialogComponent {
  reason: string = '';
  constructor(
    public dialogRef: MatDialogRef<ReasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onSkip(): void {
    this.dialogRef.close(null);
  }

  onAdd(): void {
    this.dialogRef.close(this.reason);
  }
}
