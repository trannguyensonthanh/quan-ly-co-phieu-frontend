/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { fetchGoongAddressSuggestions } from '@/services/goong.service';

export function useGoongAddressAutocomplete() {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAddress = useCallback(async (input: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchGoongAddressSuggestions(input);
      setAddresses(results);
    } catch (err: any) {
      setError(err.message || 'Lỗi không xác định');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { addresses, loading, error, searchAddress };
}
