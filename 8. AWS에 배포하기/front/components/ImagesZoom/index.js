import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Slick from 'react-slick';

import { Icon } from 'antd';
import { Overlay, Header, CloseBtn, SlickWrapper, ImgWrapper, Indicator } from './style';

const ImagesZoom = ({ images, onClose }) => {
  
  const [currentSlide, setCurrentSlide] = useState(0); 

  return (
    <Overlay>
      <Header>
        <h1>상세 이미지</h1>
        <CloseBtn type="close" onClick={onClose} />
      </Header>
      <SlickWrapper>
        <div>
          <Slick
            initialSlide={0}
            afterChange={slide => setCurrentSlide(slide)}
            infinite={false}
            arrows
            slidesToShow={1}
            slidesToScroll={1}
          >
            {images.map((v) => {
              return (
                <ImgWrapper>
                  <img src={`http://localhost:3065/${v.src}`} />
                </ImgWrapper>
              );
            })}
          </Slick>
          <div style={{ textAlign: 'center' }}>
            <Indicator>
              {currentSlide + 1} / {images.length}
            </Indicator>
          </div>
        </div>
      </SlickWrapper>
    </Overlay>
  )
};

ImagesZoom.propTypes = {
  images: PropTypes.arrayOf(PropTypes.shape({
    src: PropTypes.string,
  })).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ImagesZoom;