/**
 * Dianoia - Formal Uncertainty Quantification
 * Core logic module
 */

import * as fs from 'fs';
import * as path from 'path';

interface ConfidenceInterval {
  level: number;
  lower: number;
  upper: number;
  coverage: number | null;
}

interface ProbabilityDistribution {
  type: 'normal' | 'uniform' | 'beta' | 'custom';
  parameters: Record<string, number>;
  mean: number;
  stdDev: number;
}

interface CalibrationInfo {
  expectedCalibrationError: number;
  isCalibrated: boolean;
  sampleSize: number;
}

interface QuantifiedUncertainty {
  claim: string;
  pointEstimate?: number;
  confidenceIntervals: ConfidenceInterval[];
  probabilityDistribution?: ProbabilityDistribution;
  confidence: number;
  calibration: CalibrationInfo;
  formatted: string;
}

interface CalibrationBin {
  predicted: number;
  actual: number;
  count: number;
}

interface CalibrationData {
  model: string;
  totalPredictions: number;
  ece: number;
  bins: CalibrationBin[];
  lastUpdated: number;
}

type ModelId = string;

const STORAGE_DIR = path.join(process.env.HOME || '/root', '.abraxas', 'dianoia');

// Standard Z-scores for confidence levels
const Z_SCORES: Record<number, number> = {
  0.50: 0.674,
  0.80: 1.282,
  0.90: 1.645,
  0.95: 1.960,
  0.99: 2.576,
};

export class Dianoia {
  private calibrationData: Map<ModelId, CalibrationData> = new Map();
  private history: QuantifiedUncertainty[] = [];

  constructor() {
    this.ensureStorage();
    this.loadCalibrationData();
    this.loadHistory();
  }

  private ensureStorage(): void {
    const dirs = [STORAGE_DIR, path.join(STORAGE_DIR, 'intervals')];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  private loadCalibrationData(): void {
    const path_ = path.join(STORAGE_DIR, 'calibrations.json');
    if (fs.existsSync(path_)) {
      const data = JSON.parse(fs.readFileSync(path_, 'utf-8'));
      for (const [modelId, calib] of Object.entries(data)) {
        this.calibrationData.set(modelId, calib as CalibrationData);
      }
    }
  }

  private saveCalibrationData(): void {
    const data: Record<ModelId, CalibrationData> = {};
    for (const [modelId, calib] of this.calibrationData) {
      data[modelId] = calib;
    }
    fs.writeFileSync(
      path.join(STORAGE_DIR, 'calibrations.json'),
      JSON.stringify(data, null, 2)
    );
  }

  private loadHistory(): void {
    const path_ = path.join(STORAGE_DIR, 'history.json');
    if (fs.existsSync(path_)) {
      this.history = JSON.parse(fs.readFileSync(path_, 'utf-8'));
    }
  }

  private saveHistory(): void {
    // Keep only last 100 entries
    const history = this.history.slice(-100);
    fs.writeFileSync(
      path.join(STORAGE_DIR, 'history.json'),
      JSON.stringify(history, null, 2)
    );
  }

  /**
   * Generate quantified uncertainty for a claim
   */
  quantify(claim: string, baseConfidence: number = 0.5): QuantifiedUncertainty {
    // Extract potential numerical value from claim
    const numbers = claim.match(/\d+(?:,\d+)*(?:\.\d+)?/g);
    let pointEstimate: number | undefined;
    
    if (numbers && numbers.length > 0) {
      pointEstimate = parseFloat(numbers[0].replace(/,/g, ''));
    }

    // Generate confidence intervals
    const levels = [0.50, 0.80, 0.90, 0.95];
    let confidenceIntervals: ConfidenceInterval[] = [];
    
    if (pointEstimate !== undefined) {
      confidenceIntervals = this.generateIntervals(pointEstimate, 0.1, levels); // 10% error
    }

    // Get calibration info
    const calibration = this.getCalibration('default');

    const result: QuantifiedUncertainty = {
      claim,
      pointEstimate,
      confidenceIntervals,
      probabilityDistribution: pointEstimate !== undefined ? {
        type: 'normal',
        parameters: { mean: pointEstimate, stdDev: pointEstimate * 0.1 },
        mean: pointEstimate,
        stdDev: pointEstimate * 0.1,
      } : undefined,
      confidence: baseConfidence,
      calibration,
      formatted: this.formatQuantified(result),
    };

    this.history.push(result);
    this.saveHistory();

    return result;
  }

  /**
   * Generate confidence intervals
   */
  generateIntervals(
    point: number, 
    error: number, 
    levels: number[]
  ): ConfidenceInterval[] {
    return levels.map(level => {
      const zScore = Z_SCORES[level] || 1.96;
      const margin = point * error * zScore;
      
      return {
        level,
        lower: Math.max(0, point - margin),
        upper: point + margin,
        coverage: null,
      };
    });
  }

  /**
   * Format confidence interval as string
   */
  formatInterval(interval: ConfidenceInterval): string {
    const level = Math.round(interval.level * 100);
    const lower = interval.lower.toLocaleString();
    const upper = interval.upper.toLocaleString();
    return `${level}% CI: [${lower}, ${upper}]`;
  }

  /**
   * Format quantified uncertainty for display
   */
  formatQuantified(uncertainty: QuantifiedUncertainty): string {
    const parts: string[] = [];
    
    if (uncertainty.pointEstimate !== undefined) {
      parts.push(`Point estimate: ${uncertainty.pointEstimate.toLocaleString()}`);
    }
    
    if (uncertainty.confidenceIntervals.length > 0) {
      parts.push(this.formatInterval(uncertainty.confidenceIntervals[1])); // 80% CI
    }

    const confPercent = Math.round(uncertainty.confidence * 100);
    parts.push(`${confPercent}% confidence`);

    if (uncertainty.calibration.isCalibrated) {
      parts.push(`[Calibrated: ECE=${uncertainty.calibration.expectedCalibrationError.toFixed(2)}]`);
    }

    return parts.join(' | ');
  }

  /**
   * Calculate Brier Score (binary)
   */
  calculateBrierScore(prediction: number, outcome: number): number {
    return Math.pow(prediction - outcome, 2);
  }

  /**
   * Calculate Log Score
   */
  calculateLogScore(prediction: number, outcome: number): number {
    const p = Math.max(0.01, Math.min(0.99, prediction)); // Floor at 0.01
    return -Math.log(outcome > 0.5 ? p : (1 - p));
  }

  /**
   * Record outcome for calibration tracking
   */
  recordOutcome(
    claimId: string,
    predictedConfidence: number,
    actual: boolean
  ): void {
    let data = this.calibrationData.get('default');
    
    if (!data) {
      data = {
        model: 'default',
        totalPredictions: 0,
        ece: 0,
        bins: this.createBins(),
        lastUpdated: Date.now(),
      };
    }

    // Find appropriate bin
    const binIndex = Math.min(
      Math.floor(predictedConfidence * 10),
      data.bins.length - 1
    );
    
    data.bins[binIndex].count++;
    data.totalPredictions++;

    // Update actual frequency for this bin
    const bin = data.bins[binIndex];
    const newCount = bin.count;
    const currentActual = bin.actual * (newCount - 1);
    bin.actual = (currentActual + (actual ? 1 : 0)) / newCount;

    // Recalculate ECE
    data.ece = this.calculateECE(data.bins);
    data.lastUpdated = Date.now();

    this.calibrationData.set('default', data);
    this.saveCalibrationData();
  }

  private createBins(): CalibrationBin[] {
    const bins: CalibrationBin[] = [];
    for (let i = 0; i < 10; i++) {
      bins.push({
        predicted: (i + 0.5) / 10, // Center of bin
        actual: 0,
        count: 0,
      });
    }
    return bins;
  }

  /**
   * Calculate Expected Calibration Error
   */
  private calculateECE(bins: CalibrationBin[]): number {
    const total = bins.reduce((sum, bin) => sum + bin.count, 0);
    if (total === 0) return 1;

    let ece = 0;
    for (const bin of bins) {
      if (bin.count > 0) {
        const weight = bin.count / total;
        ece += weight * Math.abs(bin.predicted - bin.actual);
      }
    }
    return ece;
  }

  /**
   * Get calibration data for a model
   */
  getCalibration(modelId: string = 'default'): CalibrationInfo {
    const data = this.calibrationData.get(modelId);
    
    if (!data || data.totalPredictions < 10) {
      return {
        expectedCalibrationError: 0.1, // Default uncalibrated
        isCalibrated: false,
        sampleSize: data?.totalPredictions || 0,
      };
    }

    return {
      expectedCalibrationError: data.ece,
      isCalibrated: data.ece < 0.05,
      sampleSize: data.totalPredictions,
    };
  }

  /**
   * Get calibration breakdown
   */
  getCalibrationBreakdown(modelId: string = 'default'): CalibrationBin[] {
    return this.calibrationData.get(modelId)?.bins || this.createBins();
  }

  /**
   * Get history
   */
  getHistory(limit: number = 10): QuantifiedUncertainty[] {
    return this.history.slice(-limit);
  }

  /**
   * Get status
   */
  getStatus(): { totalQuantifications: number; calibration: CalibrationInfo } {
    return {
      totalQuantifications: this.history.length,
      calibration: this.getCalibration('default'),
    };
  }
}

export default Dianoia;