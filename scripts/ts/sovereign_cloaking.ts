
export interface CloakedFragment {
  original: string;
  cloaked: string;
  key: string;
}

export class SovereignCloaker {
  cloak(signal: string, key: string): CloakedFragment {
    const blur = this.generateSovereignStatic(signal, key);
    return {
      original: signal,
      cloaked: blur,
      key: key
    };
  }

  uncloak(cloaked: string, key: string): string {
    return this.generateSovereignStatic(cloaked, key);
  }

  private generateSovereignStatic(text: string, key: string): string {
    const keyChars = key.split('');
    return text.split('').map((char, i) => {
      const keyChar = keyChars[i % keyChars.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
    }).join('');
  }
}
