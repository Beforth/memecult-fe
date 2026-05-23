import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer-premium">
      <div className="site-footer-inner">
        <div className="footer-col footer-logo-col">
          <img src="/images/footer-logo.png" alt="MemeCult" className="footer-logo-mark" />
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          <a href="#">Templates</a>
          <Link to="/editor">Editor</Link>
          <a href="#">Memes</a>
        </div>

        <div className="footer-col">
          <h4>Resources</h4>
          <a href="#">Blog</a>
          <Link to="/roadmap">Roadmap</Link>
          <Link to="/support">Support</Link>
          <Link to="/privacy">Privacy</Link>
        </div>

        <div className="footer-col footer-viral">
          <h4>READY TO GO VIRAL?</h4>
          <p>Join creators making the internet funnier every day.</p>
          <Link to="/editor" className="site-btn site-btn-lime">Start Creating Now</Link>
        </div>
      </div>
    </footer>
  );
}
