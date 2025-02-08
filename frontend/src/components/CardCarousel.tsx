import React, { useState, useRef, useEffect } from 'react';
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import axios from 'axios';

// Define a type for invoice data
interface Invoice {
  companyName: string;
  totalDueAmount: number;
}
const CardCarousel: React.FC = () => {
  const baseUrl = import.meta.env.VITE_BASE_APP_BACKEND_BASEURL;
  const [slides, setSlides] = useState<Invoice[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const swipeThreshold = 50;

  useEffect(() => {
    const fetchDueAmounts = async () => {
      try {
        const response = await axios.get<Invoice[]>(`${baseUrl}/api/due_invoices_list`);

        if (response.data && Array.isArray(response.data)) {
          setSlides(response.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error('Error fetching invoice data:', err);
        setSlides([{ companyName: 'Error', totalDueAmount: 0 }]);
      }
    };

    fetchDueAmounts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      next();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentSlideIndex]);

  const previous = () => {
    setCurrentSlideIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : slides.length - 1));
  };

  const next = () => {
    setCurrentSlideIndex(prevIndex => (prevIndex < slides.length - 1 ? prevIndex + 1 : 0));
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    touchEndX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current && touchEndX.current) {
      if (touchStartX.current - touchEndX.current > swipeThreshold) {
        next();
      } else if (touchStartX.current - touchEndX.current < -swipeThreshold) {
        previous();
      }
      touchStartX.current = null;
      touchEndX.current = null;
    }
  };

  return (
    <div className="relative xl:ml-15 lg:-ml-20  w-[420%] h-[150px] border-2 border-[#edf6ff] bg-primary text-white shadow-sm rounded-xl overflow-hidden">
      {/* Previous Button */}
      <button
        type="button"
        className="absolute left-5 top-1/2 z-20 flex rounded-full -translate-y-1/2 items-center justify-center bg-white/40 p-2 text-neutral-600 transition hover:bg-white/60 dark:bg-neutral-950/40 dark:text-neutral-300 dark:hover:bg-neutral-950/60"
        aria-label="previous slide"
        onClick={previous}
      >
        <GrFormPrevious />
      </button>

      {/* Next Button */}
      <button
        type="button"
        className="absolute right-5 top-1/2 z-20 flex rounded-full -translate-y-1/2 items-center justify-center bg-white/40 p-2 text-neutral-600 transition hover:bg-white/60 dark:bg-neutral-950/40 dark:text-neutral-300 dark:hover:bg-neutral-950/60"
        aria-label="next slide"
        onClick={next}
      >
        <GrFormNext />
      </button>

      {/* Slides */}
      <div
        className="relative w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute mt-12 text-7xl tracking-widest inset-0 flex items-center justify-center text-center p-4 transition-opacity duration-700 ${
              currentSlideIndex === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Text with Red Due Amount */}
            <p className="text-4xl font-semibold text-neutral-800 dark:text-neutral-100">
              {slide.companyName} owes 
              <span className="text-meta-6 font-bold"> ₹{slide.totalDueAmount}</span> Due Amount
            </p>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-4 bg-white/75 px-1.5 py-1 rounded-sm dark:bg-neutral-950/75">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`size-2 rounded-full transition ${
              currentSlideIndex === index
                ? 'bg-neutral-600 dark:bg-neutral-300'
                : 'bg-neutral-600/50 dark:bg-neutral-300/50'
            }`}
            onClick={() => setCurrentSlideIndex(index)}
            aria-label={`slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardCarousel;
