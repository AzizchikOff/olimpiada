import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useStore } from '../store';
import { useLanguage } from '../i18n';
import Icon from '../components/Icon';

const cards = [
  { to: '/practice', icon: 'pen', title: 'Mashq boshlash', desc: 'Mavzu, yil yoki xato savollar bo\'yicha test yeching.' },
  { to: '/analysis', icon: 'search', title: 'Tahlil', desc: 'Takrorlanadigan mavzular va o\'xshash savollarni ko\'ring.' },
  { to: '/import', icon: 'upload', title: 'Savollar importi', desc: 'Excel yoki CSV orqali savollarni ommaviy yuklang.' },
];

export default function Home() {
  const { subjectId, subjects } = useStore();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [wrongCount, setWrongCount] = useState(0);
  useEffect(() => { if (!subjectId) return; Promise.all([api.get(`/api/stats/${subjectId}`), api.get(`/api/practice/wrong/${subjectId}`)]).then(([s,w]) => { setStats(s); setWrongCount(w.length); }).catch(() => {}); }, [subjectId]);
  const subject = subjects.find((s) => s.id === subjectId);
  const statCards = [
    ['book', stats?.totalQuestions ?? '—', 'Jami savollar'],
    ['pen', stats?.attempted ?? '—', 'Jami urinishlar'],
    ['checkCircle', stats ? `${stats.accuracy}%` : '—', 'O\'rtacha aniqlik'],
    ['alert', wrongCount, 'Xato savollar'],
  ];
  return <div>
    <div className="page-head"><div><h1 className="page-title">{t('Xush kelibsiz')}{subject ? `, ${subject.name}` : ''}</h1><p className="page-desc">{t('Olimpiada tayyorgarligingizni bir joyda boshqaring va natijangizni bosqichma-bosqich oshiring.')}</p></div></div>
    <div className="grid-4 stats-grid">{statCards.map(([icon,value,label]) => <div className="stat-card" key={label}><div className="stat-icon"><Icon name={icon} size={19} /></div><div className="stat-value">{value}</div><div className="stat-label">{t(label)}</div></div>)}</div>
    <div className="section-heading"><div><h2>{t('Tezkor amallar')}</h2><p>{t("Eng ko'p ishlatiladigan bo'limlarga o'ting.")}</p></div></div>
    <div className="grid-3">{cards.map((c) => <Link key={c.to} to={c.to} className="mode-card quick-card"><div className="mode-icon"><Icon name={c.icon} size={20} /></div><div><div className="mode-title">{t(c.title)}</div><div className="mode-desc">{t(c.desc)}</div></div><Icon name="chevronRight" className="quick-arrow" size={17} /></Link>)}</div>
  </div>;
}
