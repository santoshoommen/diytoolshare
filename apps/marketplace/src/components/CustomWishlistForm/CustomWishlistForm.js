import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { Button } from '../';
import categoriesClient from '../../services/categoriesClient';
import toolDescriptionsClient from '../../services/toolDescriptionsClient';
import css from './CustomWishlistForm.module.css';

const formatDateLabel = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
};

const CustomWishlistForm = ({ onSubmit, initialValues: externalInitialValues = {}, isSubmitting = false }) => {
  const titleInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [rawToolName, setRawToolName] = useState('');

  useEffect(() => {
    (async () => {
      await categoriesClient.ensureLoaded();
      await toolDescriptionsClient.ensureLoaded();
      setCategories(categoriesClient.getAll());
    })();
  }, []);

  const initialValues = useMemo(() => ({
    title: '',
    description: '',
    category: '',
    postcode: externalInitialValues.postcode || '',
    startDate: '',
    endDate: '',
  }), [externalInitialValues.postcode]);

  const handleComposeText = (values, form) => {
    const toolBaseFromTitle = (values.title || '').split(' needed - ')[0].trim();
    const tool = (rawToolName || toolBaseFromTitle).trim();
    const pc = (values.postcode || '').trim();
    const district = pc ? (pc.split(' ')[0] || pc) : '';
    const start = values.startDate;
    const end = values.endDate;
    if (tool && start && end) {
      const startLbl = formatDateLabel(start);
      const endLbl = formatDateLabel(end);
      form.change('title', `${tool} needed - ${startLbl} to ${endLbl}`);
      const locationPart = district ? ` in ${district}` : '';
      form.change('description', `I need a ${tool}${locationPart} from ${startLbl} to ${endLbl}.`);
    }
  };

  const submitHandler = values => {
    const submitData = {
      title: values.title?.trim(),
      description: values.description?.trim(),
      images: [],
      publicData: {
        listingType: 'request-a-tool',
        transactionProcessAlias: 'default-booking/release-1',
        unitType: 'day',
        categoryLevel1: values.category,
        requestStart: values.startDate,
        requestEnd: values.endDate,
      },
      privateData: {},
      availability: {},
      postcode: values.postcode,
    };
    onSubmit?.(submitData);
  };

  const todayIso = new Date().toISOString().slice(0,10);

  return (
    <div className={css.root}>
      <div className={css.header}>
        <h1 className={css.title}>Request a Tool</h1>
      </div>

      <Form
        initialValues={initialValues}
        onSubmit={submitHandler}
        render={({ handleSubmit, form, values }) => (
          <form className={css.form} onSubmit={handleSubmit}>
            <div className={css.section}>
              <h2 className={css.sectionTitle}>Tool & Dates</h2>
              <div className={css.field}>
                <label className={css.label}>Tool Name</label>
                <div className={css.suggestions}>
                  <Field name="title">
                    {({ input }) => (
                      <input
                        {...input}
                        type="text"
                        placeholder="Start typing e.g. Cordless Drill"
                        className={css.input}
                        ref={el => { titleInputRef.current = el; }}
                        onChange={e => {
                          input.onChange(e);
                          const q = (e.target.value || '').trim().toLowerCase();
                          setRawToolName((e.target.value || '').split(' needed - ')[0]);
                          if (q.length < 2) {
                            setSuggestions([]);
                            setShowSuggestions(false);
                            return;
                          }
                          const all = toolDescriptionsClient.getAllTools();
                          const hits = all.filter(t => (t.title || t.className || '').toLowerCase().includes(q)).slice(0, 8);
                          setSuggestions(hits);
                          setShowSuggestions(hits.length > 0);
                        }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        onFocus={() => setShowSuggestions(suggestions.length > 0)}
                      />
                    )}
                  </Field>
                  {showSuggestions && (
                    <div className={css.suggestionsList}>
                      {suggestions.map(s => (
                        <div
                          key={s.id}
                          className={css.suggestionItem}
                          onMouseDown={e => {
                            e.preventDefault();
                            form.change('title', s.title || s.className);
                            setRawToolName(s.title || s.className);
                            if (s.category) form.change('category', s.category);
                            handleComposeText({ ...values, title: (s.title || s.className) }, form);
                            setShowSuggestions(false);
                          }}
                        >
                          {(s.title || s.className)}{s.categoryLabel ? ` · ${s.categoryLabel}` : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={css.grid2}>
                <div className={css.field}>
                  <label className={css.label}>From</label>
                  <Field name="startDate">
                    {({ input }) => (
                      <input
                        {...input}
                        type="date"
                        className={css.input}
                        min={todayIso}
                        onChange={e => {
                          const v = e.target.value;
                          input.onChange(e);
                          // Ensure end date can't be before start date
                          const end = form.getState().values.endDate;
                          if (end && v && new Date(end) < new Date(v)) {
                            form.change('endDate', v);
                          }
                          handleComposeText({ ...values, startDate: v }, form);
                        }}
                      />
                    )}
                  </Field>
                </div>
                <div className={css.field}>
                  <label className={css.label}>To</label>
                  <Field name="endDate">
                    {({ input }) => (
                      <input
                        {...input}
                        type="date"
                        className={css.input}
                        min={values.startDate || todayIso}
                        onChange={e => {
                          const v = e.target.value;
                          input.onChange(e);
                          handleComposeText({ ...values, endDate: v }, form);
                        }}
                      />
                    )}
                  </Field>
                </div>
              </div>
              <div className={css.helpText}>
                {values.startDate && values.endDate
                  ? `Selected: ${formatDateLabel(values.startDate)} → ${formatDateLabel(values.endDate)}`
                  : 'Select a start date first, then an end date. Past dates are disabled.'}
              </div>

              <div className={css.field}>
                <label className={css.label}>Category</label>
                <Field name="category">
                  {({ input }) => (
                    <select {...input} className={css.select}>
                      <option value="">Select category</option>
                      {categories.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>

              <div className={css.field}>
                <label className={css.label}>Postcode</label>
                <Field name="postcode">
                  {({ input }) => (
                    <input {...input} type="text" className={css.input} placeholder="e.g. SW1A 1AA" onChange={e => { input.onChange(e); handleComposeText({ ...values, postcode: e.target.value }, form); }} />
                  )}
                </Field>
              </div>

              <div className={css.field}>
                <label className={css.label}>Listing Description</label>
                <Field name="description">
                  {({ input }) => (
                    <textarea {...input} className={css.textarea} rows={3} placeholder="We will auto-fill this once you select dates" />
                  )}
                </Field>
              </div>
            </div>

            <div className={css.submitSection}>
              <Button type="submit" className={css.submitButton} disabled={isSubmitting} inProgress={isSubmitting}>
                Create Request
              </Button>
            </div>
          </form>
        )}
      />
    </div>
  );
};

export default CustomWishlistForm;


