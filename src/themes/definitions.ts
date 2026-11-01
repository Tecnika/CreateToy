import { HolidayTheme } from '../core/domain/HolidayTheme';

export class WorkshopTheme extends HolidayTheme {
  constructor() {
    super({
      id: 'base',
      name: 'Мастерская подарков',
      shortName: 'Мастерская',
      tagline: 'Сувениры, напечатанные с любовью',
      description:
        'Тёплая базовая тема для будней и несезонных заказов. Спокойные цвета, крупные фотографии и акцент на фактуре материала.',
      effect: 'sparkles',
      palette: {
        bg: '#f7f0e6',
        surface: '#fffaf3',
        surface2: '#f1e6d7',
        ink: '#20251f',
        muted: '#6d6a60',
        accent: '#c45d3a',
        accent2: '#2f5d50',
        accentSoft: '#f2d8c9',
        line: '#e6d8c8',
        heroGlow: '#f4b860',
      },
      heroTitle: 'Сувениры, которые хочется',
      heroAccent: 'оставить себе',
      heroNote: 'Печатаем небольшими партиями на 3D-принтере. Выбирайте готовое или собирайте своё.',
      featuredProductIds: ['custom-figure', 'gift-box', 'heart-keychain'],
      dateLabel: 'Круглый год',
    });
  }
}

export class NewYearTheme extends HolidayTheme {
  constructor() {
    super({
      id: 'new-year',
      name: 'Новый год',
      shortName: 'Новый год',
      tagline: 'Подарки под ёлку',
      description:
        'Хвойный вечер, тёплый свет и снег за окном. Тема с глубоким зелёным, золотом и мягким снегопадом.',
      effect: 'snow',
      palette: {
        bg: '#0e2a24',
        surface: '#163a31',
        surface2: '#1e4a3e',
        ink: '#f8f1df',
        muted: '#b7c9bd',
        accent: '#f2b84b',
        accent2: '#d95d39',
        accentSoft: '#2a5044',
        line: '#2f5a4d',
        heroGlow: '#f7d98b',
      },
      heroTitle: 'Подарки, напечатанные',
      heroAccent: 'под ёлку',
      heroNote: 'Снежные фигурки, светильники и именные брелоки. Успевайте к празднику.',
      featuredProductIds: ['snow-family', 'tree-lamp', 'gift-box'],
      dateLabel: '1 декабря — 14 января',
    });
  }
}

export class HalloweenTheme extends HolidayTheme {
  constructor() {
    super({
      id: 'halloween',
      name: 'Тыквенный спас / Хэллоуин',
      shortName: 'Тыквенный спас',
      tagline: 'Уютная жуть и тёплый свет',
      description:
        'Тыквы, летучие мыши и немного магии. Тёмная слива, оранжевый и фиолетовый — для тех, кто любит осень.',
      effect: 'pumpkins',
      palette: {
        bg: '#211326',
        surface: '#2d1a32',
        surface2: '#3b2340',
        ink: '#fff3df',
        muted: '#c9a9c8',
        accent: '#f28c28',
        accent2: '#8e5bd9',
        accentSoft: '#3d2340',
        line: '#4b2c4b',
        heroGlow: '#ff9e3d',
      },
      heroTitle: 'Тыквенный спас',
      heroAccent: 'уже близко',
      heroNote: 'Светильники, брелоки и декор для самого атмосферного вечера осени.',
      featuredProductIds: ['pumpkin-lamp', 'bat-keychain', 'gift-box'],
      dateLabel: '1–31 октября',
    });
  }
}

export class KnowledgeDayTheme extends HolidayTheme {
  constructor() {
    super({
      id: 'knowledge-day',
      name: '1 сентября',
      shortName: '1 сентября',
      tagline: 'Порядок, вдохновение и новый старт',
      description:
        'Светлая школьная тема с клеткой, карандашами и синим акцентом. Для подарков учителям и первоклассникам.',
      effect: 'notebook',
      palette: {
        bg: '#eef5ff',
        surface: '#ffffff',
        surface2: '#e1ecff',
        ink: '#1e2b45',
        muted: '#68758f',
        accent: '#2f6fed',
        accent2: '#f2b84b',
        accentSoft: '#dbe8ff',
        line: '#d4e0f5',
        heroGlow: '#9bc4ff',
      },
      heroTitle: '1 сентября',
      heroAccent: 'без суеты',
      heroNote: 'Органайзеры, именные подарки и мелочи, которые делают школьный день теплее.',
      featuredProductIds: ['school-organizer', 'custom-figure', 'gift-box'],
      dateLabel: '15 августа — 10 сентября',
    });
  }
}

export class ValentineTheme extends HolidayTheme {
  constructor() {
    super({
      id: 'valentine',
      name: '14 февраля',
      shortName: '14 февраля',
      tagline: 'Признание, которое можно потрогать',
      description:
        'Нежные оттенки, сердечки и небольшие подарки. Для тех, кто говорит о чувствах не только словами.',
      effect: 'hearts',
      palette: {
        bg: '#fff1f2',
        surface: '#fff8f8',
        surface2: '#ffe6ea',
        ink: '#3b1f26',
        muted: '#8b6a70',
        accent: '#d94b67',
        accent2: '#f2a7b5',
        accentSoft: '#ffe0e5',
        line: '#f3d3d9',
        heroGlow: '#ffb3c1',
      },
      heroTitle: 'Признание, которое',
      heroAccent: 'можно потрогать',
      heroNote: 'Сердца с именами, парные брелоки и маленькие подарки с большим смыслом.',
      featuredProductIds: ['heart-keychain', 'gift-box', 'custom-figure'],
      dateLabel: '1–14 февраля',
    });
  }
}

export class March8Theme extends HolidayTheme {
  constructor() {
    super({
      id: 'march-8',
      name: '8 марта',
      shortName: '8 марта',
      tagline: 'Цветы, которые не завянут',
      description:
        'Весенняя палитра, лепестки и цветочные композиции. Для мам, бабушек, коллег и любимых.',
      effect: 'petals',
      palette: {
        bg: '#faf2ff',
        surface: '#fff9ff',
        surface2: '#f3e6fb',
        ink: '#3a2542',
        muted: '#806b87',
        accent: '#a85bb5',
        accent2: '#e7a6b8',
        accentSoft: '#f3e0fa',
        line: '#e8d5ef',
        heroGlow: '#d9a7e6',
      },
      heroTitle: 'Цветы, которые',
      heroAccent: 'не завянут',
      heroNote: 'Вазоны, букеты и именные подарки, которые останутся с вами надолго.',
      featuredProductIds: ['flower-vase', 'bouquet', 'gift-box'],
      dateLabel: '1–10 марта',
    });
  }
}

export class February23Theme extends HolidayTheme {
  constructor() {
    super({
      id: 'feb-23',
      name: '23 февраля',
      shortName: '23 февраля',
      tagline: 'Подарок с характером',
      description:
        'Сдержанная мужская тема: тёмный лес, латунь и звёзды. Для тех, кто ценит лаконичные вещи.',
      effect: 'stars',
      palette: {
        bg: '#17261f',
        surface: '#20362c',
        surface2: '#2b4437',
        ink: '#f2f0e6',
        muted: '#a9b8ae',
        accent: '#c9a227',
        accent2: '#5c7a63',
        accentSoft: '#2b4437',
        line: '#355242',
        heroGlow: '#d8bb55',
      },
      heroTitle: 'Подарок',
      heroAccent: 'с характером',
      heroNote: 'Звёзды, брелоки и кастомные фигурки. Без банальных кружек.',
      featuredProductIds: ['star-badge', 'custom-figure', 'gift-box'],
      dateLabel: '10–23 февраля',
    });
  }
}

export class VictoryDayTheme extends HolidayTheme {
  constructor() {
    super({
      id: 'victory-day',
      name: '9 Мая',
      shortName: 'День Победы',
      tagline: 'Память, которую берегут',
      description:
        'Сдержанная тема с георгиевской лентой, золотом и глубоким красным. Без лишней декоративности.',
      effect: 'ribbon',
      palette: {
        bg: '#2a1515',
        surface: '#3a1d1d',
        surface2: '#4a2626',
        ink: '#fff4e5',
        muted: '#d1b0a8',
        accent: '#d6a23a',
        accent2: '#9e2a2b',
        accentSoft: '#4a2626',
        line: '#5a3030',
        heroGlow: '#f0c75e',
      },
      heroTitle: 'Память, которую',
      heroAccent: 'берегут',
      heroNote: 'Сдержанные броши и сувениры, созданные с уважением к дате.',
      featuredProductIds: ['victory-brooch', 'gift-box'],
      dateLabel: '1–9 мая',
    });
  }
}

export class May1Theme extends HolidayTheme {
  constructor() {
    super({
      id: 'may-1',
      name: '1 мая',
      shortName: '1 мая',
      tagline: 'Весна в каждой детали',
      description:
        'Свежая зелень, солнце и лёгкость. Для весенних подарков, венков и декора.',
      effect: 'leaves',
      palette: {
        bg: '#f2f8e9',
        surface: '#fbfff4',
        surface2: '#e2f0d2',
        ink: '#23311f',
        muted: '#6b7c61',
        accent: '#5b8c3e',
        accent2: '#e0a83e',
        accentSoft: '#e2f0d2',
        line: '#d7e6c8',
        heroGlow: '#b9df8a',
      },
      heroTitle: 'Весна',
      heroAccent: 'в каждой детали',
      heroNote: 'Венки, цветы и небольшие подарки для тех, кто ждал тепла.',
      featuredProductIds: ['spring-wreath', 'flower-vase', 'gift-box'],
      dateLabel: '20 апреля — 10 мая',
    });
  }
}

export class EasterTheme extends HolidayTheme {
  constructor() {
    super({
      id: 'easter',
      name: 'Пасха',
      shortName: 'Пасха',
      tagline: 'Светлый праздник в деталях',
      description:
        'Пастельные оттенки, яйца и кролики. Тёплая тема для семейного праздника и подарков близким.',
      effect: 'eggs',
      palette: {
        bg: '#fff8ed',
        surface: '#fffdf8',
        surface2: '#f7e6d6',
        ink: '#3b3228',
        muted: '#8a7a67',
        accent: '#7aa7a1',
        accent2: '#e6b7a6',
        accentSoft: '#f7e6d6',
        line: '#edddc8',
        heroGlow: '#f3d6a6',
      },
      heroTitle: 'Светлый праздник',
      heroAccent: 'в деталях',
      heroNote: 'Кролики, весенние венки и небольшие подарки для всей семьи.',
      featuredProductIds: ['easter-bunny', 'spring-wreath', 'gift-box'],
      dateLabel: 'Пасхальная неделя',
    });
  }
}

export class ProgrammerDayTheme extends HolidayTheme {
  constructor() {
    super({
      id: 'programmer-day',
      name: 'День программиста',
      shortName: 'День программиста',
      tagline: 'Подарок, который компилируется с первого раза',
      description:
        'Терминальная эстетика, зелёный свет и сканирующая линия. Для тех, кто живёт в коде.',
      effect: 'scan',
      palette: {
        bg: '#0b1512',
        surface: '#10201b',
        surface2: '#173329',
        ink: '#d8ffe9',
        muted: '#7da890',
        accent: '#43d17a',
        accent2: '#8be9fd',
        accentSoft: '#173329',
        line: '#214536',
        heroGlow: '#43d17a',
      },
      heroTitle: 'Подарок, который',
      heroAccent: 'компилируется',
      heroNote: 'Брелоки, фигурки и мелочи для тех, кто пишет код. 256-й день года.',
      featuredProductIds: ['code-keychain', 'rocket-keychain', 'custom-figure'],
      dateLabel: '13–14 сентября',
    });
  }
}

export class HolidayRegistry {
  private readonly themes = new Map<string, HolidayTheme>();

  constructor(themes: HolidayTheme[] = []) {
    themes.forEach((theme) => this.register(theme));
  }

  register(theme: HolidayTheme): void {
    this.themes.set(theme.id, theme);
  }

  unregister(id: string): void {
    if (id === 'base') return;
    this.themes.delete(id);
  }

  list(): HolidayTheme[] {
    return Array.from(this.themes.values());
  }

  get(id: string): HolidayTheme | undefined {
    return this.themes.get(id);
  }

  getDefault(): HolidayTheme {
    return this.get('base') ?? this.list()[0];
  }

  static createDefault(): HolidayRegistry {
    return new HolidayRegistry([
      new WorkshopTheme(),
      new NewYearTheme(),
      new HalloweenTheme(),
      new KnowledgeDayTheme(),
      new ValentineTheme(),
      new March8Theme(),
      new February23Theme(),
      new VictoryDayTheme(),
      new May1Theme(),
      new EasterTheme(),
      new ProgrammerDayTheme(),
    ]);
  }
}

export const holidayRegistry = HolidayRegistry.createDefault();
