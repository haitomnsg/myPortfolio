import { Ai } from '@/components/Ai';
import { Bridge } from '@/components/Bridge';
import { Hero } from '@/components/Hero';
import { Robotics } from '@/components/Robotics';
import { Software } from '@/components/Software';

export default function Home() {
  return (
    <>
      <Hero />
      <Robotics />
      <Bridge />
      <Ai />
      <Software />
    </>
  );
}
