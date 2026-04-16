'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Service = {
  id: string
  name: string
  unit: string
  client_price: number
  internal_cost: number
  active: boolean
}

const EMPTY: Omit<Service, 'id' | 'active'> = {
  name: '',
  unit: 'ден',
  client_price: 0,
  internal_cost: 0,
}

const UNITS = ['ден', 'час', 'бр.', 'комплект', 'проект']

export function ServicesTable() {
  const supabase = createClient()
  const [services, setServices] = useState<Service[]>([])
  const [draft, setDraft] = useState<Omit<Service, 'id' | 'active'>>(EMPTY)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<Service>>({})

  async function load() {
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('name')
    setServices(data ?? [])
  }

  useEffect(() => { load() }, [])

  async function handleAdd() {
    if (!draft.name) return alert('Въведи наименование.')
    setSaving(true)
    await supabase.from('services').insert({
      ...draft,
      active: true,
      vat_applicable: true,
    })
    setDraft(EMPTY)
    setAdding(false)
    setSaving(false)
    load()
  }

  async function handleToggleActive(svc: Service) {
    await supabase.from('services').update({ active: !svc.active }).eq('id', svc.id)
    load()
  }

  async function handleSaveEdit(id: string) {
    await supabase.from('services').update(editDraft).eq('id', id)
    setEditingId(null)
    load()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="text-left px-4 py-2">Наименование</th>
              <th className="text-left px-3 py-2 w-24">Мерна ед.</th>
              <th className="text-right px-3 py-2 w-28">Клиент. цена</th>
              <th className="text-right px-3 py-2 w-28 text-red-400">Вътр. разход</th>
              <th className="text-right px-3 py-2 w-20 text-green-600">Марж</th>
              <th className="w-24 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400 text-sm">
                  Няма услуги все още. Добави първата.
                </td>
              </tr>
            )}
            {services.map(svc => {
              const margin = svc.client_price > 0
                ? Math.round(((svc.client_price - svc.internal_cost) / svc.client_price) * 100)
                : 0
              const isEditing = editingId === svc.id

              return (
                <tr key={svc.id} className={`border-t ${!svc.active ? 'opacity-40' : ''}`}>
                  <td className="px-4 py-2">
                    {isEditing
                      ? <input autoFocus value={editDraft.name ?? svc.name}
                          onChange={e => setEditDraft(p => ({ ...p, name: e.target.value }))}
                          className="w-full border rounded px-2 py-1 text-sm focus:outline-none" />
                      : svc.name}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing
                      ? <select value={editDraft.unit ?? svc.unit}
                          onChange={e => setEditDraft(p => ({ ...p, unit: e.target.value }))}
                          className="border rounded px-2 py-1 text-sm focus:outline-none">
                          {UNITS.map(u => <option key={u}>{u}</option>)}
                        </select>
                      : svc.unit}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {isEditing
                      ? <input type="number" value={editDraft.client_price ?? svc.client_price}
                          onChange={e => setEditDraft(p => ({ ...p, client_price: Number(e.target.value) }))}
                          className="w-full border rounded px-2 py-1 text-sm text-right focus:outline-none" />
                      : `€${svc.client_price.toFixed(2)}`}
                  </td>
                  <td className="px-3 py-2 text-right text-red-500">
                    {isEditing
                      ? <input type="number" value={editDraft.internal_cost ?? svc.internal_cost}
                          onChange={e => setEditDraft(p => ({ ...p, internal_cost: Number(e.target.value) }))}
                          className="w-full border rounded px-2 py-1 text-sm text-right text-red-500 focus:outline-none" />
                      : `€${svc.internal_cost.toFixed(2)}`}
                  </td>
                  <td className="px-3 py-2 text-right text-green-600">{margin}%</td>
                  <td className="px-3 py-2 text-right">
                    {isEditing
                      ? <div className="flex gap-2 justify-end">
                          <button onClick={() => handleSaveEdit(svc.id)}
                            className="text-xs text-blue-600 hover:underline">Запази</button>
                          <button onClick={() => setEditingId(null)}
                            className="text-xs text-gray-400 hover:underline">Откажи</button>
                        </div>
                      : <div className="flex gap-2 justify-end">
                          <button onClick={() => { setEditingId(svc.id); setEditDraft({}) }}
                            className="text-xs text-gray-500 hover:underline">Редактирай</button>
                          <button onClick={() => handleToggleActive(svc)}
                            className="text-xs text-gray-400 hover:underline">
                            {svc.active ? 'Деактивирай' : 'Активирай'}
                          </button>
                        </div>}
                  </td>
                </tr>
              )
            })}

            {/* Ред за добавяне */}
            {adding && (
              <tr className="border-t bg-blue-50">
                <td className="px-4 py-2">
                  <input autoFocus value={draft.name}
                    onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
                    placeholder="Наименование на услугата"
                    className="w-full border rounded px-2 py-1 text-sm focus:outline-none" />
                </td>
                <td className="px-3 py-2">
                  <select value={draft.unit}
                    onChange={e => setDraft(p => ({ ...p, unit: e.target.value }))}
                    className="border rounded px-2 py-1 text-sm focus:outline-none">
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input type="number" value={draft.client_price}
                    onChange={e => setDraft(p => ({ ...p, client_price: Number(e.target.value) }))}
                    className="w-full border rounded px-2 py-1 text-sm text-right focus:outline-none" />
                </td>
                <td className="px-3 py-2">
                  <input type="number" value={draft.internal_cost}
                    onChange={e => setDraft(p => ({ ...p, internal_cost: Number(e.target.value) }))}
                    className="w-full border rounded px-2 py-1 text-sm text-right text-red-500 focus:outline-none" />
                </td>
                <td className="px-3 py-2 text-right text-green-600 text-sm">
                  {draft.client_price > 0
                    ? Math.round(((draft.client_price - draft.internal_cost) / draft.client_price) * 100)
                    : 0}%
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={handleAdd} disabled={saving}
                      className="text-xs text-blue-600 hover:underline">Запази</button>
                    <button onClick={() => { setAdding(false); setDraft(EMPTY) }}
                      className="text-xs text-gray-400 hover:underline">Откажи</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {!adding && (
          <div className="px-4 py-2 border-t">
            <button onClick={() => setAdding(true)}
              className="text-sm text-blue-600 hover:underline">
              + Добави услуга
            </button>
          </div>
        )}
      </div>
    </div>
  )
}