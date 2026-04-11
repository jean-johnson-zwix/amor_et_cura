import * as React from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  size?: 'sm' | 'md'
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', size = 'md', ...props }, ref) => {
    const sizeClass = size === 'sm' ? 'h-8 px-2' : 'h-9 px-2.5'
    return (
      <select
        ref={ref}
        className={`${sizeClass} rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    )
  }
)
Select.displayName = 'Select'

export { Select }
