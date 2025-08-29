import React, { useState } from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { LayoutSingleColumn, Button } from '../../components';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import SmartDatePicker from '../../components/SmartDatePicker/SmartDatePicker';
import SmartPricing from '../../components/SmartPricing/SmartPricing';
import IssueReport from '../../components/IssueReport/IssueReport';
import css from './SmartFeaturesDemo.module.css';

const SmartFeaturesDemo = () => {
  const [selectedDates, setSelectedDates] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(50);
  const [showIssueReport, setShowIssueReport] = useState(false);

  const handleDateChange = (dateData) => {
    setSelectedDates(dateData);
    console.log('Date selection changed:', dateData);
  };

  const handlePriceChange = (pricingPeriods) => {
    // Extract the single day price as the base price
    if (pricingPeriods && pricingPeriods.length > 0) {
      const singleDayPeriod = pricingPeriods.find(p => p.id === 'single-day');
      if (singleDayPeriod) {
        setSelectedPrice(singleDayPeriod.price);
      }
    }
    console.log('Pricing periods changed:', pricingPeriods);
  };

  const handleIssueSubmit = (reportData) => {
    console.log('Issue report submitted:', reportData);
    setShowIssueReport(false);
  };

  return (
    <LayoutSingleColumn
      topbar={<TopbarContainer />}
      footer={<FooterContainer />}
    >
      <div className={css.root}>
        <div className={css.container}>
          <h1 className={css.title}>
            <FormattedMessage 
              id="SmartFeaturesDemo.title" 
              defaultMessage="Smart Features Demo"
            />
          </h1>
          <p className={css.subtitle}>
            <FormattedMessage 
              id="SmartFeaturesDemo.subtitle" 
              defaultMessage="Test the new smart scheduling and pricing features for DIY Tool Share"
            />
          </p>

          {/* Smart Date Picker Demo */}
          <section className={css.section}>
            <h2 className={css.sectionTitle}>
              <FormattedMessage 
                id="SmartFeaturesDemo.smartScheduling" 
                defaultMessage="Smart Calendar"
              />
            </h2>
            <div className={css.demoCard}>
              <SmartDatePicker
                name="demo-dates"
                label="Select Available Dates"
                placeholder="Choose your dates"
                toolType="power-tools"
                onDateChange={handleDateChange}
              />
              {selectedDates && (
                <div className={css.result}>
                  <h4>Selected Dates:</h4>
                  <p>Total dates selected: {selectedDates.dates ? selectedDates.dates.length : 0}</p>
                  {selectedDates.dates && selectedDates.dates.slice(0, 5).map((date, index) => (
                    <p key={index}>{new Date(date).toLocaleDateString()}</p>
                  ))}
                  {selectedDates.dates && selectedDates.dates.length > 5 && (
                    <p>... and {selectedDates.dates.length - 5} more</p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Smart Pricing Demo */}
          <section className={css.section}>
            <h2 className={css.sectionTitle}>
              <FormattedMessage 
                id="SmartFeaturesDemo.smartPricing" 
                defaultMessage="Smart Pricing"
              />
            </h2>
            <div className={css.demoCard}>
              <SmartPricing
                name="demo-pricing"
                label="Smart Pricing - Select Your Periods"
                basePrice={selectedPrice}
                currency="GBP"
                onPriceChange={handlePriceChange}
              />
              {selectedPrice && (
                <div className={css.result}>
                  <h4>Current Base Price:</h4>
                  <p>£{selectedPrice} per day</p>
                </div>
              )}
            </div>
          </section>

          {/* Issue Report Demo */}
          <section className={css.section}>
            <h2 className={css.sectionTitle}>
              <FormattedMessage 
                id="SmartFeaturesDemo.issueReporting" 
                defaultMessage="Issue Reporting"
              />
            </h2>
            <div className={css.demoCard}>
              <Button
                className={css.demoButton}
                onClick={() => setShowIssueReport(true)}
              >
                <FormattedMessage 
                  id="SmartFeaturesDemo.reportIssue" 
                  defaultMessage="Report an Issue"
                />
              </Button>
              
              {showIssueReport && (
                <div className={css.modal}>
                  <div className={css.modalContent}>
                    <button 
                      className={css.closeButton}
                      onClick={() => setShowIssueReport(false)}
                    >
                      ✕
                    </button>
                    <IssueReport
                      issueType="non-return"
                      transactionId="DEMO-12345"
                      listingTitle="Demo Power Drill"
                      onSubmit={handleIssueSubmit}
                      onCancel={() => setShowIssueReport(false)}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Integration Instructions */}
          <section className={css.section}>
            <h2 className={css.sectionTitle}>
              <FormattedMessage 
                id="SmartFeaturesDemo.integration" 
                defaultMessage="How to Integrate"
              />
            </h2>
            <div className={css.demoCard}>
              <h3>To integrate these features into your listing creation:</h3>
              <ol className={css.instructions}>
                <li>
                  <strong>Smart Date Picker:</strong> Replace the current date picker in 
                  <code>EditListingAvailabilityPanel</code> with <code>SmartDatePicker</code>
                </li>
                <li>
                  <strong>Smart Pricing:</strong> Add <code>SmartPricing</code> to the 
                  pricing panel in the listing wizard
                </li>
                <li>
                  <strong>Issue Reporting:</strong> Add <code>IssueReport</code> to the 
                  transaction pages for reporting non-collection/non-return issues
                </li>
              </ol>
              
              <div className={css.codeExample}>
                <h4>Example Integration:</h4>
                <pre>
{`// In EditListingAvailabilityPanel.js
import SmartDatePicker from '../../../components/SmartDatePicker/SmartDatePicker';

// Replace the current date picker with:
<SmartDatePicker
  name="availability"
  toolType={listingType}
  onDateChange={handleAvailabilityChange}
/>`}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </div>
    </LayoutSingleColumn>
  );
};

export default SmartFeaturesDemo;
