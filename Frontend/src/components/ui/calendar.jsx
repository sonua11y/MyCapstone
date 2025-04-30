import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "../styles/calendar.css"

const Calendar = React.forwardRef(({ className, classNames, showOutsideDays = true, ...props }, ref) => (
  <DayPicker
    showOutsideDays={showOutsideDays}
    className={`calendar ${className || ''}`}
    classNames={{
      months: `calendar-months ${classNames?.months || ''}`,
      month: `calendar-month ${classNames?.month || ''}`,
      caption: `calendar-caption ${classNames?.caption || ''}`,
      caption_label: `calendar-caption-label ${classNames?.caption_label || ''}`,
      nav: `calendar-nav ${classNames?.nav || ''}`,
      nav_button: `calendar-nav-button ${classNames?.nav_button || ''}`,
      nav_button_previous: `calendar-nav-button-previous ${classNames?.nav_button_previous || ''}`,
      nav_button_next: `calendar-nav-button-next ${classNames?.nav_button_next || ''}`,
      table: `calendar-table ${classNames?.table || ''}`,
      head_row: `calendar-head-row ${classNames?.head_row || ''}`,
      head_cell: `calendar-head-cell ${classNames?.head_cell || ''}`,
      row: `calendar-row ${classNames?.row || ''}`,
      cell: `calendar-cell ${classNames?.cell || ''}`,
      day: `calendar-day ${classNames?.day || ''}`,
      day_selected: `calendar-day-selected ${classNames?.day_selected || ''}`,
      day_today: `calendar-day-today ${classNames?.day_today || ''}`,
      day_outside: `calendar-day-outside ${classNames?.day_outside || ''}`,
      day_disabled: `calendar-day-disabled ${classNames?.day_disabled || ''}`,
      day_range_middle: `calendar-day-range-middle ${classNames?.day_range_middle || ''}`,
      day_hidden: `calendar-day-hidden ${classNames?.day_hidden || ''}`,
      ...classNames,
    }}
    components={{
      IconLeft: ({ ...props }) => <ChevronLeft className="calendar-icon-left" />,
      IconRight: ({ ...props }) => <ChevronRight className="calendar-icon-right" />,
    }}
    {...props}
  />
))
Calendar.displayName = "Calendar"

export { Calendar } 