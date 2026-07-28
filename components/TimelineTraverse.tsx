'use client';

import React, { useRef, useState, useMemo } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { MCUItem, WatchStatus, TimelineOrder, ScopeMode } from '@/lib/types';
import { SERIES_ROAD_ROWS, MOVIE_ROAD_ROWS } from '@/lib/mcuData';
import MovieNode from './MovieNode';

interface TimelineTraverseProps {
  order: TimelineOrder;
  scope: ScopeMode;
  searchQuery: string;
  userProgress: Record<string, WatchStatus>;
  partnerProgress: Record<string, WatchStatus>;
  onSelectMovie: (item: MCUItem) => void;
  onToggleStatus: (movieId: string, status: WatchStatus, e: React.MouseEvent) => void;
}

export default function TimelineTraverse({
  order,
  scope,
  searchQuery,
  userProgress,
  partnerProgress,
  onSelectMovie,
  onToggleStatus,
}: TimelineTraverseProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Framer Motion scroll progress hook for the central timeline tracker
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Filter & Order helper: flattens, filters, sorts by chronological/release order, then chunks back into rows
  const processTimelineRows = (rows: MCUItem[][], itemsPerRow: number = 3): MCUItem[][] => {
    const allItems = rows.flat();

    // Filter by scope and search query
    const filtered = allItems.filter((item) => {
      if (scope === 'essential' && !item.isEssential) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q);
      }
      return true;
    });

    // Sort according to order toggle
    filtered.sort((a, b) => {
      if (order === 'chronological') {
        return a.chronologicalOrder - b.chronologicalOrder;
      } else {
        return a.releaseOrder - b.releaseOrder;
      }
    });

    // Chunk back into serpentine rows
    const chunked: MCUItem[][] = [];
    for (let i = 0; i < filtered.length; i += itemsPerRow) {
      chunked.push(filtered.slice(i, i + itemsPerRow));
    }
    return chunked;
  };

  const processedSeriesRows = useMemo(() => processTimelineRows(SERIES_ROAD_ROWS, 2), [scope, searchQuery, order]);
  const processedMovieRows = useMemo(() => processTimelineRows(MOVIE_ROAD_ROWS, 3), [scope, searchQuery, order]);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-neo-blue text-black py-16 px-4 md:px-8 font-sans overflow-hidden">
      
      {/* Central Progress Bar (Neo-Brutalist) */}
      <div className="absolute left-1/2 top-0 bottom-0 w-5 bg-white border-x-4 border-black -translate-x-1/2 z-0 hidden md:block">
        <motion.div
          className="w-full bg-neo-red origin-top"
          style={{ scaleY, height: '100%' }}
        />
      </div>

      {/* Main Dual Columns Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row justify-between w-full max-w-7xl mx-auto gap-12 lg:gap-16">
        
        {/* Left Column: Street-Level & Series Road */}
        <div className="flex flex-col items-center w-full lg:w-1/2">
          <div className="bg-neo-yellow text-black border-4 border-black px-6 py-3 rounded-2xl shadow-brutal mb-10 text-center transform -rotate-1">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight font-display">
              📺 THE SERIES ROAD
            </h2>
            <p className="text-xs font-bold text-black/80">Street-Level Vigilantes & TVA Timeline Saga</p>
          </div>

          <div className="relative flex flex-col gap-12 w-full">
            {processedSeriesRows.map((row, rowIndex) => {
              // Serpentine S-Curve toggle: Even rows flex-row, Odd rows flex-row-reverse
              const isEven = rowIndex % 2 === 0;

              return (
                <div key={rowIndex} className="relative flex flex-col items-center">
                  {/* Serpentine Connecting Line to Next Row */}
                  {rowIndex < processedSeriesRows.length - 1 && (
                    <div className="absolute -bottom-10 z-0 w-1 bg-black h-10 border-l-2 border-dashed border-black" />
                  )}

                  <div
                    className={`flex w-full justify-around items-center gap-4 ${
                      isEven ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    {row.map((item) => (
                      <MovieNode
                        key={item.id}
                        item={item}
                        userStatus={userProgress[item.id] || 'unwatched'}
                        partnerStatus={partnerProgress[item.id] || 'unwatched'}
                        onClick={() => onSelectMovie(item)}
                        onToggleStatus={(status, e) => onToggleStatus(item.id, status, e)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: The Movie Road */}
        <div className="flex flex-col items-center w-full lg:w-1/2">
          <div className="bg-neo-yellow text-black border-4 border-black px-6 py-3 rounded-2xl shadow-brutal mb-10 text-center transform rotate-1">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight font-display">
              🎬 THE MOVIE ROAD
            </h2>
            <p className="text-xs font-bold text-black/80">Infinity & Multiverse Cinema Saga</p>
          </div>

          <div className="relative flex flex-col gap-12 w-full">
            {processedMovieRows.map((row, rowIndex) => {
              // Serpentine S-Curve toggle: Even rows flex-row, Odd rows flex-row-reverse
              const isEven = rowIndex % 2 === 0;

              return (
                <div key={rowIndex} className="relative flex flex-col items-center">
                  {/* Serpentine Connecting Line to Next Row */}
                  {rowIndex < processedMovieRows.length - 1 && (
                    <div className="absolute -bottom-10 z-0 w-1 bg-black h-10 border-l-2 border-dashed border-black" />
                  )}

                  <div
                    className={`flex w-full justify-around items-center gap-4 ${
                      isEven ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    {row.map((item) => (
                      <MovieNode
                        key={item.id}
                        item={item}
                        userStatus={userProgress[item.id] || 'unwatched'}
                        partnerStatus={partnerProgress[item.id] || 'unwatched'}
                        onClick={() => onSelectMovie(item)}
                        onToggleStatus={(status, e) => onToggleStatus(item.id, status, e)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
