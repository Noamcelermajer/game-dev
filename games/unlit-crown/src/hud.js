// The heads-up display: health, stamina, light, wave banner and messages. Plain HTML
// laid over the game, sized in game pixels (the --s scale is set by the renderer).
export function createHud() {
  const $ = (id) => document.getElementById(id);
  const hp = $('hp-fill'), hpLag = $('hp-lag'), st = $('st-fill'), light = $('light-fill');
  const wave = $('wave'), msg = $('msg'), hurt = $('hurt'), banner = $('banner');
  let lag = 1, bannerT = 0, hurtT = 0, lastWave = -1;

  return {
    update(dt, { hpFrac, staminaFrac, lightLevel, waveNumber, enemies, dead, canRestart }) {
      hp.style.width = `${Math.round(hpFrac * 100)}%`;
      lag = hpFrac > lag ? hpFrac : Math.max(hpFrac, lag - dt * 0.35);     // the lost chunk drains slowly
      hpLag.style.width = `${Math.round(lag * 100)}%`;
      hp.classList.toggle('low', hpFrac <= 0.5);
      st.style.width = `${Math.round(staminaFrac * 100)}%`;
      light.style.width = `${Math.round(lightLevel * 100)}%`;
      if (waveNumber !== lastWave) { wave.textContent = waveNumber > 0 ? `WAVE ${waveNumber}` : ''; lastWave = waveNumber; }
      wave.dataset.left = enemies;
      msg.textContent = dead ? (canRestart ? 'YOUR FLAME GOES OUT  ·  PRESS R' : 'YOUR FLAME GOES OUT') : '';
      bannerT = Math.max(0, bannerT - dt);
      banner.style.opacity = bannerT > 0 ? 1 : 0;
      hurtT = Math.max(0, hurtT - dt);
      hurt.style.opacity = hurtT > 0 ? 1 : 0;
    },
    banner(text, seconds = 1.8) { banner.textContent = text; bannerT = seconds; },
    flashHurt() { hurtT = 0.12; },
  };
}
