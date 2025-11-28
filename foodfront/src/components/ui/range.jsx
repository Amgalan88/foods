'use client';

import * as React from "react";
import Calendar from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function RangeCalendar({ value, onChange }) {
  const [internalRange, setInternalRange] = React.useState({
    from: null,
    to: null,
  });

  const range = value ?? internalRange;
  const handleChange =
    onChange ??
    ((next) => {
      setInternalRange(next);
    });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[260px] justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {range?.from ? (
            range.to ? (
              <>
                {format(range.from, "d MMM yyyy")} –{" "}
                {format(range.to, "d MMM yyyy")}
              </>
            ) : (
              format(range.from, "d MMM yyyy")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleChange}
          numberOfMonths={2}
          defaultMonth={range?.from ?? new Date()}
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  );
}
