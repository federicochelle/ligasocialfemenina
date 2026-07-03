import { useEffect, useState, type FormEvent } from 'react'
import { PlayerDialog } from './PlayerDialog.tsx'
import type { Player, PlayerFormValues, PlayerTeamOption } from './players.types.ts'

type PlayerFormProps = {
  open: boolean
  player?: Player | null
  teamOptions: PlayerTeamOption[]
  teamsLoading: boolean
  submitting: boolean
  onClose: () => void
  onSubmit: (values: PlayerFormValues) => Promise<void>
}

const defaultValues: PlayerFormValues = {
  team_id: '',
  name: '',
  jersey_number: '',
  identity_document: '',
  phone: '',
  medical_insurance: '',
  emergency_phone: '',
}

function mapPlayerToFormValues(player: Player | null | undefined): PlayerFormValues {
  if (!player) {
    return defaultValues
  }

  return {
    team_id: player.team_id,
    name: player.name,
    jersey_number: player.jersey_number?.toString() ?? '',
    identity_document: player.identity_document ?? '',
    phone: player.phone ?? '',
    medical_insurance: player.medical_insurance ?? '',
    emergency_phone: player.emergency_phone ?? '',
  }
}

export function PlayerForm({
  open,
  player,
  teamOptions,
  teamsLoading,
  submitting,
  onClose,
  onSubmit,
}: PlayerFormProps) {
  const [values, setValues] = useState<PlayerFormValues>(defaultValues)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    setValues(mapPlayerToFormValues(player))
    setErrorMessage(null)
  }, [open, player])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!values.name.trim()) {
      setErrorMessage('El nombre es obligatorio.')
      return
    }

    if (!values.team_id) {
      setErrorMessage('El equipo es obligatorio.')
      return
    }

    setErrorMessage(null)

    await onSubmit({
      ...values,
      name: values.name.trim(),
      identity_document: values.identity_document.trim(),
      phone: values.phone.trim(),
      medical_insurance: values.medical_insurance.trim(),
      emergency_phone: values.emergency_phone.trim(),
      jersey_number: values.jersey_number.trim(),
    })
  }

  return (
    <PlayerDialog
      open={open}
      title={player ? 'Editar jugadora' : 'Nueva jugadora'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="primary-button"
            form="player-form"
            disabled={submitting || teamsLoading}
          >
            {submitting ? 'Guardando...' : player ? 'Guardar cambios' : 'Crear jugadora'}
          </button>
        </>
      }
    >
      <form id="player-form" className="teams-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <div className="form-section__header">
            <h3 className="form-section__title">Datos deportivos</h3>
          </div>

          <div className="field-grid">
            <div className="field">
              <label htmlFor="player-name">Nombre *</label>
              <input
                id="player-name"
                name="name"
                value={values.name}
                onChange={(event) =>
                  setValues((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
            </div>

            <div className="field">
              <label htmlFor="player-team">Equipo *</label>
              <select
                id="player-team"
                name="team_id"
                value={values.team_id}
                onChange={(event) =>
                  setValues((current) => ({ ...current, team_id: event.target.value }))
                }
                required
                disabled={teamsLoading}
              >
                <option value="">
                  {teamsLoading ? 'Cargando equipos...' : 'Seleccioná un equipo activo'}
                </option>
                {teamOptions.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field field--compact">
            <label htmlFor="player-jersey-number">Camiseta</label>
            <input
              id="player-jersey-number"
              name="jersey_number"
              inputMode="numeric"
              value={values.jersey_number}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  jersey_number: event.target.value,
                }))
              }
            />
          </div>
        </section>

        <section className="form-section">
          <div className="form-section__header">
            <h3 className="form-section__title">Datos personales</h3>
          </div>

          <div className="field-grid">
            <div className="field">
              <label htmlFor="player-identity-document">Cédula de identidad</label>
              <input
                id="player-identity-document"
                name="identity_document"
                value={values.identity_document}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    identity_document: event.target.value,
                  }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="player-phone">Teléfono</label>
              <input
                id="player-phone"
                name="phone"
                type="tel"
                value={values.phone}
                onChange={(event) =>
                  setValues((current) => ({ ...current, phone: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label htmlFor="player-medical-insurance">Emergencia médica</label>
              <input
                id="player-medical-insurance"
                name="medical_insurance"
                value={values.medical_insurance}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    medical_insurance: event.target.value,
                  }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="player-emergency-phone">Teléfono de emergencia</label>
              <input
                id="player-emergency-phone"
                name="emergency_phone"
                type="tel"
                value={values.emergency_phone}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    emergency_phone: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        </section>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      </form>
    </PlayerDialog>
  )
}
