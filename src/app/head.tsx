export default function Head() {
  return (
    <>
      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          #__next-build-watcher * {
            animation: none !important;
            display: none !important;
          }
          [data-nextjs-loading-indicator],
          [data-nextjs-refresh-indicator],
          .nprogress-busy {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }
        }
      `}</style>
    </>
  );
} 