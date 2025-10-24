import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import './MainPage.css';
import { ROUTERS } from '../url/url';
import { incrementVisit, getVisits, resetAllVisits } from '../component/visit';

export default function MainPage() {
  const navigate = useNavigate();
  const swiperRef = useRef(null);

  const [visits, setVisits] = useState({
    sub1: 0,
    sub2: 0,
  });

  useEffect(() => {
    setVisits({
      sub1: getVisits('sub1'),
      sub2: getVisits('sub2'),
    });
  }, []);

  const goTo = (index) => swiperRef.current?.slideTo(index);
  const next = () => swiperRef.current?.slideNext();
  const prev = () => swiperRef.current?.slidePrev();

  const handleNavigate = (pageKey, route) => {
    const count = incrementVisit(pageKey);
    setVisits((prev) => ({ ...prev, [pageKey]: count }));
    navigate(route);
  };

  return (
    <div className="main-page">
      <button
        className="reset-btn"
        onClick={() => {
          if (!window.confirm('全ページの訪問者数をリセットしますか？')) return;
          const n = resetAllVisits();
          setVisits({ sub1: 0, sub2: 0 }); 
          alert(`リセットしました（対象キー数: ${n}）`);
        }}
      >
        Reset All
      </button>

      <h1 className="page-title" style={{ textAlign: 'center' }}>ミニゲーム</h1>

      <div className="swiper-outer">
        <Swiper
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          loop={true}
          spaceBetween={20}
          slidesPerView={1}
          allowTouchMove={true}
          simulateTouch={true}
          touchRatio={1}
          className="swiper-box"
        >
          {/* Slide 1 */}
          <SwiperSlide>
            <div className="slide-content">
              <h2>オセロ</h2>
              <div className="visit-count">訪問者数: {visits.sub1} 人</div>
              <button
                className="nav-btn"
                onClick={() => handleNavigate('sub1', ROUTERS.SUB1)}
              >
                ゲーム画面へ
              </button>
              
            </div>
          </SwiperSlide>

          {/* Slide 2 */}
          <SwiperSlide>
            <div className="slide-content">
              <h2>テトリス</h2>
              <div className="visit-count">訪問者数: {visits.sub2} 人</div>
              <button
                className="nav-btn"
                onClick={() => handleNavigate('sub2', ROUTERS.SUB2)}
              >
                ゲーム画面へ
              </button>
              
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <div className="controls">
        <button className="control-btn" onClick={prev}>Prev</button>
        <button className="control-btn" onClick={() => goTo(0)}>1</button>
        <button className="control-btn" onClick={() => goTo(1)}>2</button>
        <button className="control-btn" onClick={next}>Next</button>
      </div>
    </div>
  );
}
