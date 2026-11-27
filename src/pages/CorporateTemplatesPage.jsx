import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TemplateFormDialog from '../components/TemplateFormDialog.jsx'
import { useAuth } from '../AuthContext.jsx'
import { formatDate } from '../labels.js'
import { deleteTemplate, listTemplates } from '../templatesApi.js'

export default function CorporateTemplatesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [templates, setTemplates] = useState(null)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(() => {
    listTemplates()
      .then((data) => {
        setTemplates(data)
        setError('')
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (template) => {
    setDeleting(template.id)
    setActionError('')
    try {
      await deleteTemplate(template)
      setTemplates((current) => current?.filter((item) => item.id !== template.id) ?? current)
      setConfirmDelete(null)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div className="page-title-row">
          <h1 className="title">Корпоративные шаблоны</h1>
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
            Загрузить шаблон
          </button>
        </div>
        <p className="muted">
          Фирменные презентации PowerPoint. Их цвета, шрифты, фон и отступы применяются к новым презентациям.
        </p>
      </header>

      {error && <p className="alert alert-error">{error}</p>}
      {actionError && <p className="alert alert-error">{actionError}</p>}
      {templates === null && !error && <p className="muted">Загружаем шаблоны…</p>}

      {templates?.length === 0 && (
        <div className="card empty">
          <p>Пока нет ни одного корпоративного шаблона.</p>
        </div>
      )}

      {templates?.length > 0 && (
        <ul className="list">
          {templates.map((template) => {
            const isOwner = template.created_by === user?.id
            return (
              <li key={template.id} className="list-item-wrap">
                <Link to={`/corporate-templates/${template.id}`} className="card list-item">
                  <div className="list-item-main">
                    <strong className="list-title">{template.name}</strong>
                    <div className="list-item-meta">
                      {template.brand && <span className="tag">{template.brand}</span>}
                      <span className="muted small">Обновлён {formatDate(template.updated_at)}</span>
                    </div>
                  </div>
                  <div className="list-meta">
                    {template.current && <span className="tag tag-success">Версия {template.current.version_number}</span>}
                  </div>
                </Link>

                {isOwner && (confirmDelete === template.id ? (
                  <div className="delete-confirm">
                    <span className="muted small">Удалить шаблон и все версии?</span>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={deleting === template.id}
                      onClick={() => handleDelete(template)}
                    >
                      {deleting === template.id ? 'Удаляем…' : 'Удалить'}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(null)}>
                      Отмена
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-delete-template"
                    aria-label={`Удалить шаблон «${template.name}»`}
                    onClick={() => setConfirmDelete(template.id)}
                  >
                    ✕
                  </button>
                ))}
              </li>
            )
          })}
        </ul>
      )}

      {creating && (
        <TemplateFormDialog
          onClose={() => setCreating(false)}
          onSaved={(created) => navigate(`/corporate-templates/${created.id}`)}
        />
      )}
    </section>
  )
}
