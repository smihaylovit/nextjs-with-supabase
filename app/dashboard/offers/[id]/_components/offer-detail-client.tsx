'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type OfferLine = {
  id: string
  description: string
  quantity: number
  client_unit_price: number
  internal_unit_cost: number
  sort_order: number
}

type Offer = {
  id: string
  title: string
  client_name: string
  status: string
  vat_rate: number
  created_at: string
  offer_lines: OfferLine[]
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Чернова',
  sent: 'Изпратена',
  accepted: 'Приета',
  rejected: 'Отхвърлена',
  expired: 'Изтекла',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  sent: 'bg-blue-50 text-blue-600',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-600',
  expired: 'bg-yellow-50 text-yellow-600',
}

export function OfferDetailClient({ offer }: { offer: Offer }) {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState(offer.status)
  const [loading, setLoading] = useState(false)

  const lines = [...offer.offer_lines].sort((a, b) => a.sort_order - b.sort_order)

  const subtotalClient = lines.reduce((s, l) => s + l.quantity * l.client_unit_price, 0)
  const subtotalInternal = lines.reduce((s, l) => s + l.quantity * l.internal_unit_cost, 0)
  const vat = subtotalClient * offer.vat_rate
  const total = subtotalClient + vat
  const margin = subtotalClient > 0
    ? Math.round(((subtotalClient - subtotalInternal) / subtotalClient) * 100)
    : 0

  async function handleStatusChange(newStatus: string) {
    setLoading(true)
    await supabase.from('offers').update({ status: newStatus }).eq('id', offer.id)
    setStatus(newStatus)
    setLoading(false)
  }

  async function handleAcceptAndCreateProject() {
    setLoading(true)

    // 1. Смени статуса на приета
    await supabase.from('offers').update({ status: 'accepted' }).eq('id', offer.id)
    setStatus('accepted')

    // 2. Създай проект (trigger-ът в БД го прави автоматично,
    //    но го правим и тук за да redirectнем веднага)
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('offer_id', offer.id)
      .single()

    setLoading(false)

    if (project) {
      router.push(`/dashboard/projects/${project.id}`)
    } else {
      router.push('/dashboard/projects')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push('/dashboard/offers')}
            className="text-sm text-gray-400 hover:text-gray-600 mb-2 block"
          >
            ← Назад към оферти
          </button>
          <h1 className="text-lg font-medium">{offer.title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{offer.client_name}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* Позиции */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="text-left px-4 py-2">Услуга</th>
              <th className="text-right px-3 py-2 w-16">Кол.</th>
              <th className="text-right px-3 py-2 w-28">Ед. цена</th>
              <th className="text-right px-3 py-2 w-28 text-red-400">Вътр. разход</th>
              <th className="text-right px-3 py-2 w-24">Общо</th>
            </tr>
          </thead>
          <tbody>
            {lines.map(line => (
              <tr key={line.id} className="border-t">
                <td className="px-4 py-2">{line.description}</td>
                <td className="px-3 py-2 text-right">{line.quantity}</td>
                <td className="px-3 py-2 text-right">€{line.client_unit_price.toFixed(2)}</td>
                <td className="px-3 py-2 text-right text-red-400">€{line.internal_unit_cost.toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-medium">
                  €{(line.quantity * line.client_unit_price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            <span>ДДС {Math.round(offer.vat_rate * 100)}%</span>
            <span>€{vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-1 mt-1">
            <span>Общо с ДДС</span>
            <span>€{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border rounded-lg p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {status === 'draft' && (
            <button
              onClick={() => handleStatusChange('sent')}
              disabled={loading}
              className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Маркирай като изпратена
            </button>
          )}
          {status === 'sent' && (
            <button
              onClick={() => handleStatusChange('rejected')}
              disabled={loading}
              className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50 text-red-500 disabled:opacity-50"
            >
              Маркирай като отхвърлена
            </button>
          )}
          {(status === 'draft' || status === 'sent') && (
            <button
              onClick={() => handleStatusChange('expired')}
              disabled={loading}
              className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50 text-yellow-600 disabled:opacity-50"
            >
              Маркирай като изтекла
            </button>
          )}
        </div>

        {(status === 'sent' || status === 'draft') && (
          <button
            onClick={handleAcceptAndCreateProject}
            disabled={loading}
            className="text-sm px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            ✓ Приеми → Създай проект
          </button>
        )}

        {status === 'accepted' && (
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Виж проекта →
          </button>
        )}
      </div>
    </div>
  )
}