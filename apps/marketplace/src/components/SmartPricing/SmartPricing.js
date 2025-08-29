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
  
  // Define all available pricing periods
  const allPricingPeriods = [
    { id: 'single-day', label: 'Single Day', days: 1, defaultEnabled: true },
    { id: 'weekend', label: 'Weekend (2 days)', days: 2, defaultEnabled: false },
    { id: 'three-days', label: '3 Days', days: 3, defaultEnabled: false },
    { id: 'week', label: 'Week (7 days)', days: 7, defaultEnabled: false },
    { id: 'two-weeks', label: '2 Weeks', days: 14, defaultEnabled: false },
    { id: 'month', label: 'Month (30 days)', days: 30, defaultEnabled: false },
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
               period.id === 'weekend' ? basePrice * 1.8 :
               period.id === 'three-days' ? basePrice * 2.7 :
               period.id === 'week' ? basePrice * 6 :
               period.id === 'two-weeks' ? basePrice * 11 :
               period.id === 'month' ? basePrice * 20 : basePrice,
        active: true
      }))
  );

  const [customPeriods, setCustomPeriods] = useState([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [newCustomPeriod, setNewCustomPeriod] = useState({ name: '', days: '', price: '' });
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);

  useEffect(() => {
    // Update base price when it changes
    if (basePrice > 0) {
      setPricingPeriods(prev => prev.map(period => ({
        ...period,
        price: period.id === 'single-day' ? basePrice : 
               period.id === 'weekend' ? basePrice * 1.8 :
               period.id === 'three-days' ? basePrice * 2.7 :
               period.id === 'week' ? basePrice * 6 :
               period.id === 'two-weeks' ? basePrice * 11 :
               period.id === 'month' ? basePrice * 20 : period.price
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
                          periodToAdd.id === 'weekend' ? basePrice * 1.8 :
                          periodToAdd.id === 'three-days' ? basePrice * 2.7 :
                          periodToAdd.id === 'week' ? basePrice * 6 :
                          periodToAdd.id === 'two-weeks' ? basePrice * 11 :
                          periodToAdd.id === 'month' ? basePrice * 20 : basePrice;
          
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

  const handleCustomPeriodSubmit = () => {
    if (newCustomPeriod.name && newCustomPeriod.days && newCustomPeriod.price) {
      const customPeriod = {
        id: `custom-${Date.now()}`,
        label: newCustomPeriod.name,
        price: parseFloat(newCustomPeriod.price),
        days: parseInt(newCustomPeriod.days),
        active: false,
        custom: true
      };
      
      setCustomPeriods(prev => [...prev, customPeriod]);
      setNewCustomPeriod({ name: '', days: '', price: '' });
      setShowCustomForm(false);
    }
  };

  const removeCustomPeriod = (periodId) => {
    setCustomPeriods(prev => prev.filter(period => period.id !== periodId));
  };

  const allPeriods = [...pricingPeriods, ...customPeriods];

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

        {/* Custom Period Section */}
        <div className={css.customPeriodSection}>
          {!showCustomForm ? (
                            <Button
                  className={css.addCustomButton}
                  onClick={() => setShowCustomForm(true)}
                  size="small"
                  type="button"
                >
              <FormattedMessage id="SmartPricing.addCustomPeriod" defaultMessage="Add Custom Period" />
            </Button>
          ) : (
            <div className={css.customForm}>
              <div className={css.customFormRow}>
                <input
                  type="text"
                  placeholder="Period name (e.g., 'Holiday Special')"
                  value={newCustomPeriod.name}
                  onChange={(e) => setNewCustomPeriod(prev => ({ ...prev, name: e.target.value }))}
                  className={css.customInput}
                />
                <input
                  type="number"
                  placeholder="Days"
                  value={newCustomPeriod.days}
                  onChange={(e) => setNewCustomPeriod(prev => ({ ...prev, days: e.target.value }))}
                  className={css.customInput}
                  min="1"
                />
                <input
                  type="number"
                  placeholder="Total price"
                  value={newCustomPeriod.price}
                  onChange={(e) => setNewCustomPeriod(prev => ({ ...prev, price: e.target.value }))}
                  className={css.customInput}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className={css.customFormActions}>
                <Button
                  className={css.saveCustomButton}
                  onClick={handleCustomPeriodSubmit}
                  size="small"
                  type="button"
                >
                  <FormattedMessage id="SmartPricing.saveCustomPeriod" defaultMessage="Save" />
                </Button>
                <Button
                  className={css.cancelCustomButton}
                  onClick={() => setShowCustomForm(false)}
                  size="small"
                  type="button"
                >
                  <FormattedMessage id="SmartPricing.cancel" defaultMessage="Cancel" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Tips */}
        <div className={css.pricingTips}>
          <h4 className={css.tipsTitle}>
            <FormattedMessage id="SmartPricing.pricingTipsTitle" defaultMessage="💡 Pricing Tips" />
          </h4>
          <ul className={css.tipsList}>
            <li>Weekend rates are typically 1.8x daily rate</li>
            <li>Weekly rates offer 15-20% discount vs daily</li>
            <li>Monthly rates can be 30-40% off daily rate</li>
            <li>Consider demand patterns in your area</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SmartPricing;
