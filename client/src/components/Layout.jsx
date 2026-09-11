import { NavLink, Outlet } from 'react-router-dom';
import { useStore } from '../store';
import Icon from './Icon';
import { useLanguage } from '../i18n';

const links = [
  { to: '/', icon: 'home', label: 'Bosh sahifa' },
  // { to: '/questions', icon: 'book', label: 'Savollar bazasi' },
  // { to: '/import', icon: 'upload', label: 'Import' },
  { to: '/analysis', icon: 'search', label: 'Tahlil' },
  { to: '/practice', icon: 'pen', label: 'Mashq qilish' },
  { to: '/wrong', icon: 'alert', label: 'Xato savollar' },
  { to: '/stats', icon: 'chart', label: 'Statistika' },
  // { to: '/manage', icon: 'settings', label: 'Boshqaruv' },
];

export default function Layout() {
  const { subjects, subjectId, setSubjectId } = useStore();
  const { lang, setLang, t } = useLanguage();
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark"><Icon name="trophy" size={21} /></div>
          <div className="logo-copy"><div className="logo-title">Fan Olimpiadasi</div><div className="logo-sub">{t('tayyorgarlik platformasi')}</div></div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-title">{t('Asosiy')}</div>
          {links.slice(0, 5).map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon name={l.icon} size={18} /> <span>{t(l.label)}</span>
            </NavLink>
          ))}
          {/* <div className="nav-section-title">{t('Nazorat')}</div>
          {links.slice(5).map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon name={l.icon} size={18} /> <span>{t(l.label)}</span>
            </NavLink>
          ))} */}
        </nav>
        <div className="sidebar-footer">{t('Olimpiada tayyorgarligi')}</div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div><div className="topbar-kicker">{t('Shaxsiy tayyorgarlik tizimi')}</div><div className="topbar-title">{t('Bilimingizni tizimli oshiring')}</div></div>
          <div className="topbar-right"><div className="language-switch" role="group" aria-label="Language"><button type="button" className={`lang-btn ${lang==='ru'?'active':''}`} onClick={()=>setLang('ru')}>RU</button><button type="button" className={`lang-btn ${lang==='uz'?'active':''}`} onClick={()=>setLang('uz')}>UZ</button></div>
            <label className="subject-label" htmlFor="subject-select">{t('Faol fan')}</label>
            <div className="subject-select-wrap"><Icon name="book" size={16} /><select id="subject-select" className="select subject-select" value={subjectId} onChange={(e) => setSubjectId(Number(e.target.value))}>
              {!subjects.length && <option value={0}>{t("Fan qo'shing")}</option>}
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select><Icon name="chevronDown" size={15} className="select-chevron" /></div>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
