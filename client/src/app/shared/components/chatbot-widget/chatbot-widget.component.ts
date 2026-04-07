import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ChatbotService, ChatMessage, ChatResponse } from '../../../core/services/chatbot.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatInputModule],
  templateUrl: './chatbot-widget.component.html',
  styleUrl: './chatbot-widget.component.scss'
})
export class ChatbotWidgetComponent {
  private chatbotService = inject(ChatbotService);

  isOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  newMessage = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        if (this.messages().length === 0) {
          this.messages.set([
            {
              id: '1',
              text: 'Ciao! Sono l\'assistente Lucina. Come posso aiutarti con le tue domande sulla skincare?',
              sender: 'bot',
              timestamp: new Date()
            }
          ]);
        }
      }
    });
  }

  toggleChat(): void {
    this.isOpen.update(val => !val);
  }

  sendMessage(): void {
    const message = this.newMessage().trim();
    if (!message) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    this.messages.update(msgs => [...msgs, userMessage]);
    this.newMessage.set('');
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.chatbotService.sendMessage(message, this.messages()).subscribe({
      next: (response: ChatResponse) => {
        const botMessage: ChatMessage = {
          id: response.id,
          text: response.message,
          sender: 'bot',
          timestamp: new Date(response.timestamp)
        };
        this.messages.update(msgs => [...msgs, botMessage]);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        const status = error?.status;
        console.error('Chat error:', error);
        if (status === 429) {
          this.errorMessage.set('Troppe richieste, attendi qualche secondo e riprova.');
        } else if (status === 0) {
          this.errorMessage.set('Impossibile raggiungere il server. Controlla la connessione.');
        } else {
          this.errorMessage.set('Errore nella comunicazione. Riprova tra qualche istante.');
        }
      }
    });
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  clearChat(): void {
    this.messages.set([
      {
        id: '1',
        text: 'Conversazione azzerata. Come posso aiutarti?',
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    this.chatbotService.clearConversation();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  get messageCount(): number {
    return this.messages().length;
  }
}
