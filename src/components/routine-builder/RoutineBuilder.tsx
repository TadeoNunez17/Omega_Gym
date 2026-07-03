import { useState, useEffect, useCallback, useRef } from 'react'
import { trainingService, type ExerciseInput } from '@/services/training.service'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/atoms/Button'
import { Input, Textarea } from '@/components/ui/atoms/Input'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MUSCLES = ['Pecho', 'Espalda', 'Pierna', 'Hombro', 'Brazo', 'Core', 'Cardio']

type LocalExercise = ExerciseInput & { _tempId: string }

export type EditPlanData = {
  id: string
  name: string
  description?: string | null
  exercises: {
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

  // Step
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

  const [exName, setExName] = useState('')
  const [exMuscle, setExMuscle] = useState('')
  const [exMuscleOther, setExMuscleOther] = useState('')
  const [exSets, setExSets] = useState('')
  const [exReps, setExReps] = useState('')
  const [exRest, setExRest] = useState('')
  const [exNotes, setExNotes] = useState('')
  const [exLink, setExLink] = useState('')

  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

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
    resetForm()
  }, [open, editPlan])

  function resetForm() {
    setExName('')
    setExMuscle('')
    setExMuscleOther('')
    setExSets('')
    setExReps('')
    setExRest('')
    setExNotes('')
    setExLink('')
    setEditingId(null)
  }

  function openAddForm() {
    resetForm()
    setFormOpen(true)
  }

  function openEditForm(ex: LocalExercise) {
    setExName(ex.exercise_name)
    setExMuscle(MUSCLES.includes(ex.muscle ?? '') ? (ex.muscle ?? '') : 'otro')
    setExMuscleOther(MUSCLES.includes(ex.muscle ?? '') ? '' : (ex.muscle ?? ''))
    setExSets(ex.sets != null ? String(ex.sets) : '')
    setExReps(ex.reps != null ? String(ex.reps) : '')
    setExRest(ex.rest_seconds != null ? String(ex.rest_seconds) : '')
    setExNotes(ex.notes ?? '')
    setExLink(ex.reference_link ?? '')
    setEditingId(ex._tempId)
    setFormOpen(true)
  }

  function saveExercise() {
    if (!exName.trim()) return

    const muscleVal = exMuscle === 'otro' ? exMuscleOther.trim() : exMuscle

    const ex: LocalExercise = {
      _tempId: editingId || tempId(),
      exercise_name: exName.trim(),
      muscle: muscleVal || null,
      sets: exSets !== '' ? Number(exSets) : null,
      reps: exReps !== '' ? Number(exReps) : null,
      rest_seconds: exRest !== '' ? Number(exRest) : null,
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
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)}
                className="w-7 h-7 rounded-sm bg-transparent border border-border text-text-3 flex items-center justify-center cursor-pointer hover:bg-surface2 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            )}
            <div className="flex items-center gap-[10px] text-base font-semibold">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 1 ? 'bg-accent text-black' : 'bg-green-bg text-green-text'}`}>1</span>
              <span className={step === 1 ? 'text-text' : 'text-text-3'}>Información</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-3"><polyline points="9 18 15 12 9 6"/></svg>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? 'bg-accent text-black' : 'bg-surface3 text-text-3'}`}>2</span>
              <span className={step === 2 ? 'text-text' : 'text-text-3'}>Ejercicios</span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 sm:w-7 h-9 sm:h-7 rounded-sm bg-transparent border border-border text-text-3 cursor-pointer flex items-center justify-center text-base font-sans hover:bg-surface2 transition-colors">✕</button>
        </div>

        <div className="px-6 py-5">
          {step === 1 ? (
            /* Step 1: Plan Info */
            <div className="flex flex-col gap-4">
              <Input label="Nombre del plan *" value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Fuerza Básica" />
              <Textarea label="Descripción" value={description} onChange={e => setDescription(e.target.value)} placeholder="Objetivo del plan, notas generales…" />
              <div className="flex justify-end gap-[10px] pt-3">
                <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" size="sm" onClick={() => setStep(2)} disabled={!name.trim()}>
                  Siguiente
                </Button>
              </div>
            </div>
          ) : (
            /* Step 2: Exercise Builder */
            <div className="flex flex-col gap-4">
              {/* Day tabs */}
              <div className="flex gap-1.5 overflow-x-auto">
                {DAYS.map((d, i) => {
                  const hasExs = (exercisesByDay[i] || []).length > 0
                  return (
                    <button key={d} onClick={() => { setSelectedDay(i); setFormOpen(false) }}
                      className={`shrink-0 px-3.5 py-[7px] rounded-[var(--radius-sm)] text-xs font-medium cursor-pointer font-sans transition-all duration-150 ${
                        selectedDay === i
                          ? 'bg-accent text-black border border-accent'
                          : hasExs
                            ? 'bg-transparent text-text-2 border border-border hover:bg-surface2 hover:text-text'
                            : 'bg-transparent text-text-3 border border-border'
                      }`}>
                      {d}{hasExs ? <span className="ml-1 text-[10px] opacity-70">({exercisesByDay[i].length})</span> : ''}
                    </button>
                  )
                })}
              </div>

              {/* Exercise list */}
              <div className="bg-surface2 border border-border rounded min-h-[120px]">
                {currentExercises.length === 0 && !formOpen ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                    <div className="text-xs text-text-3">Sin ejercicios en {DAYS[selectedDay].toLowerCase()}</div>
                    <button onClick={openAddForm}
                      className="text-[11px] text-accent bg-accent-dim border border-[rgba(232,255,71,0.15)] px-3 py-1.5 rounded-[var(--radius-sm)] cursor-pointer font-sans transition-all duration-150 hover:bg-accent hover:text-black">
                      + Agregar ejercicio
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {currentExercises.map((ex, idx) => (
                      <div key={ex._tempId} className={`flex items-center gap-3 px-4 py-3 ${idx < currentExercises.length - 1 ? 'border-b border-border' : ''}`}>
                        <div className="flex flex-col gap-[2px] shrink-0">
                          <button onClick={() => moveExercise(idx, -1)} disabled={idx === 0}
                            className="w-4 h-3 flex items-center justify-center text-text-4 hover:text-text-2 disabled:opacity-20 disabled:cursor-default cursor-pointer">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
                          </button>
                          <button onClick={() => moveExercise(idx, 1)} disabled={idx === currentExercises.length - 1}
                            className="w-4 h-3 flex items-center justify-center text-text-4 hover:text-text-2 disabled:opacity-20 disabled:cursor-default cursor-pointer">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                          </button>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-surface3 border border-border2 flex items-center justify-center text-[9px] font-semibold text-text-3 shrink-0">{idx + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium truncate">{ex.exercise_name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {ex.muscle && <span className="text-[10px] bg-surface3 text-text-3 px-1.5 py-[1px] rounded-full">{ex.muscle}</span>}
                            {ex.reference_link && (
                              <a href={ex.reference_link} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] text-blue-text hover:underline inline-flex items-center gap-0.5"
                                onClick={e => e.stopPropagation()}>
                                🔗
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-text-3 font-mono">
                          {ex.sets != null && <span>{ex.sets}s</span>}
                          {ex.reps != null && <span>{ex.reps}r</span>}
                          {ex.rest_seconds != null && <span>{ex.rest_seconds}s</span>}
                        </div>
                        <button onClick={() => openEditForm(ex)}
                          className="w-7 h-7 rounded-[var(--radius-sm)] bg-transparent border border-border text-text-3 flex items-center justify-center cursor-pointer hover:bg-surface3 transition-colors shrink-0">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => deleteExercise(ex._tempId)}
                          className="w-7 h-7 rounded-[var(--radius-sm)] bg-transparent border border-border text-text-3 flex items-center justify-center cursor-pointer hover:bg-red-bg hover:text-red-text hover:border-[rgba(239,68,68,0.3)] transition-colors shrink-0">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    ))}
                    {!formOpen && (
                      <button onClick={openAddForm}
                        className="flex items-center justify-center gap-1.5 px-4 py-3 text-[11px] text-accent bg-transparent border-t border-border cursor-pointer font-sans transition-all duration-150 hover:bg-accent-dim">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Agregar ejercicio
                      </button>
                    )}
                  </div>
                )}

                {/* Exercise form */}
                {formOpen && (
                  <div className="border-t border-border p-4 bg-surface">
                    <div className="text-xs font-semibold text-text-2 mb-3">{editingId ? 'Editar ejercicio' : 'Nuevo ejercicio'}</div>
                    <div className="flex flex-col gap-3">
                      <Input label="Nombre del ejercicio *" value={exName} onChange={e => setExName(e.target.value)} placeholder="Ej. Press banca" />

                      <div>
                        <label className="text-xs font-medium text-text-2 block mb-2">Músculo</label>
                        <div className="flex flex-wrap gap-1.5">
                          {MUSCLES.map(m => (
                            <button key={m} onClick={() => setExMuscle(exMuscle === m ? '' : m)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-all duration-150 ${
                                exMuscle === m
                                  ? 'bg-accent text-black border border-accent'
                                  : 'bg-transparent text-text-3 border border-border hover:bg-surface2 hover:text-text-2'
                              }`}>
                              {m}
                            </button>
                          ))}
                          <button onClick={() => setExMuscle(exMuscle === 'otro' ? '' : 'otro')}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-all duration-150 ${
                              exMuscle === 'otro'
                                ? 'bg-accent text-black border border-accent'
                                : 'bg-transparent text-text-3 border border-border hover:bg-surface2 hover:text-text-2'
                            }`}>
                            Otro
                          </button>
                        </div>
                        {exMuscle === 'otro' && (
                          <input value={exMuscleOther} onChange={e => setExMuscleOther(e.target.value)} placeholder="Especificar músculo…"
                            className="mt-2 w-full bg-surface2 border border-border2 text-text font-sans text-xs px-2.5 py-1.5 rounded-sm outline-none placeholder:text-text-3" />
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <Input label="Series" type="number" min="0" value={exSets} onChange={e => setExSets(e.target.value)} placeholder="0" />
                        <Input label="Reps" type="number" min="0" value={exReps} onChange={e => setExReps(e.target.value)} placeholder="0" />
                        <Input label="Descanso (s)" type="number" min="0" value={exRest} onChange={e => setExRest(e.target.value)} placeholder="0" />
                      </div>

                      <Textarea label="Notas" value={exNotes} onChange={e => setExNotes(e.target.value)} placeholder="Indicaciones, técnica, variantes…" />

                      <Input label="Link de referencia (opcional)" value={exLink} onChange={e => setExLink(e.target.value)} placeholder="youtube.com/watch?v=…" />

                      <div className="flex justify-end gap-2 pt-1">
                        <Button variant="ghost" size="sm" onClick={() => { resetForm(); setFormOpen(false) }}>Cancelar</Button>
                        <Button variant="primary" size="sm" onClick={saveExercise} disabled={!exName.trim()}>
                          {editingId ? 'Guardar cambios' : 'Agregar ejercicio'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-text-3">{exCount} ejercicio{exCount !== 1 ? 's' : ''} en total</div>
                <div className="flex gap-[10px]">
                  <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
                  <Button variant="primary" size="sm" onClick={handleSave} disabled={!name.trim() || saving}>
                    {saving ? 'Guardando…' : editPlan ? 'Guardar cambios' : 'Crear plan'}
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
