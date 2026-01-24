import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgserviceService } from '../ngservice.service';
import Swal from 'sweetalert2';
import { Complain } from '../product';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-editproduct',
  templateUrl: './editproduct.component.html',
  styleUrls: ['./editproduct.component.css']
})
export class EditproductComponent {
  public complaint: Complain = new Complain(
    0,                // complainId: number
    "",               // complainSubject: string
    "",               // complainDescription: string
    "",               // roleOfComplainer: string
    "",               // mobileNumber: string
    "",               // dept: string
    0,                // roomNo: number
    0,                // floorNo: number
    "",               // building: string
    "",               // imageOfSubject: string
    "",               // email: string
    "",               // status: string
    "",               // createdDate: string
    "Low",            // priority: string
    "",""                // note: string
    // reason?: string (optional, can be omitted or set as needed)
  );
  public isHighPriority: boolean = false; // Reflects the toggle state
  showProducts = false;
  isLoggedIn= false;
  private roles: string[] = [];
  constructor(
    private _route: Router,
    private _service: NgserviceService,
    private _activatedRoute: ActivatedRoute,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    let id = parseInt(this._activatedRoute.snapshot.paramMap.get('id') || '', 10); // Fetch ID
    this._service.fetchProductByIdFromRemote(id).subscribe({
      next: (data) => {
        this.complaint = data;
        this.isHighPriority = this.complaint.priority === 'High'; // Sync toggle with complaint priority
      },
      error: (error) => console.log("Error occurred")
    });

    this.isLoggedIn = !!this.storageService.getToken();
    
    if (this.isLoggedIn) {
      const user = this.storageService.getUser();
      this.roles = user.roles;
      this.showProducts = this.roles.includes('ROLE_ADMIN');
    }
  }
  
  updateProductformsubmit() {
    // Reflect toggle in complaint priority
       this.complaint.priority = this.isHighPriority ? 'High' : 'Low';
    
    let id = this.complaint.complainId;
  
    // Log the complaint data for debugging
    console.log("Updating complaint with ID:", id, "Updated priority:", this.complaint.priority);
  
    // Call the service to update the product
    this._service.updateProductToRemote(id, this.complaint).subscribe({
      next: (data) => {
        console.log("Complaint updated successfully:", data); // Log the response data
  
        // Check if the response is actually a success
        if (data && data.status === 'success') {
          // Show success message using SweetAlert
          
          Swal.fire({
            title: 'Complaint Updated',
            text: 'The priority has been updated successfully.',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then((result) => {
            if (result.isConfirmed) {
              // Navigate to the product list after confirmation
              this._route.navigate(['/productlist']);
            }
          });
        } else {
          // If the response does not indicate success, show error
          Swal.fire('Error', 'Failed to update complaint priority.', 'error');
        }
      },
      error: (error) => {
        console.log("Error occurred while updating complaint: ", error);
        Swal.fire({
          title: 'Complaint Updated',
          text: 'The priority has been updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.isConfirmed) {
            // Navigate to the product list after confirmation
            this._route.navigate(['/productlist']);
          }
        });
      }
    });
  }
  


  gotolist() {
    console.log('Go back');
    this._route.navigate(['productlist']);
  }

  goToViewProduct(complainId: number) {
    console.log('Viewing complaint with id ' + complainId);
    this._route.navigate(['/viewproduct', complainId]);
  }

  togglePriority() {
    this.isHighPriority = !this.isHighPriority; 
  }
}
