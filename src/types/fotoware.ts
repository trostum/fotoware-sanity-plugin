export type EventType = 'assetSelected'

export type AssetPermission =
  | 'View'
  | 'Preview'
  | 'Workflow'
  | 'Download'
  | 'EditText'
  | 'CropRotate'
  | 'Comping'
  | 'TrdParty1'
  | 'TrdParty2'
  | 'TrdParty3'
  | 'TrdParty4'
  | 'Alert'
  | 'Rename'
  | 'OpenFile'
  | 'EditFile'
  | 'CropFile'
  | 'FwdtPlace'
  | 'Export'
  | 'Comment'
  | 'EditSmartFolders'
  | 'CropAndDownload'

export interface AssetCapabilities {
  crop: boolean
  print: boolean
  printWithAnnotations: boolean
}

export interface AssetPreview {
  size: number
  width: number
  height: number
  href: string
  square: boolean
}

export interface QuickRendition extends AssetPreview {
  name: string
}

export interface MetadataEditor {
  name: string
  href: string
}

export interface Rendition {
  display_name: string
  description: string
  width: number
  height: number
  href: string
  default: boolean
  original: boolean
  sizeFixed: boolean
  profile: string
}

export interface ImageAttributes {
  pixelwidth: number
  pixelheight: number
  resolution: number
  flipmirror: number
  rotation: number
  colorspace: string
}

export interface AssetAttributes {
  imageattributes: ImageAttributes
}

export interface MetadataValue {
  value: string | string[]
}

export type AssetMetadata = Record<string, MetadataValue>

export interface ThumbnailFieldSingle {
  value: string
}

export interface ThumbnailFieldMulti {
  value: string[]
}

export type ThumbnailView = 'desktop' | 'widgets' | 'web' | 'pro'

export interface ThumbnailAdditionalField {
  value: string | string[]
  views: ThumbnailView[]
  isKeywords: boolean
}

export interface ThumbnailFields {
  label: ThumbnailFieldSingle
  firstLine: ThumbnailFieldSingle
  secondLine: ThumbnailFieldMulti
  additionalFields: ThumbnailAdditionalField[]
}

export interface BuiltinField {
  field: string // e.g. "title" | "description" | "tags" | "notes"
  required: boolean
  value: string | string[]
}

export interface AssetAncestor {
  name: string
  href: string
  data: string
}

export interface AssetSharesProps {
  enabled: boolean
}

export interface AssetCommentsProps {
  enabled: boolean
}

export interface AssetAnnotationsProps {
  enabled: boolean
}

export interface AssetProps {
  owner: string | null
  shares: AssetSharesProps
  comments: AssetCommentsProps
  annotations: AssetAnnotationsProps
  tags: string[]
}

export interface Asset {
  href: string
  archiveHREF: string
  archiveId: number
  linkstance: string
  dropHREF: string
  isVersioningEnabled: boolean
  created: string // ISO date-time
  modified: string // ISO date-time
  modifiedBy: string
  createdBy: string
  filename: string
  filesize: number
  uniqueid: string
  permissions: AssetPermission[]
  pincount: number
  previewcount: number
  downloadcount: number
  workflowcount: number
  metadataeditcount: number
  revisioncount: number
  doctype: string
  capabilities: AssetCapabilities
  previews: AssetPreview[]
  quickRenditions: QuickRendition[]
  metadataEditor: MetadataEditor
  renditions: Rendition[]
  previewToken: string
  attributes: AssetAttributes
  physicalFileId: string
  metadata: AssetMetadata
  thumbnailFields: ThumbnailFields
  builtinFields: BuiltinField[]
  ancestors: AssetAncestor[]
  props: AssetProps
}

export interface AssetSelectedEventPayload {
  event: EventType
  asset: Asset
}
