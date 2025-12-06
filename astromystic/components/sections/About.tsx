'use client';

import React from 'react';
import { Sun, Moon, Star } from 'lucide-react';

interface AboutProps {
  theme: 'sun' | 'moon';
}

export default function About({ theme }: AboutProps) {
  return (
    <section
      id="about"
      className="py-12 md:py-24 px-4 relative overflow-hidden"
    >
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        {/* Image / Portrait Column */}
        <div
          className={`order-1 md:order-1 aspect-[3/4] rounded-full overflow-hidden border-[6px] border-opacity-20 border-current relative shadow-2xl ${theme === 'sun' ? 'shadow-amber-500/20' : 'shadow-indigo-500/20'}`}
        >
          <div className="relative w-full h-full">
            <img
              src="/IMG_7200.jpg"
              alt="Gulnara Ilyasova"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000 ease-in-out"
            />
          </div>
        </div>

        {/* Text Content Column */}
        <div className="order-2 md:order-2 space-y-8 text-center md:text-left">
          {/* Header */}
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-2">
              Gulnara Ilyasova
            </h2>
            <p
              className={`text-xs md:text-sm uppercase tracking-[0.2em] font-bold ${theme === 'sun' ? 'text-amber-600' : 'text-indigo-400'}`}
            >
              Evolutionary Astrologer
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-6 opacity-80 leading-relaxed text-base md:text-lg font-light">
            <p>
              As someone who has always struggled with forming and maintaining
              relationships, and understanding myself, purpose, intentions in
              life, astrology has been a tool I discovered at the time I needed
              it the most; it helped rationalize what was happening, explain my
              relationship dynamics through synastry; understand what my purpose
              is and what are potential challenges in the way of getting to the
              success that I desire, natal chart astrology helped me with that.
              I got inspired to learn astrology and raise awareness of how
              applicable and practical a tool it can be, if we approach it that
              way. I do astrology because it helps me, and I want you to start
              using it in your relationships and as a tool to work on yourself.
            </p>
            <p>
              My name is Gulnara. I am 31. Even though I have been pursuing my
              degree in Political Science, BA and MA, it did not stop me from
              acquiring hobbies, and astrology being one of them. Though I
              believed and followed astrology for my entire life, when I decided
              to make a move to the US in 2019, I took astrology and tarot
              seriously. As for tarot, having a strong 8th house and other
              psychic placements, it was easy to learn on my own; as for
              astrology, I was enrolled in an astrology course by Pavel Chudinov
              and completed it in 2021. I further keep updating and adding more
              to my knowledge; I specifically focus on expanding my expertise in
              aspect astrology and aspects in synastry.
            </p>
          </div>

          {/* Placements Grid */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 pt-4 border-t border-current border-opacity-10">
            {[
              {
                label: 'Sun',
                sign: 'Leo ♌',
                icon: <Sun className="w-4 h-4" />,
              },
              {
                label: 'Moon',
                sign: 'Taurus ♉',
                icon: <Moon className="w-4 h-4" />,
              },
              {
                label: 'Rising',
                sign: 'Libra ♎',
                icon: <Star className="w-4 h-4" />,
              },
            ].map((placement) => (
              <div
                key={placement.label}
                className={`p-3 md:p-4 rounded-xl border border-opacity-20 border-current flex flex-col items-center justify-center transition-all hover:-translate-y-1 duration-300 ${theme === 'sun' ? 'bg-white/50 shadow-sm' : 'bg-slate-800/50 shadow-sm'}`}
              >
                <div
                  className={`mb-2 opacity-70 ${theme === 'sun' ? 'text-amber-600' : 'text-indigo-400'}`}
                >
                  {placement.icon}
                </div>
                <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">
                  {placement.label}
                </div>
                <div className="font-serif text-sm md:text-lg font-bold">
                  {placement.sign}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
