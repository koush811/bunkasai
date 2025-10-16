import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


export default function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="main-page">
      <h1>Main Page</h1>
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
      >
        <SwiperSlide>
          <div className="slide">
            <h2>Slide 1</h2>
            <button onClick={() => navigate('/sub1')}>Go to SubPage 1</button>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="slide">
            <h2>Slide 2</h2>
            <button onClick={() => navigate('/sub2')}>Go to SubPage 2</button>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="slide">
            <h2>Slide 3</h2>
            <button onClick={() => navigate('/sub3')}>Go to SubPage 3</button>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}