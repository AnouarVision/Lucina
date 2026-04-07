import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  id: string;
  message: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:5001/api/chatbot';

  sendMessage(message: string, history: ChatMessage[] = []): Observable<ChatResponse> {
    const request = {
      message: message,
      conversationHistory: history.map(m => ({ text: m.text, sender: m.sender }))
    };
    return this.http.post<ChatResponse>(`${this.apiUrl}/message`, request);
  }

  clearConversation(): void {
    return;
  }
}
