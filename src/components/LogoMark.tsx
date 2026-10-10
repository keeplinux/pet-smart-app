export function LogoMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass =
    size === 'lg'
      ? 'h-24 w-24 text-xs'
      : size === 'sm'
        ? 'h-8 w-8 text-[9px]'
        : 'h-12 w-12 text-[10px]'

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-lg border border-dashed border-[#171717]/25 bg-white ${sizeClass}`}
    >
      <span className="tracking-widest text-[#171717]/45">LOGO</span>
    </span>
  )
}
