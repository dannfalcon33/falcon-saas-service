import React from "react";

export const FloatingSpheres = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-radial from-[#1F3A5F]/40 to-transparent blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-radial from-[#2F5D8C]/30 to-transparent blur-3xl animate-float-medium"></div>
      <div className="absolute top-[40%] right-[20%] w-48 h-48 bg-radial from-[#8A9199]/20 to-transparent blur-2xl animate-float-fast"></div>
      <div className="absolute bottom-[10%] left-[25%] w-80 h-80 bg-radial from-[#132337]/50 to-transparent blur-3xl animate-float-slow"></div>
    </div>
  );
};
