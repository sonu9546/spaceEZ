'use client'

import React from 'react'
import { Form, Progress } from 'antd'
import type { FormItemProps } from 'antd'
import type { InputProps, InputRef } from 'antd'
import AppInput from '../AppInput'
import { validatePassword } from '@/utils/helper'
import { IoIosLock } from 'react-icons/io'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

export interface PasswordFormItemProps extends Omit<FormItemProps, 'children'> {
    name: string
    label?: string
    required?: boolean
    placeholder?: string
    disabled?: boolean
    prefix?: React.ReactNode
    suffix?: React.ReactNode
    minLength?: number
    maxLength?: number
    showStrength?: boolean
    customValidationMessage?: string
    inputProps?: Omit<InputProps, 'type'>
    hasRules?: boolean
}

const PasswordFormItem = React.forwardRef<InputRef, PasswordFormItemProps>(
    (
        {
            name,
            label = 'Password',
            required: _required = false,
            placeholder = 'Enter your password',
            disabled = false,
            prefix = <IoIosLock className='size-6' />,
            suffix,
            minLength = 8,
            maxLength = 128,
            showStrength = false,
            customValidationMessage: _customValidationMessage,
            inputProps = {},
            hasRules = true,
            ...formItemProps
        },
        ref
    ) => {
        const [passwordValue, setPasswordValue] = React.useState('')
        const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)

        // Toggle password visibility
        const togglePasswordVisibility = () => {
            setIsPasswordVisible(!isPasswordVisible)
        }

        // Calculate password strength
        const getPasswordStrength = (password: string) => {
            if (!password) return 0

            let strength = 0
            const length = password.length

            // Length check
            if (length >= minLength) strength += 25
            if (length >= minLength + 4) strength += 25

            // Uppercase check
            if (/[A-Z]/.test(password)) strength += 15

            // Lowercase check
            if (/[a-z]/.test(password)) strength += 15

            // Number check
            if (/[0-9]/.test(password)) strength += 10

            // Special character check
            if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 10

            return Math.min(strength, 100)
        }

        const getStrengthStatus = (strength: number) => {
            if (strength < 25) return 'exception'
            if (strength < 50) return 'exception'
            if (strength < 75) return 'normal'
            return 'success'
        }

        const getStrengthLabel = (strength: number) => {
            if (strength < 25) return 'Weak'
            if (strength < 50) return 'Fair'
            if (strength < 75) return 'Good'
            return 'Strong'
        }

        const strength = getPasswordStrength(passwordValue)
        const strengthStatus = getStrengthStatus(strength)
        const strengthLabel = getStrengthLabel(strength)

        const rules = [
            {
                validator: validatePassword,
            },
        ]

        // Filter out incompatible props
        const { status: _status, ...restInputProps } = inputProps

        const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setPasswordValue(e.target.value)
        }

        // Eye icon for toggling password visibility
        const visibilityIcon = (
            <span
                onClick={togglePasswordVisibility}
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            >
                {isPasswordVisible ? <FaEye /> : <FaEyeSlash />}
            </span>
        )

        // Combine suffix with visibility icon
        const finalSuffix = suffix ? (
            <div className="flex gap-2 items-center">
                {suffix}
                {visibilityIcon}
            </div>
        ) : (
            visibilityIcon
        )

        return (
            <Form.Item name={name} label={label} rules={hasRules ? rules : []} {...formItemProps}>
                <div>
                    <AppInput
                        ref={ref}
                        type={isPasswordVisible ? 'text' : 'password'}
                        placeholder={placeholder}
                        disabled={disabled}
                        prefix={prefix}
                        suffix={finalSuffix}
                        maxLength={maxLength}
                        onChange={handlePasswordChange}
                        {...restInputProps}
                    />
                    {showStrength && passwordValue && (
                        <div className="mt-2 space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Password Strength</span>
                                <span className={`text-xs font-semibold ${strengthStatus === 'success'
                                    ? 'text-green-500'
                                    : strengthStatus === 'normal'
                                        ? 'text-yellow-500'
                                        : 'text-red-500'
                                    }`}>
                                    {strengthLabel}
                                </span>
                            </div>
                            <Progress
                                percent={strength}
                                strokeColor={
                                    strengthStatus === 'success'
                                        ? '#22c55e'
                                        : strengthStatus === 'normal'
                                            ? '#eab308'
                                            : '#ef4444'
                                }
                                size="small"
                                showInfo={false}
                            />
                        </div>
                    )}
                </div>
            </Form.Item>
        )
    }
)

PasswordFormItem.displayName = 'PasswordFormItem'

export default PasswordFormItem
