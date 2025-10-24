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
        <div className='menu'>
          <div>
            ＜操作方法＞
          </div>
          <div>左右矢印キー：横移動</div>
          <div>上矢印キー：回転</div>
          <div>Zキー：逆回転</div>
          <div>Shiftキー</div>
          <div>Spaceキー：ハードドロップ</div>
        </div>
      </div>
    </>
  );
}
