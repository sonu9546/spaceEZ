'use client'

import React, { useState, forwardRef } from 'react'
import { Input, Tooltip } from 'antd'
import { CloseOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import type { InputProps, InputRef } from 'antd'

export interface AppInputProps extends InputProps {
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  clearable?: boolean
  showCharCount?: boolean
  maxLength?: number
  status?: 'success' | 'warning' | 'error' | ''
  statusMessage?: string
  showStatusIcon?: boolean
  customSuffix?: React.ReactNode
}

const AppInput = forwardRef<InputRef, AppInputProps>(
  (
    {
      prefix,
      suffix,
      clearable = false,
      showCharCount = false,
      maxLength,
      status = '',
      statusMessage = '',
      showStatusIcon = true,
      customSuffix,
      value,
      onChange,
      onClear,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string>(value as string || '')

    const currentValue = value !== undefined ? (value as string) : internalValue
    const charCount = currentValue?.length || 0

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value

      // Enforce maxLength if set
      if (maxLength && newValue.length > maxLength) {
        return
      }

      setInternalValue(newValue)
      onChange?.(e)
    }

    const handleClear = () => {
      const event = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>

      setInternalValue('')
      onChange?.(event)
      onClear?.()
    }

    // Determine suffix content
    const suffixContent = customSuffix || (
      <div className="flex items-center gap-2">
        {showCharCount && maxLength && (
          <span className={`text-xs ${charCount >= maxLength * 0.8 ? 'text-warning' : 'text-muted-foreground'}`}>
            {charCount}/{maxLength}
          </span>
        )}

        {showStatusIcon && status && (
          <Tooltip title={statusMessage}>
            {status === 'success' && <CheckCircleOutlined className="text-green-500" />}
            {status === 'warning' && <ExclamationCircleOutlined className="text-yellow-500" />}
            {status === 'error' && <CloseCircleOutlined className="text-red-500" />}
          </Tooltip>
        )}

        {clearable && currentValue && (
          <CloseOutlined
            onClick={handleClear}
            className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          />
        )}

        {suffix && suffix}
      </div>
    )

    return (
      <Input
        ref={ref}
        prefix={prefix}
        suffix={suffixContent}
        value={currentValue}
        onChange={handleChange}
        maxLength={maxLength}
        status={status}
        {...props}
      />
    )
  }
)

AppInput.displayName = 'AppInput'

export default AppInput
