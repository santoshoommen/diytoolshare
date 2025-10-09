import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from '../../util/reactIntl';

const TestLink = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      zIndex: 9999,
      background: '#007bff',
      color: 'white',
      padding: '10px 15px',
      borderRadius: '5px',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: 'bold'
    }}>
      <Link to="/create-listing" style={{ color: 'white', textDecoration: 'none' }}>
        Test Custom Form
      </Link>
    </div>
  );
};

export default TestLink;
