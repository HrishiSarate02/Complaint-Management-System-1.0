
import { Component } from '@angular/core';
import { NgserviceService } from '../ngservice.service'; // Make sure you import your service
import { Complain } from '../product';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { ImageUploadDialogComponent } from '../image-upload-dialog.component';

@Component({
  selector: 'app-assigned-complaints',
  templateUrl: './assigned-complaints.component.html',
  styleUrls: ['./assigned-complaints.component.css']
})
export class AssignedComplaintsComponent {
  public complaints: Complain[] = []; // Complaints data
  public showProducts = false;
  public isLoggedIn = false;
  private roles: string[] = [];

  constructor(
    private _service: NgserviceService, // Inject the service to interact with backend
    private _route: Router,
    private _activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private dialog: MatDialog
  ) {}
  // Called when status is changed in the UI
  onStatusChange(complaint: Complain, previousStatus: string, newStatus: string) {
    if (newStatus === 'Done') {
      const dialogRef = this.dialog.open(ImageUploadDialogComponent, {
        width: '400px',
        data: { }
      });
      dialogRef.afterClosed().subscribe(result => {
        complaint.status = newStatus;
        if (result) {
          // User uploaded an image
          (complaint as any).afterCompletionImage = result;
        }
        // Save immediately to backend
        this._service.updateComplaintsStatus([complaint]).subscribe({
          next: () => this.fetchComplaintsByStatus('Assigned'),
          error: () => console.log('Error while saving status changes')
        });
      });
    } else {
      complaint.status = newStatus;
      // Save immediately to backend for other statuses
      this._service.updateComplaintsStatus([complaint]).subscribe({
        next: () => this.fetchComplaintsByStatus('Assigned'),
        error: () => console.log('Error while saving status changes')
      });
    }
  }

  ngOnInit(): void {
    this.fetchComplaintsByStatus('Assigned');
    this.isLoggedIn = !!this.storageService.getToken();
    if (this.isLoggedIn) {
      const user = this.storageService.getUser();
      this.roles = user.roles;
      this.showProducts = this.roles.includes('ROLE_ADMIN');
    }
  }

  // Method to fetch complaints by status
  fetchComplaintsByStatus(status: string): void {
    this._service.fetchComplaintsByStatusFromRemote(status).subscribe({
      next: (data) => {
        console.log('Complaints data received');
        this.complaints = data; // Assign fetched data to the complaints array
      },
      error: (error) => {
        console.log('Error occurred while fetching complaints', error);
      },
    });
  }

  // Navigate to Edit Complaint page
  // goToEditComplaint(complainId: number): void {
  //   this._route.navigate(['/editcomplaint', complainId]);
  // }

  // Navigate to View Complaint page
  goToViewComplaint(complainId: number): void {
    this._route.navigate(['/viewproduct', complainId]);
  }

  // Delete Complaint
  deleteComplaint(complainId: number): void {
    const reason = prompt('Please provide the reason for deleting this complaint:');
    if (reason) {
      this._service.deleteProductByIdFromRemote(complainId, reason).subscribe({
        next: () => this.fetchComplaintsByStatus('Assigned'), // Refresh the list after deletion
        error: (error) => console.log('Error while deleting complaint', error),
      });
    }
  }

  // Save Status Changes
  saveStatusChanges(): void {
    this._service.updateComplaintsStatus(this.complaints).subscribe({
      next: () => console.log('Status updated successfully'),
      error: () => console.log('Error while updating status'),
    });
  }
}
