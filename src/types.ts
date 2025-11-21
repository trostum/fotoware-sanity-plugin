import {AssetSourceComponentProps} from 'sanity'

export interface FotowarePluginConfig {
  domain?: string
  allowMultiSelect?: boolean
  filters?: Array<{
    key: string
    values: string[]
    inverted: boolean
  }>
}

export interface FotowareAssetSourceProps extends AssetSourceComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelect: (assets: any[]) => void
  onClose: () => void
  config?: FotowarePluginConfig
}

export interface SanityAsset {
  kind: 'url'
  value: string
  assetDocumentProps: {
    originalFilename?: string
    source: {
      name: string
      id: string
      url: string
    }
    title?: string
    description?: string
    creditLine?: string
  }
}
