import { useCallback, useEffect, useState } from 'react'
import api from '../api/axios'

export function useCrud(endpoint) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const { data } = await api.get(endpoint)
      setItems(data.data || data)
    } catch {
      setError('Backend indisponible ou acces refuse.')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    let active = true

    api
      .get(endpoint)
      .then(({ data }) => {
        if (!active) return
        setItems(data.data || data)
        setError('')
      })
      .catch(() => {
        if (!active) return
        setError('Backend indisponible ou acces refuse.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [endpoint])

  return { items, setItems, loading, error, reload: load }
}
