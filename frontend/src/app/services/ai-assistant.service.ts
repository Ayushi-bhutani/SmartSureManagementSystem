import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  suggestions?: string[];
  actionButton?: {
    text: string;
    route: string;
    icon?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AiAssistantService {
  private authService = inject(AuthService);
  private messages$ = new BehaviorSubject<ChatMessage[]>([]);
  private isTyping$ = new BehaviorSubject<boolean>(false);

  // Insurance knowledge base with smart pattern matching
  private knowledgeBase = [
    {
      keywords: ['claim', 'file claim', 'submit claim', 'initiate claim', 'how to claim', 'make claim'],
      response: '📋 **Filing a Claim - Step by Step:**\n\n1️⃣ Go to "My Claims" → Click "Initiate Claim"\n2️⃣ Select the policy you want to claim against\n3️⃣ Choose claim type (Accident, Theft, Damage, etc.)\n4️⃣ Provide incident details and date\n5️⃣ Upload supporting documents (photos, police report)\n6️⃣ Submit for review\n\n⏱️ **Timeline:** Your claim will be reviewed within 2-3 business days.\n\n💡 **Tip:** Have all documents ready before starting!',
      suggestions: ['What documents needed?', 'How long approval takes?', 'Check my claims'],
      actionButton: { text: 'File Claim Now', route: '/customer/initiate-claim', icon: 'assignment_add' }
    },
    {
      keywords: ['coverage', 'what is covered', 'insurance cover', 'policy cover', 'what does policy cover', 'benefits'],
      response: '🛡️ **Your Insurance Coverage:**\n\n🚗 **Vehicle Insurance Covers:**\n• Accident damage & repairs\n• Third-party liability\n• Theft protection\n• Natural disasters (flood, earthquake)\n• Fire damage\n\n🏠 **Home Insurance Covers:**\n• Property damage\n• Fire and flood\n• Theft and burglary\n• Personal liability\n• Natural calamities\n\n📄 Check your specific policy document for detailed coverage limits and exclusions.',
      suggestions: ['View my policies', 'What is NOT covered?', 'Premium calculation'],
      actionButton: { text: 'View My Policies', route: '/customer/policies', icon: 'description' }
    },
    {
      keywords: ['premium', 'price', 'cost', 'how much', 'calculate premium', 'payment', 'pay'],
      response: '💰 **Premium Calculation Factors:**\n\n📊 **Vehicle Insurance:**\n• Vehicle value and age\n• Manufacturing year\n• Location (city/state)\n• Coverage amount selected\n• Deductible chosen\n• Your driving history\n\n🏠 **Home Insurance:**\n• Property value\n• Location and area\n• Construction type\n• Coverage amount\n• Security features\n\n🎯 **Get Instant Quote:** Use our smart calculator for personalized premium estimates!',
      suggestions: ['Buy new policy', 'Payment methods', 'Available discounts?'],
      actionButton: { text: 'Calculate Premium', route: '/customer/buy-policy', icon: 'calculate' }
    },
    {
      keywords: ['document', 'documents needed', 'what documents', 'upload', 'proof', 'papers', 'required'],
      response: '📄 **Required Documents:**\n\n**For Filing Claims:**\n✓ Policy document copy\n✓ Incident photos (multiple angles)\n✓ Police report (FIR for theft/accident)\n✓ Repair estimates from garage\n✓ Medical bills (for injury claims)\n✓ Witness statements (if any)\n\n**For Buying New Policy:**\n✓ Government ID proof\n✓ Address proof\n✓ Vehicle RC / Property papers\n✓ Previous insurance copy (for renewal)\n\n💡 **Tip:** Keep digital copies for faster processing!',
      suggestions: ['File a claim', 'Buy policy', 'Check claim status']
    },
    {
      keywords: ['status', 'claim status', 'policy status', 'check status', 'track', 'where is my'],
      response: '🔍 **Track Your Status:**\n\n**Policy Status:**\n✅ Active - Coverage is live\n⏳ Pending - Under processing\n❌ Expired - Needs renewal\n🔄 Cancelled - No longer active\n\n**Claim Status:**\n📝 Submitted - Initial review pending\n🔎 Under Review - Being evaluated by team\n✅ Approved - Payment processing\n❌ Rejected - See reason in details\n💵 Settled - Completed successfully\n\n📊 View detailed status in your dashboard!',
      suggestions: ['View my policies', 'View my claims', 'Contact support'],
      actionButton: { text: 'Check My Claims', route: '/customer/claims', icon: 'assignment' }
    },
    {
      keywords: ['cancel', 'cancel policy', 'stop policy', 'terminate', 'end policy'],
      response: '⚠️ **Policy Cancellation:**\n\n**Important Information:**\n• Cancellation may have penalties\n• Partial refund based on unused period\n• No refund if claim was filed\n• Process takes 7-10 business days\n\n**To Cancel:**\n📞 Contact our support team:\n• Email: support@smartsure.com\n• Phone: 1-800-SMARTSURE\n• Hours: Mon-Fri 9AM-6PM\n\n💡 **Alternative:** Consider policy modification instead of cancellation!',
      suggestions: ['View policies', 'Contact support', 'Renewal options']
    },
    {
      keywords: ['renew', 'renewal', 'extend policy', 'policy expiring', 'expire'],
      response: '🔄 **Policy Renewal Made Easy:**\n\n**Auto-Renewal (Recommended):**\n✓ Enable in policy settings\n✓ Seamless coverage continuation\n✓ No coverage gaps\n✓ Automatic payment\n\n**Manual Renewal:**\n1️⃣ Go to "My Policies"\n2️⃣ Select expiring policy\n3️⃣ Click "Renew Now"\n4️⃣ Review terms & confirm\n5️⃣ Make payment\n\n⏰ **Pro Tip:** Renew 30 days before expiry to avoid coverage gaps and get early renewal discount!',
      suggestions: ['View policies', 'Enable auto-renewal', 'Premium calculation'],
      actionButton: { text: 'Renew Policy', route: '/customer/policies', icon: 'autorenew' }
    },
    {
      keywords: ['discount', 'offer', 'promo', 'coupon', 'save money', 'cheaper', 'deals'],
      response: '🎉 **Available Discounts & Offers:**\n\n💰 **Current Discounts:**\n• Multi-policy: 15% OFF (buy 2+ policies)\n• No-claim bonus: Up to 20% OFF\n• Early renewal: 10% OFF\n• Senior citizen: 5% OFF\n• Safe driver: 10% OFF\n• Online purchase: 5% OFF\n\n✨ **Special Offers:**\n• Refer a friend: ₹500 cashback\n• First-time buyer: 10% OFF\n\n🎯 Discounts are automatically applied at checkout!',
      suggestions: ['Buy policy', 'View current offers', 'Calculate savings'],
      actionButton: { text: 'Buy Policy & Save', route: '/customer/buy-policy', icon: 'local_offer' }
    },
    {
      keywords: ['contact', 'support', 'help', 'customer service', 'phone', 'email', 'talk', 'speak'],
      response: '📞 **Contact SmartSure Support:**\n\n**Get in Touch:**\n📧 Email: support@smartsure.com\n📱 Phone: 1-800-SMARTSURE\n💬 Live Chat: Available on website\n\n**Office Hours:**\n⏰ Monday - Friday: 9:00 AM - 6:00 PM\n⏰ Saturday: 10:00 AM - 4:00 PM\n⏰ Sunday: Closed\n\n**Visit Us:**\n🏢 SmartSure Insurance\n123 Insurance Plaza\nNew York, NY 10001\n\n⚡ **Emergency Claims:** 24/7 hotline available!',
      suggestions: ['File a claim', 'Check status', 'View policies']
    },
    {
      keywords: ['accident', 'car accident', 'vehicle damage', 'collision', 'crash', 'hit'],
      response: '🚨 **After an Accident - Action Plan:**\n\n**Immediate Steps:**\n1️⃣ Ensure safety - call emergency (911) if needed\n2️⃣ Take photos of damage (all angles)\n3️⃣ Get police report (mandatory for insurance)\n4️⃣ Exchange info with other party\n5️⃣ Note down witness details\n6️⃣ DON\'T admit fault at scene\n\n**File Your Claim:**\n📱 Go to "Initiate Claim" → Select policy → Choose "Accident" → Upload photos & police report\n\n⏱️ **Important:** File within 24 hours for faster processing!',
      suggestions: ['File accident claim', 'Required documents', 'Claim process'],
      actionButton: { text: 'File Accident Claim', route: '/customer/initiate-claim', icon: 'report_problem' }
    },
    {
      keywords: ['theft', 'stolen', 'vehicle stolen', 'car stolen', 'bike stolen', 'robbery'],
      response: '🚔 **Vehicle Theft - Immediate Actions:**\n\n**Step 1: Police Report**\n• File FIR immediately at nearest police station\n• Get FIR copy (mandatory for claim)\n• Provide vehicle details & last seen location\n\n**Step 2: Notify SmartSure**\n• Call us within 24 hours: 1-800-SMARTSURE\n• Email: claims@smartsure.com\n\n**Step 3: File Claim**\n📋 Required Documents:\n✓ FIR copy\n✓ Vehicle RC\n✓ Insurance policy\n✓ Keys (if available)\n✓ Purchase invoice\n\n⚡ **Act Fast:** File claim within 24 hours!',
      suggestions: ['File theft claim', 'Documents needed', 'Contact support'],
      actionButton: { text: 'File Theft Claim', route: '/customer/initiate-claim', icon: 'report' }
    },
    {
      keywords: ['approved', 'approval time', 'how long', 'processing time', 'when approved', 'timeline', 'duration'],
      response: '⏱️ **Claim Processing Timeline:**\n\n**Typical Processing Stages:**\n\n📝 Initial Review: 1-2 days\n   ↓\n🔍 Document Verification: 2-3 days\n   ↓\n📊 Assessment & Inspection: 3-5 days\n   ↓\n✅ Approval Decision: 5-7 days\n   ↓\n💵 Payment Processing: 2-3 days\n\n**Total Duration:** 7-15 business days\n\n📊 Track real-time status in "My Claims" section!\n\n💡 **Faster Processing:** Submit complete documents upfront.',
      suggestions: ['Check claim status', 'Upload documents', 'Contact support'],
      actionButton: { text: 'Track My Claims', route: '/customer/claims', icon: 'track_changes' }
    },
    {
      keywords: ['payment method', 'how to pay', 'pay premium', 'payment options', 'credit card', 'debit'],
      response: '💳 **Payment Methods:**\n\n**Accepted Payments:**\n✓ Credit Cards (Visa, Mastercard, Amex)\n✓ Debit Cards (All major banks)\n✓ Net Banking (150+ banks)\n✓ UPI (GPay, PhonePe, Paytm)\n✓ Digital Wallets (Paytm, Mobikwik)\n\n🔒 **Security:**\n• 256-bit SSL encryption\n• PCI-DSS compliant\n• No card details stored\n\n📅 **Payment Plans:**\n• One-time annual payment\n• Quarterly installments\n• Monthly auto-debit\n\n💡 **Save 5%** with annual payment!',
      suggestions: ['Buy policy', 'View policies', 'Premium calculation']
    },
    {
      keywords: ['buy', 'buy policy', 'new policy', 'purchase', 'get insurance', 'need insurance'],
      response: '🎯 **Buy New Policy - Quick & Easy:**\n\n**Simple 5-Minute Process:**\n\n1️⃣ Choose Type\n   • Vehicle Insurance\n   • Home Insurance\n\n2️⃣ Enter Details\n   • Basic information\n   • Asset details\n\n3️⃣ Get Instant Quote\n   • AI-powered calculation\n   • Multiple plan options\n\n4️⃣ Customize Coverage\n   • Select add-ons\n   • Choose deductible\n\n5️⃣ Make Payment\n   • Secure checkout\n   • Instant policy issuance\n\n✨ **Get your policy in 5 minutes!**',
      suggestions: ['Vehicle insurance', 'Home insurance', 'Calculate premium'],
      actionButton: { text: 'Buy Policy Now', route: '/customer/buy-policy', icon: 'shopping_cart' }
    },
    {
      keywords: ['rejected', 'claim rejected', 'why rejected', 'denial', 'denied', 'not approved'],
      response: '❌ **Claim Rejection - Next Steps:**\n\n**Common Rejection Reasons:**\n• Incomplete documentation\n• Policy exclusions apply\n• Late reporting (>48 hours)\n• Pre-existing damage\n• Fraud suspicion\n• Coverage lapsed\n\n**What You Can Do:**\n\n1️⃣ **Review Details:**\n   Check rejection reason in "My Claims"\n\n2️⃣ **Provide Additional Docs:**\n   Upload missing documents\n\n3️⃣ **File Appeal:**\n   Appeal within 30 days\n   Email: appeals@smartsure.com\n\n4️⃣ **Contact Support:**\n   Get clarification: 1-800-SMARTSURE\n\n💡 **Most rejections** can be resolved with proper documentation!',
      suggestions: ['View claims', 'Contact support', 'Upload documents'],
      actionButton: { text: 'View Claim Details', route: '/customer/claims', icon: 'info' }
    },
    {
      keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      response: '👋 Hello! Great to see you!\n\nI\'m your SmartSure AI Assistant, here to help with all your insurance needs.\n\n**I can help you with:**\n• Filing and tracking claims\n• Understanding coverage\n• Premium calculations\n• Policy management\n• Document requirements\n• And much more!\n\nWhat would you like to know today?',
      suggestions: ['File a claim', 'Check coverage', 'Buy policy', 'Contact support']
    }
  ];

  constructor() {
    // Add personalized welcome message
    this.addWelcomeMessage();
  }

  private addWelcomeMessage(): void {
    const user = this.authService.getCurrentUser();
    const userName = user?.firstName || 'there';
    
    this.addMessage({
      type: 'ai',
      text: `👋 Hi ${userName}! I'm your SmartSure AI Assistant.\n\n**I can help you with:**\n• 📋 Filing and tracking claims\n• 🛡️ Understanding your coverage\n• 💰 Premium calculations\n• 📄 Document requirements\n• 🔍 Status tracking\n• And much more!\n\n**Quick Tip:** Click on suggestion chips below for instant answers!\n\nWhat would you like to know today?`,
      suggestions: ['How to file a claim?', 'What is covered?', 'Buy new policy', 'Contact support']
    });
  }

  getMessages(): Observable<ChatMessage[]> {
    return this.messages$.asObservable();
  }

  getIsTyping(): Observable<boolean> {
    return this.isTyping$.asObservable();
  }

  sendMessage(userMessage: string): Observable<{ text: string; suggestions?: string[]; actionButton?: any }> {
    // Add user message
    const userMsg = this.addMessage({
      type: 'user',
      text: userMessage
    });

    // Show typing indicator
    this.isTyping$.next(true);

    // Find best matching response
    const response = this.findBestResponse(userMessage);

    // Simulate AI thinking delay (700-1200ms for more realistic feel)
    const thinkingTime = 700 + Math.random() * 500;

    return of(response).pipe(
      delay(thinkingTime)
    );
  }

  addAiResponse(response: { text: string; suggestions?: string[]; actionButton?: any }): void {
    this.isTyping$.next(false);
    this.addMessage({
      type: 'ai',
      text: response.text,
      suggestions: response.suggestions,
      actionButton: response.actionButton
    });
  }

  private addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const newMessage: ChatMessage = {
      ...message,
      id: this.generateId(),
      timestamp: new Date()
    };

    const current = this.messages$.value;
    this.messages$.next([...current, newMessage]);

    return newMessage;
  }

  private findBestResponse(userMessage: string): { text: string; suggestions?: string[]; actionButton?: any } {
    const normalizedMessage = userMessage.toLowerCase().trim();

    // Find all matching knowledge base entries
    const matches = this.knowledgeBase.map(entry => {
      const matchCount = entry.keywords.filter(keyword => 
        normalizedMessage.includes(keyword.toLowerCase())
      ).length;
      return { entry, matchCount };
    }).filter(m => m.matchCount > 0);

    // Sort by match count (best match first)
    matches.sort((a, b) => b.matchCount - a.matchCount);

    // Return best match or default response
    if (matches.length > 0) {
      const bestMatch = matches[0].entry;
      return {
        text: bestMatch.response,
        suggestions: bestMatch.suggestions,
        actionButton: bestMatch.actionButton
      };
    }

    // Default response for unmatched queries
    return {
      text: '🤔 I\'m here to help!\n\nI specialize in insurance-related questions. I can assist you with:\n\n• 📋 Filing and tracking claims\n• 🛡️ Understanding your coverage\n• 💰 Premium calculations\n• 📄 Document requirements\n• 🔍 Status tracking\n• 📞 Contact information\n• 💳 Payment methods\n• 🎉 Discounts and offers\n\nCould you please rephrase your question or choose from the suggestions below?',
      suggestions: ['File a claim', 'Check coverage', 'Calculate premium', 'Contact support']
    };
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  clearChat(): void {
    this.messages$.next([]);
    // Re-add welcome message
    this.addWelcomeMessage();
  }
}
