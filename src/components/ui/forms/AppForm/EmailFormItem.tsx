'use client'

import React from 'react'
import { Form } from 'antd'
import type { FormItemProps } from 'antd'
import type { InputProps, InputRef } from 'antd'
import AppInput from '../AppInput'
import { validateEmail } from '@/utils/helper'
import { MdEmail } from 'react-icons/md'

export interface EmailFormItemProps extends Omit<FormItemProps, 'children'> {
  name: string
  label?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  clearable?: boolean
  maxLength?: number
  autoComplete?: string
  inputProps?: Omit<InputProps, 'type'>
  customValidationMessage?: string
  hasRules?: boolean
}

const EmailFormItem = React.forwardRef<InputRef, EmailFormItemProps>(
  (
    {
      name,
      label = 'Email',
      required: _required = false,
      placeholder = 'Enter your email address',
      disabled = false,
      prefix = <MdEmail className='size-6' />,
      suffix,
      clearable = false,
      maxLength = 255,
      autoComplete = 'email',
      inputProps = {},
      customValidationMessage: _customValidationMessage,
      hasRules = true,
      ...formItemProps
    },
    ref
  ) => {

    const rules = [
      {
        validator: validateEmail,
      },
    ]

    // Filter out incompatible props
    const { status: _status, ...restInputProps } = inputProps

    return (
      <Form.Item
        name={name}
        label={label}
        rules={hasRules ? rules : []}
        {...formItemProps}
      >
        <AppInput
          ref={ref}
          // type="email"
          placeholder={placeholder}
          disabled={disabled}
          prefix={prefix}
          suffix={suffix}
          allowClear={clearable}
          maxLength={maxLength}
          autoComplete={autoComplete}
          {...restInputProps}
        />
      </Form.Item>
    )
  }
)

EmailFormItem.displayName = 'EmailFormItem'

export default EmailFormItem
