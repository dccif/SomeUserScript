import { render } from 'preact';
import App from './App';

render(
  <App />,
  (() => {
    const app = document.createElement('div');
    document.body.append(app);
    return app;
  })()
);
