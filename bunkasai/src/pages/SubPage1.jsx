import React from 'react';
import { Link } from 'react-router-dom';

export default function SubPage1() {
  return (
    <div>
      <h1>Sub Page 1</h1>
      <Link to="/">Back</Link>
    </div>
  );
}