import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../index.css";
import { MovieProvider } from "../context/MovieContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CineSwipe | Descubre tu próxima película favorita",
  description: "Desliza, descubre y guarda tus películas favoritas con CineSwipe. La forma más rápida y divertida de encontrar qué ver esta noche usando la API de TMDB.",
  openGraph: {
    type: "website",
    title: "CineSwipe | Discover Your Next Favorite Movie",
    description: "Desliza para descubrir películas personalizadas según tus gustos.",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "CineSwipe",
    description: "Descubre películas con un swipe.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-background text-white antialiased overflow-hidden`}>
        <MovieProvider>
          {children}
        </MovieProvider>
      </body>
    </html>
  );
}
