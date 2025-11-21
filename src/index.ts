import {definePlugin, LayoutProps} from 'sanity'

import {fotowareAssetSource} from './assetSource'
import {FotowarePluginConfig} from './types'
import {FotowareAuthProvider} from './FotowareAuthProvider'

/**
 * Usage in `sanity.config.ts` (or .js)
 *
 * ```ts
 * import {defineConfig} from 'sanity'
 * import {frontifyPlugin} from 'frontify-dam'
 *
 * export default defineConfig({
 *   // ...
 *   plugins: [
 *     frontifyPlugin({
 *       filters: [
 *         {
 *           key: "object_type",
 *           values: ["IMAGE"],
 *           inverted: false
 *         }
 *       ]
 *     })
 *   ],
 * })
 * ```
 */
export const fotowarePlugin = definePlugin<FotowarePluginConfig>((config = {}) => {
  return {
    studio: {
      components: {
        layout: (props: LayoutProps) => FotowareAuthProvider(props),
      },
    },
    name: 'frontify-dam',
    form: {
      image: {
        assetSources: [fotowareAssetSource(config)],
      },
    },
  }
})

// Export the asset source for direct use
export {fotowareAssetSource} from './assetSource'
export type {FotowarePluginConfig, SanityAsset} from './types'
