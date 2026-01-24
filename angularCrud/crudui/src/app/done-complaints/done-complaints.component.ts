
import { Component } from '@angular/core';
import { NgserviceService } from '../ngservice.service'; // Import your service
import { Complain } from '../product';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

@Component({
  selector: 'app-done-complaints',
  templateUrl: './done-complaints.component.html',
  styleUrls: ['./done-complaints.component.css']
})
export class DoneComplaintsComponent {
  public complaints: Complain[] = []; // Complaints data
  public showProducts = false;
  public isLoggedIn = false;
  private roles: string[] = [];

  constructor(
    private _service: NgserviceService, // Inject the service to interact with backend
    private _route: Router,
    private _activatedRoute: ActivatedRoute,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.fetchComplaintsByStatus('Done');
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
        next: () => this.fetchComplaintsByStatus('Done'), // Refresh the list after deletion
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
  generatePDF() {
    const doc = new jsPDF();
  
    // Centered Title
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = 'Done Complaints';
    const textWidth = doc.getTextWidth(title);
    const x = (pageWidth - textWidth) / 2;
    doc.setFontSize(18);
    doc.text(title, x, 20); // Title centered horizontally at y = 20
  
    // Table Headers
    const headers = [
      ['Subject', 'Description', 'Room No.', 'Floor No.', 'Building', 'Email']
    ];
  
    // Table Rows
    const rows = this.complaints.map(complaint => [
      complaint.complainSubject,
      complaint.complainDescription,
      complaint.roomNo.toString(),
      complaint.floorNo.toString(),
      complaint.building,
      complaint.email
    ]);
  
    // Create Table with Styling
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 30,
      styles: {
        fontSize: 12,
        cellPadding: 5,
        valign: 'middle',
        halign: 'center',
      },
      headStyles: {
        fontStyle: 'bold',
        fillColor: [139, 69, 19],    // Brown background
        textColor: [255, 255, 255],  // White text
        fontSize: 14,
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],  // Light grey
      },
      columnStyles: {
        0: { cellWidth: 30 },  // Subject
        1: { cellWidth: 50 },  // Description
        2: { cellWidth: 20 },  // Room No.
        3: { cellWidth: 20 },  // Floor No.
        4: { cellWidth: 20 },  // Building
        5: { cellWidth: 40 },  // Email
      }
    });
  
    // Save as PDF
    doc.save('done-complaints.pdf');
  }
  
  
}
