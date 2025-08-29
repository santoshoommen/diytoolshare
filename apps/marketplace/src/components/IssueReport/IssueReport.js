import React, { useState } from 'react';
import { Field } from 'react-final-form';
import classNames from 'classnames';
import { FormattedMessage, useIntl } from '../../util/reactIntl';

import { Button, FieldTextInput, FieldSelect, FieldCheckbox } from '../../components';
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
        transactionId,
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
            <span className={css.infoValue}>{transactionId}</span>
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
          <label className={css.sectionLabel}>
            Severity Level
          </label>
          <FieldSelect
            name="severity"
            value={formData.severity}
            onChange={(value) => handleInputChange('severity', value)}
            options={currentIssue.severityOptions}
            className={css.severitySelect}
          />
        </div>

        {/* Description */}
        <div className={css.formSection}>
          <label className={css.sectionLabel}>
            Detailed Description
          </label>
          <FieldTextInput
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(value) => handleInputChange('description', value)}
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
            <FieldCheckbox
              name="contactAttempts"
              checked={formData.contactAttempts}
              onChange={(checked) => handleInputChange('contactAttempts', checked)}
              label="I have attempted to contact the other party"
            />
            <FieldCheckbox
              name="evidence"
              checked={formData.evidence}
              onChange={(checked) => handleInputChange('evidence', checked)}
              label="I have evidence (messages, photos, etc.) to support this report"
            />
          </div>
        </div>

        {/* Desired Resolution */}
        <div className={css.formSection}>
          <label className={css.sectionLabel}>
            Desired Resolution
          </label>
          <FieldSelect
            name="resolution"
            value={formData.resolution}
            onChange={(value) => handleInputChange('resolution', value)}
            options={[
              { value: '', label: 'Select a resolution...' },
              { value: 'refund', label: 'Request refund' },
              { value: 'extension', label: 'Request time extension' },
              { value: 'replacement', label: 'Request tool replacement' },
              { value: 'mediation', label: 'Request mediation' },
              { value: 'other', label: 'Other (please specify)' }
            ]}
            className={css.resolutionSelect}
          />
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
