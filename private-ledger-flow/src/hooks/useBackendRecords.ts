import { useQuery } from '@tanstack/react-query';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface BackendRecord {
  id: number;
  userAddress: string;
  cid: string;
  submissionHash: string;
  txHash: string;
  blockNumber: string | null;
  timestamp: string;
  category: string | null;
  note: string | null;
  status: string;
}

/**
 * Hook to fetch expense records from backend API
 * This is more reliable than direct blockchain queries with free-tier RPC
 */
export function useBackendRecords() {
  return useQuery({
    queryKey: ['backend-records'],
    queryFn: async (): Promise<BackendRecord[]> => {
      try {
        // Add timestamp to bust cache
        const timestamp = Date.now();
        const url = `${BACKEND_URL}/api/records?limit=50&_t=${timestamp}`;
        console.log('📡 [BACKEND] Fetching records from:', url);
        console.log('📡 [BACKEND] BACKEND_URL env:', BACKEND_URL);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          cache: 'no-store', // Force no cache
          mode: 'cors', // Explicitly set CORS mode
        });
        
        console.log('📡 [BACKEND] Response status:', response.status, response.statusText);
        console.log('📡 [BACKEND] Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [BACKEND] Error response:', errorText);
          throw new Error(`Backend API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ [BACKEND] Records received:', result.count, 'records');
        console.log('✅ [BACKEND] Full result:', result);
        
        if (result.success && result.records) {
          console.log('✅ [BACKEND] Returning', result.records.length, 'records');
          return result.records;
        }
        
        console.warn('⚠️ [BACKEND] No records in response:', result);
        return [];
      } catch (error: any) {
        console.error('❌ [BACKEND] Error fetching backend records:', error);
        console.error('❌ [BACKEND] Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        // Don't return empty array on network errors - let React Query handle retry
        throw error;
      }
    },
    refetchOnWindowFocus: true, // Refetch on focus to get latest data
    refetchOnMount: true, // Always fetch on mount
    refetchOnReconnect: true, // Refetch when network reconnects
    staleTime: 0, // Consider data stale immediately
    gcTime: 0, // Don't cache data
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

