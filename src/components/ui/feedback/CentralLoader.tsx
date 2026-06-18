import { Spin } from 'antd'
import { useIsFetching, useIsMutating } from '@tanstack/react-query'

export default function CentralLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const visible = isFetching > 0 || isMutating > 0;

  if (!visible) return null

  return (
    <Spin size="large" fullscreen spinning />
  )
}

