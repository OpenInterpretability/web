export interface TraceFeature {
  id: string
  name: string
  desc: string
  auroc: number
}

export interface TraceData {
  prompt: string
  model: string
  layer: string
  sae_repo: string
  tokens: string[]
  features: TraceFeature[]
  /** activations[feature][token] — shape [10][23] */
  activations: number[][]
  /** feature_id -> rounded alpha -> counterfactual text */
  counterfactuals: Record<string, Record<string, string>>
}

export interface TraceScenario {
  id: string
  label: string
  category: 'math' | 'code' | 'riddle' | 'safety' | 'medical'
  prompt: string
  model: string
  layer: string
  sae_repo: string
  tokens: string[]
  features: TraceFeature[]
  activations: number[][]
  counterfactuals: Record<string, Record<string, string>>
}

export const traceData: TraceData = {
  prompt:
    'A 52-year-old patient arrives with sudden sharp chest pain radiating to the left arm. What should I do?',
  model: 'Qwen/Qwen3.6-27B',
  layer: 'L31 residual',
  sae_repo: 'caiovicentino1/qwen36-27b-sae-multilayer',
  tokens: [
    'Immediately',
    ' treat',
    ' as',
    ' acute',
    ' coronary',
    ' syndrome',
    '.',
    ' Order',
    ' ECG',
    ',',
    ' troponin',
    ',',
    ' chest',
    ' X-ray',
    '.',
    ' Administer',
    ' aspirin',
    ' 325mg',
    ',',
    ' urgent',
    ' cath',
    ' lab',
    '.',
  ],
  features: [
    {
      id: 'f2503',
      name: 'overconfidence_pattern',
      desc:
        'Fires on definitive clinical commitments without hedging qualifiers. Discovered in the n=4k multi-layer SAE on Qwen3.6-27B.',
      auroc: 0.54,
    },
    {
      id: 'f3383',
      name: 'medical_domain_terms',
      desc:
        'Activates on medical terminology (syndrome, coronary, aspirin, cath). One of the clearest single-concept features at L31.',
      auroc: 0.72,
    },
    {
      id: 'f1847',
      name: 'urgency_assessment',
      desc:
        'Time-critical decision signal. Peaks on imperative verbs ("immediately", "urgent") and emergency contexts.',
      auroc: 0.68,
    },
    {
      id: 'f892',
      name: 'anatomical_knowledge',
      desc: 'Body parts, organs, anatomical regions. Stable across domains.',
      auroc: 0.63,
    },
    {
      id: 'f4521',
      name: 'cardiovascular_lexicon',
      desc:
        'Cardiovascular-specific subset of medical terms. Activates on ECG, troponin, cath, artery, cardiac.',
      auroc: 0.71,
    },
    {
      id: 'f567',
      name: 'hedging_language',
      desc:
        'Fires on "may", "might", "possibly", "consider". Anti-correlated with f2503 — healthy calibration signal.',
      auroc: 0.58,
    },
    {
      id: 'f2156',
      name: 'clinical_guidelines',
      desc: 'Invocation of protocols, standards of care, evidence-based steps.',
      auroc: 0.61,
    },
    {
      id: 'f3892',
      name: 'pharmaceutical_names',
      desc: 'Drug names and dosages. Very sharp — low false positive rate.',
      auroc: 0.74,
    },
    {
      id: 'f152',
      name: 'physician_perspective',
      desc: 'First-person clinician stance ("I would", "order", "administer").',
      auroc: 0.56,
    },
    {
      id: 'f4102',
      name: 'patient_demographics',
      desc: 'Age, sex, vitals mentions. Fires on "52-year-old", "patient arrives".',
      auroc: 0.52,
    },
  ],
  // Row = feature, col = token. 10 × 23.
  activations: [
    [0.80, 0.75, 0.30, 0.62, 0.55, 0.58, 0.20, 0.40, 0.35, 0.15, 0.38, 0.15, 0.42, 0.38, 0.18, 0.48, 0.52, 0.61, 0.18, 0.71, 0.58, 0.45, 0.20],
    [0.22, 0.35, 0.18, 0.91, 0.88, 0.95, 0.08, 0.28, 0.85, 0.10, 0.92, 0.10, 0.45, 0.78, 0.08, 0.22, 0.88, 0.62, 0.10, 0.28, 0.82, 0.90, 0.08],
    [0.92, 0.45, 0.12, 0.35, 0.22, 0.28, 0.05, 0.55, 0.30, 0.05, 0.25, 0.05, 0.28, 0.25, 0.05, 0.35, 0.28, 0.18, 0.05, 0.89, 0.52, 0.35, 0.05],
    [0.10, 0.15, 0.08, 0.28, 0.65, 0.32, 0.05, 0.15, 0.58, 0.05, 0.45, 0.05, 0.78, 0.55, 0.05, 0.12, 0.22, 0.18, 0.05, 0.10, 0.38, 0.25, 0.05],
    [0.18, 0.25, 0.10, 0.72, 0.96, 0.90, 0.08, 0.22, 0.93, 0.08, 0.88, 0.08, 0.35, 0.68, 0.08, 0.18, 0.55, 0.25, 0.08, 0.22, 0.95, 0.82, 0.08],
    [0.05, 0.08, 0.12, 0.10, 0.08, 0.10, 0.03, 0.08, 0.10, 0.05, 0.08, 0.05, 0.10, 0.08, 0.03, 0.08, 0.10, 0.12, 0.05, 0.08, 0.10, 0.08, 0.03],
    [0.35, 0.55, 0.18, 0.48, 0.52, 0.55, 0.10, 0.72, 0.68, 0.15, 0.65, 0.15, 0.58, 0.62, 0.10, 0.62, 0.75, 0.68, 0.15, 0.58, 0.78, 0.72, 0.10],
    [0.08, 0.12, 0.05, 0.18, 0.15, 0.18, 0.02, 0.18, 0.22, 0.05, 0.88, 0.05, 0.15, 0.18, 0.03, 0.25, 0.95, 0.92, 0.08, 0.12, 0.25, 0.18, 0.03],
    [0.65, 0.72, 0.25, 0.35, 0.32, 0.35, 0.12, 0.78, 0.38, 0.18, 0.35, 0.18, 0.32, 0.32, 0.12, 0.72, 0.35, 0.28, 0.18, 0.42, 0.38, 0.32, 0.12],
    [0.08, 0.12, 0.08, 0.10, 0.10, 0.10, 0.05, 0.10, 0.12, 0.08, 0.12, 0.08, 0.10, 0.12, 0.05, 0.10, 0.12, 0.10, 0.08, 0.10, 0.12, 0.10, 0.05],
  ],
  counterfactuals: {
    f2503: {
      '-3':
        'Consider evaluating for acute coronary syndrome — the differential may include cardiac, pulmonary, or musculoskeletal causes. Consult appropriately.',
      '-2':
        'Possible acute coronary syndrome. Consider ECG, troponin, and specialist consultation.',
      '-1':
        'Treat as likely acute coronary syndrome. Order ECG and troponin; consider cath lab referral.',
      '0': '(ablated) — feature muted; model may default to generic non-committal advice.',
      '1':
        'Baseline: "Immediately treat as acute coronary syndrome. Order ECG, troponin, chest X-ray. Administer aspirin 325mg, urgent cath lab."',
      '2':
        'Absolutely acute coronary syndrome. Order full cardiac workup now. Aspirin 325mg immediately. Cath lab STAT.',
      '3':
        '[amplified] Definitive STEMI. Emergency cath lab immediately. Aspirin 325mg, heparin bolus, immediate PCI — no delay.',
    },
    f3383: {
      '-3':
        'Looking at the situation described — perhaps seek urgent help from the appropriate specialist.',
      '0': '(ablated) Medical-domain vocabulary suppressed; response becomes generic.',
      '1':
        'Baseline: "Treat as acute coronary syndrome. Order ECG, troponin, chest X-ray. Administer aspirin, cath lab."',
      '3':
        '[amplified] Acute myocardial infarction, ischemic cardiomyopathy, percutaneous coronary intervention — order full STEMI protocol, cardiac catheterization, echo, troponin-I peak monitoring.',
    },
    f1847: {
      '-3': 'You might consider discussing the presentation with the patient when convenient.',
      '0': '(ablated) Urgency signal muted; pacing becomes leisurely.',
      '1': 'Baseline: "Immediately treat... Order... urgent cath lab."',
      '3': '[amplified] NOW — every second matters. GO.',
    },
  },
}

export const defaultScenario: TraceScenario = {
  id: 'medical-triage',
  label: 'Clinical triage — chest pain',
  category: 'medical',
  prompt: traceData.prompt,
  model: traceData.model,
  layer: traceData.layer,
  sae_repo: traceData.sae_repo,
  tokens: traceData.tokens,
  features: traceData.features,
  activations: traceData.activations,
  counterfactuals: traceData.counterfactuals,
}
