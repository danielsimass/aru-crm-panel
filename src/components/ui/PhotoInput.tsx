import { useState, useRef, useEffect } from 'react'
import { Button } from './Button'

export interface PhotoInputProps {
  onChange: (file: File | null) => void
  /** Optional URL to show when no file is selected (e.g. existing photo from API) */
  previewUrl?: string | null
  disabled?: boolean
  label?: string
  error?: string
}

function stopStream(stream: MediaStream | null) {
  if (!stream) return
  stream.getTracks().forEach((t) => t.stop())
}

export function PhotoInput({
  onChange,
  previewUrl,
  disabled = false,
  label = 'Foto',
  error,
}: PhotoInputProps) {
  const [file, setFile] = useState<File | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [requestingCamera, setRequestingCamera] = useState(false)
  const [hasCameraStream, setHasCameraStream] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  const hasFile = file !== null
  const displayPreview = hasFile ? objectUrl : previewUrl ?? null

  useEffect(() => {
    if (!file) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      setObjectUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setObjectUrl(url)
    return () => {
      URL.revokeObjectURL(url)
      if (objectUrlRef.current === url) objectUrlRef.current = null
    }
  }, [file])

  useEffect(() => {
    if (!cameraOpen) {
      stopStream(streamRef.current ?? null)
      streamRef.current = null
      setHasCameraStream(false)
      return
    }
    return () => {
      stopStream(streamRef.current ?? null)
      streamRef.current = null
      setHasCameraStream(false)
    }
  }, [cameraOpen])

  // Quando temos stream (após permissão), anexar ao <video> e dar play
  useEffect(() => {
    if (!cameraOpen || !hasCameraStream) return
    const video = videoRef.current
    const stream = streamRef.current
    if (!video || !stream) return
    video.srcObject = stream
    video.play().catch(() => {})
    return () => {
      video.srcObject = null
    }
  }, [cameraOpen, hasCameraStream])

  // Solicitar câmera assim que o modal abre (sem precisar de botão)
  useEffect(() => {
    if (!cameraOpen) return
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Este navegador não suporta acesso à câmera.')
      return
    }
    if (hasCameraStream || cameraError) return
    setCameraError(null)
    setRequestingCamera(true)
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } })
      .then((stream) => {
        streamRef.current = stream
        setRequestingCamera(false)
        setHasCameraStream(true)
      })
      .catch((err: DOMException) => {
        setRequestingCamera(false)
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Permissão negada. Permita o acesso à câmera nas configurações do navegador.'
            : err.name === 'NotFoundError'
              ? 'Nenhuma câmera encontrada.'
              : 'Não foi possível acessar a câmera.'
        )
        stopStream(streamRef.current ?? null)
        streamRef.current = null
        setHasCameraStream(false)
      })
  }, [cameraOpen, hasCameraStream, cameraError])

  useEffect(() => {
    return () => {
      stopStream(streamRef.current ?? null)
      streamRef.current = null
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [])

  const handleUploadClick = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] ?? null
    e.target.value = ''
    if (next && !next.type.startsWith('image/')) return
    setFile(next)
    onChange(next)
  }

  const handleTakePhoto = () => {
    if (disabled) return
    setCameraError(null)
    setCameraOpen(true)

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Este navegador não suporta acesso à câmera.')
    }
  }

  const requestCameraAccess = () => {
    if (disabled) return
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Este navegador não suporta acesso à câmera.')
      return
    }
    setCameraError(null)
    setRequestingCamera(true)
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } })
      .then((stream) => {
        streamRef.current = stream
        setRequestingCamera(false)
        setHasCameraStream(true)
      })
      .catch((err: DOMException) => {
        setRequestingCamera(false)
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Permissão negada. Permita o acesso à câmera nas configurações do navegador.'
            : err.name === 'NotFoundError'
              ? 'Nenhuma câmera encontrada.'
              : 'Não foi possível acessar a câmera.'
        )
        stopStream(streamRef.current ?? null)
        streamRef.current = null
        setHasCameraStream(false)
      })
  }

  const handleCapture = () => {
    const video = videoRef.current
    const stream = streamRef.current
    if (!video || !stream) return
    const track = stream.getVideoTracks()[0]
    const settings = track?.getSettings()
    let w = video.videoWidth
    let h = video.videoHeight
    if (!w || !h) {
      w = settings?.width ?? 640
      h = settings?.height ?? 480
    }
    if (!w || !h) return
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        stopStream(streamRef.current ?? null)
        streamRef.current = null
        setCameraOpen(false)
        setCameraError(null)
        setHasCameraStream(false)
        const name = `photo-${Date.now()}.jpeg`
        const nextFile = new File([blob], name, { type: 'image/jpeg' })
        setFile(nextFile)
        onChange(nextFile)
      },
      'image/jpeg',
      0.85
    )
  }

  const handleCloseCamera = () => {
    stopStream(streamRef.current ?? null)
    streamRef.current = null
    setCameraOpen(false)
    setCameraError(null)
    setHasCameraStream(false)
  }

  const handleRemove = () => {
    setFile(null)
    onChange(null)
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {label && (
          <span className="block text-sm font-medium text-neutral-100">{label}</span>
        )}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="flex-shrink-0 w-full max-w-[200px] aspect-square rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700 flex items-center justify-center">
            {displayPreview ? (
              <img
                src={displayPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <svg
                  className="w-12 h-12 text-neutral-500 sm:w-14 sm:h-14"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs sm:text-sm text-neutral-400">Nenhuma foto</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 w-full sm:w-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {!disabled && (
              <>
                <Button type="button" variant="neutral" size="sm" onClick={handleUploadClick}>
                  Upload Photo
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleTakePhoto}
                >
                  Tirar foto
                </Button>
                {hasFile && (
                  <Button type="button" variant="neutral" size="sm" onClick={handleRemove}>
                    Remove
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        {error && <p className="text-sm text-error-500">{error}</p>}
      </div>

      {cameraOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 max-sm:p-0 max-sm:items-stretch">
          <div className="relative w-full max-w-lg rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl overflow-hidden flex flex-col max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:h-full max-sm:min-h-0">
            <div className="px-4 py-3 border-b border-neutral-800">
              <h3 className="text-lg font-semibold text-neutral-100">Tirar foto</h3>
              <p className="text-xs text-neutral-400 mt-1">
                {requestingCamera
                  ? 'Solicitando acesso à câmera…'
                  : cameraError
                    ? 'Se permitiu o acesso, use o botão abaixo para tentar novamente.'
                    : 'Ajuste o enquadramento e clique em Capturar.'}
              </p>
            </div>
            <div className="relative aspect-video bg-neutral-950 flex items-center justify-center flex-1 min-h-0 sm:aspect-video sm:flex-initial">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {requestingCamera && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/90">
                  <p className="text-sm text-neutral-300">Solicitando acesso à câmera…</p>
                </div>
              )}
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                  <p className="text-sm text-error-500">{cameraError}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 p-4 border-t border-neutral-800 flex-wrap">
              <div className="flex items-center gap-2">
                {!hasCameraStream && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={requestCameraAccess}
                    disabled={requestingCamera}
                  >
                    {requestingCamera ? 'Solicitando acesso…' : 'Solicitar acesso à câmera'}
                  </Button>
                )}
              </div>
              <Button type="button" variant="neutral" size="sm" onClick={handleCloseCamera}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleCapture}
                disabled={!!cameraError || !hasCameraStream}
              >
                Capturar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
