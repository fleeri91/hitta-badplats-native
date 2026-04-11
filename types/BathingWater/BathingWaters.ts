export interface BathingWaters {
  watersAndAdvisories: WatersAndAdvisory[]
}

export interface WatersAndAdvisory {
  abnormalSituations: AbnormalSituation[]
  adviceAgainstBathing: AdviceAgainstBathing[]
  bathingWater: BathingWater
}

export interface AbnormalSituation {
  description: string
  startsAt: string
}

export interface AdviceAgainstBathing {
  description: string
  startsAt: string
  typeId: number
  typeIdText: string
}

export interface BathingWater {
  description?: string
  euMotive?: string
  euType: boolean
  id: string
  municipality: Municipality
  name: string
  notEuMotive: string
  perimeterCoordinates: PerimeterCoordinate[]
  samplingPointPosition: SamplingPointPosition
  waterTypeId: number
  waterTypeIdText: string
}

export interface Municipality {
  contactInfo: ContactInfo
  name: string
}

export interface ContactInfo {
  email?: string
  phone?: string
  url?: string
}

export interface PerimeterCoordinate {
  latitude: string
  longitude: string
}

export interface SamplingPointPosition {
  latitude: string
  longitude: string
}
