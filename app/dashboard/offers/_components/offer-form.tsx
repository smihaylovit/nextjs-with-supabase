'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Service = {
  id: string
  name: string
  unit: string
  client_price: number
  internal_cost: number
}

type Line = {
  id: string
  service_id: string
  description: string
  quantity: number
  client_unit_price: number
  internal_unit_cost: number
}

let counter = 0
function newLine(): Line {
  return {
    id: String(++counter),
    service_id: '',
    description: '',
    quantity: 1,
    client_unit_price: 0,
    internal_unit_cost: 0,
  }
}

export function OfferForm() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [services, setServices] = useState<Service[]>([])

  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [vatRate, setVatRate] = useState(0.20)
  const [lines, setLines] = useState<Line[]>([newLine()])

  useEffect(() => {
    supabase
      .from('services')
      .select('id, name, unit, client_price, internal_cost')
      .eq('active', true)
      .order('name')
      .then(({ data }) => setServices(data ?? []))
  }, [])

  function updateLine(id: string, field: keyof Line, value: string | number) {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  function pickService(lineId: string, serviceId: string) {
    const svc = services.find(s => s.id === serviceId)
    if (!svc) return
    setLines(prev => prev.map(l => l.id === lineId ? {
      ...l,
      service_id: serviceId,
      description: svc.name,
      client_unit_price: svc.client_price,
      internal_unit_cost: svc.internal_cost,
    } : l))
  }

  function addLine() { setLines(prev => [...prev, newLine()]) }
  function removeLine(id: string) { setLines(prev => prev.filter(l => l.id !== id)) }

  const subtotalClient = lines.reduce((s, l) => s + l.quantity * l.client_unit_price, 0)
  const subtotalInternal = lines.reduce((s, l) => s + l.quantity * l.internal_unit_cost, 0)
  const vat = subtotalClient * vatRate
  const total = subtotalClient + vat
  const margin = subtotalClient > 0
    ? Math.round(((subtotalClient - subtotalInternal) / subtotalClient) * 100)
    : 0

  async function handleSave(status: 'draft' | 'sent') {
    if (!title || !clientName) return alert('Попълни заглавие и клиент.')
    setSaving(true)

    const { data: offer, error } = await supabase
      .from('offers')
      .insert({ title, client_name: clientName, status, vat_rate: vatRate })
      .select()
      .single()

    if (error || !offer) { alert('Грешка при записване.'); setSaving(false); return }

    await supabase.from('offer_lines').insert(
      lines.map((l, i) => ({
        offer_id: offer.id,
        service_id: l.service_id || null,
        description: l.description,
        quantity: l.quantity,
        client_unit_price: l.client_unit_price,
        internal_unit_cost: l.internal_unit_cost,
        sort_order: i,
      }))
    )

    router.push('/dashboard/offers')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Основни полета */}
      <div className="bg-white border rounded-lg p-4 flex flex-col gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Заглавие на офертата</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="пр. Промоционална кампания — Lidl"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Клиент</label>
            <input
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="пр. Lidl Bulgaria EOOD"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">ДДС</label>
            <select
              value={vatRate}
              onChange={e => setVatRate(Number(e.target.value))}
              className="border rounded-md px-3 py-2 text-sm focus:outline-none"
            >
              <option value={0.20}>20%</option>
              <option value={0}>0% (без ДДС)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Позиции */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="text-left px-4 py-2">Услуга</th>
              <th className="text-right px-3 py-2 w-16">Кол.</th>
              <th className="text-right px-3 py-2 w-28">Ед. цена (кл.)</th>
              <th className="text-right px-3 py-2 w-28 text-red-400">Вътр. разход</th>
              <th className="text-right px-3 py-2 w-24">Общо</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map(line => (
              <tr key={line.id} className="border-t">
                <td className="px-4 py-2">
                  <select
                    value={line.service_id}
                    onChange={e => pickService(line.id, e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm mb-1 focus:outline-none"
                  >
                    <option value="">— избери услуга —</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <input
                    value={line.description}
                    onChange={e => updateLine(line.id, 'description', e.target.value)}
                    placeholder="или въведи описание ръчно"
                    className="w-full border rounded px-2 py-1 text-xs text-gray-500 focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number" min={1}
                    value={line.quantity}
                    onChange={e => updateLine(line.id, 'quantity', Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-sm text-right focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number" min={0}
                    value={line.client_unit_price}
                    onChange={e => updateLine(line.id, 'client_unit_price', Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-sm text-right focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number" min={0}
                    value={line.internal_unit_cost}
                    onChange={e => updateLine(line.id, 'internal_unit_cost', Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-sm text-right text-red-500 focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  €{(line.quantity * line.client_unit_price).toFixed(2)}
                </td>
                <td className="px-2">
                  <button
                    onClick={() => removeLine(line.id)}
                    className="text-gray-300 hover:text-red-400 text-lg leading-none"
                  >×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 border-t">
          <button onClick={addLine} className="text-sm text-blue-600 hover:underline">
            + Добави ред
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white border rounded-lg p-4 flex justify-end">
        <div className="flex flex-col gap-1 text-sm min-w-56">
          <div className="flex justify-between text-gray-500">
            <span>Общо без ДДС</span>
            <span>€{subtotalClient.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-red-400">
            <span>Вътрешен разход</span>
            <span>€{subtotalInternal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Марж</span>
            <span>{margin}%</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>ДДС {Math.round(vatRate * 100)}%</span>
            <span>€{vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-1 mt-1">
            <span>Общо с ДДС</span>
            <span>€{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
        >
          Откажи
        </button>
        <button
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Запази като чернова
        </button>
        <button
          onClick={() => handleSave('sent')}
          disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Изпрати оферта
        </button>
      </div>
    </div>
  )
}