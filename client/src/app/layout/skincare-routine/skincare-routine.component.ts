import { Component, inject, signal } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {NgForOf, CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';

interface RoutineStep {
  title: string;
  description: string;
  icon: string;
  time: string;
  frequency: string;
  tips: string[];
  products: { name: string; category: string; id: number }[];
}

interface SkinType {
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-skincare-routine',
  imports: [
    MatIcon,
    NgForOf,
    CommonModule,
    MatTabsModule
  ],
  templateUrl: './skincare-routine.component.html',
  styleUrl: './skincare-routine.component.scss'
})
export class SkincareRoutineComponent {
  private router = inject(Router);

  selectedSkinType = signal<string>('normal');
  selectedRoutineType = signal<'morning' | 'evening'>('morning');
  expandedFaq = signal<number | null>(null);

  skinTypes: SkinType[] = [
    { name: 'normal', icon: 'sentiment_satisfied', description: 'Pelle Normale' },
    { name: 'oily', icon: 'oil_barrel', description: 'Pelle Grassa' },
    { name: 'dry', icon: 'grain', description: 'Pelle Secca' },
    { name: 'sensitive', icon: 'favorite', description: 'Pelle Sensibile' }
  ];

  morningRoutine: RoutineStep[] = [
    {
      title: 'Detersione',
      description: 'Rimuovi le impurità accumulate durante la notte con un detergente delicato.',
      icon: 'cleaning_services',
      time: '2-3 min',
      frequency: 'Ogni mattina',
      tips: ['Usa acqua tiepida', 'Applicare con movimenti circolari', 'Asciugare delicatamente'],
      products: [
        { name: 'Mirea Soft Cleanser', category: 'Cleanser', id: 9 },
        { name: 'Oryne Melt Balm', category: 'Cleanser', id: 10 }
      ]
    },
    {
      title: 'Tonificazione',
      description: 'Equilibra il pH e prepara la pelle per i trattamenti successivi.',
      icon: 'tune',
      time: '1 min',
      frequency: 'Ogni mattina',
      tips: ['Immergere un dischetto di cotone', 'Applicare delicatamente', 'Non strofinare'],
      products: [
        { name: 'Hydralis Deep Toner', category: 'Toner', id: 3 },
        { name: 'Nuvia Clear Toner', category: 'Toner', id: 5 }
      ]
    },
    {
      title: 'Siero/Essence',
      description: 'Applica un siero idratante o anti-età per un trattamento intenso.',
      icon: 'opacity',
      time: '2 min',
      frequency: 'Ogni mattina',
      tips: ['Usare 2-3 gocce', 'Tamponare delicatamente', 'Attendere 1 minuto'],
      products: [
        { name: 'Serenya Green Serum', category: 'Serum', id: 7 },
        { name: 'Lunara Dew Essence', category: 'Essence', id: 1 }
      ]
    },
    {
      title: 'Idratazione',
      description: 'Proteggi e nutri la pelle con una crema leggera e idratante.',
      icon: 'water_drop',
      time: '2 min',
      frequency: 'Ogni mattina',
      tips: ['Usare una quantità pisello-sized', 'Massaggiare fino ad assorbimento', 'Attendere 2-3 minuti'],
      products: [
        { name: 'Veyra Calm Cream', category: 'Cream', id: 4 }
      ]
    },
    {
      title: 'Protezione Solare',
      description: 'SPF 30+ essenziale durante il giorno per prevenire danni UV.',
      icon: 'wb_sunny',
      time: '2 min',
      frequency: 'Sempre di giorno',
      tips: ['Applicare generosamente', 'Riapplicare ogni 2 ore se all\'aperto', 'Non dimenticare il collo'],
      products: [
        { name: 'Consigliato: Sunscreen SPF 50+', category: 'Sunscreen', id: 0 }
      ]
    }
  ];

  eveningRoutine: RoutineStep[] = [
    {
      title: 'Detersione Leggera',
      description: 'Rimuovi trucco e sporco della giornata con detergente delicato.',
      icon: 'cleaning_services',
      time: '2-3 min',
      frequency: 'Ogni sera',
      tips: ['Inizia con movimenti circolari', 'Risciacqua abbondantemente', 'Ripeti se necessario'],
      products: [
        { name: 'Mirea Soft Cleanser', category: 'Cleanser', id: 9 },
        { name: 'Oryne Melt Balm', category: 'Cleanser', id: 10 }
      ]
    },
    {
      title: 'Tonificazione',
      description: 'Prepara la pelle per i trattamenti notturni intensi.',
      icon: 'tune',
      time: '1 min',
      frequency: 'Ogni sera',
      tips: ['Applicare su dischetto di cotone', 'Coprire viso e collo', 'Attendere 30 secondi'],
      products: [
        { name: 'Hydralis Deep Toner', category: 'Toner', id: 3 }
      ]
    },
    {
      title: 'Siero Intenso',
      description: 'Applica un siero nutriente per il trattamento notturno anti-age.',
      icon: 'healing',
      time: '2 min',
      frequency: 'Ogni sera',
      tips: ['Usare prodotto specifico notturno', 'Massaggiare delicatamente', 'Permettere assorbimento completo'],
      products: [
        { name: 'Serenya Green Serum', category: 'Serum', id: 7 }
      ]
    },
    {
      title: 'Crema Notte',
      description: 'Crema ricca e rigenerante per il rinnovamento notturno della pelle.',
      icon: 'nights_stay',
      time: '2 min',
      frequency: 'Ogni sera',
      tips: ['Usare quantità generosa', 'Massaggiare bene', 'Applicare prima di dormire'],
      products: [
        { name: 'Veyra Calm Cream', category: 'Cream', id: 4 }
      ]
    },
    {
      title: 'Maschera (2-3x settimana)',
      description: 'Trattamento intenso per risultati visibili e pelle rigenerata.',
      icon: 'theater_comedy',
      time: '10-15 min',
      frequency: '2-3 volte a settimana',
      tips: ['Applicare strato uniforme', 'Evitare occhi e labbra', 'Risciacquare con acqua tiepida'],
      products: [
        { name: 'Elios Dream Mask', category: 'Mask', id: 6 },
        { name: 'Velura Aqua Sheet Mask', category: 'Sheet Mask', id: 8 }
      ]
    }
  ];

  faqs = [
    {
      question: 'Quante volte al giorno dovrei fare la skincare routine?',
      answer: 'L\'ideale è 2 volte al giorno: una routine mattutina (leggera) e una serale (più intensa). Se la pelle è molto sensibile, puoi iniziare solo con la sera.'
    },
    {
      question: 'Posso usare gli stessi prodotti mattina e sera?',
      answer: 'Dipende dal tipo di pelle. La mattina preferisci prodotti leggeri e con SPF. La sera puoi usare formule più ricche e nutrienti. Alcuni prodotti come tonici e sieri possono essere usati in entrambi i momenti.'
    },
    {
      question: 'Qual è l\'ordine corretto di applicazione?',
      answer: 'Ricorda la regola "dal più leggero al più pesante": Detergente → Tonico → Siero/Essence → Idratante → Sunscreen (mattina). La pesantezza aumenta per permettere assorbimento completo.'
    },
    {
      question: 'Quanto devo aspettare tra un prodotto e l\'altro?',
      answer: 'Generalmente 30 secondi a 1 minuto è sufficiente perché il prodotto sia assorbito. Per i sieri intensi, puoi aspettare 2-3 minuti. Ascolta la tua pelle!'
    },
    {
      question: 'Cosa fare se noto irritazione o arrossamento?',
      answer: 'Riduci la frequenza d\'uso a 1-2 volte a settimana, usa meno prodotto, o passa a formule più delicate. Se il problema persiste, consulta un dermatologo.'
    }
  ];

  goToShop(productId?: number) {
    if (productId && productId > 0) {
      this.router.navigate(['/shop', productId]);
    } else {
      this.router.navigate(['/shop']);
    }
  }

  setSkinType(skinType: string) {
    this.selectedSkinType.set(skinType);
  }

  setRoutineType(type: 'morning' | 'evening') {
    this.selectedRoutineType.set(type);
  }

  toggleFaq(index: number) {
    this.expandedFaq.set(this.expandedFaq() === index ? null : index);
  }

  getCurrentRoutine() {
    return this.selectedRoutineType() === 'morning' ? this.morningRoutine : this.eveningRoutine;
  }
}
