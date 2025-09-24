export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private async unlockAudio(): Promise<void> {
    if (this.isUnlocked || !this.audioContext) return;
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    this.isUnlocked = true;
  }

  public async playClick(isAccent: boolean, time: number): Promise<void> {
    await this.unlockAudio();
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const freq = isAccent ? 1200 : 880;
    const gain = isAccent ? 0.6 : 0.4;
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, time);
    
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(gain, time + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    oscillator.start(time);
    oscillator.stop(time + 0.05);
  }

  public getContextTime(): number {
    return this.audioContext?.currentTime ?? 0;
  }

  public async ensureContext(): Promise<void> {
    await this.unlockAudio();
  }
}
