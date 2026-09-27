import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Cloud, Key, Server } from 'lucide-react';
import { WeatherResponse } from '../types/weather';

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherResponse;
}

export const ApiStatusModal: React.FC<ApiStatusModalProps> = ({
  isOpen,
  onClose,
  weather,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/95 border border-white/20 p-6 sm:p-7 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">API 연동 및 시스템 아키텍처</h3>
            <p className="text-xs text-white/60">
              안전한 서버 프록시 기반 기상 데이터 및 AI 엔진 연동
            </p>
          </div>
        </div>

        {/* Status Blocks */}
        <div className="mt-5 space-y-3.5">
          {/* Weather API Service Status */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300 shrink-0 mt-0.5">
              <Cloud size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  실시간 기상 데이터 엔진
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                  <CheckCircle2 size={13} />
                  정상 가동 중
                </span>
              </div>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                현재 <strong className="text-sky-300">{weather.provider}</strong> 기상망을 통해
                위도 {weather.lat.toFixed(2)}, 경도 {weather.lon.toFixed(2)}의 실시간 기상 관측치와
                초정밀 24시간 및 7일 예보를 수신하고 있습니다.
              </p>
            </div>
          </div>

          {/* OpenWeather API Key Status */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
              <Key size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  OpenWeather API 키 적용 상태
                </span>
                {weather.hasApiKey ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 size={13} />
                    API Key 적용됨
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-300">
                    <CheckCircle2 size={13} />
                    오픈 기상망 자동 연동
                  </span>
                )}
              </div>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                {weather.hasApiKey
                  ? '환경 변수(OPENWEATHER_API_KEY)에 등록된 API 키로 OpenWeatherMap API에 직접 연결되어 서비스 중입니다.'
                  : '서버 환경변수 OPENWEATHER_API_KEY를 설정하면 전용 키로 연결되며, 미설정 시에도 고정밀 글로벌 기상망(Open-Meteo & KMA)을 통해 결측 없이 실시간 데이터를 제공합니다.'}
              </p>
            </div>
          </div>

          {/* Gemini AI Engine */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 shrink-0 mt-0.5">
              <Sparkles size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  AI 기상 분석 및 코디 엔진
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-300">
                  <CheckCircle2 size={13} />
                  활성화
                </span>
              </div>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                Google Gemini 및 전문 기상 분석 규칙 엔진을 결합하여 현재 기온, 습도, 풍속, 강수
                확률 및 미세먼지를 분석해 실시간 옷차림과 생활 지수를 생성합니다.
              </p>
            </div>
          </div>

          {/* Server Proxy Security */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-start gap-2.5 text-xs text-emerald-200">
            <Server size={16} className="shrink-0 mt-0.5" />
            <p>
              <strong>보안 안내:</strong> API 키는 클라이언트(브라우저)에 노출되지 않도록 전용
              백엔드 서버 프록시(<code>/api/weather</code>)를 통해 안전하게 보호됩니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-all cursor-pointer shadow-lg shadow-sky-500/25 active:scale-95"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
