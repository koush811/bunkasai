// ...existing code...
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './SubPage.css';
import { ROUTERS } from '../url/url';
import { getVisits } from '../component/visit';

export default function SubPage1() {
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    setVisits(getVisits('sub1')); // 表示のみ
  }, []);

  return (
    <div className='SubPage'>
      <h1>Sub Page 1</h1>
      <div className="visit-count">訪問者数: {visits} 人</div>
      <Link to={ROUTERS.MAIN}>Back</Link>
      <div className='MainContents'>
        <div className="sentence">
          This is the content for Sub Page 1.
        </div>
        <img src="" alt="" />
      </div>
    </div>
  );
}
