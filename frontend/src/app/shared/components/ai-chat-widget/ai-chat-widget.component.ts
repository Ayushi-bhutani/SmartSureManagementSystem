import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AiAssistantService, ChatMessage } from '../../../services/ai-assistant.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ai-chat-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ],
  templateUrl: './ai-chat-widget.component.html',
  styleUrls: ['./ai-chat-widget.component.scss']
})
export class AiChatWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  private aiService = inject(AiAssistantService);
  private router = inject(Router);
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;

  isOpen = false;
  isMinimized = false;
  messages: ChatMessage[] = [];
  isTyping = false;
  userInput = '';

  ngOnInit(): void {
    // Subscribe to messages
    this.subscriptions.push(
      this.aiService.getMessages().subscribe(messages => {
        this.messages = messages;
        this.shouldScrollToBottom = true;
      })
    );

    // Subscribe to typing indicator
    this.subscriptions.push(
      this.aiService.getIsTyping().subscribe(typing => {
        this.isTyping = typing;
        if (typing) {
          this.shouldScrollToBottom = true;
        }
      })
    );
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isMinimized = false;
      this.shouldScrollToBottom = true;
    }
  }

  minimizeChat(): void {
    this.isMinimized = !this.isMinimized;
    if (!this.isMinimized) {
      this.shouldScrollToBottom = true;
    }
  }

  closeChat(): void {
    this.isOpen = false;
    this.isMinimized = false;
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    const message = this.userInput.trim();
    this.userInput = '';

    // Send message and get response
    this.aiService.sendMessage(message).subscribe(response => {
      this.aiService.addAiResponse(response);
    });
  }

  selectSuggestion(suggestion: string): void {
    this.userInput = suggestion;
    this.sendMessage();
  }

  clearChat(): void {
    if (confirm('Are you sure you want to clear the chat history?')) {
      this.aiService.clearChat();
    }
  }

  navigateToAction(route: string): void {
    this.router.navigate([route]);
    // Optionally minimize chat after navigation
    this.isMinimized = true;
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  formatMessageText(text: string): string {
    // Convert markdown-style bold to HTML
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert line breaks to <br> tags
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  }
}
