import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTERS } from '../url/url';

import TetrisGame from '../teto/tetorisu'
import '../teto/teto.css'

export default function SubPage2() {
  

  return (
    <>
      <div className='SubPage-header'>
        <Link className="nav-link" to={ROUTERS.MAIN}>MainPageに戻る</Link>
      </div>
      <div className='SubPage-main'>
        
        <div className='MainContents'>
          <TetrisGame />
        </div>
      </div>
    </>
  );
}
