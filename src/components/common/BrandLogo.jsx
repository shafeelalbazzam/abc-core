import React from 'react';

export default function BrandLogo({ className = "h-12 w-auto", showText = false, textClassName = "" }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Official Al Bazzam Logo Image with transparent background */}
      <img
        src="./logo.png"
        alt="Al Bazzam IT & Enterprise Systems"
        className={`${className} object-contain block dark:hidden`}
      />
      <img
        src="./logo-dark.png"
        alt="Al Bazzam IT & Enterprise Systems"
        className={`${className} object-contain hidden dark:block`}
      />

      {showText && (
        <div className={`flex flex-col leading-none ${textClassName}`}>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs tracking-wider text-emerald-600 dark:text-emerald-400">
              AL BAZZAM
            </span>
            <span className="font-extrabold text-xs tracking-wider text-blue-600 dark:text-blue-400">
              GROUP
            </span>
          </div>
          <span className="text-[9px] font-semibold text-slate-400 tracking-tight mt-0.5">
            Enterprise IT & Software Systems
          </span>
        </div>
      )}
    </div>
  );
}
