import React from 'react';
import ReactDOM from 'react-dom/client';

import {App} from './ui/App';

import './index.css';
import {BUILD_INFO} from './utils';

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
                    <p>Build {BUILD_INFO}, Script {window.USERSCRIPT_COMPAT_VER||'---'}</p>
                    <p>{window.navigator.userAgent}</p>
                    <pre>{this.state.error.stack.toString()}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}

function inject() {
    if(window.EUTOPIA_RENDER_ROOT) {
        console.log('entupia: render root already exists');
        return;
    }

    window.EUTOPIA_RENDER_ROOT = window.EUTOPIA_USE_MOCK ?
        document.getElementById('eu-root') :
        document.getElementById('eutopia-mount-point').shadowRoot.getElementById('eu-root');

    if(window.EUTOPIA_RENDER_ROOT.innerHTML!=='') {
        console.log('entupia: render root not empty');
        return;
    }

    const root = ReactDOM.createRoot(window.EUTOPIA_RENDER_ROOT);
    root.render(
      <React.StrictMode>
          <ErrorBoundary>
              <App />
          </ErrorBoundary>
      </React.StrictMode>
    );
}

inject();