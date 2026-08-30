import type { TranslationKey } from './en';

// Turkish overrides. Only keys that differ from English need an entry — the
// resolver falls back to English for any missing key.
export const tr: Partial<Record<TranslationKey, string>> = {
  // ─── Generic ───
  appName: 'Stellora',
  loading: 'Yükleniyor…',
  close: 'Kapat',
  open: 'Aç',
  cancel: 'İptal',
  save: 'Kaydet',
  reset: 'Sıfırla',
  enable: 'Etkinleştir',
  disable: 'Devre Dışı Bırak',
  on: 'Açık',
  off: 'Kapalı',
  search: 'Ara',
  all: 'Tümü',

  // ─── Galaxy sources ───
  sourceKnowledge: 'Bilgi',
  sourceStellora: 'Stellora',
  sourceAll: 'Tümü',
  galaxySource: 'Galaksi Kaynağı',

  // ─── Per-node source hover tag ───
  nodeSourceLabel: 'KAYNAK',
  sourceBusiness: 'İş',
  sourceOps: 'Operasyon',
  sourceProduct: 'Ürün',
  sourceSourcing: 'Tedarik',
  sourceFinanceCorpus: 'Finans Korpusu',
  sourceStelloraMemory: 'Stellora Anısı',
  sourceMusicGalaxy: 'Müzik Galaksisi',
  sourceGitGalaxy: 'Git Galaksisi',
  sourceMismatchQuestion: 'Kaynak uyuşmuyor mu?',
  sourceMismatchFlagged: 'Uyuşmazlık işaretlendi',
  openAiChat: 'AI Chat aç',

  // ─── Foto/anı detay paneli ───
  photoUnit: 'foto',
  peopleUnit: 'kişi',
  noLocation: 'konum yok',
  noGpsData: "Konum verisi yok (EXIF'te GPS bulunamadı)",
  sceneLabel: 'Sahne',
  editLabel: 'Düzenle',
  doneLabel: 'Bitti',
  previewLabel: 'Önizleme',
  scenePlaceholder: 'Bu fotoğrafta ne oluyordu?',
  tagsPlaceholder: 'etiketler, virgülle ayır…',
  writeScenePrompt: 'Bu fotoğrafta ne oluyordu, yaz…',
  storyLabel: 'Hikaye',
  storyPlaceholder: 'Bu günün hikayesini yaz… (markdown + [[wikilink]] destekli)',
  writeStoryPrompt: 'Bu günün hikayesini yaz…',
  peopleLabel: 'Kişiler',
  peoplePlaceholder: 'virgülle ayırarak isim ekle…',
  photosOfDay: 'Bu günün fotoğrafları',

  // ─── Dock panelleri: Dashboard / Systems / Orbs / Analytics / Archive ───
  overview: 'Genel bakış',
  totalNodes: 'Toplam Node',
  searchIndexLabel: 'Arama İndeksi',
  connectionsLabel: 'Bağlantı',
  memoryDaysLabel: 'Anı Günü',
  activeSourceLabel: 'Aktif Kaynak',
  archivedMemoriesLabel: 'arşivlenmiş anı var',
  goToArchive: "ARCHIVE'a git",
  noNodesYet: 'Henüz node yok.',
  generalLabel: 'Genel',
  bySourceLabel: 'Kaynağa Göre',
  byTypeLabel: 'Tipe Göre',
  topTagsLabel: 'En Sık Etiketler',
  memoryMarksLabel: 'Anı İşaretleri',
  noArchivedMemories: 'Arşivlenmiş anı yok. Bir anıyı panelde 🕓 ile işaretleyerek buraya taşıyabilirsin.',
  removeFromArchive: 'Arşivden çıkar',
  modelNamePlaceholder: 'model adı',
  emptyReply: '(boş cevap)',

  // ─── Settings panel ───
  settings: 'Ayarlar',
  settingsFeatures: 'Özellikler',
  settingsAppearance: 'Görünüm',
  settingsLanguage: 'Dil',
  settingsTheme: 'Tema',
  settingsData: 'Veri',
  langAuto: 'Otomatik (algıla)',
  langEn: 'İngilizce',
  langTr: 'Türkçe',
  themeDark: 'Koyu',
  themeLight: 'Açık',
  themeAurora: 'Aurora',
  themeCustom: 'Özel',

  // ─── Feature labels ───
  featFinance3D: 'Finans Korpusunu 3D’de Göster',
  featFinance3DDesc: '1.661 dosyalık ekonomi/finans referans arşivini 3D düğüm olarak render et.',
  featTimeline: 'Zaman Çizelgesi Görünümü',
  featTimelineDesc: 'Düğümlerde tarihe göre gezinmek için zamansal eksen ekle.',
  featMusic: 'Müzik Galaksisi',
  featMusicDesc: 'Yerel bir müzik klasörünü galaksiye dönüştür (foto galerisi gibi).',
  featGit: 'Git Galaksisi',
  featGitDesc: 'Bir GitHub deposunu çek ve commit’lerini düğüm olarak render et.',
  featCollab: 'İşbirliği Modu',
  featCollabDesc: 'Galaksiyi BroadcastChannel ile sekmeler arası senkronla.',
  featExport: 'Dışa / İçe Aktar',
  featExportDesc: 'Tüm galaksiyi JSON dosyası olarak kaydet veya yükle.',

  // ─── Finance ───
  financeCount: 'Finans makalesi',
  financeNotice: 'Finans korpusu aranabilir. 3D’de göstermek için "Finans Korpusunu 3D’de Göster"i aç.',

  // ─── Music ───
  musicFolder: 'Müzik klasörü',
  musicAddHint: 'Ses dosyalarını src/data/music/ içine at — otomatik görünür.',

  // ─── Git ───
  gitRepoUrl: 'Depo URL’si',
  gitFetch: 'Commit’leri Çek',
  gitPlaceholder: 'https://github.com/sahip/repo',

  // ─── Export / Import ───
  exportJson: 'JSON Dışa Aktar',
  importJson: 'JSON İçe Aktar',

  // ─── Collaborative ───
  collabActive: 'İşbirliği modu aktif — değişiklikler sekmeler arasında senkronlanır.',

  // ─── Dock tabs ───
  tabDashboard: 'Kontrol Paneli',
  tabGalaxy: 'Galaksi',
  tabSystems: 'Sistemler',
  tabOrbs: 'Uydular',
  tabAnalytics: 'Analitik',
  tabArchive: 'Arşiv',
  tabSettings: 'Ayarlar',
};
