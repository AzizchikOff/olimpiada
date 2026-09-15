import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useLanguage } from '../i18n';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    if (login === 'admin' && password === 'admin123') {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin');
      return;
    }

    setError("Login yoki parol noto'g'ri");
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <Icon name="settings" size={26} />
        </div>

        <h1>{t('Admin panel')}</h1>
        <p>{t('Fan Olimpiadasi boshqaruv tizimi')}</p>

        <form onSubmit={handleSubmit}>
          <label>{t('Login')}</label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder={t('Admin login')}
            autoComplete="username"
          />

          <label>{t('Parol')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('Admin paroli')}
            autoComplete="current-password"
          />

          {error && <div className="admin-login-error">{error}</div>}

          <button type="submit" className="admin-login-button">
            {t('Kirish')}
          </button>
        </form>

        <button
          type="button"
          className="admin-back-button"
          onClick={() => navigate('/')}
        >
          ← {t('Bosh sahifaga qaytish')}
        </button>
      </div>
    </div>
  );
}