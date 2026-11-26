import { useEffect, useState } from 'react'

export default function PreviewDialog({ title, loadBlob, onClose }) {
  const [error, setError] = useState('')
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const open = async () => {
    setOpening(true)
    setError('')
    try {
      const blob = await loadBlob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener')
      setTimeout(() => URL.revokeObjectURL(url), 60 * 1000)
      onClose()
    } catch (err) {
      setError(err.message)
      setOpening(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card fade-in" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2 className="subtitle">{title}</h2>
        {error && <p className="alert alert-error">{error}</p>}
        <p className="muted small">
          PDF-файл откроется в новой вкладке браузера. Если браузер заблокировал всплывающее окно,
          разрешите его для этого сайта и попробуйте ещё раз.
        </p>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="button" className="btn btn-primary" disabled={opening} onClick={open}>
            {opening ? 'Открываем…' : 'Открыть предпросмотр'}
          </button>
        </div>
      </div>
    </div>
  )
}
