import { useEffect, useMemo, useState } from 'react';
import './HomePage.css';

const memeImages = [
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=500',
  'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=500',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
  'https://media.istockphoto.com/id/1356364288/photo/close-up-portrait-of-funny-surprised-cat.jpg?s=612x612&w=0&k=20&c=GlOY77gLQoYnMlJfYlMCokJwcd7DRzrVhrOtsT2vZPw=',
];

const funnyCaptions = [
  ['ME ON MONDAY', 'SLEEP IS POWER'],
  ['BRAIN IS OFFLINE', 'SEND COFFEE'],
  ['WHEN THE WIFI WORKS', 'BLESSED'],
  ['EXAM DAY BE LIKE', 'PANIC MODE'],
  ['GROUP PROJECT', 'DOING NOTHING'],
  ['THAT MOMENT', 'PURE CHAOS'],
  ['I HAVE NO IDEA', "AND I'M OKAY"],
  ['MISSION PASSED', 'RESPECT +100'],
];

const trending = [
  ['https://i.imgflip.com/30b1gx.jpg', 'Me on Monday', '12.4k'],
  ['https://i.imgflip.com/1bij.jpg', 'Explain this!', '9.2k'],
  ['https://i.imgflip.com/26am.jpg', 'I have no idea', '8.7k'],
  ['https://i.imgflip.com/1ur9b0.jpg', 'Life lately', '13.1k'],
  ['https://i.imgflip.com/2ybua0.jpg', 'Exam day', '11.3k'],
  ['https://i.imgflip.com/39t1o.jpg', 'Mission passed', '15.8k'],
];

function Icon({ name, className = '' }) {
  const common = { className: `icon ${className}`.trim(), viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'image') return <svg {...common}><rect x='3' y='3' width='18' height='18' rx='2' /><circle cx='9' cy='9' r='1.8' /><path d='m21 15-5-5L5 21' /></svg>;
  if (name === 'smile') return <svg {...common}><circle cx='12' cy='12' r='10' /><path d='M8 14s1.5 2 4 2 4-2 4-2' /><line x1='9' y1='9' x2='9.01' y2='9' /><line x1='15' y1='9' x2='15.01' y2='9' /></svg>;
  if (name === 'type') return <svg {...common}><path d='M4 7h16' /><path d='M10 7v10' /><path d='M14 7v10' /><path d='M8 17h8' /></svg>;
  if (name === 'upload') return <svg {...common}><path d='M12 16V4' /><path d='m7 9 5-5 5 5' /><rect x='4' y='16' width='16' height='4' rx='1' /></svg>;
  if (name === 'calendar') return <svg {...common}><rect x='3' y='5' width='18' height='16' rx='2' /><path d='M16 3v4M8 3v4M3 11h18' /></svg>;
  if (name === 'trophy') return <svg {...common}><path d='M8 21h8' /><path d='M12 17v4' /><path d='M6 4h12v4a6 6 0 0 1-12 0V4Z' /><path d='M6 6H4a2 2 0 0 0 0 4h2' /><path d='M18 6h2a2 2 0 0 1 0 4h-2' /></svg>;
  if (name === 'swords') return <svg {...common}><path d='m14.5 6.5 3 3-11 11-3-3z' /><path d='m9.5 6.5-3 3 11 11 3-3z' /></svg>;
  if (name === 'crown') return <svg {...common}><path d='M3 8l4 4 5-7 5 7 4-4-2 11H5z' /></svg>;
  if (name === 'spark') return <svg {...common}><path d='M12 3v6M12 15v6M3 12h6M15 12h6M6.5 6.5l4 4M13.5 13.5l4 4M17.5 6.5l-4 4M10.5 13.5l-4 4' /></svg>;
  if (name === 'heart') return <svg {...common}><path d='M12 21s-7-4.5-9-9a5.5 5.5 0 0 1 9-5 5.5 5.5 0 0 1 9 5c-2 4.5-9 9-9 9Z' /></svg>;
  return <svg {...common}><circle cx='12' cy='12' r='10' /></svg>;
}

export default function HomePage() {
  const [topText, setTopText] = useState('THAT MOMENT');
  const [bottomText, setBottomText] = useState('WHEN IT WORKS!');
  const [img, setImg] = useState(memeImages[0]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/happy358/TornPaper@v0.0.3/tornpaper.min.js';
    script.async = true;
    script.onload = () => {
      if (window.Tornpaper) {
        // Apply torn paper filter used by `.torn-paper` class.
        new window.Tornpaper({
          filterName: 'filter_tornpaper_strip',
          seed: 9,
          tornFrequency: 0.12,
          tornScale: 16,
          grungeFrequency: 0.06,
          grungeScale: 5,
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const upperTop = useMemo(() => topText.toUpperCase(), [topText]);
  const upperBottom = useMemo(() => bottomText.toUpperCase(), [bottomText]);

  function randomizeMeme() {
    setImg(memeImages[Math.floor(Math.random() * memeImages.length)]);
    const [t, b] = funnyCaptions[Math.floor(Math.random() * funnyCaptions.length)];
    setTopText(t);
    setBottomText(b);
  }

  return (
    <div className='testing-home'>
      <div className='container'>
        <div className='hero'>
          <div className='hero-left'>
            <h1>MAKE MEMES<br /><span>NOT EXCUSES.</span></h1>
            <p className='subtitle'>The ultimate meme studio for creators, streamers, internet legends, students & chaos enjoyers.</p>
            <div className='hero-buttons'>
              <button className='btn btn-lime'>Start Creating</button>
              <button className='btn btn-outline'>Explore Memes</button>
            </div>
          </div>

          <div className='editor'>
            <div className='window-dots'><div className='dot red' /><div className='dot yellow' /><div className='dot green' /></div>
            <div className='toolbar'>
              <div className='tool'><Icon name='image' className='tool-icon' />Templates</div>
              <div className='tool'><Icon name='smile' className='tool-icon' />Stickers</div>
              <div className='tool'><Icon name='type' className='tool-icon' />Text</div>
              <div className='tool'><Icon name='upload' className='tool-icon' />Uploads</div>
            </div>
            <div className='canvas'><div className='meme-preview'><img src={img} alt='meme base' /><div className='meme-text-layer'><div className='top-meme-text'>{upperTop || ' '}</div><div className='bottom-meme-text'>{upperBottom || ' '}</div></div></div></div>
            <div className='properties'>
              <div className='prop-title'>Top text</div>
              <input type='text' className='input' value={topText} onChange={(e) => setTopText(e.target.value)} maxLength={40} />
              <div className='prop-title'>Bottom text</div>
              <input type='text' className='input' value={bottomText} onChange={(e) => setBottomText(e.target.value)} />
              <div className='prop-title'>Style</div>
              <button className='btn btn-outline full' onClick={randomizeMeme}>Random meme</button>
            </div>
          </div>
        </div>

        <div className='strip torn-paper'>
          <div className='strip-card'><Icon name='calendar' className='strip-icon' /><div><h3>Daily Challenge</h3><p>New meme everyday</p></div></div>
          <div className='strip-card'><Icon name='trophy' className='strip-icon' /><div><h3>Earn XP & Badges</h3><p>Level up your meme game</p></div></div>
          <div className='strip-card'><Icon name='swords' className='strip-icon' /><div><h3>Meme Battles</h3><p>Challenge creators</p></div></div>
          <div className='strip-card'><Icon name='crown' className='strip-icon' /><div><h3>Weekly Contest</h3><p>Show your creativity</p></div></div>
        </div>

        <section><div className='section-head'><h2>Trending Templates</h2><a className='see' href='#'>See all →</a></div>
          <div className='meme-grid'>{trending.map(([src, title, likes]) => <div className='meme-card' key={title}><img src={src} alt={title} /><p>{title}</p><div className='meme-bottom'><span className='like-wrap'><Icon name='heart' className='mini-icon' /> {likes}</span><Icon name='spark' className='mini-icon' /></div></div>)}</div>
        </section>


      </div>
    </div>
  );
}
