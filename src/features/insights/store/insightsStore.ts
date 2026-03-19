'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PredictionResult, CorrelationResult, OutlierSummary } from '@/types/prediction'
import type { AnalysisWindow } from '@/config/constants'

interface InsightsStoreState {
  predictionResult: PredictionResult | null
  correlationResult: CorrelationResult | null
  outlierSummary: OutlierSummary | null
  analysisWindow: AnalysisWindow
  isComputing: boolean
  lastComputedAt: number | null
  setPrediction: (r: PredictionResult) => void
  setCorrelation: (r: CorrelationResult, o: OutlierSummary) => void
  setWindow: (w: AnalysisWindow) => void
  setComputing: (v: boolean) => void
}

export const useInsightsStore = create<InsightsStoreState>()(
  persist(
    (set) => ({
      predictionResult: null,
      correlationResult: null,
      outlierSummary: null,
      analysisWindow: '30d',
      isComputing: false,
      lastComputedAt: null,
      setPrediction: (r) => set({ predictionResult: r, lastComputedAt: Date.now() }),
      setCorrelation: (r, o) => set({ correlationResult: r, outlierSummary: o }),
      setWindow: (w) => set({ analysisWindow: w }),
      setComputing: (v) => set({ isComputing: v }),
    }),
    {
      name: 'paintracker-insights',
      partialize: (state) => ({ analysisWindow: state.analysisWindow }),
    }
  )
)
