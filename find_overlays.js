import fs from 'fs';

function searchFile(path) {
  if (!fs.existsSync(path)) return;
  const content = fs.readFileSync(path, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('fixed') || line.includes('absolute') || line.includes('opacity') || line.includes('bg-black') || line.includes('bg-zinc-950/80') || line.includes('backdrop')) {
      if (line.includes('inset-0') || line.includes('w-screen') || line.includes('h-screen') || line.includes('w-full') || line.includes('h-full') || line.includes('pointer-events-none') || line.includes('z-50') || line.includes('z-40')) {
         console.log(`${path}:${idx+1} - ${line.trim()}`);
      }
    }
  });
}

searchFile('src/App.tsx');
searchFile('src/components/LandingPage.tsx');
searchFile('index.html');
