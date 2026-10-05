// Ícones de marca (o lucide-react não inclui logos de marcas).

export function WhatsAppIcon({ size = 24, ...props }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden="true" {...props}>
      <path
        d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.822 6.5L4 29l7.75-1.797A11.93 11.93 0 0 0 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3Z"
        fill="#fff"
      />
      <path
        d="M22.003 19.25c-.302-.15-1.786-.882-2.063-.982-.276-.1-.477-.15-.678.15-.2.3-.776.982-.952 1.183-.175.2-.351.225-.652.075-.302-.15-1.274-.47-2.426-1.495-.896-.8-1.501-1.787-1.677-2.087-.175-.3-.019-.462.132-.611.135-.135.302-.351.452-.527.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.527-.075-.15-.678-1.633-.928-2.235-.244-.587-.493-.507-.678-.517l-.577-.01c-.2 0-.527.075-.803.375s-1.054 1.03-1.054 2.512 1.08 2.912 1.23 3.113c.15.2 2.126 3.247 5.152 4.553.72.31 1.282.496 1.72.635.722.23 1.38.197 1.9.12.58-.086 1.786-.73 2.038-1.435.252-.705.252-1.308.177-1.435-.075-.126-.276-.2-.577-.35Z"
        fill="#25d366"
      />
    </svg>
  )
}

export function InstagramIcon({ size = 24, ...props }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  )
}
