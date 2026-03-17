/**
 * Prometheus - User Preference Learning
 * Core logic module
 */

import * as fs from 'fs';
import * as path from 'path';

type DetailLevel = 'terse' | 'balanced' | 'detailed' | 'comprehensive';
type DomainExpertise = 'novice' | 'intermediate' | 'advanced' | 'specialist';
type RiskTolerance = 'low' | 'medium' | 'high' | 'custom';
type CommunicationStyle = 'formal' | 'casual' | 'technical' | 'simple';

interface UserPreferences {
  detailLevel: DetailLevel;
  domainExpertise: DomainExpertise;
  riskTolerance: RiskTolerance;
  communicationStyle: CommunicationStyle;
  preferredSources: string[];
  customSettings: Record<string, unknown>;
}

interface PreferenceConfidence {
  detailLevel: number;
  domainExpertise: number;
  riskTolerance: number;
  communicationStyle: number;
}

interface SignalCounts {
  total: number;
  explicit: number;
  implicit: number;
  lastSignal: number;
}

interface UserProfile {
  userId: string;
  preferences: UserPreferences;
  signals: SignalCounts;
  confidence: PreferenceConfidence;
  updated: number;
}

interface ImplicitSignal {
  type: 'followup' | 'rejection' | 'clarification' | 'acknowledgment' | 'terminology' | 'deep_followup';
  interpretation: string;
  weight: number;
  timestamp: number;
}

interface ExplicitSignal {
  type: 'set' | 'update' | 'correct';
  key: string;
  value: unknown;
  timestamp: number;
}

const STORAGE_DIR = path.join(process.env.HOME || '/root', '.abraxas', 'prometheus');

const DEFAULT_PROFILE: UserProfile = {
  userId: 'default',
  preferences: {
    detailLevel: 'balanced',
    domainExpertise: 'intermediate',
    riskTolerance: 'medium',
    communicationStyle: 'technical',
    preferredSources: [],
    customSettings: {},
  },
  signals: {
    total: 0,
    explicit: 0,
    implicit: 0,
    lastSignal: 0,
  },
  confidence: {
    detailLevel: 0.5,
    domainExpertise: 0.5,
    riskTolerance: 0.5,
    communicationStyle: 0.5,
  },
  updated: Date.now(),
};

export class Prometheus {
  private profiles: Map<string, UserProfile> = new Map();
  private currentUserId: string = 'default';

  constructor() {
    this.ensureStorage();
    this.loadProfiles();
  }

  private ensureStorage(): void {
    const dirs = [STORAGE_DIR, path.join(STORAGE_DIR, 'profiles'), path.join(STORAGE_DIR, 'signals')];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  private loadProfiles(): void {
    const profilesPath = path.join(STORAGE_DIR, 'profiles');
    if (!fs.existsSync(profilesPath)) return;

    const files = fs.readdirSync(profilesPath);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const userId = file.replace('.json', '');
        const data = fs.readFileSync(path.join(profilesPath, file), 'utf-8');
        this.profiles.set(userId, JSON.parse(data));
      }
    }

    // Ensure default profile exists
    if (!this.profiles.has('default')) {
      this.profiles.set('default', { ...DEFAULT_PROFILE });
      this.saveProfile('default');
    }
  }

  private saveProfile(userId: string): void {
    const profile = this.profiles.get(userId);
    if (profile) {
      fs.writeFileSync(
        path.join(STORAGE_DIR, 'profiles', `${userId}.json`),
        JSON.stringify(profile, null, 2)
      );
    }
  }

  getProfile(userId?: string): UserProfile {
    const id = userId || this.currentUserId;
    return this.profiles.get(id) || { ...DEFAULT_PROFILE, userId: id };
  }

  setProfile(userId: string): void {
    this.currentUserId = userId;
    if (!this.profiles.has(userId)) {
      this.profiles.set(userId, { ...DEFAULT_PROFILE, userId });
      this.saveProfile(userId);
    }
  }

  setPreference(key: keyof UserPreferences, value: unknown): UserProfile {
    const profile = this.getProfile();
    if (key in profile.preferences) {
      (profile.preferences as Record<string, unknown>)[key] = value;
      profile.signals.explicit++;
      profile.signals.total++;
      profile.signals.lastSignal = Date.now();
      profile.updated = Date.now();
      this.saveProfile(profile.userId);
    }
    return profile;
  }

  recordSignal(signal: ImplicitSignal | ExplicitSignal): void {
    const profile = this.getProfile();
    
    if ('key' in signal) {
      // Explicit signal
      profile.signals.explicit++;
      if (signal.type === 'set' || signal.type === 'update') {
        (profile.preferences as Record<string, unknown>)[signal.key] = signal.value;
        profile.confidence[signal.key as keyof PreferenceConfidence] = 1.0; // Explicit = 100% confidence
      }
    } else {
      // Implicit signal
      profile.signals.implicit++;
      this.updateFromImplicitSignal(profile, signal);
    }

    profile.signals.total++;
    profile.signals.lastSignal = Date.now();
    profile.updated = Date.now();
    this.saveProfile(profile.userId);
  }

  private updateFromImplicitSignal(profile: UserProfile, signal: ImplicitSignal): void {
    // Bayesian-inspired update
    const strength = signal.weight * 0.1;

    switch (signal.type) {
      case 'followup':
        // User wants more detail - increase detail level
        this.movePreference(profile, 'detailLevel', 1, strength);
        break;
      case 'rejection':
        // User rejected something - reduce confidence in current preference
        // Don't change preference, just note the signal
        break;
      case 'clarification':
        // User needs simpler explanation
        this.movePreference(profile, 'detailLevel', -1, strength);
        break;
      case 'acknowledgment':
        // Quick ack - user prefers concise
        this.movePreference(profile, 'detailLevel', -1, strength);
        break;
      case 'terminology':
      case 'deep_followup':
        // User shows expertise
        this.movePreference(profile, 'domainExpertise', 1, strength);
        break;
    }
  }

  private movePreference(
    profile: UserProfile, 
    key: keyof PreferenceConfidence, 
    direction: number, 
    strength: number
  ): void {
    const levels = key === 'detailLevel' 
      ? ['terse', 'balanced', 'detailed', 'comprehensive']
      : key === 'domainExpertise'
      ? ['novice', 'intermediate', 'advanced', 'specialist']
      : key === 'riskTolerance'
      ? ['low', 'medium', 'high']
      : ['formal', 'casual', 'technical', 'simple'];

    const currentValue = profile.preferences[key];
    const currentIndex = levels.indexOf(currentValue as string);
    
    if (currentIndex === -1) return;

    const newIndex = Math.max(0, Math.min(levels.length - 1, currentIndex + direction));
    (profile.preferences as Record<string, unknown>)[key] = levels[newIndex];
    
    // Update confidence
    profile.confidence[key] = Math.min(1, profile.confidence[key] + strength);
  }

  learn(userId?: string): UserProfile {
    // In a full implementation, this would run more sophisticated learning
    // For now, it just returns the current profile
    return this.getProfile(userId);
  }

  clearProfile(userId: string): void {
    this.profiles.set(userId, { ...DEFAULT_PROFILE, userId });
    this.saveProfile(userId);
  }

  getSignals(limit: number = 10): { total: number; explicit: number; implicit: number } {
    const profile = this.getProfile();
    return {
      total: profile.signals.total,
      explicit: profile.signals.explicit,
      implicit: profile.signals.implicit,
    };
  }

  getStatus(): { currentUser: string; totalProfiles: number } {
    return {
      currentUser: this.currentUserId,
      totalProfiles: this.profiles.size,
    };
  }

  /**
   * Apply preferences to output
   */
  applyPreferences(output: string): string {
    const profile = this.getProfile();
    
    // Adjust output based on preferences
    switch (profile.preferences.detailLevel) {
      case 'terse':
        // Extract main point only
        const sentences = output.split(/[.!?]+/).filter(s => s.trim());
        return sentences[0]?.trim() || output;
      case 'balanced':
        // Moderate pruning - keep key points
        return output;
      case 'detailed':
      case 'comprehensive':
        // Full output
        return output;
    }
    
    return output;
  }
}

export default Prometheus;