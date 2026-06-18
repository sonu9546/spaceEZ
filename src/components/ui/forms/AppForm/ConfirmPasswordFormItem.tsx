'use client';

import React from 'react';
import { Form } from 'antd';
import type { FormItemProps } from 'antd';
import type { InputProps, InputRef } from 'antd';
import AppInput from '../AppInput';
import { IoIosLock } from 'react-icons/io';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export interface ConfirmPasswordFormItemProps
  extends Omit<FormItemProps, 'children'> {
  /** Name of confirm password field */
  name: string;

  /** Name of original password field (IMPORTANT) */
  passwordFieldName: string;

  label?: string;
  placeholder?: string;
  disabled?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  maxLength?: number;
  inputProps?: Omit<InputProps, 'type'>;
}

const ConfirmPasswordFormItem = React.forwardRef<
  InputRef,
  ConfirmPasswordFormItemProps
>(
  (
    {
      name,
      passwordFieldName,
      label = 'Confirm Password',
      placeholder = 'Re-enter your password',
      disabled = false,
      prefix = <IoIosLock className="size-6" />,
      suffix,
      maxLength = 128,
      inputProps = {},
      ...formItemProps
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(false);

    const toggleVisibility = () => {
      setIsVisible((prev) => !prev);
    };

    const visibilityIcon = (
      <span
        onClick={toggleVisibility}
        className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
      >
        {isVisible ? <FaEye /> : <FaEyeSlash />}
      </span>
    );

    const finalSuffix = suffix ? (
      <div className="flex gap-2 items-center">
        {suffix}
        {visibilityIcon}
      </div>
    ) : (
      visibilityIcon
    );

    // Remove incompatible props
    const { status: _status, ...restInputProps } = inputProps;

    return (
      <Form.Item
        name={name}
        label={label}
        dependencies={[passwordFieldName]}
        rules={[
          { required: true, message: 'Please confirm your password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue(passwordFieldName) === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error('Passwords do not match')
              );
            },
          }),
        ]}
        {...formItemProps}
      >
        <AppInput
          ref={ref}
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
          disabled={disabled}
          prefix={prefix}
          suffix={finalSuffix}
          maxLength={maxLength}
          {...restInputProps}
        />
      </Form.Item>
    );
  }
);

ConfirmPasswordFormItem.displayName = 'ConfirmPasswordFormItem';

export default ConfirmPasswordFormItem;
