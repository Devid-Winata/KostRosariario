'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Check, ShieldAlert, MessageCircle, 
  Wind, Shirt, Sparkles, Info, ChevronLeft, ChevronRight, 
  Volume2, VolumeX, ArrowRight, Maximize2, X, Phone,
  Ruler, Zap
} from 'lucide-react';
import Papa from 'papaparse';

// ⚠️ LINK CSV GOOGLE SHEETS
const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRenNFu1mmE5ur840SK5NZBbj_lFtBtTjLlIILqybvQXn4YZg1JPAkKQ0mZgUQ7NOe1aQOoo_vxol80/pub?output=csv";

export default function Home() {
  const [activeTab, setActiveTab] = useState('AC');
  const [sheetData, setSheetData] = useState({
    AC: { stock: 0, price: 'Rp 1.500.000' },
    'Non-AC': { stock: 0, price: 'Rp 1.000.000' },
    Lama: { stock: 0, price: 'Rp 800.000' }
  });
  const [loading, setLoading] = useState(true);

  // State Slider Utama Atas
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // State Modal Fullscreen Video & Foto Kamar
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // State Slider Foto Kamar Spesifik
  const [roomImageIndex, setRoomImageIndex] = useState(0);

  // FETCH DATA REAL-TIME + AUTO-REFRESH TIAP 10 DETIK
  useEffect(() => {
    const fetchSheetData = () => {
      if (GOOGLE_SHEETS_CSV_URL && !GOOGLE_SHEETS_CSV_URL.includes("PASTE_LINK")) {
        // Trik Anti-Cache: Menambahkan timestamp unik agar browser selalu ambil data terbaru dari Google Sheets
        const freshUrl = `${GOOGLE_SHEETS_CSV_URL}&_t=${Date.now()}`;

        Papa.parse(freshUrl, {
          download: true,
          header: true,
          complete: (results) => {
            const parsedData = {};
            results.data.forEach((row) => {
              if (row['Tipe Kamar']) {
                const key = row['Tipe Kamar'].trim();
                parsedData[key] = {
                  stock: parseInt(row['Stok']) || 0,
                  price: row['Harga'] ? row['Harga'].trim() : ''
                };
              }
            });
            setSheetData((prev) => ({ ...prev, ...parsedData }));
            setLoading(false);
          },
          error: () => setLoading(false)
        });
      } else {
        setLoading(false);
      }
    };

    // Panggil pertama kali saat komponen dimuat
    fetchSheetData();

    // Auto-update otomatis tiap 10 detik (Real-time sync)
    const interval = setInterval(fetchSheetData, 10000);

    return () => clearInterval(interval);
  }, []);

  // Kunci Scroll Layar Saat Modal Terbuka
  useEffect(() => {
    if (isVideoModalOpen || isImageModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isVideoModalOpen, isImageModalOpen]);

  // Data Slider Utama Atas
  const mediaGallery = [
    { type: 'image', src: '/luar.webp', title: 'Tampak Depan' },
    { type: 'image', src: '/umum.webp', title: 'Area Bersama & Balkon' },
    { type: 'image', src: '/samping.webp', title: 'Tampak Samping' },
  ];

  // Detail & Foto Spesifik Masing-masing Kamar
  const roomDetails = {
    AC: {
      name: 'Kamar AC (BARU)',
      defaultPrice: 'Rp 1.500.000',
      period: '/ bulan',
      size: '3 x 5 Meter',
      electricityNote: 'Listrik menggunakan token / meteran mandiri (biaya di luar harga sewa).',
      images: ['/ac-2.webp', '/ac-3.webp', '/ac-1.webp'],
      specs: ['AC', 'Kasur', 'Lemari / Storage', 'Jendela', 'Ventilasi', 'Bantal & Guling'],
      bathroom: ['Kamar Mandi Dalam', 'Kloset Jongkok', 'Shower', 'Ember Mandi', 'Wastafel']
    },
    'Non-AC': {
      name: 'Kamar Non-AC (BARU)',
      defaultPrice: 'Rp 1.000.000',
      period: '/ bulan',
      size: '3 x 5 Meter',
      electricityNote: 'Listrik menggunakan token / meteran mandiri (biaya di luar harga sewa).',
      images: ['/nonac-1.webp', '/nonac-2.webp'],
      specs: ['Kipas Angin', 'Kasur', 'Lemari / Storage', 'Jendela', 'Ventilasi', 'Bantal & Guling', 'Wastafel'],
      bathroom: ['Kamar Mandi Dalam', 'Kloset Jongkok', 'Shower', 'Ember Mandi']
    },
    Lama: {
      name: 'Kamar Tipe Lama',
      defaultPrice: 'Rp 800.000',
      period: '/ bulan',
      size: '3 x 5 Meter',
      electricityNote: 'Listrik menggunakan token / meteran mandiri (biaya di luar harga sewa).',
      images: ['/lama-1.webp', '/lama-2.webp'],
      specs: ['AC', 'Kasur', 'Kursi plastik', 'Jendela', 'Ventilasi'],
      bathroom: ['Kamar Mandi Dalam', 'Kloset Jongkok', 'Ember Mandi', 'Wastafel dalam kamar']
    }
  };

  const currentRoom = roomDetails[activeTab];
  const currentStock = sheetData[activeTab]?.stock ?? 0;
  const currentPrice = sheetData[activeTab]?.price || currentRoom.defaultPrice;

  // PERHITUNGAN TOTAL STOK GABUNGAN (AC + Non-AC + Lama)
  const totalStock = Object.values(sheetData).reduce((acc, curr) => acc + (curr.stock || 0), 0);

  useEffect(() => {
    setRoomImageIndex(0);
  }, [activeTab]);

  // AUTO SLIDE: Slider Utama
  useEffect(() => {
    if (mediaGallery[currentSlide]?.type === 'video' || isVideoModalOpen) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === mediaGallery.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, mediaGallery.length, isVideoModalOpen]);

  // AUTO SLIDE: Foto Kamar
  useEffect(() => {
    if (!currentRoom.images || currentRoom.images.length <= 1 || isImageModalOpen) return;
    const timer = setInterval(() => {
      setRoomImageIndex((prev) => (prev === currentRoom.images.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [activeTab, roomImageIndex, currentRoom.images.length, isImageModalOpen]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === mediaGallery.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? mediaGallery.length - 1 : prev - 1));

  const nextRoomImage = () => setRoomImageIndex((prev) => (prev === currentRoom.images.length - 1 ? 0 : prev + 1));
  const prevRoomImage = () => setRoomImageIndex((prev) => (prev === 0 ? currentRoom.images.length - 1 : prev - 1));

  const handleWhatsApp = () => {
    const text = `Halo Admin Kost Rosa Ria Rio, saya berminat dengan ${currentRoom.name} (${currentPrice}/bulan). Apakah stok masih tersedia?`;
    window.open(`https://wa.me/6281294509239?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleImageError = (e) => {
    e.currentTarget.src = 'https://placehold.co/800x600/e7e5e4/78716c?text=Foto+Belum+Diunggah';
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#F5EFE6] via-[#FDFBF7] to-[#EFEBE4] text-stone-800 font-sans selection:bg-[#C68B59] selection:text-white flex flex-col justify-between overflow-x-hidden">
      
      {/* BACKGROUND DECORATIVE ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] left-[-10%] w-[400px] sm:w-[550px] h-[400px] sm:h-[550px] bg-[#C68B59]/25 rounded-full blur-[70px] sm:blur-[90px]" />
        <div className="absolute top-[10%] right-[-10%] w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] bg-[#4A5D4E]/20 rounded-full blur-[80px] sm:blur-[100px]" />
        <div className="absolute top-[50%] left-[-8%] w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] bg-[#8C5E3C]/15 rounded-full blur-[70px] sm:blur-[90px]" />
        <div 
          className="absolute inset-0 opacity-[0.1]"
          style={{ backgroundImage: `radial-gradient(#8C5E3C 1.5px, transparent 1.5px)`, backgroundSize: '24px 24px' }}
        />
      </div>

      {/* WRAPPER KONTEN UTAMA */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-10 w-full flex-grow">
        
        {/* NAVIGATION BAR */}
        <nav className="flex items-center justify-between py-3 sm:py-4 mb-8 sm:mb-12 border-b border-stone-300/60 backdrop-blur-xs gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl overflow-hidden shadow-sm shrink-0 bg-white flex items-center justify-center border border-stone-200">
              <img src="/logo.png" alt="Logo Kost Rosa" className="w-full h-full object-cover scale-150" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-[14px] sm:text-lg font-bold text-stone-900 leading-none mb-0.5 sm:mb-1 truncate">
                Kost Rosa Ria Rio
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#A67B5B] font-semibold leading-none">
                Residence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* BADGE TOTAL STOK ATAS */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 border text-[10px] sm:text-xs font-semibold rounded-full ${
              loading 
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : totalStock > 0 
                  ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900' 
                  : 'bg-rose-100/80 border-rose-300 text-rose-900'
            }`}>
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  loading ? 'bg-amber-400' : totalStock > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 ${
                  loading ? 'bg-amber-500' : totalStock > 0 ? 'bg-emerald-600' : 'bg-rose-600'
                }`}></span>
              </span>
              <span>
                {loading ? 'Mengecek stok kamar...' : totalStock > 0 ? `Tersedia ${totalStock} Kamar` : 'Kamar Penuh'}
              </span>
            </div>

            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#4A5D4E] hover:bg-[#3D4E41] text-white rounded-full transition shadow-md text-[11px] sm:text-xs font-medium cursor-pointer shrink-0"
            >
              <MessageCircle size={14} className="sm:w-[15px] sm:h-[15px]" />
              <span className="hidden sm:inline">Tanya Admin</span>
              <span className="sm:hidden">Tanya</span>
            </button>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-12 items-center mb-10 sm:mb-16">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#A67B5B] font-semibold mb-2 sm:mb-3">
              Hunian Nyaman & Strategis
            </span>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-stone-900 leading-[1.2] tracking-tight mb-3 sm:mb-4">
              Bingung Cari Kos? <br />
              <span className="font-semibold text-[#8C5E3C]">Di Sinilah Tempat yang Tepat.</span>
            </h1>
            
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6 max-w-lg">
              Temukan kenyamanan istirahat terbaik di lingkungan yang tenang, bersih, dan aman. Lokasi strategis di Semabung Lama dengan fasilitas lengkap sesuai kebutuhanmu.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 sm:mb-8">
              <button
                onClick={() => document.getElementById('pilihan-kamar')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-5 py-3.5 sm:px-6 sm:py-3.5 bg-[#4A5D4E] hover:bg-[#3D4E41] text-white rounded-full font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer shrink-0"
              >
                <span>Lihat Pilihan Kamar</span>
                <ArrowRight size={16} />
              </button>

              <a 
                href="https://maps.app.goo.gl/NC1kN8iTXgq1XJxN8" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-4 py-3 sm:px-4 sm:py-2.5 bg-white/90 hover:bg-white text-stone-800 rounded-2xl border border-stone-200/90 hover:border-[#8C5E3C] shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#8C5E3C] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 group-hover:bg-[#724a2d] transition-all">
                  <MapPin size={16} className="animate-bounce" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-900 text-xs sm:text-sm leading-none">Semabung Lama</span>
                    <span className="text-[9px] sm:text-[10px] bg-[#8C5E3C]/10 text-[#8C5E3C] font-semibold px-1.5 py-0.5 rounded-full">Maps</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-normal mt-0.5 flex items-center gap-1 group-hover:text-[#8C5E3C] transition-colors">
                    <span>Petunjuk arah lokasi</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </span>
                </div>
              </a>
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-stone-300/60">
              {['Lingkungan Tenang', 'Akses Jam Malam', 'Bebas Banjir', 'Kamar Mandi Dalam'].map((tag, i) => (
                <span key={i} className="px-3 py-1.5 sm:px-3 sm:py-1.5 bg-white/80 border border-stone-300/80 rounded-full text-[11px] text-stone-700 font-medium shadow-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative w-full h-[260px] sm:h-[400px] md:h-[440px] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-stone-900 shadow-xl border-[3px] sm:border-4 border-white group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full relative"
                >
                  {mediaGallery[currentSlide].type === 'video' ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-stone-950 overflow-hidden">
                      <video
                        src={mediaGallery[currentSlide].src}
                        autoPlay loop muted playsInline
                        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none"
                      />
                      <video
                        src={mediaGallery[currentSlide].src}
                        autoPlay loop muted={isMuted} playsInline preload="metadata"
                        className="relative z-10 w-full h-full object-contain sm:object-cover cursor-pointer"
                        onClick={() => setIsVideoModalOpen(true)}
                      />
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 z-20">
                        <button
                          onClick={() => setIsVideoModalOpen(true)}
                          className="flex items-center gap-1 bg-black/60 hover:bg-black/80 text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full backdrop-blur-md transition text-[11px] sm:text-xs font-medium cursor-pointer"
                          aria-label="Layar Penuh Video"
                        >
                          <Maximize2 size={12} />
                          <span>Layar Penuh</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                          className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition cursor-pointer"
                          aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
                        >
                          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={mediaGallery[currentSlide].src}
                      alt={mediaGallery[currentSlide].title}
                      loading="lazy" onError={handleImageError}
                      className="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none z-10" />
                  
                  <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 z-20 text-white pointer-events-none">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider bg-[#8C5E3C] px-2.5 py-1 rounded-full font-medium">
                      {mediaGallery[currentSlide].type === 'video' ? 'Video Tour' : 'Suasana Kos'}
                    </span>
                    <h3 className="text-sm sm:text-lg font-medium mt-1.5">
                      {mediaGallery[currentSlide].title}
                    </h3>
                  </div>
                </motion.div>
              </AnimatePresence>

              <button
                onClick={prevSlide}
                className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-800 p-2 sm:p-2.5 rounded-full backdrop-blur-md transition shadow-md z-20 cursor-pointer"
                aria-label="Slide Sebelumnya"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-800 p-2 sm:p-2.5 rounded-full backdrop-blur-md transition shadow-md z-20 cursor-pointer"
                aria-label="Slide Selanjutnya"
              >
                <ChevronRight size={18} />
              </button>

              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-1.5 z-20">
                {mediaGallery.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${currentSlide === idx ? 'w-4 sm:w-5 bg-white' : 'w-1.5 bg-white/50'}`}
                    aria-label={`Pindah ke slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SEKSI PILIHAN KAMAR */}
        <div id="pilihan-kamar" className="scroll-mt-6 sm:scroll-mt-8">
          <section className="mb-4 sm:mb-6">
            <div className="flex p-1 bg-stone-300/60 rounded-full max-w-[320px] sm:max-w-md mx-auto sm:mx-0">
              {['AC', 'Non-AC', 'Lama'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-full transition-all relative cursor-pointer ${
                    activeTab === tab ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div layoutId="activeTabBadge" className="absolute inset-0 bg-white rounded-full shadow-sm" transition={{ type: 'spring', duration: 0.3 }} />
                  )}
                  <span className="relative z-10">Tipe {tab}</span>
                </button>
              ))}
            </div>
          </section>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
              className="bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-md mb-6 sm:mb-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-5">
                
                {/* SLIDER FOTO KAMAR */}
                <div className="lg:col-span-5 order-1 lg:order-2">
                  <div className="relative w-full h-[240px] sm:h-[320px] rounded-xl sm:rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/60 group">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={roomImageIndex} src={currentRoom.images[roomImageIndex]} alt={`Foto ${currentRoom.name}`}
                        initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.25 }}
                        className="w-full h-full object-cover cursor-pointer" onClick={() => setIsImageModalOpen(true)}
                      />
                    </AnimatePresence>
                    <button
                      onClick={() => setIsImageModalOpen(true)}
                      className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition shadow-md z-10 cursor-pointer"
                      aria-label="Lihat foto penuh"
                    >
                      <Maximize2 size={14} />
                    </button>
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-medium z-10 pointer-events-none">
                      Foto {roomImageIndex + 1} / {currentRoom.images.length}
                    </div>
                    {currentRoom.images.length > 1 && (
                      <>
                        <button onClick={prevRoomImage} className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-800 p-2 rounded-full backdrop-blur-md transition shadow-md z-10 cursor-pointer" aria-label="Foto Kamar Sebelumnya">
                          <ChevronLeft size={16} />
                        </button>
                        <button onClick={nextRoomImage} className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-800 p-2 rounded-full backdrop-blur-md transition shadow-md z-10 cursor-pointer" aria-label="Foto Kamar Selanjutnya">
                          <ChevronRight size={16} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                          {currentRoom.images.map((_, idx) => (
                            <button key={idx} onClick={() => setRoomImageIndex(idx)} className={`h-1.5 rounded-full transition-all cursor-pointer ${roomImageIndex === idx ? 'w-4 sm:w-5 bg-white' : 'w-1.5 bg-white/60'}`} aria-label={`Foto ${idx + 1}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* INFO & FASILITAS KAMAR */}
                <div className="lg:col-span-7 flex flex-col order-2 lg:order-1">
                  <div className="flex flex-col mb-4 sm:mb-6 border-b border-stone-100 pb-4 sm:pb-6">
                    
                    {/* BARIS NAMA KAMAR & UKURAN */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h2 className="text-xl sm:text-2xl font-normal text-stone-900">{currentRoom.name}</h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100/90 border border-stone-200 rounded-md text-[11px] sm:text-xs font-medium text-stone-700">
                        <Ruler size={13} className="text-[#8C5E3C]" />
                        <span>Ukuran {currentRoom.size}</span>
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 mt-1">
                      {/* HARGA DINAMIS DARI GOOGLE SHEETS */}
                      <span className="text-2xl sm:text-3xl font-semibold text-[#8C5E3C]">{currentPrice}</span>
                      <span className="text-stone-400 text-xs sm:text-sm">{currentRoom.period}</span>
                    </div>

                    {/* BADGE STOK PADA DETAIL KAMAR */}
                    <div className="mt-3">
                      {loading ? (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-50 border border-amber-200/80 text-amber-800 rounded-full text-xs sm:text-sm font-semibold">
                          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-amber-500"></span>
                          </span>
                          <span>Mengecek stok kamar...</span>
                        </div>
                      ) : currentStock > 0 ? (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-emerald-50 border border-emerald-200/80 text-emerald-800 rounded-full text-xs sm:text-sm font-semibold">
                          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500"></span>
                          </span>
                          <Sparkles size={14} className="text-emerald-600 shrink-0" />
                          <span>Kamar ini tersisa <strong className="font-bold">{currentStock} Kamar</strong></span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-rose-50 border border-rose-200/80 text-rose-700 rounded-full text-xs sm:text-sm font-semibold">
                          <Info size={14} className="text-rose-500 shrink-0" />
                          <span>Kamar Penuh</span>
                        </div>
                      )}
                    </div>

                    {/* INFORMASI LISTRIK (BAHASA HALUS & SOPAN) */}
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50/80 border border-amber-200/70 rounded-xl text-[11px] sm:text-xs text-amber-900 font-medium">
                      <Zap size={14} className="text-amber-600 shrink-0" />
                      <span>{currentRoom.electricityNote}</span>
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-2">
                    <div>
                      <h3 className="text-[11px] sm:text-xs uppercase tracking-wider text-[#A67B5B] font-semibold mb-2 sm:mb-3 flex items-center gap-1.5">
                        <Wind size={14} className="shrink-0" /> Fasilitas Kamar
                      </h3>
                      <ul className="space-y-1.5 sm:space-y-2">
                        {currentRoom.specs.map((spec, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-[11px] sm:text-sm text-stone-600">
                            <Check size={14} className="text-[#8C5E3C] shrink-0" />
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-[11px] sm:text-xs uppercase tracking-wider text-[#A67B5B] font-semibold mb-2 sm:mb-3 flex items-center gap-1.5">
                        <Sparkles size={14} className="shrink-0" /> Kamar Mandi
                      </h3>
                      <ul className="space-y-1.5 sm:space-y-2">
                        {currentRoom.bathroom.map((item, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-[11px] sm:text-sm text-stone-600">
                            <Check size={14} className="text-[#8C5E3C] shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

              </div>

              {/* PERATURAN KOS (DIPINDAHKAN KE ATAS TOMBOL WA) */}
              <div className="mt-4 mb-4 p-4 sm:p-5 bg-stone-50/90 border border-stone-200/80 rounded-xl sm:rounded-2xl">
                <h3 className="text-xs sm:text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2 border-b border-stone-200/60 pb-2">
                  <ShieldAlert size={16} className="text-[#A67B5B]" /> Peraturan Kos
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-stone-600">
                  <li className="flex items-start gap-2 leading-relaxed">
                    <Info size={14} className="text-[#A67B5B] shrink-0 mt-0.5" />
                    <span>Maksimal 1 orang/kamar (Bukan pasutri & dilarang membawa anak).</span>
                  </li>
                  <li className="flex items-start gap-2 leading-relaxed">
                    <Info size={14} className="text-[#A67B5B] shrink-0 mt-0.5" />
                    <span>Ada jam malam penghuni & tamu (Tamu menginap harap mengabari dan memberi info).</span>
                  </li>
                  <li className="flex items-start gap-2 leading-relaxed">
                    <Info size={14} className="text-[#A67B5B] shrink-0 mt-0.5" />
                    <span>Dilarang membawa hewan peliharaan & dilarang merokok di kamar.</span>
                  </li>
                </ul>
              </div>

              {/* BUTTON WHATSAPP FULL WIDTH */}
              <button
                onClick={handleWhatsApp} disabled={loading || currentStock === 0}
                className={`w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-medium text-xs sm:text-base flex items-center justify-center gap-2 transition ${
                  loading
                    ? 'bg-stone-200 text-stone-400 cursor-wait'
                    : currentStock > 0 
                      ? 'bg-[#4A5D4E] hover:bg-[#3D4E41] text-white shadow-sm cursor-pointer' 
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <MessageCircle size={16} />
                {loading ? 'Memuat data...' : currentStock > 0 ? `Pesan ${currentRoom.name} via WhatsApp` : 'Kamar Tidak Tersedia'}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* INFORMASI FASILITAS UMUM & PARKIR (WITH PHOTO CARDS) */}
        <div className="mb-12 sm:mb-16">
          <div className="bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-md">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 sm:pb-4 mb-5">
              <h3 className="text-base sm:text-lg font-medium text-stone-900 flex items-center gap-2">
                <Shirt size={18} className="text-[#A67B5B]" /> Fasilitas Umum & Area Bersama
              </h3>
              <span className="text-[10px] sm:text-xs text-[#8C5E3C] font-semibold bg-[#8C5E3C]/10 px-2.5 py-1 rounded-full">
                Bisa Dipakai Bersama
              </span>
            </div>

            {/* GRID FOTO FASILITAS UMUM */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-5">
              
              {/* KARTU 1: DAPUR & WASTAFEL */}
              <div className="bg-stone-50 border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all">
                <div className="relative w-full h-44 sm:h-48 bg-stone-200">
                  <img 
                    src="/dapur.webp" 
                    alt="Dapur Umum & Wastafel" 
                    onError={handleImageError}
                    className="w-full h-full object-cover" 
                  />
                  <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                    Dapur & Wastafel
                  </span>
                </div>
                <div className="p-3.5">
                  <h4 className="font-semibold text-stone-800 text-xs sm:text-sm">Wastafel & Dapur Umum</h4>
                  <p className="text-stone-500 text-[11px] sm:text-xs mt-1 leading-relaxed">
                    Dilengkapi wastafel cuci piring & area dapur bersih untuk memasak harian.
                  </p>
                </div>
              </div>

              {/* KARTU 2: KURSI & MEJA BERSAMA */}
              <div className="bg-stone-50 border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all">
                <div className="relative w-full h-44 sm:h-48 bg-stone-200">
                  <img 
                    src="/kursi.webp" 
                    alt="Kursi & Meja Bersama" 
                    onError={handleImageError}
                    className="w-full h-full object-cover" 
                  />
                  <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                    Ruang Bersama
                  </span>
                </div>
                <div className="p-3.5">
                  <h4 className="font-semibold text-stone-800 text-xs sm:text-sm">Kursi & Meja Bersama</h4>
                  <p className="text-stone-500 text-[11px] sm:text-xs mt-1 leading-relaxed">
                    Area santai & ruang tamu dengan meja-kursi nyaman untuk kumpul atau makan.
                  </p>
                </div>
              </div>

              {/* KARTU 3: MESIN CUCI & JEMURAN */}
              <div className="bg-stone-50 border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all">
                <div className="relative w-full h-44 sm:h-48 bg-stone-200">
                  <img 
                    src="/cuci.webp" 
                    alt="Mesin Cuci & Jemuran" 
                    onError={handleImageError}
                    className="w-full h-full object-cover" 
                  />
                  <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                    Area Cuci & Jemur
                  </span>
                </div>
                <div className="p-3.5">
                  <h4 className="font-semibold text-stone-800 text-xs sm:text-sm">Mesin Cuci & Gantung Jemuran</h4>
                  <p className="text-stone-500 text-[11px] sm:text-xs mt-1 leading-relaxed">
                    Fasilitas mesin cuci siap pakai & area balkon jemuran baju yang luas.
                  </p>
                </div>
              </div>

            </div>

            {/* RINGKASAN AREA PARKIR */}
            <div className="p-3.5 sm:p-4 bg-stone-100/70 border border-stone-200/60 rounded-xl text-xs text-stone-600 flex items-center gap-2">
              <span className="font-semibold text-stone-800 shrink-0">Parkir Kendaraan:</span>
              <span className="text-stone-500">Tersedia area parkir aman untuk Motor, dan Sepeda.</span>
            </div>

          </div>
        </div>

      </div>

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href={`https://wa.me/6281294509239?text=${encodeURIComponent(
          `Halo Admin Kost Rosa Ria Rio, saya berminat dengan ${currentRoom.name} (${currentPrice}/bulan). Apakah stok masih tersedia?`
        )}`}
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2.5 px-4 py-3 sm:px-4 sm:py-3 bg-[#25D366] hover:bg-[#1EBE57] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 group cursor-pointer"
        aria-label="Hubungi Admin via WhatsApp"
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle size={20} className="fill-white text-[#25D366]" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200"></span>
          </span>
        </div>
        <span className="font-semibold text-xs sm:text-sm tracking-wide">Hubungi Admin</span>
      </a>

      {/* FOOTER */}
      <footer className="relative z-10 w-full bg-stone-900 text-stone-300 pt-10 sm:pt-12 pb-24 sm:pb-10 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 sm:pb-10 border-b border-stone-800">

            <div className="md:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-4">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center p-0.5 border border-stone-700 shrink-0">
                    <img src="/logo.png" alt="Logo Kost Rosa" className="w-full h-full object-cover scale-150" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base leading-tight">Kost Rosa Ria Rio</h4>
                    <p className="text-[10px] uppercase tracking-widest text-[#C68B59] font-semibold">Residence</p>
                  </div>
                </div>
                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-sm">
                  Hunian kos nyaman, bersih, dan strategis di Kota Pangkal Pinang. Lingkungan tenang dengan penawaran fasilitas lengkap untuk kenyamanan harianmu.
                </p>
              </div>
            </div>

            <div className="md:col-span-4">
              <h5 className="text-white text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4 border-b border-stone-800 pb-2">
                Alamat Lokasi
              </h5>
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-300 leading-relaxed">
                <MapPin size={16} className="text-[#C68B59] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white mb-1">Kost Rosa Ria Rio</p>
                  <p className="text-stone-400 text-xs leading-relaxed pr-4 sm:pr-0">
                    Jl. Depati Hamzah gang musyawarah, RT.12/RW.3, Semabung Lama, Kec. Bukitintan, Kota Pangkal Pinang, Kepulauan Bangka Belitung 33684
                  </p>
                  <a href="https://maps.app.goo.gl/NC1kN8iTXgq1XJxN8" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#C68B59] hover:text-[#d69967] hover:underline mt-2 font-medium transition">
                    <span>Petunjuk Arah Google Maps</span> <span>→</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <h5 className="text-white text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4 border-b border-stone-800 pb-2">
                Hubungi Kami
              </h5>
              <ul className="space-y-3 text-xs sm:text-sm text-stone-300">
                <li className="flex items-center gap-2.5">
                  <Phone size={15} className="text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase tracking-wider block mb-0.5">Nomor HP / WhatsApp</span>
                    <a href="https://wa.me/6281294509239" target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:text-emerald-400 transition text-sm">
                      0812-9450-9239
                    </a>
                  </div>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-stone-500 gap-2 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Kost Rosa Ria Rio. All rights reserved.</p>
            <p className="text-stone-500">Semabung Lama, Bukit Intan, Pangkal Pinang</p>
          </div>
        </div>
      </footer>

      {/* MODAL FULLSCREEN VIDEO & FOTO */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsVideoModalOpen(false)} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
            <button onClick={() => setIsVideoModalOpen(false)} className="absolute top-5 right-5 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full transition z-10 cursor-pointer" aria-label="Tutup Modal Video">
              <X size={20} />
            </button>
            <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-stone-800">
              <video src="/video-tour.mp4" controls autoPlay className="w-full h-full object-contain" />
            </div>
          </motion.div>
        )}
        {isImageModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsImageModalOpen(false)} className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
            <button onClick={() => setIsImageModalOpen(false)} className="absolute top-5 right-5 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full transition z-20 cursor-pointer" aria-label="Tutup Modal Foto">
              <X size={20} />
            </button>
            <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-5xl h-[85vh] flex items-center justify-center">
              <img src={currentRoom.images[roomImageIndex]} alt={`Preview ${currentRoom.name}`} className="w-full h-full object-contain" />
              {currentRoom.images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); prevRoomImage(); }} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-md transition z-20 cursor-pointer" aria-label="Foto Sebelumnya">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); nextRoomImage(); }} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-md transition z-20 cursor-pointer" aria-label="Foto Selanjutnya">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}