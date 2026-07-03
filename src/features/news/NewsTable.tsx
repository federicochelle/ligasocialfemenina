import type { News } from './news.types.ts'
import {
  EditIcon,
  PowerIcon,
  TableActionButton,
  TrashIcon,
} from '../admin/crud/TableActionButton.tsx'

type NewsTableProps = {
  news: News[]
  busyNewsId?: string | null
  onEdit: (newsItem: News) => void
  onDelete: (newsItem: News) => void
  onTogglePublished: (newsItem: News) => void
}

const dateFormatter = new Intl.DateTimeFormat('es-UY', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function getPublicationLabel(newsItem: News) {
  if (!newsItem.published || !newsItem.published_at) {
    return 'Sin publicar'
  }

  return dateFormatter.format(new Date(newsItem.published_at))
}

export function NewsTable({
  news,
  busyNewsId,
  onEdit,
  onDelete,
  onTogglePublished,
}: NewsTableProps) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="teams-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Titular</th>
              <th>Estado</th>
              <th>Fecha de publicación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {news.map((newsItem) => {
              const isBusy = busyNewsId === newsItem.id

              return (
                <tr key={newsItem.id}>
                  <td>
                    {newsItem.cover_image ? (
                      <img
                        className="news-cover-thumb"
                        src={newsItem.cover_image}
                        alt={`Imagen principal de ${newsItem.title}`}
                      />
                    ) : (
                      <div className="news-cover-thumb news-cover-thumb--fallback" aria-hidden="true">
                        N
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="teams-table__name">{newsItem.title}</div>
                    <div className="news-table__meta">/{newsItem.slug}</div>
                  </td>
                  <td>
                    <span
                      className={
                        newsItem.published
                          ? 'status-badge status-badge--live'
                          : 'status-badge'
                      }
                    >
                      {newsItem.published ? 'Publicada' : 'Borrador'}
                    </span>
                  </td>
                  <td>
                    <div className="teams-table__description">{getPublicationLabel(newsItem)}</div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <TableActionButton
                        label="Editar"
                        icon={<EditIcon />}
                        onClick={() => onEdit(newsItem)}
                      />
                      <TableActionButton
                        label={newsItem.published ? 'Pasar a borrador' : 'Publicar'}
                        icon={<PowerIcon />}
                        variant="accent"
                        onClick={() => onTogglePublished(newsItem)}
                        disabled={isBusy}
                      />
                      <TableActionButton
                        label="Eliminar"
                        icon={<TrashIcon />}
                        variant="danger"
                        onClick={() => onDelete(newsItem)}
                        disabled={isBusy}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
