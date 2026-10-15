export function LogoMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass =
    size === 'lg' ? 'h-24 w-24' : size === 'sm' ? 'h-8 w-8' : 'h-12 w-12'

  return (
    <img
      src="/brand/logo.png"
      alt="硅宠场域商标"
      className={`shrink-0 rounded-lg object-contain ${sizeClass}`}
    />
  )
}
