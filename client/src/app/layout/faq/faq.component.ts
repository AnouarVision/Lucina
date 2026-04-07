import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: 'account' | 'payment' | 'orders' | 'returns';
  icon: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);

  constructor(public router: Router) {}

  categories: Category[] = [
    { id: 'account', name: 'Account', icon: 'person', color: 'from-blue-50 to-blue-100' },
    { id: 'payment', name: 'Pagamenti', icon: 'credit_card', color: 'from-green-50 to-green-100' },
    { id: 'orders', name: 'Ordini', icon: 'local_shipping', color: 'from-purple-50 to-purple-100' },
    { id: 'returns', name: 'Resi', icon: 'assignment_return', color: 'from-orange-50 to-orange-100' }
  ];

  faqs: FAQ[] = [
    {
      id: 1,
      category: 'account',
      question: 'Come posso creare un account?',
      answer: 'Puoi creare un account cliccando sull\'icona del profilo in alto a destra e selezionando "Registrati". Compila il modulo con le informazioni richieste e conferma l\'email. Potrai poi accedere al tuo account personale.',
      icon: 'person_add'
    },
    {
      id: 2,
      category: 'account',
      question: 'Ho dimenticato la mia password. Cosa faccio?',
      answer: 'Clicca su "Accedi" e poi su "Password dimenticata?". Inserisci la tua email e riceverai un link per reimpostare la password. Il link è valido per 24 ore.',
      icon: 'lock_reset'
    },
    {
      id: 3,
      category: 'payment',
      question: 'Quali metodi di pagamento sono accettati?',
      answer: 'Accettiamo pagamenti tramite carta di credito (Visa, Mastercard, American Express), PayPal e bonifico bancario. Tutti i pagamenti sono sicuri, crittografati e protetti.',
      icon: 'payment'
    },
    {
      id: 4,
      category: 'payment',
      question: 'È sicuro inserire i dati della mia carta?',
      answer: 'Sì, i tuoi dati sono completamente sicuri. Utilizziamo il protocollo SSL/TLS 256-bit e conformiamo tutti gli standard PCI DSS. La tua carta non è mai memorizzata sui nostri server.',
      icon: 'security'
    },
    {
      id: 5,
      category: 'payment',
      question: 'Posso salvare la mia carta per i prossimi acquisti?',
      answer: 'Certo! Normalmente ti proponiamo di salvare i dati del pagamento per gli acquisti futuri. Puoi selezionare e modificare i metodi di pagamento salvati nel tuo profilo.',
      icon: 'bookmark'
    },
    {
      id: 6,
      category: 'orders',
      question: 'Come posso tracciare il mio ordine?',
      answer: 'Dopo aver completato l\'ordine, riceverai una email con il numero di tracking. Puoi anche accedere alla sezione "I miei ordini" nel tuo account per visualizzare lo stato e i dettagli.',
      icon: 'local_shipping'
    },
    {
      id: 7,
      category: 'orders',
      question: 'Quali sono i tempi di consegna?',
      answer: 'I tempi di consegna dipendono dal metodo scelto: Standard (5-7 giorni), Express (2-3 giorni), Overnight (1 giorno). Durante l\'checkout puoi scegliere l\'opzione preferita.',
      icon: 'schedule'
    },
    {
      id: 8,
      category: 'orders',
      question: 'Spedite internazionalmente?',
      answer: 'Attualmente spediamo solo in Italia. Stiamo lavorando all\'espansione internazionale. Contatta il nostro servizio clienti per informazioni su spedizioni speciali.',
      icon: 'language'
    },
    {
      id: 9,
      category: 'returns',
      question: 'Posso restituire un prodotto?',
      answer: 'Sì, puoi restituire un prodotto entro 14 giorni dalla consegna. I prodotti devono essere integri e nella confezione originale. Contatta il servizio clienti per avviare la procedura.',
      icon: 'assignment_return'
    },
    {
      id: 10,
      category: 'returns',
      question: 'Mi verrà rimborsato il costo della spedizione?',
      answer: 'Se la restituzione è dovuta a nostro errore (prodotto danneggiato, non corrispondente), il rimborso include la spedizione di ritorno. Altrimenti, la spedizione di ritorno è a carico del cliente.',
      icon: 'money_off'
    },
    {
      id: 11,
      category: 'returns',
      question: 'Quanto tempo impiega il rimborso?',
      answer: 'Dopo aver ricevuto e verificato il prodotto restituito, il rimborso viene elaborato entro 5-7 giorni lavorativi. Vedrai l\'importo accreditato sul tuo conto dopo questo periodo.',
      icon: 'schedule'
    }
  ];

  filteredFaqs = computed(() => {
    let filtered = this.faqs;

    if (this.selectedCategory()) {
      filtered = filtered.filter(faq => faq.category === this.selectedCategory());
    }

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  getCategoryInfo(category: string) {
    return this.categories.find(c => c.id === category);
  }

  selectCategory(categoryId: string | null) {
    this.selectedCategory.set(this.selectedCategory() === categoryId ? null : categoryId);
  }
}
