import { Component } from '@angular/core';
import {MatCard} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-skincare-routine',
  imports: [
    MatCard,
    MatIcon,
    MatButton,
    NgForOf
  ],
  templateUrl: './skincare-routine.component.html',
  styleUrl: './skincare-routine.component.scss'
})
export class SkincareRoutineComponent {
  routines = [
    {
      title: 'Detersione',
      description: 'Rimuovi impurità e trucco con un detergente delicato adatto al tuo tipo di pelle.',
      icon: 'cleaning_services'
    },
    {
      title: 'Tonificazione',
      description: 'Equilibra il pH della pelle e prepara per i trattamenti successivi.',
      icon: 'tune'
    },
    {
      title: 'Trattamenti',
      description: 'Applica sieri o prodotti specifici per idratazione, anti-età o acne.',
      icon: 'healing'
    },
    {
      title: 'Idratazione',
      description: 'Proteggi e nutri la pelle con creme idratanti adatte al tuo tipo di pelle.',
      icon: 'opacity'
    },
    {
      title: 'Protezione Solare',
      description: 'Applica sempre protezione solare durante il giorno per prevenire danni e invecchiamento.',
      icon: 'wb_sunny'
    }
  ];
}
