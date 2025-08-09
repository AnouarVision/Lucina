import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss']
})
export class AnnouncementComponent implements AfterViewInit, OnDestroy {
  messages = [
    'ISCRIVITI ALLA NEWSLETTER PER RICEVERE UN <strong>10% DI SCONTO</strong> SUL PRIMO ORDINE!',
    'SPEDIZIONE GRATUITA A PARTIRE DA €65!',
    'VUOI DIVENTARE RIVENDITORE LUCINA? <a href="/pages/vendita-b2b" class="underline">CLICCA QUI</a>'
  ];

  @ViewChild('viewport', { static: true }) viewport!: ElementRef<HTMLElement>;
  @ViewChild('track', { static: true }) track!: ElementRef<HTMLElement>;

  private currentIndex = 0;
  private timer: any = null;
  private speedPxPerSec = 120; // regola la velocità: px al secondo
  private pauseSeconds = 0.7;  // pausa dopo che il testo esce a sinistra
  private onResizeBound = this.onResize.bind(this);

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    // avvia la sequenza
    this.playCurrent();
    window.addEventListener('resize', this.onResizeBound);
  }

  private playCurrent() {
    const vp = this.viewport.nativeElement;
    const tr = this.track.nativeElement;

    // Inserisco il contenuto (attento a XSS se proveniente da esterno)
    tr.innerHTML = this.messages[this.currentIndex];

    // Reset posizione / transizione
    this.renderer.setStyle(tr, 'transition', 'none');
    this.renderer.setStyle(tr, 'transform', `translateX(${vp.clientWidth}px)`);

    // lasciamo che il browser abbia il tempo di paint
    requestAnimationFrame(() => {
      const vpW = vp.clientWidth;
      const trW = tr.scrollWidth;
      const distance = vpW + trW;
      // durata in secondi, min 1.5s per evitare durate troppo corte
      const duration = Math.max(1.5, distance / this.speedPxPerSec);

      // applico la transizione e parto
      this.renderer.setStyle(tr, 'transition', `transform ${duration}s linear`);
      // start (assicurato prima): translateX(vpW)
      requestAnimationFrame(() => {
        // fine: fuori a sinistra di trW px
        this.renderer.setStyle(tr, 'transform', `translateX(-${trW}px)`);
      });

      // alla fine della transizione, passo al messaggio successivo
      this.clearTimer();
      this.timer = setTimeout(() => {
        this.currentIndex = (this.currentIndex + 1) % this.messages.length;
        this.playCurrent();
      }, (duration + this.pauseSeconds) * 1000);
    });
  }

  private onResize() {
    // al resize interrompo e ri-avvio dalla stessa slide
    this.clearTimer();
    // piccola pausa per evitare ricalcoli continui durante resize
    setTimeout(() => this.playCurrent(), 120);
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  ngOnDestroy() {
    this.clearTimer();
    window.removeEventListener('resize', this.onResizeBound);
  }
}
