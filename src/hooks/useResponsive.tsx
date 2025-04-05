import { useState, useEffect } from "react";

interface ResponsiveOptions {
  breakpoint?: number;
}

export const useResponsive = ({
  breakpoint = 1024,
}: ResponsiveOptions = {}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= breakpoint;
      setIsMobile(mobile);

      if (!mobile && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [breakpoint, isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return { isMobile, isMenuOpen, toggleMenu };
};
