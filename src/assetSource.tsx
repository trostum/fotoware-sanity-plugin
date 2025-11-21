/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react'

import {FotowareAssetSourceComponent} from './components/FotowareAssetSource'
import {FotowareIcon} from './components/FotowareIcon'
import {FotowarePluginConfig} from './types'

export const fotowareAssetSource = (config: FotowarePluginConfig = {}) => {
  return {
    name: 'fotoware',
    title: 'Fotoware',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: (props: any) =>
      React.createElement(FotowareAssetSourceComponent, {...props, config}),
    icon: () => React.createElement(FotowareIcon),
  }
}
