import {Box, Button, Dialog, Spinner, Stack, Text} from '@sanity/ui'
import {useCallback, useEffect, useMemo, useState} from 'react'
import type {AssetFromSource, AssetSourceComponentProps} from 'sanity'

import {useFotowareAuth} from '../FotowareAuthProvider'
import {fotowareConfig} from '../fotowareConfig'
import {AssetSelectedEventPayload, BuiltinField} from '../types/fotoware'
import {FotowareIcon} from './FotowareIcon'

function getBuiltinFieldValue(field: BuiltinField | undefined) {
  if (!field) {
    return ''
  }
  if (Array.isArray(field.value)) {
    return field.value.join(', ')
  }
  return field.value
}

export function FotowareAssetSourceComponent(props: AssetSourceComponentProps) {
  const {onClose, onSelect} = props
  const [open, setOpen] = useState(true)
  const auth = useFotowareAuth()

  const handleMessage = useCallback(
    (evt: MessageEvent<AssetSelectedEventPayload>) => {
      // 1. Security: only trust your Fotoware domain
      if (evt.origin !== fotowareConfig.fotowareBaseUrl) {
        return
      }

      const data = evt.data
      if (!data) return

      const {event, asset} = data

      if (event === 'assetSelected') {
        const assetUrl = asset.previews.find((preview) => preview.size >= 2400)
        if (!assetUrl) return

        const assets: AssetFromSource[] = [
          {
            kind: 'url',
            value: `${fotowareConfig.fotowareBaseUrl}${assetUrl.href}`,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            assetDocumentProps: {
              altText: getBuiltinFieldValue(
                asset.builtinFields.find((field) => field.field === 'description'),
              ),
              originalFilename: asset.filename,
              title: getBuiltinFieldValue(
                asset.builtinFields.find((field) => field.field === 'description'),
              ),
              creditLine: getBuiltinFieldValue(
                asset.builtinFields.find((field) => field.field === 'creditLine'),
              ),
              description: getBuiltinFieldValue(
                asset.builtinFields.find((field) => field.field === 'description'),
              ),
            },
          },
        ]
        // Notify Sanity of the picked image
        onSelect(assets)
        setOpen(false)
        onClose()
      } else {
        console.log('Received unknown event from Fotoware: ', event, ' - ignoring')
      }
    },
    [onSelect, onClose],
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  const widgetUrl = useMemo(() => {
    if (auth.status !== 'authenticated' || !auth.accessToken) return null
    const url = new URL('/fotoweb/widgets/selection', fotowareConfig.fotowareBaseUrl)
    url.searchParams.set('access_token', auth.accessToken)
    return url.toString()
  }, [auth])

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  return (
    <Dialog
      id="fotoware-asset-source"
      header="Velg bilde fra Fotoware"
      width={4}
      onClose={handleClose}
      open={open}
    >
      <Box padding={4} style={{minHeight: '60vh'}}>
        {auth.status === 'unknown' && (
          <Stack space={3}>
            <Spinner />
            <Text>Kobler til Fotoware…</Text>
          </Stack>
        )}

        {auth.status === 'unauthenticated' && (
          <Box
            style={{
              minHeight: '60vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stack space={4}>
              <Box>
                <FotowareIcon />
              </Box>
              <Text size={2} align="center">
                Logg inn med Fotoware
              </Text>
              <Button
                text="Logg inn med Fotoware"
                mode="default"
                tone="primary"
                onClick={auth.login}
              />
            </Stack>
          </Box>
        )}

        {auth.status === 'authenticated' && widgetUrl && (
          <Box style={{height: '60vh'}}>
            <iframe
              src={widgetUrl}
              title="Fotoware Selection Widget"
              style={{border: 0, width: '100%', height: '100%'}}
            />
          </Box>
        )}
      </Box>

      <Box padding={3}>
        <Button text="Avbryt" tone="critical" onClick={handleClose} />
      </Box>
    </Dialog>
  )
}
