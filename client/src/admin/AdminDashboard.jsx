import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useStore } from '../store';
import { useLanguage } from '../i18n';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { subjects } = useStore();
  const { lang, setLang, t } = useLanguage();

  function logout() {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-kicker">FAN OLIMPIADASI</div>
          <h1>{t('Admin Dashboard')}</h1>
          <p>{t('Platformani boshqarish va statistikalarni nazorat qilish.')}</p>
        </div>

        <div className="admin-header-actions">
          <div className="language-switch" role="group" aria-label="Language">
            <button type="button" className={`lang-btn ${lang === 'ru' ? 'active' : ''}`} onClick={() => setLang('ru')}>RU</button>
            <button type="button" className={`lang-btn ${lang === 'uz' ? 'active' : ''}`} onClick={() => setLang('uz')}>UZ</button>
          </div>
          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => navigate('/')}
          >
            <Icon name="home" size={17} />
            {t('Saytga qaytish')}
          </button>

          <button
            type="button"
            className="admin-logout-button"
            onClick={logout}
          >
            {t('Chiqish')}
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Icon name="book" size={21} />
          </div>
          <div>
            <span>{t('Fanlar')}</span>
            <strong>{subjects.length}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Icon name="settings" size={21} />
          </div>
          <div>
            <span>{t('Boshqaruv')}</span>
            <strong>{t('Faol')}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Icon name="upload" size={21} />
          </div>
          <div>
            <span>{t('Import')}</span>
            <strong>{t('Tayyor')}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Icon name="chart" size={21} />
          </div>
          <div>
            <span>{t('Analitika')}</span>
            <strong>{t('Faol')}</strong>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2>{t('Tezkor boshqaruv')}</h2>
            <p>{t('Kerakli bo‘limga tezda o‘ting.')}</p>
          </div>
        </div>

        <div className="admin-actions-grid">
          <button
            type="button"
            className="admin-action-card"
            onClick={() => navigate('/manage')}
          >
            <Icon name="settings" size={23} />
            <div>
              <strong>{t('Fanlar va mavzular')}</strong>
              <span>{t('Fan, yil va mavzularni boshqarish')}</span>
            </div>
            <Icon name="chevronRight" size={18} />
          </button>

          <button
            type="button"
            className="admin-action-card"
            onClick={() => navigate('/questions')}
          >
            <Icon name="book" size={23} />
            <div>
              <strong>{t('Savollar bazasi')}</strong>
              <span>{t('Savollarni ko‘rish va boshqarish')}</span>
            </div>
            <Icon name="chevronRight" size={18} />
          </button>

          <button
            type="button"
            className="admin-action-card"
            onClick={() => navigate('/import')}
          >
            <Icon name="upload" size={23} />
            <div>
              <strong>{t('Import')}</strong>
              <span>{t('Yangi savollarni import qilish')}</span>
            </div>
            <Icon name="chevronRight" size={18} />
          </button>

          <button
            type="button"
            className="admin-action-card"
            onClick={() => navigate('/analysis')}
          >
            <Icon name="chart" size={23} />
            <div>
              <strong>{t('Analitika')}</strong>
              <span>{t('Natijalar va tahlillarni ko‘rish')}</span>
            </div>
            <Icon name="chevronRight" size={18} />
          </button>
        </div>
      </div>

      <div className="admin-info-card">
        <div className="admin-info-icon">
          <Icon name="info" size={20} />
        </div>
        <div>
          <strong>{t('Admin panel')}</strong>
          <p>
            {t('Bu panel orqali Fan Olimpiadasi platformasidagi fanlar, savollar, import va statistikalarni boshqarish mumkin.')}
          </p>
        </div>
      </div>
    </div>
  );
}
