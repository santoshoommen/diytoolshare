import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { FormattedMessage, useIntl } from '../../util/reactIntl';

import { Button } from '../../components';
import css from './SmartPricing.module.css';

const SmartPricing = props => {
  const {
    rootClassName,
    className,
    name,
    label,
    basePrice = 0,
    currency = 'GBP',
    onPriceChange,
    ...rest
  } = props;

  const intl = useIntl();
  
  // Define available pricing periods - only daily, weekend, and weekly
  const allPricingPeriods = [
    { id: 'single-day', label: 'Daily', days: 1, defaultEnabled: true },
    { id: 'weekend', label: 'Weekend (per day)', days: 1, defaultEnabled: true },
    { id: 'week', label: 'Weekly (per day)', days: 1, defaultEnabled: true },
  ];

  // Initialize with only enabled periods
  const [enabledPeriods, setEnabledPeriods] = useState(
    allPricingPeriods.filter(period => period.defaultEnabled).map(period => period.id)
  );
  
  const [pricingPeriods, setPricingPeriods] = useState(
    allPricingPeriods
      .filter(period => period.defaultEnabled)
      .map(period => ({
        ...period,
        price: period.id === 'single-day' ? basePrice : 
               period.id === 'weekend' ? basePrice * 1.2 : // 20% above daily
               period.id === 'week' ? basePrice * 0.8 : // 20% below daily per day
               basePrice,
        active: true
      }))
  );

  const [showPeriodSelector, setShowPeriodSelector] = useState(false);

  useEffect(() => {
    // Update base price when it changes
    if (basePrice > 0) {
      setPricingPeriods(prev => prev.map(period => ({
        ...period,
        price: period.id === 'single-day' ? basePrice : 
               period.id === 'weekend' ? basePrice * 1.2 : // 20% above daily
               period.id === 'week' ? basePrice * 0.8 : // 20% below daily per day
               period.price
      })));
    }
  }, [basePrice]);

  const togglePeriod = (periodId) => {
    setEnabledPeriods(prev => {
      const isEnabled = prev.includes(periodId);
      if (isEnabled) {
        // Remove period
        setPricingPeriods(current => current.filter(p => p.id !== periodId));
        return prev.filter(id => id !== periodId);
      } else {
        // Add period
        const periodToAdd = allPricingPeriods.find(p => p.id === periodId);
        if (periodToAdd) {
          const newPrice = periodToAdd.id === 'single-day' ? basePrice : 
                          periodToAdd.id === 'weekend' ? basePrice * 1.2 : // 20% above daily
                          periodToAdd.id === 'week' ? basePrice * 0.8 : // 20% below daily per day
                          basePrice;
          
          setPricingPeriods(current => [...current, {
            ...periodToAdd,
            price: newPrice,
            active: true
          }]);
        }
        return [...prev, periodId];
      }
    });
  };

  const handlePeriodChange = (periodId, newPrice) => {
    setPricingPeriods(prev => prev.map(period => 
      period.id === periodId 
        ? { ...period, price: parseFloat(newPrice) || 0 }
        : period
    ));
    
    // Notify parent component
    if (onPriceChange) {
      const updatedPeriods = pricingPeriods.map(period => 
        period.id === periodId 
          ? { ...period, price: parseFloat(newPrice) || 0 }
          : period
      );
      onPriceChange(updatedPeriods);
    }
  };


  const allPeriods = pricingPeriods;

  return (
    <div className={classNames(rootClassName || css.root, className)}>
      {label && (
        <label className={css.label}>
          {label}
        </label>
      )}
      
      <div className={css.pricingContainer}>
        {/* Period Selector */}
        <div className={css.periodSelectorSection}>
          <div className={css.periodSelectorHeader}>
            <h4 className={css.periodSelectorTitle}>
              <FormattedMessage id="SmartPricing.selectPricingPeriods" defaultMessage="Select Pricing Periods" />
            </h4>
            <Button
              className={css.toggleSelectorButton}
              onClick={() => setShowPeriodSelector(!showPeriodSelector)}
              size="small"
              type="button"
            >
              {showPeriodSelector ? 'Hide Options' : 'Show All Options'}
            </Button>
          </div>
          
          {showPeriodSelector && (
            <div className={css.periodSelectorGrid}>
              {allPricingPeriods.map(period => (
                <button
                  key={period.id}
                  className={classNames(css.periodToggle, {
                    [css.periodToggleActive]: enabledPeriods.includes(period.id)
                  })}
                  onClick={() => togglePeriod(period.id)}
                  type="button"
                >
                  <div className={css.periodToggleContent}>
                    <span className={css.periodToggleLabel}>{period.label}</span>
                    <span className={css.periodToggleDays}>{period.days} day{period.days !== 1 ? 's' : ''}</span>
                  </div>
                  <div className={css.periodToggleCheckbox}>
                    {enabledPeriods.includes(period.id) ? '✓' : ''}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Periods Grid */}
        {allPeriods.length > 0 && (
          <div className={css.periodsGrid}>
            {allPeriods.map(period => (
              <div key={period.id} className={css.periodCard}>
                <div className={css.periodHeader}>
                  <h4 className={css.periodLabel}>{period.label}</h4>
                  {period.custom && (
                    <button
                      className={css.removeButton}
                      onClick={() => removeCustomPeriod(period.id)}
                      type="button"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                <div className={css.priceInputWrapper}>
                  <span className={css.currencySymbol}>£</span>
                  <input
                    type="number"
                    value={period.price}
                    onChange={(e) => handlePeriodChange(period.id, e.target.value)}
                    placeholder="0.00"
                    className={css.priceInput}
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div className={css.periodDetails}>
                  <span className={css.daysText}>{period.days} day{period.days !== 1 ? 's' : ''}</span>
                  <span className={css.dailyRate}>
                    £{(period.price / period.days).toFixed(2)}/day
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}


        {/* Pricing Tips */}
        <div className={css.pricingTips}>
          <h4 className={css.tipsTitle}>
            <FormattedMessage id="SmartPricing.pricingTipsTitle" defaultMessage="Pricing Tips" />
          </h4>
          <ul className={css.tipsList}>
            <li>Weekend rate is 20% above daily rate (per day)</li>
            <li>Weekly rate is 20% below daily rate (per day)</li>
            <li>All rates are calculated per day with different multipliers</li>
            <li>Consider your local market when setting prices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SmartPricing;
