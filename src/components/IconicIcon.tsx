import React from "react";

export type IconicName = "google" | "telegram" | "mail" | "lock" | "eye" | "book" | "trophy" | "target" | "cap" | "quiz" | "clock" | "shield" | "star" | "check" | "user";

export function IconicIcon({ name, size = 24, className = "" }: { name: IconicName; size?: number; className?: string }) {
  switch (name) {
    case "google":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={`ic shrink-0 ${className}`}
          style={{ overflow: "visible" }}
        >
          <filter id="cut-google">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          <g filter="url(#cut-google)">
            <g transform="translate(2.6, 2.6)">
              <rect fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" x="5" y="5" width="38" height="38" rx="11"/><g transform="translate(24 24) scale(1.32) translate(-24 -24)"><path fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M14.8 16.3A12 12 0 0 1 32.5 15.5L28.6 19.4A6.5 6.5 0 0 0 19 19.8z"/><path fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M14.8 31.7A12 12 0 0 1 14.8 16.3L19 19.8A6.5 6.5 0 0 0 19 28.2z"/><path fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M14.8 31.7A12 12 0 0 0 32.5 32.5L28.6 28.6A6.5 6.5 0 0 1 19 28.2z"/><path fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M32.5 32.5A12 12 0 0 0 36 24L30.5 24A6.5 6.5 0 0 1 28.6 28.6z"/><rect fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" x="24" y="21.5" width="12" height="5"/></g>
            </g>
            <rect fill="#fffef8" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" x="5" y="5" width="38" height="38" rx="11"/><g transform="translate(24 24) scale(1.32) translate(-24 -24)"><path fill="#ff8f85" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M14.8 16.3A12 12 0 0 1 32.5 15.5L28.6 19.4A6.5 6.5 0 0 0 19 19.8z"/><path fill="#ffd84d" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M14.8 31.7A12 12 0 0 1 14.8 16.3L19 19.8A6.5 6.5 0 0 0 19 28.2z"/><path fill="#b6ef88" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M14.8 31.7A12 12 0 0 0 32.5 32.5L28.6 28.6A6.5 6.5 0 0 1 19 28.2z"/><path fill="#a8d9ff" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M32.5 32.5A12 12 0 0 0 36 24L30.5 24A6.5 6.5 0 0 1 28.6 28.6z"/><rect fill="#a8d9ff" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" x="24" y="21.5" width="12" height="5"/></g>
          </g>
        </svg>
      );
    case "telegram":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={`ic shrink-0 ${className}`}
          style={{ overflow: "visible" }}
        >
          <filter id="cut-telegram">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          <g filter="url(#cut-telegram)">
            <g transform="translate(2.6, 2.6)">
              <circle fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="19"/><path fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M13 23.3 34.6 15C35.6 14.6 36.5 15.2 36.2 16.4L32.5 33.7C32.2 35 31.4 35.3 30.4 34.7L24.9 30.6 22.2 33.2C21.9 33.5 21.6 33.8 21 33.8L21.5 28.2 31.6 19C32 18.6 31.5 18.4 31 18.8L18.5 26.7 13.2 25C12 24.6 12 23.8 13 23.3z"/>
            </g>
            <circle fill="#a8d9ff" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="19"/><path fill="#fffef8" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M13 23.3 34.6 15C35.6 14.6 36.5 15.2 36.2 16.4L32.5 33.7C32.2 35 31.4 35.3 30.4 34.7L24.9 30.6 22.2 33.2C21.9 33.5 21.6 33.8 21 33.8L21.5 28.2 31.6 19C32 18.6 31.5 18.4 31 18.8L18.5 26.7 13.2 25C12 24.6 12 23.8 13 23.3z"/>
          </g>
        </svg>
      );
    case "mail":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={`ic shrink-0 ${className}`}
          style={{ overflow: "visible" }}
        >
          <filter id="cut-mail">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          <g filter="url(#cut-mail)">
            <g transform="translate(2.6, 2.6)">
              <rect fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" x="5" y="11" width="38" height="27" rx="6"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M9 17l15 12 15-12"/>
            </g>
            <rect fill="#a8d9ff" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" x="5" y="11" width="38" height="27" rx="6"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M9 17l15 12 15-12"/>
          </g>
        </svg>
      );
    case "lock":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={`ic shrink-0 ${className}`}
          style={{ overflow: "visible" }}
        >
          <filter id="cut-lock">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          <g filter="url(#cut-lock)">
            <g transform="translate(2.6, 2.6)">
              <path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M16 22v-6a8 8 0 0 1 16 0v6"/><rect fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" x="9" y="21" width="30" height="22" rx="6"/><circle fill="#1a1a1a" cx="24" cy="30" r="3.2"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M24 31v5"/>
            </g>
            <path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M16 22v-6a8 8 0 0 1 16 0v6"/><rect fill="#ffd84d" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" x="9" y="21" width="30" height="22" rx="6"/><circle fill="#1a1a1a" cx="24" cy="30" r="3.2"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M24 31v5"/>
          </g>
        </svg>
      );
    case "eye":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={`ic shrink-0 ${className}`}
          style={{ overflow: "visible" }}
        >
          <filter id="cut-eye">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          <g filter="url(#cut-eye)">
            <g transform="translate(2.6, 2.6)">
              <path fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M3 24C8 15 15 11 24 11s16 4 21 13c-5 9-12 13-21 13S8 33 3 24z"/><circle fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="9"/><circle fill="#1a1a1a" cx="24" cy="24" r="4"/><circle fill="#1a1a1a" cx="21.5" cy="21.5" r="1.8"/>
            </g>
            <path fill="#a8d9ff" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M3 24C8 15 15 11 24 11s16 4 21 13c-5 9-12 13-21 13S8 33 3 24z"/><circle fill="#fffef8" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="9"/><circle fill="#1a1a1a" cx="24" cy="24" r="4"/><circle fill="#1a1a1a" cx="21.5" cy="21.5" r="1.8"/>
          </g>
        </svg>
      );
    case "book":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={`ic shrink-0 ${className}`}
          style={{ overflow: "visible" }}
        >
          <filter id="cut-book">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          <g filter="url(#cut-book)">
            <g transform="translate(2.6, 2.6)">
              <path fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M4 12c7-2 14-1 20 3 6-4 13-5 20-3v26c-7-2-14-1-20 3-6-4-13-5-20-3z"/><path fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M8 15c6-1 12 0 16 3 4-3 10-4 16-3v20c-6-1-12 0-16 3-4-3-10-4-16-3z"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M24 18v20"/>
            </g>
            <path fill="#a8d9ff" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M4 12c7-2 14-1 20 3 6-4 13-5 20-3v26c-7-2-14-1-20 3-6-4-13-5-20-3z"/><path fill="#fffef8" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M8 15c6-1 12 0 16 3 4-3 10-4 16-3v20c-6-1-12 0-16 3-4-3-10-4-16-3z"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M24 18v20"/>
          </g>
        </svg>
      );
    case "trophy":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={`ic shrink-0 ${className}`}
          style={{ overflow: "visible" }}
        >
          <filter id="cut-trophy">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          <g filter="url(#cut-trophy)">
            <g transform="translate(2.6, 2.6)">
              <path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14 11H7c0 7 3 11 8 12M34 11h7c0 7-3 11-8 12"/><path fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M12 6h24v13c0 7-5 12-12 12S12 26 12 19z"/><rect fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" x="20" y="30" width="8" height="7"/><rect fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" x="13" y="36" width="22" height="7" rx="3"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M18 12v7"/>
            </g>
            <path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14 11H7c0 7 3 11 8 12M34 11h7c0 7-3 11-8 12"/><path fill="#ffd84d" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M12 6h24v13c0 7-5 12-12 12S12 26 12 19z"/><rect fill="#ff5722" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" x="20" y="30" width="8" height="7"/><rect fill="#ff5722" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" x="13" y="36" width="22" height="7" rx="3"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M18 12v7"/>
          </g>
        </svg>
      );
    case "target":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={`ic shrink-0 ${className}`}
          style={{ overflow: "visible" }}
        >
          <filter id="cut-target">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          <g filter="url(#cut-target)">
            <g transform="translate(2.6, 2.6)">
              <circle fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="19"/><circle fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="12.5"/><circle fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="6"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M24 24L38 10M32 9l1 7 7 1"/>
            </g>
            <circle fill="#ff8f85" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="19"/><circle fill="#fffef8" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="12.5"/><circle fill="#ff8f85" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="6"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M24 24L38 10M32 9l1 7 7 1"/>
          </g>
        </svg>
      );
    case "cap":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={`ic shrink-0 ${className}`}
          style={{ overflow: "visible" }}
        >
          <filter id="cut-cap">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          <g filter="url(#cut-cap)">
            <g transform="translate(2.6, 2.6)">
              <path fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M24 7 3 17.5 24 28l21-10.5z"/><path fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M11 24v9c0 3.5 6 7 13 7s13-3.5 13-7v-9l-13 6z"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M43 20v13"/>
            </g>
            <path fill="#a8d9ff" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M24 7 3 17.5 24 28l21-10.5z"/><path fill="#fffef8" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M11 24v9c0 3.5 6 7 13 7s13-3.5 13-7v-9l-13 6z"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M43 20v13"/>
          </g>
        </svg>
      );
    case "quiz":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={`ic shrink-0 ${className}`}
          style={{ overflow: "visible" }}
        >
          <filter id="cut-quiz">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          <g filter="url(#cut-quiz)">
            <g transform="translate(2.6, 2.6)">
              <path fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M8 6h32a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H27l-9 8v-8H8a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M19 16c0-3 2-5 5-5s5 2 5 5c0 4-5 4-5 7"/><circle fill="#1a1a1a" cx="24" cy="29" r="2"/>
            </g>
            <path fill="#d9c3ff" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M8 6h32a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H27l-9 8v-8H8a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M19 16c0-3 2-5 5-5s5 2 5 5c0 4-5 4-5 7"/><circle fill="#1a1a1a" cx="24" cy="29" r="2"/>
          </g>
        </svg>
      );
    case "clock":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={`ic shrink-0 ${className}`}
          style={{ overflow: "visible" }}
        >
          <filter id="cut-clock">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          <g filter="url(#cut-clock)">
            <g transform="translate(2.6, 2.6)">
              <circle fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="19"/><circle fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="13.5"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M24 15v10l7 4"/>
            </g>
            <circle fill="#a8d9ff" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="19"/><circle fill="#fffef8" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="13.5"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M24 15v10l7 4"/>
          </g>
        </svg>
      );
    case "shield":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={`ic shrink-0 ${className}`}
          style={{ overflow: "visible" }}
        >
          <filter id="cut-shield">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          <g filter="url(#cut-shield)">
            <g transform="translate(2.6, 2.6)">
              <path fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M24 4l16 6v12c0 10-7 17-16 22C15 39 8 32 8 22V10z"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M16 24l6 6 11-12"/>
            </g>
            <path fill="#a8d9ff" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M24 4l16 6v12c0 10-7 17-16 22C15 39 8 32 8 22V10z"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M16 24l6 6 11-12"/>
          </g>
        </svg>
      );
    case "star":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={`ic shrink-0 ${className}`}
          style={{ overflow: "visible" }}
        >
          <filter id="cut-star">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          <g filter="url(#cut-star)">
            <g transform="translate(2.6, 2.6)">
              <path fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" transform="translate(24 24) scale(.88) translate(-24 -24)" d="M24 4l6.3 13.3 14.2 2-10.2 9.9 2.4 14.1L24 36.7 11.3 43.3l2.4-14.1L3.5 19.3l14.2-2z"/>
            </g>
            <path fill="#ffd84d" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" transform="translate(24 24) scale(.88) translate(-24 -24)" d="M24 4l6.3 13.3 14.2 2-10.2 9.9 2.4 14.1L24 36.7 11.3 43.3l2.4-14.1L3.5 19.3l14.2-2z"/>
          </g>
        </svg>
      );
    case "check":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={`ic shrink-0 ${className}`}
          style={{ overflow: "visible" }}
        >
          <filter id="cut-check">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          <g filter="url(#cut-check)">
            <g transform="translate(2.6, 2.6)">
              <circle fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="19"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14 25l7 7 13-15"/>
            </g>
            <circle fill="#b6ef88" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="24" r="19"/><path fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14 25l7 7 13-15"/>
          </g>
        </svg>
      );
    case "user":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={`ic shrink-0 ${className}`}
          style={{ overflow: "visible" }}
        >
          <filter id="cut-user">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          <g filter="url(#cut-user)">
            <g transform="translate(2.6, 2.6)">
              <circle fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="15" r="10"/><path fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M6 43c0-10 8-17 18-17s18 7 18 17z"/>
            </g>
            <circle fill="#a8d9ff" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" cx="24" cy="15" r="10"/><path fill="#a8d9ff" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round" d="M6 43c0-10 8-17 18-17s18 7 18 17z"/>
          </g>
        </svg>
      );
    default:
      return null;
  }
}
