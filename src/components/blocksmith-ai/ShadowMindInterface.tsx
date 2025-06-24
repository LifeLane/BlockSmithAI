'use client';

import type { FunctionComponent } from 'react';

interface ShadowMindInterfaceProps {
  signalConfidence?: string; // Percentage string e.g., "82" or "82%"
  currentThought?: string;
  sentimentMemory?: string;
  prediction?: string;
  onSynchronize?: () => void; // Optional: for future functionality
}

const ShadowMindInterface: FunctionComponent<ShadowMindInterfaceProps> = ({
  signalConfidence = "0",
  currentThought = "Awaiting neural synchronization...",
  sentimentMemory = "State: Nominal",
  prediction = "Calculating future vectors...",
  onSynchronize,
}) => {
  const confidenceValue = parseInt(signalConfidence.replace('%', ''), 10) || 0;

  return (
    <div className="shadow-mind-terminal">
      <div className="shadow-mind-terminal-header">
        <span className="shadow-mind-terminal-header-title">┌─ SHADOW_MIND [NEURAL_CORE]</span>
        <span className="shadow-mind-terminal-header-status">[ONLINE] ┐</span>
      </div>
      
      <div className="space-y-2.5 pt-4">
        <div className="shadow-mind-line">
            <span className="shadow-mind-label">│ Signal Confidence :</span>
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
            <span className="shadow-mind-label">│ Current Thought   :</span>
            <span className="shadow-mind-value thought">"{currentThought}"</span>
            <span>│</span>
        </div>

        <div className="shadow-mind-line">
            <span className="shadow-mind-label">│ Sentiment Memory  :</span>
            <span className="shadow-mind-value">{sentimentMemory}</span>
            <span>│</span>
        </div>
        
        <div className="shadow-mind-line">
            <span className="shadow-mind-label">│ Prediction        :</span>
            <span className="shadow-mind-value">{prediction}</span>
            <span>│</span>
        </div>
        
        <div className="shadow-mind-line">
            <span className="shadow-mind-label">│                   </span>
            <span className="shadow-mind-value"></span>
            <span>│</span>
        </div>
      </div>


      <div className="shadow-mind-footer">
        <button className="glow-button" onClick={onSynchronize} disabled={!onSynchronize}>
        ▷ [ Synchronize Thoughts ]
        </button>
      </div>
       <div className="shadow-mind-line footer-line">
          <span>└───────────────────</span>
          <span>┘</span>
      </div>
    </div>
  );
};

export default ShadowMindInterface;
