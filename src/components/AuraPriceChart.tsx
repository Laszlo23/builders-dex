import React, { useEffect, useRef } from 'react';
import { ColorType, createChart, type IChartApi, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';
import type { AuraLiveCandle } from '../lib/auraLive';

type Props = {
  candles: AuraLiveCandle[];
};

export default function AuraPriceChart({ candles }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8B929A',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true },
      crosshair: { mode: 1 },
      width: el.clientWidth,
      height: el.clientHeight,
    });
    const series = chart.addAreaSeries({
      lineColor: '#C8E868',
      topColor: 'rgba(200,232,104,0.28)',
      bottomColor: 'rgba(200,232,104,0.02)',
      lineWidth: 2,
      priceFormat: { type: 'price', precision: 6, minMove: 0.000001 },
    });
    chartRef.current = chart;
    seriesRef.current = series;
    const onResize = () => {
      if (!wrapRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: wrapRef.current.clientWidth,
        height: wrapRef.current.clientHeight,
      });
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || candles.length === 0) return;
    seriesRef.current.setData(
      candles.map((c) => ({ time: c.time as UTCTimestamp, value: c.value })),
    );
    chartRef.current.timeScale().fitContent();
  }, [candles]);

  return <div ref={wrapRef} className="h-full min-h-[220px] w-full" />;
}
