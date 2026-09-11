import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useLanguage } from '../i18n';
import Icon from '../components/Icon';

const LETTERS = ['A', 'B', 'C', 'D'];

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function Practice() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [data] = useState(() =>
    JSON.parse(localStorage.getItem('activePractice') || 'null')
  );
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});   // { questionId: chosenIndex }
  const [flagged, setFlagged] = useState({});   // { questionId: true }
  const [secondsLeft, setSecondsLeft] = useState(() =>
    data?.timed ? Number(data.minutes) * 60 : 0
  );
  const [submitting, setSubmitting] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [warn, setWarn] = useState(false);      // tasdiqlash modali

  useEffect(() => {
    if (!data) navigate('/practice');
  }, [data, navigate]);

  // Taymer
  useEffect(() => {
    if (!data?.timed || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [data, secondsLeft]);

  // Vaqt tugaganda avtomatik yakunlash
  useEffect(() => {
    if (data?.timed && secondsLeft === 0 && !submitting) submit();
  }, [secondsLeft]);

  if (!data) return null;

  const questions = data.questions || [];
  const q = questions[idx];
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.keys(flagged).length;
  const unanswered = questions.length - answeredCount;

  const choose = (i) => setAnswers((a) => ({ ...a, [q.id]: i }));

  const toggleFlag = () =>
    setFlagged((f) => {
      const next = { ...f };
      if (next[q.id]) delete next[q.id];
      else next[q.id] = true;
      return next;
    });

  const submit = () => {
    setSubmitting(true);
    api
      .post('/api/practice/submit', {
        sessionId: data.sessionId,
        answers: questions.map((x) => ({
          questionId: x.id,
          chosen: answers[x.id] ?? null,
        })),
      })
      .then((r) => {
        localStorage.setItem('lastResult', JSON.stringify(r));
        localStorage.removeItem('activePractice');
        navigate('/practice/result');
      })
      .catch(() => setSubmitting(false));
  };

  const tryFinish = () => {
    if (unanswered > 0 || flaggedCount > 0) {
      setWarn(true);
    } else {
      submit();
    }
  };

  // Navigatordagi har bir savol holati
  const getStatus = (question, i) => {
    const isCurrent = i === idx;
    const isAnswered = answers[question.id] !== undefined;
    const isFlagged = flagged[question.id];
    if (isCurrent) return 'current';
    if (isFlagged) return 'flagged';
    if (isAnswered) return 'answered';
    return 'empty';
  };

  if (!q) return null;

  const timerDanger = data?.timed && secondsLeft < 60;
  const timerWarn  = data?.timed && secondsLeft < 300 && secondsLeft >= 60;

  return (
    <div className="practice-shell">

      {/* === YUQORI PANEL === */}
      <div className="quiz-top">
        <div className="quiz-top-left">
          <span className="quiz-progress">
            {t('Savol')} {idx + 1} / {questions.length}
          </span>
          <span className="quiz-meta-chips">
            <span className="chip chip-answered">✓ {answeredCount}</span>
            {flaggedCount > 0 && (
              <span className="chip chip-flagged">⚑ {flaggedCount}</span>
            )}
            {unanswered > 0 && (
              <span className="chip chip-empty">○ {unanswered}</span>
            )}
          </span>
        </div>

        <div className="quiz-top-right">
          {data.timed && (
            <span className={`quiz-timer${timerDanger ? ' danger' : timerWarn ? ' warn' : ''}`}>
              <Icon name="timer" size={15} /> {fmt(secondsLeft)}
            </span>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowNav((v) => !v)}
          >
            <Icon name="grid" size={15} /> {t('Navigator')}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${((idx + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className={`practice-body ${showNav ? 'with-nav' : ''}`}>

        {/* === SAVOL KARTASI === */}
        <div className="quiz-main">
          <div className="card quiz-card">
            {/* Savol meta */}
            <div className="quiz-card-meta">
              {q.topic_name && (
                <span className="badge"><Icon name="tag" size={11} /> {q.topic_name}</span>
              )}
              <span className="badge badge-gray">{q.year} · {t(q.stage)}</span>
              <button
                type="button"
                className={`flag-btn${flagged[q.id] ? ' active' : ''}`}
                title={flagged[q.id] ? t('Belgini olib tashlash') : t('Belgilash (qaytib kelaman)')}
                onClick={toggleFlag}
              >
                <Icon name="flag" size={15} />
                {flagged[q.id] ? t('Belgilangan') : t('Belgilash')}
              </button>
            </div>

            {/* Savol matni */}
            <div className="q-text quiz-question">{q.question_text}</div>
            {q.image_url && (
              <img src={q.image_url} className="quiz-image" alt="" />
            )}

            {/* Javob variantlari */}
            <div className="answers-list">
              {q.options.map((opt, i) => (
                <button
                  type="button"
                  key={i}
                  className={`answer-option${answers[q.id] === i ? ' selected' : ''}`}
                  onClick={() => choose(i)}
                >
                  <span className="answer-letter">{LETTERS[i]}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Harakatlar */}
          <div className="quiz-actions">
            <button
              className="btn btn-secondary"
              disabled={idx === 0}
              onClick={() => setIdx(idx - 1)}
            >
              <Icon name="arrowLeft" size={15} /> {t('Orqaga')}
            </button>

            <div className="spacer" />

            {idx < questions.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setIdx(idx + 1)}>
                {t('Keyingisi')} <Icon name="arrowRight" size={15} />
              </button>
            ) : (
              <button
                className="btn btn-success"
                disabled={submitting}
                onClick={tryFinish}
              >
                {submitting
                  ? t('Baholanmoqda...')
                  : <><Icon name="checkCircle" size={15} /> {t('Testni yakunlash')}</>}
              </button>
            )}
          </div>
        </div>

        {/* === NAVIGATOR PANEL === */}
        {showNav && (
          <aside className="quiz-nav-panel">
            <div className="nav-panel-title">{t('Savollar')}</div>
            <div className="nav-grid">
              {questions.map((question, i) => {
                const status = getStatus(question, i);
                return (
                  <button
                    key={question.id}
                    type="button"
                    className={`nav-btn nav-${status}`}
                    onClick={() => { setIdx(i); setShowNav(false); }}
                    title={`${i + 1}: ${status === 'answered' ? t('Javob berildi') : status === 'flagged' ? t('Belgilangan') : t('Javob berilmadi')}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="nav-legend">
              <span className="legend-item"><span className="nav-btn nav-answered nav-demo">1</span> {t('Javob berildi')}</span>
              <span className="legend-item"><span className="nav-btn nav-flagged nav-demo">2</span> {t('Belgilangan')}</span>
              <span className="legend-item"><span className="nav-btn nav-empty nav-demo">3</span> {t('Javob berilmadi')}</span>
            </div>
          </aside>
        )}
      </div>

      {/* === TASDIQLASH MODALI === */}
      {warn && (
        <div className="modal-backdrop" onClick={() => setWarn(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{t('Testni yakunlash')}</h3>
              <button className="btn btn-ghost action-icon" onClick={() => setWarn(false)}>
                <Icon name="x" />
              </button>
            </div>
            <div className="warn-body">
              {unanswered > 0 && (
                <p className="warn-line">
                  <Icon name="alert" size={16} className="warn-icon" />
                  <strong>{unanswered}</strong> ta savolga javob berилmadi
                </p>
              )}
              {flaggedCount > 0 && (
                <p className="warn-line">
                  <Icon name="flag" size={16} className="warn-icon warn-flag" />
                  <strong>{flaggedCount}</strong> ta savol belgilab qo'yilgan
                </p>
              )}
              <p className="warn-hint">{t('Shunga qaramasdan yakunlaysizmi?')}</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setWarn(false)}>
                {t('Orqaga qaytish')}
              </button>
              <button className="btn btn-success" disabled={submitting} onClick={submit}>
                {submitting ? t('Baholanmoqda...') : t('Yakunlash')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
