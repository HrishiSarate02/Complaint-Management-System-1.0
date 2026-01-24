import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-image-upload-dialog',
  template: `
    <h2 mat-dialog-title>Upload Completion Image</h2>
    <mat-dialog-content>
      <input type="file" (change)="onFileSelected($event)" accept="image/*" />
      <div *ngIf="imagePreview" style="margin-top:10px;">
        <img [src]="imagePreview" alt="Preview" style="max-width: 100%; max-height: 200px;" />
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onSkip()">Skip</button>
      <button mat-button color="primary" [disabled]="!imagePreview" (click)="onAdd()">Add</button>
    </mat-dialog-actions>
  `
})
export class ImageUploadDialogComponent {
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    public dialogRef: MatDialogRef<ImageUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = (e.target as FileReader).result;
        if (result !== undefined && result !== null) {
          this.imagePreview = result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onSkip() {
    this.dialogRef.close(null);
  }

  onAdd() {
    this.dialogRef.close(this.imagePreview);
  }
}
