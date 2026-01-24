import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  email: string = '';
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      Swal.fire('Error', 'Passwords Mismatch. Please try again.', 'error');
      return; // Stop the function here if they don't match
    }
    this.authService.resetPassword(this.email, this.otp, this.newPassword).subscribe(
      response => {
        Swal.fire('Success', 'Password has been reset successfully.', 'success').then(() => {
          this.router.navigate(['/login']);
        });
      },
      error => {
        Swal.fire('Error', 'Failed to reset password. Please try again.', 'error');
      }
    );
  }
}
