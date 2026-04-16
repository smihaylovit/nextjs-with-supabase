import { OfferForm } from '../_components/offer-form'

export default function NewOfferPage() {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-lg font-medium mb-6">Нова оферта</h1>
      <OfferForm />
    </div>
  )
}