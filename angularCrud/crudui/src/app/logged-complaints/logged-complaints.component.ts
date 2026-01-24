
import { Component, OnInit } from '@angular/core';
import { NgserviceService } from '../ngservice.service'; // Import your service
import { Complain } from '../product';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-logged-complaints',
  templateUrl: './logged-complaints.component.html',
  styleUrls: ['./logged-complaints.component.css']
})
export class LoggedComplaintsComponent implements OnInit {
  public complaints: Complain[] = []; // Complaints list
  public showProducts = false;
  public isLoggedIn = false;
  private roles: string[] = [];

  constructor(
    private _service: NgserviceService, // Service to interact with backend
    private _route: Router,
    private _activatedRoute: ActivatedRoute,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    // Fetch complaints with "Logged" status on initialization
    this.fetchComplaintsByStatus('Logged');
    this.isLoggedIn = !!this.storageService.getToken();
    if (this.isLoggedIn) {
      const user = this.storageService.getUser();
      this.roles = user.roles;
      this.showProducts = this.roles.includes('ROLE_ADMIN');
    }
  }

  // Fetch complaints by status
  fetchComplaintsByStatus(status: string): void {
    this._service.fetchComplaintsByStatusFromRemote(status).subscribe({
      next: (data) => {
        this.complaints = data; // Assign fetched complaints to the array
      },
      error: (error) => {
        console.log('Error occurred while fetching complaints', error);
      }
    });
  }

  // Navigate to Edit Complaint page
  goToEditComplaint(complainId: number): void {
    this._route.navigate(['/editproduct', complainId]);
  }

  // Navigate to View Complaint page
  goToViewComplaint(complainId: number): void {
    this._route.navigate(['/viewproduct', complainId]);
  }

  // Delete a complaint
  deleteComplaint(complainId: number): void {
    const reason = prompt('Please provide the reason for deleting this complaint:');
    if (reason) {
      this._service.deleteProductByIdFromRemote(complainId, reason).subscribe({
        next: () => this.fetchComplaintsByStatus('Logged'), // Refresh complaints list
        error: (error) => console.log('Error while deleting complaint', error)
      });
    }
  }

  // Save status changes for a complaint
  saveStatusChanges(complaint: Complain): void {
    this._service.updateComplaintsStatus([complaint]).subscribe({
      next: () => console.log('Status updated successfully'),
      error: () => console.log('Error while saving status changes')
    });
  }
}
