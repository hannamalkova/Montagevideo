"""Synthesise a 'vine boom'-style hit that is audible on phone speakers:
pitch-dropping 808-like body driven into hard saturation (rich 150 Hz-2 kHz harmonics),
a mid 'thud' layer, a short noise attack and a small room tail.  usage: boom.py OUT.wav"""
import numpy as np, wave, sys
sr = 48000; T = 1.5; t = np.arange(int(sr * T)) / sr
rng = np.random.default_rng(7)
def tone(f0, f1, k):
    f = f1 + (f0 - f1) * np.exp(-t * k); return np.sin(2 * np.pi * np.cumsum(f) / sr)
env = np.exp(-t * 2.6) * (1 - np.exp(-t * 1500))
body = tone(160, 52, 7) * env                                  # the boom
drive = np.tanh(6.0 * body) * 0.9                              # heavy saturation -> audible harmonics
thud = np.tanh(3 * tone(420, 170, 10) * np.exp(-t * 6)) * 0.9   # mid punch for small speakers
upper = np.tanh(4 * tone(640, 230, 9) * np.exp(-t * 8)) * 0.45  # 'growl' harmonics heard on phones
noise = rng.standard_normal(len(t)); nb = np.convolve(noise, np.ones(6) / 6, 'same') - np.convolve(noise, np.ones(60) / 60, 'same')
attack = nb * np.exp(-t * 45) * 0.6                            # band-limited click (~800 Hz-8 kHz)
x = 0.7 * drive + thud + upper + attack
# gentle high-pass (~90 Hz): sub-bass that phones can't play only eats headroom
a = np.exp(-2 * np.pi * 90 / sr); y = np.zeros_like(x); prev = 0.0
for i in range(len(x)):
    prev = a * prev + (1 - a) * x[i]; y[i] = x[i] - 0.75 * prev
x = y
ir = rng.standard_normal(int(sr * 0.6)) * np.exp(-np.arange(int(sr * 0.6)) / sr * 7) * 0.012
x = x + np.convolve(x, ir)[:len(x)]
x = np.tanh(1.4 * x)
x = x / np.abs(x).max() * 0.97
x *= np.minimum(1, (T - t) / 0.15)                             # fade the tail
s = (np.column_stack([x, x]) * 32767).astype(np.int16)
w = wave.open(sys.argv[1], "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes(s.tobytes()); w.close()
X = np.abs(np.fft.rfft(x)) ** 2; fr = np.fft.rfftfreq(len(x), 1 / sr)
for lo, hi in [(20, 150), (150, 300), (300, 800), (800, 3000), (3000, 10000)]:
    m = (fr >= lo) & (fr < hi); print(f"{lo}-{hi} Hz: {100 * X[m].sum() / X.sum():.1f}%")
print("rms dBFS", round(20 * np.log10(np.sqrt((x ** 2).mean())), 1))
