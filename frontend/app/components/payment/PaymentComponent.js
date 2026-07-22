import React from 'react';

export default function PaymentComponent({ id }) {
  return (
    <div>
      <h1>Payment Service</h1>
      {id && <p>Payment ID: {id}</p>}
    </div>
  );
}