import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import MobileStepper from "@mui/material/MobileStepper";
import { Box, useTheme } from "@mui/material";
import { useState } from "react";

export const ProductBanner = ({ images }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = images.length;

  return (
    <>
      <Swiper
        style={{ overflow: "hidden", width: "100%", height: "100%" }}
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        onSlideChange={(swiper) => setActiveStep(swiper.activeIndex)}
        direction={theme.direction === "rtl" ? "rtl" : "ltr"}
        slidesPerView={1}
        loop={true}
        initialSlide={activeStep}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <Box
              component="img"
              sx={{ width: "100%", objectFit: "contain" }}
              src={image}
              alt={"Banner Image"}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div style={{ alignSelf: "center" }}>
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
        />
      </div>
    </>
  );
};
