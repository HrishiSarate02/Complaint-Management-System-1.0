import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgserviceService } from '../ngservice.service';
import { Complain } from '../product';
import { StorageService } from '../services/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { ReasonDialogComponent } from '../reason-dialog.component';
import { ImageUploadDialogComponent } from '../image-upload-dialog.component';

@Component({
  selector: 'app-productlist',
  templateUrl: './productlist.component.html',
  styleUrls: ['./productlist.component.css']
})
export class ProductlistComponent implements OnInit {
  searchBy: string = 'id'; // Default search criteria
  searchTerm: string = ''; // User input for search
  showProducts = false;
  isLoggedIn= false;
  private roles: string[] = [];
  _productlist: Complain[] = [];
  filteredProductList: Complain[] = []; // List used for filtering

  constructor(
    private _service: NgserviceService,
    private _route: Router,
    private storageService: StorageService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this._service.fetchProductListFromRemote().subscribe(
      (data) => {
        console.log('Response received');
        this._productlist = data;
        this.filteredProductList = data; // Initialize filtered list
      },
      (error) => console.log('Exception occurred')
    );

    this.isLoggedIn = !!this.storageService.getToken();
    
    if (this.isLoggedIn) {
      const user = this.storageService.getUser();
      this.roles = user.roles;
      this.showProducts = this.roles.includes('ROLE_ADMIN');
    }
  }

  // Save status changes for all complaints
  saveStatusChanges() {
    // This method is now only for non-Pending status changes
    const toUpdate = this._productlist.filter(c => c.status !== 'Pending');
    if (toUpdate.length > 0) {
      this._service.updateComplaintsStatus(toUpdate).subscribe({
        next: (data) => {
          console.log('All status changes saved successfully');
          this.refreshProductList();
        },
        error: (error) => console.log('Error while saving status changes'),
      });
    }
  }

  // Called when status is changed in the UI
  onStatusChange(complaint: Complain, previousStatus: string, newStatus: string) {
    if (newStatus === 'Pending') {
      const dialogRef = this.dialog.open(ReasonDialogComponent, {
        width: '400px',
        data: { reason: complaint.reason || '' }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result && result.trim()) {
          complaint.reason = result.trim();
          complaint.status = newStatus;
          // Save immediately to backend
          this._service.updateComplaintsStatus([complaint]).subscribe({
            next: () => this.refreshProductList(),
            error: () => console.log('Error while saving status changes')
          });
        } else {
          // User skipped, revert status
          complaint.status = previousStatus;
        }
      });
    } else if (newStatus === 'Done') {
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
          next: () => this.refreshProductList(),
          error: () => console.log('Error while saving status changes')
        });
      });
    } else {
      complaint.reason = '';
      complaint.status = newStatus;
      // Save immediately to backend for other statuses
      this._service.updateComplaintsStatus([complaint]).subscribe({
        next: () => this.refreshProductList(),
        error: () => console.log('Error while saving status changes')
      });
    }
  }

  // Navigate to the Add Product Page
  goToAddProduct() {
    this._route.navigate(['/addproduct']);
  }

  // Navigate to the Edit Product Page with the provided complainId
  goToEditProduct(complainId: number) {
    console.log('Editing complaint with id ' + complainId);
    this._route.navigate(['/editproduct', complainId]);
  }

  // Navigate to the View Product Page with the provided complainId
  goToViewProduct(complainId: number) {
    console.log('Viewing complaint with id ' + complainId);
    this._route.navigate(['/viewproduct', complainId]);
  }

  // Delete the complaint with the provided complainId and prompt for reason
  deleteProduct(complainId: number) {
    const reason = prompt("Please provide the reason for deleting this complaint:");

    if (reason) {
      console.log('Deleting complaint with id ' + complainId);
      this._service.deleteProductByIdFromRemote(complainId, reason).subscribe({
        next: (data) => {
          console.debug('Deleted Successfully');
          this.refreshProductList();
        },
        error: (error) => console.log('Exception occurred while deleting'),
      });
    } else {
      console.log('Deletion cancelled. No reason provided.');
    }
  }

  // Refresh the complaint list after deletion or status update
  refreshProductList() {
    this._service.fetchProductListFromRemote().subscribe(
      (data) => {
        this._productlist = data;
        this.filteredProductList = data; // Update the filtered list as well
      },
      (error) => console.log('Error while refreshing the complaint list')
    );
  }

  filterComplaints() {
    const term = this.searchTerm.toLowerCase();

    this.filteredProductList = this._productlist.filter((complaint) => {
      switch (this.searchBy) {
        case 'id':
          return complaint.complainId.toString().includes(term);
        case 'subject':
          return complaint.complainSubject.toLowerCase().includes(term);
        case 'department':
          return complaint.dept.toLowerCase().includes(term);
        case 'building':
          return complaint.building.toLowerCase().includes(term);
        case 'description':
          return complaint.complainDescription.toLowerCase().includes(term);
        case 'priority':
          return complaint.priority.toLowerCase().includes(term);
        case 'status':
          return complaint.status.toLowerCase().includes(term);
        default:
          return false;
      }
    });
  }


printComplaintList() {
  window.print();
  
  // for more control
  /*
  const printContent = document.getElementById('print-section');
  const WindowPrt = window.open('', '', 'width=800,height=900');
  WindowPrt.document.write('<html><head><title>Print</title>');
  WindowPrt.document.write('<style>@media print { .no-print { display: none; }}</style>');
  WindowPrt.document.write('</head><body>');
  WindowPrt.document.write(printContent.innerHTML);
  WindowPrt.document.write('</body></html>');
  WindowPrt.document.close();
  WindowPrt.focus();
  WindowPrt.print();
  WindowPrt.close();
  */
}  
  
}
