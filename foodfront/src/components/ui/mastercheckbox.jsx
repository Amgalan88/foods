'use client';
import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * MasterCheckbox component
 * props:
 * - allChecked: бүх харагдаж буй мөрүүд сонгогдсон эсэх
 * - someChecked: хэсэгчлэн сонгогдсон эсэх (indeterminate төлөв)
 * - onToggleAll: бүгдийг сонгох/арилгах event
 */
export default function MasterCheckbox({ allChecked, someChecked, onToggleAll }) {
  const checkboxRef = React.useRef(null);

  // indeterminate төлөвийг гар аргаар оноох
  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someChecked;
    }
  }, [someChecked]);

  return (
    <Checkbox
      ref={checkboxRef}
      checked={allChecked}
      onCheckedChange={onToggleAll}
      className="w-5 h-5 border-2 cursor-pointer"
      id="master"
      aria-label="Select all orders"
    />
  );
}
