import './globals.css';

export const metadata = {
  title: 'gelanlasalim.com | B2B Canlı Tersine İhale Arenası',
  description: 'Tedarik taleplerinizi yayınlayın, tedarikçilerin canlı yarışmasını izleyin.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <div className="ambient-glow-wrapper">
          <div className="glow-circle primary"></div>
          <div className="glow-circle secondary"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
