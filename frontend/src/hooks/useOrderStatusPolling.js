import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { getOrderByIdAsync } from '../features/order/OrderSlice';

/**
 * Custom hook for polling order status updates
 * @param {string} orderId - The order ID to poll
 * @param {number} interval - Polling interval in milliseconds (default: 30000 = 30 seconds)
 * @param {boolean} enabled - Whether polling is enabled
 */
export const useOrderStatusPolling = (orderId, interval = 30000, enabled = true) => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!orderId || !enabled) return;

    // Initial fetch
    dispatch(getOrderByIdAsync(orderId));

    // Set up polling
    intervalRef.current = setInterval(() => {
      dispatch(getOrderByIdAsync(orderId));
    }, interval);

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch, orderId, interval, enabled]);

  // Function to manually refresh
  const refresh = () => {
    if (orderId) {
      dispatch(getOrderByIdAsync(orderId));
    }
  };

  return { refresh };
};
