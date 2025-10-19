import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { ROUTERS } from '../url/url';
import { incrementVisit, resetAllVisits } from '../component/visit';
import './swiper.css';

export default function MainPage() {
  const navigate = useNavigate();
  const swiperRef = useRef(null);

  useEffect(() => {
    console.log('MainPage mounted');
  }, []);

  const goTo = (index) => {
    if (swiperRef.current) swiperRef.current.slideTo(index);
  };

  const next = () => {
    if (swiperRef.current) swiperRef.current.slideNext();
  };

  const prev = () => {
    if (swiperRef.current) swiperRef.current.slidePrev();
  };

  return (
    <div className="main-page">
      <h1 className="page-title" style={{ display: 'flex', justifyContent: 'center' }}>Main Page</h1>
      <button
            className="reset-btn"
            onClick={() => {
              if (!window.confirm('全ページの訪問者数をリセットしますか？')) return;
              const n = resetAllVisits();
              alert(`リセットしました（対象キー数: ${n}）`);
            }}
          >
            Reset All
        </button>
      <div className="swiper-outer">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            console.log('swiper ready', swiper);
          }}
          loop={true}
          spaceBetween={20}
          slidesPerView={1}
          allowTouchMove={true}
          simulateTouch={true}
          touchRatio={1}
          className="swiper-box"
          onSlideChange={(swiper) => console.log('slide changed to', swiper.activeIndex)}
        >
          <SwiperSlide>
            <div className="slide-content">
              <h2>Slide 1</h2>
              <button
                className="nav-btn"
                onClick={() => {
                  incrementVisit('sub1');
                  navigate(ROUTERS.SUB1);
                }}
              >
                Go to SubPage 1
              </button>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-content">
              <h2>Slide 2</h2>
              <button
                className="nav-btn"
                onClick={() => {
                  incrementVisit('sub2');
                  navigate(ROUTERS.SUB2);
                }}
              >
                Go to SubPage 2
              </button>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-content">
              <h2>Slide 3</h2>
              <button
                className="nav-btn"
                onClick={() => {
                  incrementVisit('sub3');
                  navigate(ROUTERS.SUB3);
                }}
              >
                Go to SubPage 3
              </button>
            </div>
          </SwiperSlide>
        </Swiper>

        <div className="controls">
          <button className="control-btn" onClick={prev}>Prev</button>
          <button className="control-btn" onClick={() => goTo(0)}>1</button>
          <button className="control-btn" onClick={() => goTo(1)}>2</button>
          <button className="control-btn" onClick={() => goTo(2)}>3</button>
          <button className="control-btn" onClick={next}>Next</button>
        </div>
      </div>
    </div>
  );
}
