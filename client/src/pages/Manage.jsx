import { useEffect, useState } from 'react';
import api from '../api';
import { useStore } from '../store';
import { useLanguage } from '../i18n';
import Icon from '../components/Icon';

const STAGES = ['Maktab', 'Tuman', 'Viloyat', 'Respublika'];

export default function Manage() {
  const { subjectId, subjects, refreshSubjects } = useStore();
  const { t } = useLanguage();
  const [years, setYears] = useState([]);
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [newSubject, setNewSubject] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newStage, setNewStage] = useState('Respublika');
  const [newTopic, setNewTopic] = useState('');

  const load = () => {
    if (!subjectId) return;
    Promise.all([
      api.get(`/api/years?subjectId=${subjectId}`),
      api.get(`/api/topics?subjectId=${subjectId}`),
    ]).then(([y, tp]) => { setYears(y); setTopics(tp); }).catch((e) => setError(e.message));
  };
  useEffect(load, [subjectId]);

  const run = (promise, after = load) => {
    setError('');
    promise.then(after).catch((e) => setError(e.message));
  };

  const openEdit = (type, item) => setModal({ type, item, value: type === 'subject' ? item.name : type === 'topic' ? item.name : item.year, stage: item.stage });

  const saveEdit = () => {
    if (!modal) return;
    const { type, item, value, stage } = modal;
    const request = type === 'subject'
      ? api.put(`/api/subjects/${item.id}`, { name: value })
      : type === 'topic'
        ? api.put(`/api/topics/${item.id}`, { name: value })
        : api.put(`/api/years/${item.id}`, { year: value, stage });
    run(request, () => { setModal(null); if (type === 'subject') return refreshSubjects(); load(); });
  };

  const remove = (message, endpoint, after = load) => {
    if (!window.confirm(message)) return;
    run(api.del(endpoint), after);
  };

  return (
    <div>
      <div className="page-head"><div><h1 className="page-title">{t('Boshqaruv')}</h1><p className="page-desc">{t("Kontentni qo'shing, tahrirlang va tartibda saqlang.")}</p></div><span className="badge"><Icon name="settings" size={13} /> {t('Admin panel')}</span></div>
      {error && <div className="alert alert-error"><Icon name="alert" size={16} />{error}</div>}

      <div className="grid-2">
        <section className="card">
          <div className="card-title"><Icon name="book" /> {t('Fanlar')}</div>
          <div className="inline-form">
            <input className="input" placeholder={t('Masalan: Matematika')} value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
            <button className="btn btn-primary" disabled={!newSubject.trim()} onClick={() => run(api.post('/api/subjects', { name: newSubject }), () => { setNewSubject(''); refreshSubjects(); })}><Icon name="plus" size={16} /> {t("Qo'shish")}</button>
          </div>
          <div className="management-list">
            {subjects.map((s) => <div className="management-row" key={s.id}><div className="management-main"><strong>{s.name}</strong><div className="management-meta">{s.questions_count} {t('savol')} · {s.years_count} {t('yil')} · {s.topics_count} {t('mavzu')}</div></div><div className="management-actions"><button className="btn btn-secondary action-icon" title={t('Tahrirlash')} onClick={() => openEdit('subject', s)}><Icon name="pencil" size={15} /></button><button className="btn btn-danger action-icon" title={t("O'chirish")} onClick={() => remove(`“${s.name}” ${t("fanini o'chirasizmi? Barcha bog'liq ma'lumotlar ham o'chadi.")}`, `/api/subjects/${s.id}`, refreshSubjects)}><Icon name="trash" size={15} /></button></div></div>)}
            {!subjects.length && <div className="empty">{t("Hozircha fan qo'shilmagan.")}</div>}
          </div>
        </section>

        <section className="card">
          <div className="card-title"><Icon name="calendar" /> {t('Yillar va bosqichlar')}</div>
          <div className="inline-form">
            <input className="input" type="number" placeholder="2026" value={newYear} onChange={(e) => setNewYear(e.target.value)} />
            <select className="select" value={newStage} onChange={(e) => setNewStage(e.target.value)}>{STAGES.map((s) => <option key={s}>{t(s)}</option>)}</select>
            <button className="btn btn-primary" disabled={!subjectId || !newYear} onClick={() => run(api.post('/api/years', { subjectId, year: newYear, stage: newStage }), () => { setNewYear(''); load(); })}><Icon name="plus" size={16} /> {t("Qo'shish")}</button>
          </div>
          <div className="management-list">
            {years.map((y) => <div className="management-row" key={y.id}><span className="badge">{y.year}</span><div className="management-main"><strong>{t(y.stage)}</strong><div className="management-meta">{y.questions_count} {t('savol')}</div></div><div className="management-actions"><button className="btn btn-secondary action-icon" title={t('Tahrirlash')} onClick={() => openEdit('year', y)}><Icon name="pencil" size={15} /></button><button className="btn btn-danger action-icon" title={t("O'chirish")} onClick={() => remove(`${y.year} (${t(y.stage)}) ${t("ni o'chirasizmi?")}`, `/api/years/${y.id}`)}><Icon name="trash" size={15} /></button></div></div>)}
            {!years.length && <div className="empty">{t("Yil qo'shilmagan.")}</div>}
          </div>
        </section>
      </div>

      <section className="card">
        <div className="card-title"><Icon name="tag" /> {t('Mavzular')}</div>
        <div className="inline-form topic-form">
          <input className="input" placeholder={t('Masalan: Rekursiya')} value={newTopic} onChange={(e) => setNewTopic(e.target.value)} />
          <button className="btn btn-primary" disabled={!subjectId || !newTopic.trim()} onClick={() => run(api.post('/api/topics', { subjectId, name: newTopic }), () => { setNewTopic(''); load(); })}><Icon name="plus" size={16} /> {t("Qo'shish")}</button>
        </div>
        <div className="topic-list">
          {topics.map((tp) => <div className="topic-chip" key={tp.id}><Icon name="tag" size={14} />{tp.name}<span className="topic-chip-count">{tp.questions_count}</span><button className="btn btn-ghost action-icon" title={t('Tahrirlash')} onClick={() => openEdit('topic', tp)}><Icon name="pencil" size={14} /></button><button className="btn btn-ghost action-icon" title={t("O'chirish")} onClick={() => remove(`“${tp.name}” ${t("mavzusini o'chirasizmi?")}`, `/api/topics/${tp.id}`)}><Icon name="x" size={14} /></button></div>)}
          {!topics.length && <div className="empty">{t("Mavzu qo'shilmagan.")}</div>}
        </div>
      </section>

      {modal && <div className="modal-backdrop" onClick={() => setModal(null)}><div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>{modal.type === 'subject' ? t('Fanni tahrirlash') : modal.type === 'topic' ? t('Mavzuni tahrirlash') : t('Yilni tahrirlash')}</h3><button className="btn btn-ghost action-icon" onClick={() => setModal(null)}><Icon name="x" /></button></div>
        <div className="field-group"><label className="field">{modal.type === 'year' ? t('Yil') : t('Nomi')}</label><input className="input" type={modal.type === 'year' ? 'number' : 'text'} value={modal.value} onChange={(e) => setModal({ ...modal, value: e.target.value })} /></div>
        {modal.type === 'year' && <div className="field-group"><label className="field">{t('Bosqich')}</label><select className="select" value={modal.stage} onChange={(e) => setModal({ ...modal, stage: e.target.value })}>{STAGES.map((s) => <option key={s}>{t(s)}</option>)}</select></div>}
        <div className="modal-actions"><button className="btn btn-secondary" onClick={() => setModal(null)}>{t('Bekor qilish')}</button><button className="btn btn-primary" onClick={saveEdit}><Icon name="check" size={16} /> {t('Saqlash')}</button></div>
      </div></div>}
    </div>
  );
}
