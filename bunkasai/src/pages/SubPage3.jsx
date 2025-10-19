import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './SubPage.css';
import { ROUTERS } from '../url/url';
import { getVisits } from '../component/visit';

export default function SubPage3() {
  const [visits, setVisits] = useState(0);

  useEffect(() => { 
    setVisits(getVisits('sub3'));
  }, []);

  return (
    <>
          <div className='SubPage-header'>
            <Link className="nav-link" to={ROUTERS.MAIN}>MainPageに戻る</Link>
          </div>
          <div className='SubPage-main'>
            <h1>Sub Page 3</h1>
            <div className="visit-count">訪問者数: {visits} 人</div>
            <div className='MainContents'>
              <div className="sentence">
                This is the content for Sub Page 3.
              </div>
              <img src="" alt="" />
            </div>
          </div>
        </>
  );
}
