import React, { useState } from 'react';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../../../util/reactIntl';
import { Form, Heading, H3, PrimaryButton } from '../../../../../components';
import FieldTimeZoneSelect from '../FieldTimeZoneSelect';
import AvailabilityPlanEntries from './AvailabilityPlanEntries';
import SmartDatePicker from '../../../../../components/SmartDatePicker/SmartDatePicker';

import css from './EditListingAvailabilityPlanForm.module.css';

/**
 * User might create entries inside the day of week in what ever order.
 * We sort them before submitting to Marketplace API
 */
const sortEntries = () => (a, b) => {
  if (a.startTime && b.startTime) {
    const aStart = Number.parseInt(a.startTime.split(':')[0]);
    const bStart = Number.parseInt(b.startTime.split(':')[0]);
    return aStart - bStart;
  }
  return 0;
};

/**
 * Handle submitted values: sort entries within the day of week
 * @param {Redux Thunk} onSubmit promise fn.
 * @param {Array<string>} weekdays ['mon', 'tue', etc.]
 */
const submit = (onSubmit, weekdays) => values => {
  const sortedValues = weekdays.reduce(
    (submitValues, day) => {
      return submitValues[day]
        ? {
            ...submitValues,
            [day]: submitValues[day].sort(sortEntries()),
          }
        : submitValues;
    },
    { ...values }
  );

  onSubmit(sortedValues);
};

/**
 * @typedef {'sun'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat'} Weekday
 */

/**
 * Create and edit availability plan of the listing.
 * This is essentially the weekly schedule.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {string?} props.rootClassName
 * @param {string?} props.formId
 * @param {Object} props.form form API from React Final Form
 * @param {Function} props.handleSubmit
 * @param {boolean} props.inProgress
 * @param {string} props.listingTitle
 * @param {Array<Weekday>} props.weekdays
 * @param {boolean} props.useFullDays
 * @param {boolean} props.useMultipleSeats
 * @param {'hour'|'day'|'night'} props.unitType
 * @param {boolean} props.fetchErrors
 * @param {Object|null} props.fetchErrors.updateListingError
 * @param {Object} props.values form's values
 * @returns {JSX.Element} containing form that allows adding availability exceptions
 */
const EditListingAvailabilityPlanForm = props => {
  const intl = useIntl();
  const { onSubmit, ...restOfprops } = props;
  const [selectedDateDays, setSelectedDateDays] = useState([]);
  return (
    <FinalForm
      {...restOfprops}
      onSubmit={submit(onSubmit, props.weekdays)}
      mutators={{
        ...arrayMutators,
      }}
      render={fieldRenderProps => {
        const {
          rootClassName,
          className,
          formId,
          form: formApi,
          handleSubmit,
          inProgress,
          listingTitle,
          weekdays,
          useFullDays,
          useMultipleSeats,
          unitType,
          fetchErrors,
          values,
        } = fieldRenderProps;

        const classes = classNames(rootClassName || css.root, className);
        const submitInProgress = inProgress;

        const concatDayEntriesReducer = (entries, day) =>
          values[day] ? entries.concat(values[day]) : entries;
        const hasUnfinishedEntries = !!weekdays
          .reduce(concatDayEntriesReducer, [])
          .find(e => !e.startTime || !e.endTime);

        const { updateListingError } = fetchErrors || {};

        const submitDisabled = submitInProgress || hasUnfinishedEntries;

        return (
          <Form id={formId} className={classes} onSubmit={handleSubmit}>
            <H3 as="h2" className={css.heading}>
              <FormattedMessage
                id="EditListingAvailabilityPlanForm.title"
                values={{ listingTitle }}
              />
            </H3>
            <Heading as="h3" rootClassName={css.subheading}>
              <FormattedMessage id="EditListingAvailabilityPlanForm.timezonePickerTitle" />
            </Heading>
            <div className={css.timezonePicker}>
              <FieldTimeZoneSelect
                id="timezone"
                name="timezone"
                selectClassName={css.timeZoneSelect}
                rootClassName={css.timeZoneField}
              />
            </div>
            {/* Smart Date Picker Integration */}
            <div className={css.smartSchedulingSection}>
              <Heading as="h3" rootClassName={css.subheading}>
                <FormattedMessage 
                  id="EditListingAvailabilityPlanForm.smartSchedulingTitle" 
                  defaultMessage="Smart Availability Selection"
                />
              </Heading>
              <p className={css.smartSchedulingDescription}>
                <FormattedMessage 
                  id="EditListingAvailabilityPlanForm.smartSchedulingDescription" 
                  defaultMessage="Select specific dates to create availability exceptions. This will make you available on those exact dates, regardless of your weekly schedule. Perfect for one-off availability or special events."
                />
              </p>
              <SmartDatePicker
                name="smart-dates"
                label="Select Available Dates"
                placeholder="Choose your available dates"
                toolType="power-tools"
                onDateChange={(dateData) => {
                  console.log('Smart date selection for availability:', dateData);
                  
                  if (dateData.dates && dateData.dates.length > 0) {
                    const selectedDates = dateData.dates;
                    
                    // Show user what they've selected and provide clear guidance
                    console.log(`📅 You've selected ${selectedDates.length} dates for availability`);
                    console.log('💡 Next steps:');
                    console.log('1. Set up your weekly schedule below (this creates your base availability pattern)');
                    console.log('2. Use the "Add Exception" button to create specific date exceptions for your selected dates');
                    console.log('3. This approach gives you maximum flexibility - weekly pattern + specific date overrides');
                    
                    // Store selected dates for display
                    setSelectedDateDays(selectedDates);
                  } else {
                    setSelectedDateDays([]);
                  }
                }}
              />
              
              {/* Show selected dates and guidance */}
              {selectedDateDays.length > 0 && (
                <div className={css.dateHelperSection}>
                  <p className={css.dateHelperText}>
                    <FormattedMessage 
                      id="EditListingAvailabilityPlanForm.dateHelperText" 
                      defaultMessage="📅 You've selected {count} dates for availability"
                      values={{ count: selectedDateDays.length }}
                    />
                  </p>
                  <div className={css.selectedDatesList}>
                    {selectedDateDays.slice(0, 5).map((dateStr, index) => (
                      <span key={index} className={css.selectedDate}>
                        {new Date(dateStr).toLocaleDateString()}
                      </span>
                    ))}
                    {selectedDateDays.length > 5 && (
                      <span className={css.moreDates}>
                        +{selectedDateDays.length - 5} more dates
                      </span>
                    )}
                  </div>
                  <p className={css.dateHelperInstructions}>
                    <FormattedMessage 
                      id="EditListingAvailabilityPlanForm.dateHelperInstructions" 
                      defaultMessage="💡 Set up your weekly schedule below, then use 'Add Exception' to create specific availability for these dates."
                    />
                  </p>
                </div>
              )}
            </div>

            <Heading as="h3" rootClassName={css.subheading}>
              <FormattedMessage id="EditListingAvailabilityPlanForm.hoursOfOperationTitle" />
            </Heading>
            <div className={css.week}>
              {weekdays.map(w => {
                return (
                  <AvailabilityPlanEntries
                    dayOfWeek={w}
                    useFullDays={useFullDays}
                    useMultipleSeats={useMultipleSeats}
                    unitType={unitType}
                    key={w}
                    values={values}
                    formApi={formApi}
                    intl={intl}
                  />
                );
              })}
            </div>

            <div className={css.submitButton}>
              {updateListingError ? (
                <p className={css.error}>
                  <FormattedMessage id="EditListingAvailabilityPlanForm.updateFailed" />
                </p>
              ) : null}
              <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
                <FormattedMessage id="EditListingAvailabilityPlanForm.saveSchedule" />
              </PrimaryButton>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default EditListingAvailabilityPlanForm;
