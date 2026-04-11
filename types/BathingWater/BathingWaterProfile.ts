export interface BathingWaterProfile {
  administrativeAuthority: AdministrativeAuthority
  algae: boolean
  bathingSeason: BathingSeason
  bathingWater: BathingWater
  cyano: boolean
  lastFourClassifications: LastFourClassification[]
  pollutionSources: PollutionSource[]
  summary: string
  supervisoryAuthority: SupervisoryAuthority
  updateDetail: UpdateDetail
}

export interface AdministrativeAuthority {
  contactInfo: ContactInfo
}

export interface ContactInfo {
  address?: string
  email?: string
  name?: string
  phone?: string
  visitAddress?: string
  url?: string
}

export interface BathingSeason {
  endsAt: string
  startsAt: string
}

export interface BathingWater {
  description: string
  euMotive: string
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

export interface PerimeterCoordinate {
  latitude: string
  longitude: string
}

export interface SamplingPointPosition {
  latitude: string
  longitude: string
}

export interface LastFourClassification {
  qualityClassId: number
  qualityClassIdText: string
  year: number
}

export interface PollutionSource {
  description: string
  implementedMeasures: any[]
  name: string
  position: Position
  proposedMeasures: any[]
  riskLevel: number
}

export interface Position {
  latitude: string
  longitude: string
}

export interface SupervisoryAuthority {
  contactInfo: ContactInfo
}

export interface UpdateDetail {
  authoredBy: string
  frequency: string
  latestAt: string
  schedule: string
}
