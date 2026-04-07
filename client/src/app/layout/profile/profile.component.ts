import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  activeTab: 'login' | 'signup' = 'login';
  isLoading = false;

  loginEmail = '';
  loginPassword = '';
  loginError = '';

  signupName = '';
  signupEmail = '';
  signupPassword = '';
  signupConfirmPassword = '';
  signupError = '';
  gdprAccepted = false;

  login() {
    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'Compila tutti i campi';
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    this.authService.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/my-profile']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err);
        console.error('Error response:', err.error);
        
        if (err.error?.message) {
          this.loginError = err.error.message;
        } else if (err.status === 0) {
          this.loginError = 'Errore di connessione. Verifica che il server sia in esecuzione.';
        } else if (err.status >= 500) {
          this.loginError = 'Errore del server. Riprova più tardi.';
        } else {
          this.loginError = err.error?.message || `Errore ${err.status}: ${err.statusText || 'nel login'}`;
        }
      }
    });
  }

  signup() {
    if (!this.signupName || !this.signupEmail || !this.signupPassword || !this.signupConfirmPassword) {
      this.signupError = 'Compila tutti i campi';
      return;
    }

    if (this.signupPassword !== this.signupConfirmPassword) {
      this.signupError = 'Le password non coincidono';
      return;
    }

    if (!this.gdprAccepted) {
      this.signupError = 'Devi accettare la Privacy Policy e i Termini di Servizio per registrarti.';
      return;
    }

    this.isLoading = true;
    this.signupError = '';

    this.authService.signup(this.signupName, this.signupEmail, this.signupPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.activeTab = 'login';
        this.signupName = '';
        this.signupEmail = '';
        this.signupPassword = '';
        this.signupConfirmPassword = '';
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Signup error:', err);
        console.error('Error response:', err.error);
        
        if (err.error?.message) {
          this.signupError = err.error.message;
        } else if (err.status === 0) {
          this.signupError = 'Errore di connessione. Verifica che il server sia in esecuzione.';
        } else if (err.status >= 500) {
          this.signupError = 'Errore del server. Riprova più tardi.';
        } else {
          this.signupError = err.error?.message || `Errore ${err.status}: ${err.statusText || 'nella registrazione'}`;
        }
      }
    });
  }

  continueAsGuest() {
    this.router.navigate(['/checkout']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}

