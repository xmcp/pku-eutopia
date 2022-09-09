import React from 'react';
import ReactDOM from 'react-dom/client';

import {App} from './ui/App';

import './index.css';

window.EUTOPIA_RENDER_ROOT = window.EUTOPIA_USE_MOCK ?
    document.getElementById('eu-root') :
    document.getElementById('eutopia-mount-point').shadowRoot.getElementById('eu-root');

const root = ReactDOM.createRoot(window.EUTOPIA_RENDER_ROOT);

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error: error };
    }

    render() {
        if (this.state.error) {
            return (
                <div className="eu-error">
                    <p><b>{this.state.error.toString()}</b></p>
                    <pre>{this.state.error.stack.toString()}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}

root.render(
  <React.StrictMode>
      <ErrorBoundary>
          <App />
      </ErrorBoundary>
  </React.StrictMode>
);
