import {render, Component} from 'preact';

import {App} from './ui/App';
import {check_session_on_launch} from './api/common';
import {BUILD_INFO} from './utils';

import './index.css';

class ErrorBoundary extends Component {
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

    if(process.env.NODE_ENV==='production') {
        window.EUTOPIA_RENDER_ROOT = document.getElementById('eutopia-mount-point').shadowRoot.getElementById('eu-root');
    } else {
        window.EUTOPIA_RENDER_ROOT = document.getElementById('eu-root');
    }

    if(window.EUTOPIA_RENDER_ROOT.innerHTML!=='') {
        console.log('entupia: render root not empty');
        return;
    }

    check_session_on_launch();

    render((
      <ErrorBoundary>
          <App />
      </ErrorBoundary>
    ), window.EUTOPIA_RENDER_ROOT);
}

inject();