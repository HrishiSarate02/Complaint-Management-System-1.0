import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.forgotPassword(this.email).subscribe(
      response => {
        Swal.fire('Success', 'OTP sent to your email. Please check your inbox.', 'success').then(() => {
          this.router.navigate(['/reset-password']);
        });
      },
      error => {
        Swal.fire('Error', 'Failed to send OTP. Please try again.', 'error');
      }
    );
  }
}
