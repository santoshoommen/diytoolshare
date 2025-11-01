import React, { useState } from 'react';
import classNames from 'classnames';
import { FormattedMessage, useIntl } from '../../util/reactIntl';

import { Button } from '../../components';
import css from './IssueReport.module.css';

/**
 * Issue Report component for reporting non-collection or non-return issues
 */
const IssueReport = props => {
  const {
    rootClassName,
    className,
    issueType = 'non-return', // 'non-collection' or 'non-return'
    onSubmit,
    onCancel,
    transactionId,
    listingTitle,
    ...rest
  } = props;

  const intl = useIntl();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    issueType: issueType,
    description: '',
    severity: 'medium',
    contactAttempts: false,
    evidence: false,
    resolution: ''
  });

  const issueTypes = {
    'non-collection': {
      title: 'Non-Collection Report',
      description: 'Report when a renter fails to collect the tool',
      icon: '📦',
      severityOptions: [
        { value: 'low', label: 'Minor delay (1-2 days)' },
        { value: 'medium', label: 'Significant delay (3-7 days)' },
        { value: 'high', label: 'No contact for over a week' }
      ]
    },
    'non-return': {
      title: 'Non-Return Report',
      description: 'Report when a renter fails to return the tool',
      icon: '⏰',
      severityOptions: [
        { value: 'low', label: 'Minor delay (1-2 days)' },
        { value: 'medium', label: 'Significant delay (3-7 days)' },
        { value: 'high', label: 'Overdue by more than a week' }
      ]
    }
  };

  const currentIssue = issueTypes[issueType];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

      try {
      // Here you would typically send the report to your backend
      const reportData = {
        ...formData,
        transactionId: transactionId?.uuid || transactionId,
        listingTitle,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      if (onSubmit) {
        await onSubmit(reportData);
      }

      // Show success message or redirect
      console.log('Issue report submitted:', reportData);
    } catch (error) {
      console.error('Failed to submit issue report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className={classNames(rootClassName || css.root, className)}>
      <div className={css.header}>
        <div className={css.issueIcon}>
          {currentIssue.icon}
        </div>
        <div className={css.headerContent}>
          <h3 className={css.title}>
            {currentIssue.title}
          </h3>
          <p className={css.description}>
            {currentIssue.description}
          </p>
        </div>
      </div>

      {transactionId && (
        <div className={css.transactionInfo}>
          <div className={css.infoItem}>
            <span className={css.infoLabel}>Transaction ID:</span>
            <span className={css.infoValue}>{transactionId?.uuid || transactionId}</span>
          </div>
          {listingTitle && (
            <div className={css.infoItem}>
              <span className={css.infoLabel}>Listing:</span>
              <span className={css.infoValue}>{listingTitle}</span>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className={css.form}>
        {/* Issue Type Selection */}
        <div className={css.formSection}>
          <label className={css.sectionLabel}>
            Issue Type
          </label>
          <div className={css.issueTypeSelector}>
            {Object.entries(issueTypes).map(([key, issue]) => (
              <button
                key={key}
                type="button"
                className={classNames(css.issueTypeOption, {
                  [css.selected]: formData.issueType === key
                })}
                onClick={() => handleInputChange('issueType', key)}
              >
                <div className={css.optionIcon}>
                  {issue.icon}
                </div>
                <div className={css.optionContent}>
                  <div className={css.optionTitle}>
                    {issue.title}
                  </div>
                  <div className={css.optionDescription}>
                    {issue.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Severity Level */}
        <div className={css.formSection}>
          <label className={css.sectionLabel} htmlFor="severity">
            Severity Level
          </label>
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={(e) => handleInputChange('severity', e.target.value)}
            className={css.severitySelect}
          >
            {currentIssue.severityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className={css.formSection}>
          <label className={css.sectionLabel} htmlFor="description">
            Detailed Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Please provide details about the issue, including dates, communication attempts, and any relevant information..."
            className={css.descriptionInput}
            rows={4}
          />
        </div>

        {/* Additional Information */}
        <div className={css.formSection}>
          <label className={css.sectionLabel}>
            Additional Information
          </label>
          <div className={css.checkboxes}>
            <label className={css.checkboxLabel}>
              <input
                type="checkbox"
                name="contactAttempts"
                checked={formData.contactAttempts}
                onChange={(e) => handleInputChange('contactAttempts', e.target.checked)}
                className={css.checkbox}
              />
              <span>I have attempted to contact the other party</span>
            </label>
            <label className={css.checkboxLabel}>
              <input
                type="checkbox"
                name="evidence"
                checked={formData.evidence}
                onChange={(e) => handleInputChange('evidence', e.target.checked)}
                className={css.checkbox}
              />
              <span>I have evidence (messages, photos, etc.) to support this report</span>
            </label>
          </div>
        </div>

        {/* Desired Resolution */}
        <div className={css.formSection}>
          <label className={css.sectionLabel} htmlFor="resolution">
            Desired Resolution
          </label>
          <select
            id="resolution"
            name="resolution"
            value={formData.resolution}
            onChange={(e) => handleInputChange('resolution', e.target.value)}
            className={css.resolutionSelect}
          >
            <option value="">Select a resolution...</option>
            <option value="refund">Request refund</option>
            <option value="extension">Request time extension</option>
            <option value="replacement">Request tool replacement</option>
            <option value="mediation">Request mediation</option>
            <option value="other">Other (please specify)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className={css.actions}>
          <Button
            type="button"
            onClick={handleCancel}
            className={css.cancelButton}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className={css.submitButton}
            disabled={isSubmitting || !formData.description.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </form>

      {/* Information Panel */}
      <div className={css.infoPanel}>
        <h4 className={css.infoPanelTitle}>
          ℹ️ What happens next?
        </h4>
        <ul className={css.infoPanelList}>
          <li>Your report will be reviewed by our support team within 24 hours</li>
          <li>We may contact both parties to gather additional information</li>
          <li>Depending on the severity, we may escalate to mediation</li>
          <li>You'll receive updates via email and in-app notifications</li>
        </ul>
      </div>
    </div>
  );
};

export default IssueReport;
