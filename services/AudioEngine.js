export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.isUnlocked = false;
  }

  async unlockAudio() {
    if (this.isUnlocked || typeof window === 'undefined') return;
    
    if(!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    this.isUnlocked = true;
  }

  async playClick(isAccent, time) {
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

  getContextTime() {
    return this.audioContext?.currentTime ?? 0;
  }

  async ensureContext() {
    await this.unlockAudio();
  }
}
