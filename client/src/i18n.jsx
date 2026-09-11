import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const translations = {
  ru: {
    'Bosh sahifa':'Главная','Savollar bazasi':'База вопросов','Import':'Импорт','Tahlil':'Анализ','Mashq qilish':'Тренировка','Xato savollar':'Ошибочные вопросы','Statistika':'Статистика','Boshqaruv':'Управление',
    'Asosiy':'Основное','Nazorat':'Контроль','tayyorgarlik platformasi':'платформа подготовки','Olimpiada tayyorgarligi':'Подготовка к олимпиаде','Shaxsiy tayyorgarlik tizimi':'Система индивидуальной подготовки','Bilimingizni tizimli oshiring':'Повышайте знания системно','Faol fan':'Активный предмет','Fan qo\'shing':'Добавьте предмет',
    'Xush kelibsiz':'Добро пожаловать','Olimpiada tayyorgarligingizni bir joyda boshqaring va natijangizni bosqichma-bosqich oshiring.':'Управляйте подготовкой к олимпиаде в одном месте и постепенно повышайте результат.','Tezkor amallar':'Быстрые действия','Eng ko\'p ishlatiladigan bo\'limlarga o\'ting.':'Перейдите к самым часто используемым разделам.',
    'Mashq boshlash':'Начать тренировку','Mavzu, yil yoki xato savollar bo\'yicha test yeching.':'Решайте тесты по теме, году или ошибочным вопросам.','Takrorlanadigan mavzular va o\'xshash savollarni ko\'ring.':'Анализируйте повторяющиеся темы и похожие вопросы.','Savollar importi':'Импорт вопросов','Excel yoki CSV orqali savollarni ommaviy yuklang.':'Массово загружайте вопросы через Excel или CSV.',
    'Jami savollar':'Всего вопросов','Jami urinishlar':'Всего попыток','O\'rtacha aniqlik':'Средняя точность','Xato savollar':'Ошибочные вопросы',
    'Savollarni qidiring, filtrlab ko‘ring va to‘g‘ridan-to‘g‘ri tahrirlang.':'Ищите вопросы, фильтруйте их и редактируйте прямо в таблице.','Yangi savol':'Новый вопрос','Barcha yillar':'Все годы','Barcha mavzular':'Все темы','Savol bo‘yicha qidirish...':'Поиск по вопросу...','Qidirish':'Найти','Savollar topilmadi. Filtrlarni o‘zgartiring yoki yangi savol qo‘shing.':'Вопросы не найдены. Измените фильтры или добавьте новый вопрос.','Savol':'Вопрос','Mavzu':'Тема','Yil':'Год','Amallar':'Действия','Tahrirlash':'Редактировать','O‘chirish':'Удалить','Mavzusiz':'Без темы','Tanlang...':'Выберите...','Savolni tahrirlash':'Редактирование вопроса','Savol va javob variantlarini aniq kiriting.':'Введите вопрос и варианты ответов.','Yil / bosqich *':'Год / этап *','Savol matni *':'Текст вопроса *','Rasm':'Изображение','Yuklanmoqda...':'Загрузка...','Variantlar * · to‘g‘ri javobni belgilang':'Варианты * · отметьте правильный ответ','Manba / izoh':'Источник / комментарий','Bekor qilish':'Отмена','Saqlanmoqda...':'Сохранение...','Saqlash':'Сохранить',
    'Savollar importi':'Импорт вопросов','Excel yoki CSV fayl orqali ko‘p sonli savollarni tez yuklang.':'Быстро загружайте большое количество вопросов через Excel или CSV.','Fayl yuklash':'Загрузка файла','Fayl (.xlsx, .csv)':'Файл (.xlsx, .csv)','Import qilish':'Импортировать','Namuna shablonni yuklab olish':'Скачать шаблон','Fayl formati':'Формат файла','Ustun':'Столбец','Tavsif':'Описание','Misol':'Пример','Olimpiada yili':'Год олимпиады','Bosqich':'Этап','Savol matni':'Текст вопроса','Javob variantlari':'Варианты ответа','To‘g‘ri javob':'Правильный ответ','Izoh / manba':'Комментарий / источник','Yangi yil yoki mavzu avtomatik yaratiladi. Xato qatorlar hisobotda ko‘rsatiladi.':'Новый год или тема создаются автоматически. Ошибочные строки будут показаны в отчёте.','Fayl tanlanmagan':'Файл не выбран','Fan tanlanmagan':'Предмет не выбран',
    'Tahlil':'Анализ','Mavzular bo‘yicha takrorlanish va o‘xshash savollarni ko‘ring.':'Смотрите повторяемость тем и похожие вопросы.','Eng ko‘p uchraydigan mavzular':'Самые часто встречающиеся темы','Hozircha savollar yo‘q.':'Пока нет вопросов.','Mavzu × yil matritsasi':'Матрица тема × год','Yil qo‘shilmagan.':'Годы не добавлены.','O‘xshash savollar qidiruvi':'Поиск похожих вопросов','Savolni tanlang — tizim boshqa yillardagi o‘xshash savollarni matn o‘xshashligi asosida topadi.':'Выберите вопрос — система найдёт похожие вопросы из других лет по текстовой схожести.','Savol tanlang...':'Выберите вопрос...','Qidirilmoqda...':'Поиск...','O‘xshash savol topilmadi.':'Похожие вопросы не найдены.','o‘xshash':'схожесть',
    'Kontentni qo\'shing, tahrirlang va tartibda saqlang.':'Добавляйте, редактируйте и поддерживайте контент в порядке.','Admin panel':'Панель администратора','Fanlar':'Предметы','Masalan: Matematika':'Например: Математика','Qo\'shish':'Добавить','Hozircha fan qo\'shilmagan.':'Предметы пока не добавлены.','savol':'вопрос','Yillar va bosqichlar':'Годы и этапы','Hozircha':'Пока','Mavzular':'Темы','Masalan: Rekursiya':'Например: Рекурсия','Mavzu qo\'shilmagan.':'Темы пока не добавлены.','Fanni tahrirlash':'Редактирование предмета','Mavzuni tahrirlash':'Редактирование темы','Yilni tahrirlash':'Редактирование года','Nomi':'Название',
    'Maqsadingizga mos test turini tanlang.':'Выберите режим теста под вашу цель.','Mashq rejimi':'Режим тренировки','Mavzu bo‘yicha':'По теме','Bitta mavzuni chuqur o‘zlashtiring':'Глубоко изучите одну тему','Yil bo‘yicha':'По году','Muayyan yil testini simulyatsiya qiling':'Симулируйте олимпиаду конкретного года','Aralash':'Смешанный','Barcha savollardan tasodifiy tanlov':'Случайный выбор из всех вопросов','Avval xato qilingan savollarni takrorlang':'Повторите ранее ошибочные вопросы','Sozlamalar':'Настройки','Savollar soni':'Количество вопросов','Vaqt bilan':'С таймером','daqiqa':'минут','Boshlanmoqda...':'Запуск...','Boshlash':'Начать',
    'Avvalgi mashqlarda xato qilingan savollarni qayta mustahkamlang.':'Повторите вопросы, на которых ранее ошибались.','Hozircha xato savollar yo‘q.':'Пока нет ошибочных вопросов.','ta xato savol':'ошибочных вопросов','Barchasini qayta ishlash':'Повторить все','marta xato':'ошибок','Oxirgi:':'Последний раз:','Javoblarni ko‘rish':'Показать ответы','to‘g‘ri javob':'правильный ответ',
    'Tayyorgarlik jarayoningiz va kuchli/zaif mavzular tahlili.':'Анализ подготовки и сильных/слабых тем.','Bazadagi savollar':'Вопросов в базе','To‘g‘ri javoblar':'Правильные ответы','Umumiy aniqlik':'Общая точность','Mavzu bo‘yicha aniqlik':'Точность по темам','Hali test ishlanmagan.':'Тесты пока не проходились.','So‘nggi mashqlar':'Последние тренировки','Hali mashq qilinmagan.':'Тренировки пока не проводились.','Sana':'Дата','Rejim':'Режим','Natija':'Результат','Foiz':'Процент','Mavzu':'Тема','Yil':'Год',
    'Savol':'Вопрос','Javoblangan:':'Отвечено:','Orqaga':'Назад','Keyingisi':'Далее','Testni yakunlash':'Завершить тест','Baholanmoqda...':'Проверка...','Yangi test':'Новый тест','Ajoyib natija!':'Отличный результат!','Yaxshi natija, yana mashq qiling.':'Хороший результат, потренируйтесь ещё.','Xatolarni tahlil qiling va qayta urinib ko‘ring.':'Разберите ошибки и попробуйте ещё раз.','Xato qilingan savollar':'Ошибочные вопросы','sizning javobingiz':'ваш ответ','Xato savollarni qayta ishlash':'Повторить ошибочные вопросы',
    'Maktab':'Школа','Tuman':'Район','Viloyat':'Область','Respublika':'Республика','Rekursiya':'Рекурсия','Algoritmlar':'Алгоритмы',
    'Navigator':'Навигатор','Savollar':'Вопросы','Javob berildi':'Отвечено','Belgilangan':'Отмечен','Javob berilmadi':'Не отвечено',
    'Belgilash (qaytib kelaman)':'Отметить (вернусь)','Belgini olib tashlash':'Снять отметку','Belgilash':'Отметить',
    'Testni yakunlash':'Завершить тест','Shunga qaramasdan yakunlaysizmi?':'Всё равно завершить?',
    'Orqaga qaytish':'Вернуться','Yakunlash':'Завершить'
  },
  uz: {}
};

// Admin panel strings. These are kept in the same dictionary so the
// admin dashboard changes language immediately without waiting for API translation.
Object.assign(translations.ru, {
  'Admin Dashboard': 'Панель администратора',
  'Platformani boshqarish va statistikalarni nazorat qilish.': 'Управление платформой и контроль статистики.',
  'Saytga qaytish': 'Вернуться на сайт',
  'Chiqish': 'Выйти',
  'Faol': 'Активно',
  'Tayyor': 'Готово',
  'Analitika': 'Аналитика',
  'Tezkor boshqaruv': 'Быстрое управление',
  'Kerakli bo‘limga tezda o‘ting.': 'Быстро перейдите в нужный раздел.',
  'Fanlar va mavzular': 'Предметы и темы',
  'Fan, yil va mavzularni boshqarish': 'Управление предметами, годами и темами',
  'Savollarni ko‘rish va boshqarish': 'Просмотр и управление вопросами',
  'Yangi savollarni import qilish': 'Импорт новых вопросов',
  'Natijalar va tahlillarni ko‘rish': 'Просмотр результатов и аналитики',
  'Admin panel': 'Панель администратора',
  'Bu panel orqali Fan Olimpiadasi platformasidagi fanlar, savollar, import va statistikalarni boshqarish mumkin.': 'В этой панели можно управлять предметами, вопросами, импортом и статистикой платформы «Fan Olimpiadasi».',
  'Login yoki parol noto‘g‘ri': 'Неверный логин или пароль',
  'Fan Olimpiadasi boshqaruv tizimi': 'Система управления Fan Olimpiadasi',
  'Admin login': 'Логин администратора',
  'Admin paroli': 'Пароль администратора',
  'Kirish': 'Войти',
  'Bosh sahifaga qaytish': 'Вернуться на главную'
});

// Uzbek is the canonical UI copy; Russian is an additional interface language.
translations.uz = Object.fromEntries(Object.entries(translations.ru).map(([ru, uz]) => [uz, Object.keys(translations.ru).find(k => translations.ru[k] === uz) || uz]));
// The reverse map above is not suitable for duplicate values, so keep canonical Uzbek strings explicitly.
const ruToUz = Object.fromEntries(Object.entries(translations.ru).map(([uz, ru]) => [ru, uz]));
Object.assign(ruToUz, {
  'Панель администратора': 'Admin panel',
  'Admin Dashboard': 'Admin panel',
  'Управление платформой и контроль статистики.': 'Platformani boshqarish va statistikalarni nazorat qilish.',
  'Вернуться на сайт': 'Saytga qaytish',
  'Выйти': 'Chiqish',
  'Активно': 'Faol',
  'Готово': 'Tayyor',
  'Аналитика': 'Analitika',
  'Быстрое управление': 'Tezkor boshqaruv',
  'Быстро перейдите в нужный раздел.': 'Kerakli bo‘limga tezda o‘ting.',
  'Предметы и темы': 'Fanlar va mavzular',
  'Управление предметами, годами и темами': 'Fan, yil va mavzularni boshqarish',
  'Просмотр и управление вопросами': 'Savollarni ko‘rish va boshqarish',
  'Импорт новых вопросов': 'Yangi savollarni import qilish',
  'Просмотр результатов и аналитики': 'Natijalar va tahlillarni ko‘rish',
  'В этой панели можно управлять предметами, вопросами, импортом и статистикой платформы «Fan Olimpiadasi».': 'Bu panel orqali Fan Olimpiadasi platformasidagi fanlar, savollar, import va statistikalarni boshqarish mumkin.',
  'Неверный логин или пароль': 'Login yoki parol noto‘g‘ri',
  'Система управления Fan Olimpiadasi': 'Fan Olimpiadasi boshqaruv tizimi',
  'Логин администратора': 'Admin login',
  'Пароль администратора': 'Admin paroli',
  'Войти': 'Kirish',
  'Вернуться на главную': 'Bosh sahifaga qaytish'
});

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('fo-language') || 'ru');

  const change = (next) => {
    const value = next === 'uz' ? 'uz' : 'ru';
    setLang(value);
    localStorage.setItem('fo-language', value);
  };

  const value = useMemo(() => ({
    lang,
    setLang: change,
    t: (text) => {
      if (text == null) return text;
      const value = String(text);
      return lang === 'ru'
        ? (translations.ru[value] || value)
        : (ruToUz[value] || value);
    },
  }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
