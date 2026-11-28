import { useEffect, useRef, useState } from 'react'

export default function PreviewDialog({ title, loadBlob, onClose }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const urlRef = useRef('')

  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [onClose])

  const replacePreviewUrl = (url) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = url
    setPreviewUrl(url)
  }

  const openInDialog = async () => {
    setLoading(true)
    setError('')
    try {
      const blob = await loadBlob()
      replacePreviewUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openInNewTab = async () => {
    const tab = window.open('', '_blank')
    if (!tab) {
      setError('Браузер заблокировал новую вкладку. Разрешите всплывающие окна и попробуйте снова.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const blob = await loadBlob()
      const url = URL.createObjectURL(blob)
      tab.opener = null
      tab.location.href = url
      window.setTimeout(() => URL.revokeObjectURL(url), 60 * 1000)
      onClose()
    } catch (err) {
      tab.close()
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal card fade-in${previewUrl ? ' modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="subtitle">{title}</h2>
        {error && <p className="alert alert-error">{error}</p>}

        {previewUrl ? (
          <iframe className="preview-frame" title={title} src={previewUrl} />
        ) : (
          <>
            <p className="muted small">Выберите, где открыть PDF-файл.</p>
            <div className="preview-options">
              <button type="button" className="btn btn-secondary" disabled={loading} onClick={openInDialog}>
                {loading ? 'Загружаем…' : 'В маленьком окне'}
              </button>
              <button type="button" className="btn btn-primary" disabled={loading} onClick={openInNewTab}>
                Открыть в отдельной вкладке
              </button>
            </div>
            <p className="muted small">
              Если новая вкладка не открылась, разрешите всплывающие окна для этого сайта.
            </p>
          </>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
