  export function createLoop(update, render, updateHUD) {
  const dt = 1000 / 60; // фіксований крок
  let accumulator = 0;
  let lastTime = performance.now();
  
  let steps = 0;
  let frames = 0;
  let lastHudTime = lastTime;

  function frame(currentTime) {
    let frameTime = currentTime - lastTime;
    // якщо вкладка була неактивна, обмежуємо час
    if (frameTime > 250) frameTime = 250; 
    lastTime = currentTime;

    accumulator += frameTime;

    // симуляція фізики 
    while (accumulator >= dt) {
      update(dt / 1000); // передаємо dt у секундах
      accumulator -= dt;
      steps++;
    }

    // (наскільки близько ми до наступного кроку)
    const alpha = accumulator / dt;
    render(alpha); //браузер може намалювати корабель трошки попереду
    frames++;

    // oновлення HUD 
    if (currentTime - lastHudTime >= 1000) {
      updateHUD(steps, frames, frameTime.toFixed(2));
      steps = 0;
      frames = 0;
      lastHudTime = currentTime;
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}