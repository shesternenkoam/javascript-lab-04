export function createInput() {
  const keys = { w: false, a: false, d: false };
  
  const handleKeyDown = (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) keys[key] = true;
  };
  
  const handleKeyUp = (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) keys[key] = false;
  };

  const handleBlur = () => {
    for (let key in keys) keys[key] = false;
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('blur', handleBlur);

  return () => ({ ...keys }); 
}