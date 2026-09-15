import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useLanguage } from '../i18n';
import api from '../api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/admin/login', { login, password });
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin');
    } catch (err) {
      setError(err.message || "Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
          />

          <label>{t('Parol')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('Admin paroli')}
            autoComplete="current-password"
            disabled={loading}
          />

          {error && <div className="admin-login-error">{error}</div>}

          <button type="submit" className="admin-login-button" disabled={loading}>
            {loading ? t('Tekshirilmoqda...') : t('Kirish')}
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