import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { addDays, getISODateString, getLocalDateFromISOString } from '../DatePicker/DatePickers/DatePicker.helpers';

import { Button } from '../../components';
import css from './SmartDatePicker.module.css';

const SmartDatePicker = props => {
  const {
    rootClassName,
    className,
    name,
    label,
    placeholder,
    toolType = 'general',
    onDateChange,
    ...rest
  } = props;

  const intl = useIntl();
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [quickSelections, setQuickSelections] = useState([]);

  // Generate calendar data for current month
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays(currentMonth);

  // Quick selection presets
  const quickSelectionOptions = [
    { id: 'weekend', label: 'Weekends', description: 'Select all weekends this month' },
    { id: 'weekdays', label: 'Weekdays', description: 'Select all weekdays this month' },
    { id: 'next-week', label: 'Next Week', description: 'Select the next 7 days' },
    { id: 'next-month', label: 'Next Month', description: 'Select the next 30 days' },
    { id: 'clear', label: 'Clear All', description: 'Clear all selections' },
  ];

  const handleDateClick = (date) => {
    const dateString = getISODateString(date);
    
    // Toggle selection - if already selected, remove it; otherwise add it
    setSelectedDates(prev => {
      const isSelected = prev.includes(dateString);
      if (isSelected) {
        return prev.filter(d => d !== dateString);
      } else {
        return [...prev, dateString];
      }
    });
  };

  const handleQuickSelection = (optionId) => {
    const today = new Date();
    let newDates = [];

    switch (optionId) {
      case 'weekend':
        // Select all weekends in current month
        newDates = calendarDays
          .filter(date => date.getDay() === 0 || date.getDay() === 6)
          .map(date => getISODateString(date));
        break;
      
      case 'weekdays':
        // Select all weekdays in current month
        newDates = calendarDays
          .filter(date => date.getDay() >= 1 && date.getDay() <= 5)
          .map(date => getISODateString(date));
        break;
      
      case 'next-week':
        // Select next 7 days
        for (let i = 0; i < 7; i++) {
          newDates.push(getISODateString(addDays(today, i)));
        }
        break;
      
      case 'next-month':
        // Select next 30 days
        for (let i = 0; i < 30; i++) {
          newDates.push(getISODateString(addDays(today, i)));
        }
        break;
      
      case 'clear':
        setSelectedDates([]);
        setQuickSelections([]);
        return;
    }

    setSelectedDates(newDates);
    setQuickSelections(prev => [...prev, optionId]);
  };

  const clearSelection = () => {
    setSelectedDates([]);
    setQuickSelections([]);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + direction);
      return newMonth;
    });
  };

  const isDateSelected = (date) => {
    const dateString = getISODateString(date);
    return selectedDates.includes(dateString);
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Notify parent component when dates change
  useEffect(() => {
    if (onDateChange && selectedDates.length > 0) {
      onDateChange({ dates: selectedDates });
    }
  }, [selectedDates, onDateChange]);

  return (
    <div className={classNames(rootClassName || css.root, className)}>
      {label && (
        <label className={css.label}>
          {label}
        </label>
      )}
      
      <div className={css.calendarContainer}>
        {/* Quick Selection Buttons */}
        <div className={css.quickSelectionSection}>
          <h4 className={css.quickSelectionTitle}>
            <FormattedMessage id="SmartDatePicker.quickSelection" defaultMessage="Quick Selection" />
          </h4>
          <div className={css.quickSelectionButtons}>
            {quickSelectionOptions.map(option => (
              <Button
                key={option.id}
                className={classNames(css.quickButton, { 
                  [css.activeQuickButton]: quickSelections.includes(option.id) 
                })}
                onClick={() => handleQuickSelection(option.id)}
                size="small"
                type="button"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className={css.calendar}>
          {/* Calendar Header */}
          <div className={css.calendarHeader}>
            <Button
              className={css.navButton}
              onClick={() => navigateMonth(-1)}
              size="small"
              type="button"
            >
              ‹
            </Button>
            <h3 className={css.monthTitle}>
              {currentMonth.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h3>
            <Button
              className={css.navButton}
              onClick={() => navigateMonth(1)}
              size="small"
              type="button"
            >
              ›
            </Button>
          </div>

          {/* Day Headers */}
          <div className={css.dayHeaders}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={css.dayHeader}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className={css.calendarGrid}>
            {calendarDays.map((date, index) => (
              <button
                key={index}
                className={classNames(css.calendarDay, {
                  [css.otherMonth]: !isCurrentMonth(date),
                  [css.today]: isToday(date),
                  [css.selected]: isDateSelected(date),
                })}
                onClick={() => handleDateClick(date)}
                type="button"
                disabled={!isCurrentMonth(date)}
              >
                {date.getDate()}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Dates Display */}
        {selectedDates.length > 0 && (
          <div className={css.selectedDatesSection}>
            <div className={css.selectedDatesHeader}>
              <h4 className={css.selectedDatesTitle}>
                <FormattedMessage id="SmartDatePicker.selectedDates" defaultMessage="Selected Dates" />
              </h4>
              <Button
                className={css.clearButton}
                onClick={clearSelection}
                size="small"
                type="button"
              >
                <FormattedMessage id="SmartDatePicker.clear" defaultMessage="Clear" />
              </Button>
            </div>
            <div className={css.selectedDatesList}>
              {selectedDates.map((date, index) => (
                <span key={index} className={css.selectedDate}>
                  {new Date(date).toLocaleDateString()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartDatePicker;
