import { Geist_Mono, Rethink_Sans, Urbanist } from 'next/font/google';

// Rethink Sans sets the name and the big titles; Urbanist carries every other word; Geist Mono
// only labels data (the viewfinder, axis ticks).
export const display = Rethink_Sans({ subsets: ['latin'], variable: '--font-rethink', display: 'swap' });
export const body = Urbanist({ subsets: ['latin'], variable: '--font-urbanist', display: 'swap' });
export const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });
