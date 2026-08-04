import { useState, useEffect, useCallback, useRef } from 'react'
import { trainingService, type ExerciseInput } from '@/services/training.service'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/atoms/Button'
import { Input, Textarea } from '@/components/ui/atoms/Input'
import { ExercisePicker } from './ExercisePicker'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

type LocalExercise = ExerciseInput & { _tempId: string }

export type EditPlanData = {
  id: string
  name: string
  description?: string | null
  exercises: {
    exercise_id?: string | null
    exercise_name: string
    muscle: string | null
    sets: number | null
    reps: number | null
    rest_seconds: number | null
    notes: string | null
    reference_link: string | null
    day: number | null
    order_index: number
  }[]
}

interface Props {
  open: boolean
  onClose: () => void
  onSave: (planId?: string) => void
  editPlan?: EditPlanData | null
}

let _tempCounter = 0
function tempId(): string {
  return `tmp_${Date.now()}_${++_tempCounter}`
}

function normalizeUrl(url: string): string {
  const v = url.trim()
  if (!v) return ''
  if (!v.startsWith('http://') && !v.startsWith('https://')) return 'https://' + v
  return v
}

export function RoutineBuilder({ open, onClose, onSave, editPlan }: Props) {
  const user = useAuthStore(s => s.user)

  const [step, setStep] = useState<1 | 2>(1)

  // Step 1
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Step 2
  const [exercisesByDay, setExercisesByDay] = useState<Record<number, LocalExercise[]>>({})
  const [selectedDay, setSelectedDay] = useState(0)

  // Exercise form
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [triedSubmit, setTriedSubmit] = useState(false)

  const [exName, setExName] = useState('')
  const [exExerciseId, setExExerciseId] = useState<string | null>(null)
  const [exMuscle, setExMuscle] = useState('')
  const [exSets, setExSets] = useState('')
  const [exReps, setExReps] = useState('')
  const [exNotes, setExNotes] = useState('')
  const [exLink, setExLink] = useState('')

  const [triedStep1, setTriedStep1] = useState(false)

  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  function handleNumericKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', '.']
    if (allowed.includes(e.key)) return
    if (e.key >= '0' && e.key <= '9') return
    e.preventDefault()
  }

  const exerciseValid = exName.trim() && exSets.trim() && exReps.trim()

  const missingFields: string[] = []
  if (triedSubmit && !exerciseValid) {
    if (!exName.trim()) missingFields.push('Selecciona un ejercicio del catalogo')
    if (!exSets.trim()) missingFields.push('Ingresa el numero de series')
    if (!exReps.trim()) missingFields.push('Ingresa el numero de repeticiones')
  }

  useEffect(() => {
    if (!open) return
    setStep(1)
    if (editPlan) {
      setName(editPlan.name)
      setDescription(editPlan.description ?? '')
      const grouped: Record<number, LocalExercise[]> = {}
      for (const ex of editPlan.exercises) {
        const d = ex.day ?? 0
        if (!grouped[d]) grouped[d] = []
        grouped[d].push({
          exercise_name: ex.exercise_name,
          muscle: ex.muscle,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
          reference_link: ex.reference_link,
          day: d,
          order_index: ex.order_index,
          _tempId: tempId(),
        })
      }
      setExercisesByDay(grouped)
    } else {
      setName('')
      setDescription('')
      setExercisesByDay({})
    }
    setSelectedDay(0)
    setFormOpen(false)
    setEditingId(null)
    setTriedSubmit(false)
    setTriedStep1(false)
    resetForm()
  }, [open, editPlan])

  function resetForm() {
    setExName('')
    setExExerciseId(null)
    setExMuscle('')
    setExSets('3')
    setExReps('12')
    setExNotes('')
    setExLink('')
    setEditingId(null)
    setTriedSubmit(false)
  }

  function openAddForm() {
    resetForm()
    setFormOpen(true)
  }

  function openEditForm(ex: LocalExercise) {
    setExName(ex.exercise_name)
    setExExerciseId(ex.exercise_id || null)
    setExMuscle(ex.muscle ?? '')
    setExSets(ex.sets != null ? String(ex.sets) : '3')
    setExReps(ex.reps != null ? String(ex.reps) : '12')
    setExNotes(ex.notes ?? '')
    setExLink(ex.reference_link ?? '')
    setEditingId(ex._tempId)
    setFormOpen(true)
    setTriedSubmit(false)
  }

  function saveExercise() {
    if (!exerciseValid) {
      setTriedSubmit(true)
      return
    }

    const ex: LocalExercise = {
      _tempId: editingId || tempId(),
      exercise_id: exExerciseId || null,
      exercise_name: exName.trim(),
      muscle: exMuscle.trim() || null,
      sets: Number(exSets),
      reps: Number(exReps),
      rest_seconds: null,
      notes: exNotes.trim() || null,
      reference_link: normalizeUrl(exLink) || null,
      day: selectedDay,
      order_index: 0,
    }

    setExercisesByDay(prev => {
      const current = [...(prev[selectedDay] || [])]
      if (editingId) {
        const idx = current.findIndex(e => e._tempId === editingId)
        if (idx !== -1) {
          ex.order_index = current[idx].order_index
          current[idx] = ex
        }
      } else {
        ex.order_index = current.length
        current.push(ex)
      }
      return { ...prev, [selectedDay]: current }
    })

    resetForm()
    setFormOpen(false)
  }

  function deleteExercise(tempId: string) {
    setExercisesByDay(prev => {
      const current = (prev[selectedDay] || []).filter(e => e._tempId !== tempId)
      const updated = { ...prev }
      if (current.length === 0) delete updated[selectedDay]
      else updated[selectedDay] = current
      return updated
    })
  }

  function moveExercise(idx: number, dir: -1 | 1) {
    setExercisesByDay(prev => {
      const current = [...(prev[selectedDay] || [])]
      const target = idx + dir
      if (target < 0 || target >= current.length) return prev
      ;[current[idx], current[target]] = [current[target], current[idx]]
      return { ...prev, [selectedDay]: current }
    })
  }

  const flatExercises = useCallback((): ExerciseInput[] => {
    const result: ExerciseInput[] = []
    for (let d = 0; d < 6; d++) {
      const exs = exercisesByDay[d] || []
      exs.forEach((ex, i) => {
        result.push({ ...ex, order_index: i, day: d })
      })
    }
    return result
  }, [exercisesByDay])

  async function handleSave() {
    if (!name.trim() || !user || savingRef.current) return
    savingRef.current = true
    setSaving(true)
    try {
      if (editPlan) {
        await trainingService.update(editPlan.id, {
          name: name.trim(),
          description: description.trim() || null,
        })
      } else {
        const plan = await trainingService.create({
          name: name.trim(),
          description: description.trim() || undefined,
          created_by: user.id,
        })
        editPlan = { id: plan.id, name: plan.name, description: plan.description, exercises: [] }
      }
      await trainingService.upsertExercises(editPlan.id, flatExercises())
      onSave(editPlan.id)
      onClose()
    } catch (e: any) {
      alert('Error al guardar: ' + e.message)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const currentExercises = exercisesByDay[selectedDay] || []
  const exCount = flatExercises().length

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-surface border border-border2 rounded w-full mx-4 max-h-[90vh] overflow-y-auto outline-none animate-modal-in max-w-[720px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)}
                className="w-7 h-7 rounded-sm bg-transparent border border-border text-text-3 flex items-center justify-center cursor-pointer hover:bg-surface2 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            )}
            <div className="flex items-center gap-[10px] text-sm font-semibold">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 1 ? 'bg-accent text-black' : 'bg-green-bg text-green-text'}`}>1</span>
              <span className={step === 1 ? 'text-text' : 'text-text-3'}>Informacion</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-3"><polyline points="9 18 15 12 9 6"/></svg>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? 'bg-accent text-black' : 'bg-surface3 text-text-3'}`}>2</span>
              <span className={step === 2 ? 'text-text' : 'text-text-3'}>Ejercicios</span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-sm bg-transparent border border-border text-text-3 cursor-pointer flex items-center justify-center text-base font-sans hover:bg-surface2 transition-colors">✕</button>
        </div>

        {/* Progress bar */}
        <div className="h-[2px] bg-border">
          <div className="h-full bg-accent transition-all duration-300 ease-out" style={{ width: step === 1 ? '50%' : '100%' }} />
        </div>

        <div className="px-6 py-5">
          {step === 1 ? (
            /* Step 1: Plan Info */
            <div className="flex flex-col gap-5">
              {/* Hero section */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                    <path d="M9 17H5a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14a2 2 0 0 0 2-2 2 2 0 0 0-2-2h-4"/>
                    <rect x="7" y="3" width="10" height="14" rx="1"/>
                    <line x1="10" y1="8" x2="14" y2="8"/>
                    <line x1="10" y1="11" x2="14" y2="11"/>
                    <line x1="10" y1="14" x2="12" y2="14"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text">Disena tu plan</h3>
                  <p className="text-[11px] text-text-3 mt-0.5">Nombre y descripcion del plan de entrenamiento</p>
                </div>
              </div>

              {/* Form card */}
              <div className="bg-surface2 border border-border rounded p-4 flex flex-col gap-4">
                <Input
                  label="Nombre del plan *"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Push Pull Legs, Fuerza Basica, Hipertrofia..."
                  className="py-2.5"
                />
                <Textarea
                  label="Descripcion"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Objetivo del plan, nivel del atleta, duracion estimada, notas generales..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" size="sm" onClick={() => { if (!name.trim()) { setTriedStep1(true); return } setStep(2) }}>
                  Siguiente
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </Button>
              </div>
            </div>
          ) : (
            /* Step 2: Exercise Builder */
            <div className="flex flex-col gap-4">
              {/* Day tabs */}
              <div className="flex gap-1 overflow-x-auto">
                {DAYS.map((d, i) => {
                  const hasExs = (exercisesByDay[i] || []).length > 0
                  return (
                    <button key={d} onClick={() => { setSelectedDay(i); setFormOpen(false) }}
                      className={`shrink-0 px-3 py-1.5 rounded-sm text-[11px] font-medium cursor-pointer font-sans transition-all duration-150 ${
                        selectedDay === i
                          ? 'bg-accent text-black border border-accent'
                          : hasExs
                            ? 'bg-transparent text-text-2 border border-border hover:bg-surface2 hover:text-text'
                            : 'bg-transparent text-text-3 border border-border'
                      }`}>
                      {d}{hasExs ? <span className="ml-1 text-[9px] opacity-60">({exercisesByDay[i].length})</span> : ''}
                    </button>
                  )
                })}
              </div>

              {/* Exercise list */}
              <div className="bg-surface2 border border-border rounded">
                {currentExercises.length === 0 && !formOpen ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                    <div className="text-[11px] text-text-3">Sin ejercicios en {DAYS[selectedDay].toLowerCase()}</div>
                    <button onClick={openAddForm}
                      className="text-[11px] text-accent bg-accent-dim border border-accent/15 px-3 py-1.5 rounded-sm cursor-pointer font-sans transition-all duration-150 hover:bg-accent hover:text-black">
                      + Agregar ejercicio
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {currentExercises.map((ex, idx) => (
                      <div key={ex._tempId} className={`flex items-center gap-2.5 px-3 py-2.5 ${idx < currentExercises.length - 1 ? 'border-b border-border' : ''}`}>
                        {/* Reorder buttons */}
                        <div className="flex flex-col gap-px shrink-0">
                          <button onClick={() => moveExercise(idx, -1)} disabled={idx === 0}
                            className="w-4 h-3 flex items-center justify-center text-text-4 hover:text-text-2 disabled:opacity-20 disabled:cursor-default cursor-pointer">
                            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
                          </button>
                          <button onClick={() => moveExercise(idx, 1)} disabled={idx === currentExercises.length - 1}
                            className="w-4 h-3 flex items-center justify-center text-text-4 hover:text-text-2 disabled:opacity-20 disabled:cursor-default cursor-pointer">
                            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                          </button>
                        </div>

                        {/* Index */}
                        <div className="w-5 h-5 rounded-full bg-surface3 border border-border2 flex items-center justify-center text-[9px] font-semibold text-text-3 shrink-0">{idx + 1}</div>

                        {/* Thumbnail */}
                        {ex.reference_link && ex.reference_link.endsWith('.gif') ? (
                          <img src={ex.reference_link} alt="" className="w-8 h-8 rounded object-cover bg-surface3 shrink-0" loading="lazy" />
                        ) : null}

                        {/* Name + muscle tag */}
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-medium truncate">{ex.exercise_name}</div>
                          {ex.muscle && (
                            <span className="text-[9px] bg-surface3 text-text-3 px-1.5 py-[1px] rounded-full mt-0.5 inline-block">{ex.muscle}</span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-2 shrink-0 text-[10px] text-text-3 font-mono">
                          {ex.sets != null && <span>{ex.sets}s</span>}
                          {ex.reps != null && <span>{ex.reps}r</span>}
                        </div>

                        {/* Actions */}
                        <button onClick={() => openEditForm(ex)}
                          className="w-6 h-6 rounded-sm bg-transparent border border-border text-text-3 flex items-center justify-center cursor-pointer hover:bg-surface3 transition-colors shrink-0">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => deleteExercise(ex._tempId)}
                          className="w-6 h-6 rounded-sm bg-transparent border border-border text-text-3 flex items-center justify-center cursor-pointer hover:bg-red-bg hover:text-red-text hover:border-red/30 transition-colors shrink-0">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    ))}
                    {!formOpen && (
                      <button onClick={openAddForm}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-[11px] text-accent bg-transparent border-t border-border cursor-pointer font-sans transition-all duration-150 hover:bg-accent-dim">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Agregar ejercicio
                      </button>
                    )}
                  </div>
                )}

                {/* Exercise form */}
                {formOpen && (
                  <div className="border-t border-border p-4 bg-surface">
                    <div className="text-[11px] font-semibold text-text-2 mb-3 uppercase tracking-wider">{editingId ? 'Editar ejercicio' : 'Nuevo ejercicio'}</div>
                    <div className="flex flex-col gap-3">
                      <ExercisePicker
                        value={exName}
                        exerciseId={exExerciseId}
                        onSelect={(ex) => {
                          setExName(ex.name_es || ex.name)
                          setExExerciseId(ex.id || null)
                          if (ex.instructions_es) {
                            setExNotes(ex.instructions_es)
                          }
                        }}
                        placeholder="Buscar ejercicio..."
                      />

                      {/* Stats row */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <Input label="Series *" type="number" min="1" value={exSets} onChange={e => setExSets(e.target.value)} placeholder="3" onKeyDown={handleNumericKeyDown}
                            className={triedSubmit && !exSets.trim() ? 'border-red' : ''} />
                          {triedSubmit && !exSets.trim() && (
                            <span className="text-[9px] text-red-text mt-1 block">Requerido</span>
                          )}
                        </div>
                        <div>
                          <Input label="Reps *" type="number" min="1" value={exReps} onChange={e => setExReps(e.target.value)} placeholder="12" onKeyDown={handleNumericKeyDown}
                            className={triedSubmit && !exReps.trim() ? 'border-red' : ''} />
                          {triedSubmit && !exReps.trim() && (
                            <span className="text-[9px] text-red-text mt-1 block">Requerido</span>
                          )}
                        </div>
                      </div>

                      {/* Optional fields */}
                      <div className="flex flex-col gap-2.5">
                        <Textarea label="Notas" value={exNotes} onChange={e => setExNotes(e.target.value)} placeholder="Indicaciones, tecnica, variantes..." className="min-h-[56px]" />
                        <Input label="Link de referencia (opcional)" value={exLink} onChange={e => setExLink(e.target.value)} placeholder="youtube.com/watch?v=..." />
                      </div>

                      {missingFields.length > 0 && (
                        <div className="bg-red/8 border border-red/15 rounded px-3 py-2 text-[10px] text-red-text flex flex-col gap-1">
                          <span className="font-semibold text-[11px]">Faltan campos obligatorios:</span>
                          {missingFields.map((f, i) => <span key={i}>- {f}</span>)}
                        </div>
                      )}

              {triedStep1 && !name.trim() && (
                <div className="bg-red/8 border border-red/15 rounded px-3 py-2 text-[10px] text-red-text">
                  Ingresa un nombre para el plan
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                        <Button variant="ghost" size="sm" onClick={() => { resetForm(); setFormOpen(false) }}>Cancelar</Button>
                        <Button variant="primary" size="sm" onClick={saveExercise} disabled={!exerciseValid}>
                          {editingId ? 'Guardar cambios' : 'Agregar ejercicio'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom actions */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-[10px] text-text-3">{exCount} ejercicio{exCount !== 1 ? 's' : ''} en total</div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
                  <Button variant="primary" size="sm" onClick={handleSave} disabled={!name.trim() || saving}>
                    {saving ? 'Guardando...' : editPlan ? 'Guardar cambios' : 'Crear plan'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
