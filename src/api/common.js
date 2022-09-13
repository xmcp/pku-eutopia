function alert_session_expired() {
    if(window.EUTOPIA_SESSION_EXPIRE_ALERTED)
        return;

    window.EUTOPIA_SESSION_EXPIRE_ALERTED = true;

    if(window.confirm('会话过期，是否重新登录？')) {
        window.location.href = '/site/login/cas-login';
    }
}

export function handle_redirect(res) {
    if(res.type==='opaqueredirect') {
        alert_session_expired();
        throw new Error('网络错误（跳转）');
    }
}