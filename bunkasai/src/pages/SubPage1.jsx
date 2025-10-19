// ...existing code...
import React from 'react';
import { Link } from 'react-router-dom';
import './SubPage.css';
import { ROUTERS } from '../url/url';
import Osero from '../osero/osero.jsx';

export default function SubPage1() {
  return (
    <>
      <div className='SubPage-header'>
        <Link className="nav-link" to={ROUTERS.MAIN}>MainPageに戻る</Link>
      </div>
      <div className='SubPage-main'>
        <div className='Osero'>
          <Osero />
        </div>
      </div>
    </>
  );
}
