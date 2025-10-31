import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import { FormattedMessage } from '../../../../../util/reactIntl';

import { ExternalLink, NamedLink, ListingTypeSelectionModal } from '../../../../../components';

import css from './PriorityLinks.module.css';

/**
 * Create component that shows only a single "Post a new listing" link.
 *
 * @param {*} props contains customLinksMenuClass and onManageDisableScrolling
 * @returns div with only one link inside.
 */
export const CreateListingMenuLink = props => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = e => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={props.customLinksMenuClass}>
        <button
          type="button"
          onClick={handleClick}
          className={classNames(css.priorityLink, css.highlight, css.buttonLink)}
        >
          <span className={css.priorityLinkLabel}>
            <FormattedMessage id="TopbarDesktop.createListing" />
          </span>
        </button>
      </div>
      <ListingTypeSelectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onManageDisableScrolling={props.onManageDisableScrolling}
      />
    </>
  );
};

/**
 * Link component that can be used on TopbarDesktop.
 *
 * @param {*} props containing linkConfig including resolved 'route' params for NamedLink, and onManageDisableScrolling.
 * @returns NamedLink or ExternalLink component based on config.
 */
const PriorityLink = ({ linkConfig, onManageDisableScrolling }) => {
  const { text, type, href, route, highlight } = linkConfig;
  const classes = classNames(css.priorityLink, { [css.highlight]: highlight });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle CustomListingPage specially to show modal instead of direct navigation
  if (type === 'internal' && route && route.name === 'CustomListingPage') {
    const handleClick = e => {
      e.preventDefault();
      setIsModalOpen(true);
    };
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={classNames(classes, css.buttonLink)}
        >
          <span className={css.priorityLinkLabel}>{text}</span>
        </button>
        <ListingTypeSelectionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onManageDisableScrolling={onManageDisableScrolling}
        />
      </>
    );
  }

  // Note: if the config contains 'route' keyword,
  // then in-app linking config has been resolved already.
  if (type === 'internal' && route) {
    // Internal link
    const { name, params, to } = route || {};
    return (
      <NamedLink name={name} params={params} to={to} className={classes}>
        <span className={css.priorityLinkLabel}>{text}</span>
      </NamedLink>
    );
  }
  return (
    <ExternalLink href={href} className={classes}>
      <span className={css.priorityLinkLabel}>{text}</span>
    </ExternalLink>
  );
};

/**
 * Create priority links, which are visible on the desktop layout on the Topbar.
 * If space is limited, this doesn't include anything to the Topbar.
 *
 * @param {*} props contains links array and setLinks function
 * @returns container div with priority links included.
 */
const PriorityLinks = props => {
  const containerRef = useRef(null);

  // With this useEffect, we measure the widths of each rendered priority link
  // This is done once before the real rendering and it's done outside the viewport.
  useEffect(() => {
    const isMeasured = props.links?.[0]?.width;
    if (containerRef.current && !isMeasured) {
      const linksFromRenderedWrapper = [...containerRef.current.childNodes];
      let cumulatedWidth = 0;
      // Generate an array of link configs with width & cumulatedWidth included
      const linksWithWidths = props.links.reduce((links, l, i) => {
        const width = linksFromRenderedWrapper[i].offsetWidth;
        cumulatedWidth = cumulatedWidth + width;
        return [...links, { ...l, width, cumulatedWidth }];
      }, []);
      props.setLinks(linksWithWidths);
    }
  }, [containerRef]);

  const { links, priorityLinks } = props;
  const isServer = typeof window === 'undefined';
  const isMeasured = links?.[0]?.width && (priorityLinks.length === 0 || priorityLinks?.[0]?.width);
  const styleWrapper = !!isMeasured
    ? {}
    : {
        style: {
          position: 'absolute',
          top: '-2000px',
          left: '-2000px',
          width: '100%',
          height: 'var(--topbarHeightDesktop)',
          display: 'flex',
          flexDirection: 'row',
        },
      };
  const linkConfigs = isMeasured ? priorityLinks : links;

  return isMeasured || isServer ? (
    <div className={css.priorityLinkWrapper} {...styleWrapper} ref={containerRef}>
      {linkConfigs.map((linkConfig, index) => {
        return <PriorityLink key={`${linkConfig.text}_${index}`} linkConfig={linkConfig} onManageDisableScrolling={props.onManageDisableScrolling} />;
      })}
    </div>
  ) : (
    ReactDOM.createPortal(
      <div className={css.priorityLinkWrapper} {...styleWrapper} ref={containerRef}>
        {linkConfigs.map((linkConfig, index) => {
          return <PriorityLink key={`${linkConfig.text}_${index}`} linkConfig={linkConfig} onManageDisableScrolling={props.onManageDisableScrolling} />;
        })}
      </div>,
      document.body
    )
  );
};

export default PriorityLinks;
