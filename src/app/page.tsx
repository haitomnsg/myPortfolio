import { Ai } from '@/components/Ai';
import { Chapters } from '@/components/Chapters';
import { Hero } from '@/components/Hero';
import { Robotics } from '@/components/Robotics';

export default function Home() {
  return (
    <>
      <Hero />
      <Robotics />
      <Ai />
      <Chapters />
    </>
  );
}
