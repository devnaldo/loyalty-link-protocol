// Best of both worlds - clean code with one useful inline style
export const AnimatedBackground = () => (
  <div 
    className="background-container"
    style={{ pointerEvents: 'none' }}
  >
    <div className="floating-element"></div>
    <div className="floating-element"></div>
  </div>
);