"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, type MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[55rem] md:h-[75rem] flex items-center justify-center relative p-2 md:p-20 overflow-hidden"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-20 w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
      }}
      className="max-w-5xl -mt-10 mx-auto h-[28rem] md:h-[42rem] w-full border-2 border-[#00D37B]/40 p-2 md:p-4 bg-gradient-to-b from-[#182230] via-[#131D28] to-[#0A1017] rounded-[32px] shadow-[0_25px_80px_-15px_rgba(0,211,123,0.22),0_15px_35px_rgba(0,0,0,0.4)]"
    >
      {/* Top window status bar */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-white/70">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFB800]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#00D37B]" />
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#00D37B]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D37B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D37B]"></span>
          </span>
          Consulta online ativa • Conexão criptografada
        </div>
        <div className="text-[11px] text-white/40 hidden sm:block">
          CRM/CFM Verificado
        </div>
      </div>
      <div className="h-[calc(100%-32px)] w-full overflow-hidden rounded-2xl bg-white shadow-inner">
        {children}
      </div>
    </motion.div>
  );
};
