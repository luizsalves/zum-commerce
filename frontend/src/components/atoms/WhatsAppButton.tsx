/** Botão flutuante de WhatsApp. Recebe o número com DDI (ex.: 5535999999999). */
export function WhatsAppButton({ phone }: { phone?: string | null }) {
  const digits = phone?.replace(/\D/g, '')
  if (!digits) return null
  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-20 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg"
    >
      WhatsApp
    </a>
  )
}
