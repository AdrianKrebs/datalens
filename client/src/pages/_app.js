import '../styles/tailwind.css'
import '../styles/globals.css'
import {DM_Sans} from "@next/font/google";

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], });

export default function App({ Component, pageProps }) {
   return (
    <main className={dmSans.className}>
        <style jsx global>{`
              :root {
                --font-dm: ${dmSans.style.fontFamily};
              }
              html {
          font-family: ${dmSans.style.fontFamily};
        }
            `}</style>
      <Component {...pageProps} />
    </main>
  );
}
