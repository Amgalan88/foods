'use client';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export const Calendar = React.forwardRef(function Calendar(
  { className, classNames, showOutsideDays = true, ...props },
  ref
) {
  return (
    <DayPicker
      ref={ref}
      showOutsideDays={showOutsideDays}
      className={className}
      classNames={{ ...classNames }}
      {...props} // numberOfMonths, defaultMonth, selected, onSelect г.м. бүгд энд зүгээр
    />
  );
});
export default Calendar;
