import {
  AlertTriangle, ArrowRight, BarChart3, BookOpen, Bookmark, CalendarDays, Check, ChevronDown,
  ChevronLeft, ChevronRight, CircleCheck, Clock3, File, Filter, House, Info, Pencil,
  Plus, Search, Settings, Sparkles, Tag, Trash2, Trophy, Upload, X,
} from 'lucide-react';

const icons = {
  home: House, book: BookOpen, upload: Upload, search: Search, pen: Pencil,
  pencil: Pencil, alert: AlertTriangle, chart: BarChart3, settings: Settings,
  trophy: Trophy, plus: Plus, trash: Trash2, x: X, check: Check,
  chevronDown: ChevronDown, chevronRight: ChevronRight, arrowLeft: ChevronLeft,
  arrowRight: ArrowRight, timer: Clock3, filter: Filter, file: File,
  checkCircle: CircleCheck, info: Info, tag: Tag, calendar: CalendarDays,
  sparkle: Sparkles, flag: Bookmark,
};

export default function Icon({ name, size = 18, strokeWidth = 1.9, className = '' }) {
  const Component = icons[name] || Info;
  return <Component size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}
