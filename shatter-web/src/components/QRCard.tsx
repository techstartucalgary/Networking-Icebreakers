import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QrCardProps {
  qrPayload: string;
  size?: number;
}

const QRCard: React.FC<QrCardProps> = ({ qrPayload, size = 220 }) => (
  <div className="w-80 flex flex-col items-center">
    <div 
      className="backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full flex flex-col items-center shadow-2xl"
      style={{ backgroundColor: 'rgba(27, 37, 58, 0.6)' }}
    >
      <div className="flex justify-between items-center w-full mb-4">
        <h3 className="font-heading font-semibold text-lg text-white">Join Event</h3>
        <span className="text-xs text-white/60">Scan</span>
      </div>
      
      <div className="bg-white p-3 rounded-xl shadow-lg">
        <QRCodeSVG value={qrPayload} width={size} height={size} />
      </div>
      
      <p className="text-sm text-center text-white/70 mt-4 font-body">
        Scan the QR to join this creative networking event.
      </p>
      
      <a
        href={qrPayload}
        target="_blank"
        rel="noreferrer"
        className="mt-4 px-6 py-2.5 rounded-full font-semibold text-white hover:opacity-90 transition-opacity shadow-lg font-body"
        style={{ backgroundColor: '#4DC4FF' }}
      >
        Join via Link
      </a>
    </div>
  </div>
);

export default QRCard;
