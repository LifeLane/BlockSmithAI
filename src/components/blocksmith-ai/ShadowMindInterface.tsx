
'use client';

import type { FunctionComponent } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Percent,
  Brain,
  AlertTriangle
} from 'lucide-react';
import GlyphScramble from './GlyphScramble';

interface ShadowMindInterfaceProps {
  shadowScore?: string;
  confidence?: string;
  sentiment?: string;
  riskRating?: string;
  currentThought?: string;
  prediction?: string;
}

const ShadowMindInterface: FunctionComponent<ShadowMindInterfaceProps> = ({
  shadowScore = "0",
  confidence = "N/A",
  sentiment = "State: Nominal",
  riskRating = "N/A",
  currentThought = "Awaiting neural synchronization...",
  prediction = "Calculating future vectors...",
}) => {
  const confidenceValue = parseInt(shadowScore.replace('%', ''), 10) || 0;

  return (
    <div className="shadow-mind-terminal">
      <div className="shadow-mind-terminal-header">
        <span className="shadow-mind-terminal-header-title">┌─ SHADOW_MIND [NEURAL_CORE]</span>
        <span className="shadow-mind-terminal-header-status">[ONLINE] ┐</span>
      </div>
      
      <div className="space-y-2.5 pt-4">

        <div className="shadow-mind-line">
            <span className="shadow-mind-label">│ SHADOW Score      :</span>
            <span className="shadow-mind-value accent">
                {confidenceValue}%
                <div className="confidence-bar-container">
                    <div 
                    className="confidence-bar" 
                    style={{ width: `${Math.min(confidenceValue, 100)}%` }}
                    aria-valuenow={confidenceValue}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    role="progressbar"
                    />
                </div>
            </span>
            <span>│</span>
        </div>

        <div className="shadow-mind-line">
            <span className="shadow-mind-label">│ Confidence Level  :</span>
            <span className="shadow-mind-value text-tertiary">{confidence}</span>
            <span>│</span>
        </div>

        <div className="shadow-mind-line">
            <span className="shadow-mind-label">│ Sentiment Scan    :</span>
            <span className="shadow-mind-value text-primary">{sentiment}</span>
            <span>│</span>
        </div>

        <div className="shadow-mind-line">
            <span className="shadow-mind-label">│ Risk Rating       :</span>
            <span className="shadow-mind-value text-orange-500">{riskRating}</span>
            <span>│</span>
        </div>
        
        <div className="shadow-mind-line">
            <span className="shadow-mind-label">│ Current Thought   :</span>
            <span className="shadow-mind-value thought">
                {currentThought}
            </span>
            <span>│</span>
        </div>
        
        <div className="shadow-mind-line">
            <span className="shadow-mind-label">│ Prediction        :</span>
            <span className="shadow-mind-value">{prediction}</span>
            <span>│</span>
        </div>
        
      </div>


      <div className="shadow-mind-footer flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link href="/pulse" className="glow-button w-full sm:w-auto">
            ▷ [ Review Trade History ]
        </Link>
        <Link href="/core" className="shadow-choice-button w-full sm:w-auto">
            ▷ [ Generate New Signal ]
        </Link>
      </div>
       <div className="shadow-mind-line footer-line">
          <span>└───────────────────</span>
          <span>┘</span>
      </div>
    </div>
  );
};

export default ShadowMindInterface;
