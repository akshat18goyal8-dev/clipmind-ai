import wave
import numpy as np
from typing import List, Dict, Any, Tuple

class AudioAnalyzerService:
    @staticmethod
    def analyze_audio_energy(wav_path: str, window_sec: float = 0.5) -> Dict[str, Any]:
        """
        Analyzes 16kHz mono audio file for RMS energy, volume peaks, and silence regions.
        """
        try:
            with wave.open(wav_path, 'rb') as wf:
                sample_rate = wf.getframerate()
                n_frames = wf.getnframes()
                raw_data = wf.readframes(n_frames)
                
            samples = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32)
            if len(samples) == 0:
                return {"energy_peaks": [], "silences": [], "avg_energy": 0.0}
                
            # Normalize to [-1.0, 1.0]
            max_val = np.max(np.abs(samples)) or 1.0
            samples = samples / max_val
            
            window_size = int(sample_rate * window_sec)
            n_windows = len(samples) // window_size
            
            energy_timeline = []
            silences = []
            
            silence_threshold = 0.04
            
            for i in range(n_windows):
                start_sample = i * window_size
                end_sample = start_sample + window_size
                chunk = samples[start_sample:end_sample]
                
                rms = float(np.sqrt(np.mean(chunk**2)))
                timestamp = (i * window_size) / sample_rate
                
                energy_timeline.append({
                    "time": round(timestamp, 2),
                    "energy": round(rms, 4)
                })
                
                if rms < silence_threshold:
                    silences.append({
                        "start": round(timestamp, 2),
                        "end": round(timestamp + window_sec, 2)
                    })
                    
            energies = [e["energy"] for e in energy_timeline]
            avg_energy = float(np.mean(energies)) if energies else 0.0
            std_energy = float(np.std(energies)) if energies else 0.0
            peak_threshold = avg_energy + 1.2 * std_energy
            
            peaks = [
                e for e in energy_timeline if e["energy"] > peak_threshold
            ]
            
            return {
                "timeline": energy_timeline,
                "peaks": peaks,
                "silences": silences,
                "avg_energy": avg_energy,
                "peak_threshold": peak_threshold
            }
        except Exception as e:
            return {
                "timeline": [],
                "peaks": [],
                "silences": [],
                "avg_energy": 0.0,
                "peak_threshold": 0.0,
                "error": str(e)
            }

    @staticmethod
    def find_nearest_silence(silences: List[Dict[str, float]], target_time: float, max_offset: float = 3.0) -> float:
        """
        Finds natural pause/silence within max_offset seconds to avoid cutting mid-sentence.
        """
        if not silences:
            return target_time
            
        candidates = [
            s["start"] for s in silences 
            if abs(s["start"] - target_time) <= max_offset
        ]
        if candidates:
            # Pick closest candidate
            return min(candidates, key=lambda c: abs(c - target_time))
        return target_time
