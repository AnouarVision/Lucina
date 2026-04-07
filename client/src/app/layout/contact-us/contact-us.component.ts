import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);

  contactForm: FormGroup;
  isSubmitting = signal(false);
  submitSuccess = signal(false);

  infos = [
    { icon: 'location_on', title: 'Indirizzo', content: 'Via della Bellezza, 123 - 20100 Milano' },
    { icon: 'phone', title: 'Telefono', content: '+39 02 1234 5678' },
    { icon: 'email', title: 'Email', content: 'info@lucina.com' },
    { icon: 'schedule', title: 'Orari', content: 'Lun-Ven: 9:00 - 18:00' }
  ];

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting.set(true);

      this.http.post<{ message: string }>('https://localhost:5001/api/contact/send', this.contactForm.value).subscribe({
        next: () => {
          this.snackBar.open('Messaggio inviato con successo! Ti risponderemo al più presto.', 'Chiudi', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.submitSuccess.set(true);
          this.isSubmitting.set(false);
          this.contactForm.reset();
          setTimeout(() => this.submitSuccess.set(false), 3000);
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Errore nell\'invio. Riprova più tardi.';
          this.snackBar.open(msg, 'Chiudi', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.snackBar.open('Compila tutti i campi correttamente.', 'Chiudi', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} è obbligatorio`;
    }
    if (field?.hasError('email')) {
      return 'Email non valida';
    }
    if (field?.hasError('minlength')) {
      return `Minimo ${field.getError('minlength').requiredLength} caratteri`;
    }
    if (field?.hasError('pattern')) {
      return 'Telefono non valido';
    }
    return '';
  }
}
