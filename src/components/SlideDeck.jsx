import React, { useState, useEffect, useRef } from 'react';
import {
    Target, ChevronLeft, ChevronRight, CheckCircle, ArrowRight, Zap, Video, Bot,
    HeartHandshake, Award, Sun, Moon, Type, ExternalLink, Search, Coffee, Briefcase, Mail, FileDown,
    Settings, Linkedin
} from 'lucide-react';
import { useContent } from '../hooks/useContent';

const IconMap = {
    Target, ChevronLeft, ChevronRight, CheckCircle, ArrowRight, Zap, Video, Bot,
    HeartHandshake, Award, Sun, Moon, Type, ExternalLink, Search, Coffee, Briefcase, Mail, Linkedin
};

// ... Themes and FontSizes logic same as before ... 
// (Duplicated for brevity in this tool call, but ideally should be imported or kept)
// I will include the full file content to ensure it works.

const themes = {
    dark: {
        bg: "bg-gray-900",
        containerBg: "bg-gradient-to-br from-gray-900 to-black",
        cardBg: "bg-gray-800",
        cardBorder: "border-gray-700 hover:border-yellow-500",
        text: "text-white",
        subText: "text-gray-300",
        accent: "text-yellow-500",
        accentBg: "bg-yellow-500",
        buttonBg: "bg-yellow-600 hover:bg-yellow-500",
        buttonText: "text-black",
        titleGradient: "from-yellow-400 to-yellow-100",
        navBg: "bg-gray-900",
        navBorder: "border-gray-800",
        navText: "text-gray-500",
        progressBar: "from-yellow-600 to-yellow-400",
        qCard: "bg-gray-800 border-yellow-500",
        numberBg: "bg-blue-900 text-blue-300",
        codeBg: "bg-black text-green-400",
        codeBoxBorder: "bg-blue-900/30 border-blue-500/30",
        checkIconBg: "border-gray-500 group-hover:border-yellow-500 group-hover:bg-yellow-500",
        checkIconColor: "text-black",
        linkButton: "bg-blue-600 hover:bg-blue-500 text-white",
        promoCardBg: "bg-gradient-to-r from-gray-800 to-gray-900 border-l-4 border-yellow-500",
        inputBg: "bg-gray-800 text-white border-gray-600 focus:border-yellow-500"
    },
    light: {
        bg: "bg-gray-100",
        containerBg: "bg-gradient-to-br from-white to-gray-100",
        cardBg: "bg-white",
        cardBorder: "border-gray-200 hover:border-blue-600 shadow-sm hover:shadow-md",
        text: "text-gray-900",
        subText: "text-gray-700",
        accent: "text-blue-700",
        accentBg: "bg-blue-700",
        buttonBg: "bg-blue-700 hover:bg-blue-600",
        buttonText: "text-white",
        titleGradient: "from-blue-800 to-blue-600",
        navBg: "bg-white",
        navBorder: "border-gray-200",
        navText: "text-gray-400",
        progressBar: "from-blue-700 to-blue-400",
        qCard: "bg-white border-blue-600 shadow-md",
        numberBg: "bg-blue-100 text-blue-800",
        codeBg: "bg-gray-800 text-green-300",
        codeBoxBorder: "bg-blue-50 border-blue-200",
        checkIconBg: "border-gray-300 group-hover:border-blue-600 group-hover:bg-blue-600",
        checkIconColor: "text-white",
        linkButton: "bg-blue-700 hover:bg-blue-800 text-white",
        promoCardBg: "bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-600 shadow-md",
        inputBg: "bg-white text-gray-900 border-gray-300 focus:border-blue-600"
    }
};

const fontSizes = {
    normal: { base: "text-xl", lg: "text-2xl", xl: "text-3xl", title: "text-5xl", code: "text-base", icon: "w-6 h-6", nav: "text-sm" },
    large: { base: "text-2xl", lg: "text-3xl", xl: "text-4xl", title: "text-6xl", code: "text-lg", icon: "w-8 h-8", nav: "text-base" },
    xl: { base: "text-3xl", lg: "text-4xl", xl: "text-5xl", title: "text-7xl", code: "text-xl", icon: "w-10 h-10", nav: "text-lg" }
};

const SlideDeck = ({ onDownloadPDF, isGeneratingPDF, onAdminClick }) => {
    const { slides: slideData, loading, isOffline } = useContent();

    const [currentSlide, setCurrentSlide] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [animate, setAnimate] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [fontSizeLevel, setFontSizeLevel] = useState('normal');

    const [isNavInputVisible, setIsNavInputVisible] = useState(false);
    const [navInputValue, setNavInputValue] = useState("");
    const navInputRef = useRef(null);

    const theme = isDarkMode ? themes.dark : themes.light;
    const fonts = fontSizes[fontSizeLevel];
    const instructor = "Robin Hsu |  電商總監 · ex.CIO · ex.人資副總";

    const totalSlides = slideData.length;

    const toggleFontSize = () => {
        if (fontSizeLevel === 'normal') setFontSizeLevel('large');
        else if (fontSizeLevel === 'large') setFontSizeLevel('xl');
        else setFontSizeLevel('normal');
    };

    const jumpToSlide = (index) => {
        if (index >= 0 && index < totalSlides) {
            setAnimate(false);
            setTimeout(() => {
                setCurrentSlide(index);
                setShowAnswer(false);
                setAnimate(true);
            }, 300);
        }
    };

    const nextSlide = () => jumpToSlide(currentSlide + 1);
    const prevSlide = () => jumpToSlide(currentSlide - 1);

    const handleNavSubmit = (e) => {
        e.preventDefault();
        const input = navInputValue.trim();
        const pageNum = parseInt(input);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalSlides) {
            jumpToSlide(pageNum - 1);
            setIsNavInputVisible(false);
            setNavInputValue("");
            return;
        }
        const keyword = input.toLowerCase();
        const foundIndex = slideData.findIndex(slide =>
            slide.title.toLowerCase().includes(keyword) ||
            (slide.content && Array.isArray(slide.content) && slide.content.some(c => typeof c === 'string' && c.toLowerCase().includes(keyword))) ||
            (slide.points && slide.points.some(p => p.title.toLowerCase().includes(keyword) || p.desc.toLowerCase().includes(keyword)))
        );
        if (foundIndex !== -1) {
            jumpToSlide(foundIndex);
            setIsNavInputVisible(false);
            setNavInputValue("");
        } else {
            alert(`找不到包含 "${input}" 的頁面或無效的頁碼`);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isNavInputVisible) {
                if (e.key === 'Escape') setIsNavInputVisible(false);
                return;
            }
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === ' ' || e.key === 'Enter') setShowAnswer(!showAnswer);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlide, showAnswer, isNavInputVisible]);

    useEffect(() => {
        if (isNavInputVisible && navInputRef.current) {
            navInputRef.current.focus();
        }
    }, [isNavInputVisible]);

    const renderContent = (slide) => {
        const SlideIcon = slide.iconName ? IconMap[slide.iconName] : null;

        switch (slide.type) {


            case "intro":
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 relative overflow-hidden">
                        {/* Background Data Particles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`absolute rounded-full opacity-20 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'}`}
                                    style={{
                                        width: Math.random() * 10 + 5 + 'px',
                                        height: Math.random() * 10 + 5 + 'px',
                                        top: Math.random() * 100 + '%',
                                        left: Math.random() * 100 + '%',
                                        animation: `floatUp ${Math.random() * 10 + 5}s linear infinite`,
                                        animationDelay: `-${Math.random() * 5}s`
                                    }}
                                ></div>
                            ))}
                        </div>

                        {/* ADMIN LOGIN LOGO (Intro) - Bottom Right */}
                        <div onClick={onAdminClick} className="absolute bottom-6 right-6 p-3 opacity-30 hover:opacity-100 cursor-pointer transition-all hover:scale-110 z-50" title="CMS 後台">
                            <Settings className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                        </div>

                        <div className="animate-bounce mb-8 relative z-10">
                            <Linkedin className="w-32 h-32 text-[#0077b5]" strokeWidth={1.5} />
                        </div>

                        <h1 className={`${fonts.title} font-bold text-[#0077b5] leading-tight mb-6 tracking-tight relative z-10`}>
                            {slide.title}
                        </h1>

                        <h2 className={`${fonts.xl} ${theme.subText} font-light max-w-4xl leading-relaxed tracking-wide mb-8 relative z-10`}>
                            {slide.subtitle} {slide.emoji && <span className="ml-2 animate-pulse inline-block">{slide.emoji}</span>}
                        </h2>

                        <div className="w-24 h-1.5 bg-[#0077b5] rounded-full mb-12 relative z-10"></div>

                        <div className={`mt-8 ${fonts.base} ${theme.subText} relative z-10`}>{instructor}</div>

                        <button
                            onClick={nextSlide}
                            className={`mt-12 px-12 py-5 bg-[#0077b5] hover:bg-[#006097] text-white ${fonts.lg} font-bold rounded-full transition-all transform hover:scale-105 hover:shadow-xl flex items-center shadow-lg relative z-10`}
                        >
                            開始經營 <ArrowRight className={`ml-3 ${fonts.icon}`} />
                        </button>
                    </div>
                );

            case "agenda":
                return (
                    <div className="h-full flex flex-col p-8 md:p-12">
                        <div className={`${theme.accent} ${fonts.nav} font-semibold tracking-widest uppercase mb-4`}>{slide.module}</div>
                        <h2 className={`${fonts.title} font-bold ${theme.text} mb-10`}>{slide.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow items-center overflow-y-auto no-scrollbar">
                            {slide.content.map((item, idx) => (
                                <div key={idx} className={`${theme.cardBg} p-8 rounded-2xl border ${theme.cardBorder} transition-all group h-full flex flex-col justify-center`}>
                                    <div className={`text-6xl font-bold text-gray-400 group-hover:${theme.accent} mb-4 transition-colors`}>
                                        {item.id}
                                    </div>
                                    <h3 className={`${fonts.lg} font-bold ${theme.text} mb-3`}>{item.title}</h3>
                                    <p className={`${theme.subText} ${fonts.base} leading-relaxed`}>
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case "concept":
            case "action":
            case "strategy":
                return (
                    <div className="h-full flex flex-col p-8 md:p-12">
                        <div className={`${theme.accent} ${fonts.nav} font-semibold tracking-widest uppercase mb-4`}>{slide.module}</div>
                        <h2 className={`${fonts.title} font-bold ${theme.text} mb-8`}>{slide.title}</h2>
                        <div className={`${theme.qCard} rounded-2xl p-8 mb-8 border-l-8 shadow-lg cursor-pointer transition-all hover:translate-x-2`} onClick={() => setShowAnswer(!showAnswer)}>
                            <div className="flex items-start">
                                <div className={`${isDarkMode ? 'bg-yellow-900/50 text-yellow-400' : 'bg-blue-50 text-blue-700'} p-3 rounded-xl mr-6 font-bold ${fonts.lg}`}>Q</div>
                                <h3 className={`${fonts.lg} ${theme.text} font-medium leading-relaxed`}>{slide.question}</h3>
                            </div>
                            {showAnswer ? (
                                <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} animate-fadeIn`}>
                                    <p className={`${theme.accent} ${fonts.xl} font-bold leading-relaxed`}>{slide.answer}</p>
                                </div>
                            ) : (
                                <div className={`mt-6 ${theme.subText} ${fonts.base} flex items-center`}>
                                    <Zap className={`${fonts.icon} mr-2`} /> 點擊揭曉觀點
                                </div>
                            )}
                        </div>
                        <div className="grid gap-6 flex-grow overflow-y-auto no-scrollbar">
                            {slide.points && slide.points.map((point, idx) => (
                                <div key={idx} className={`flex items-start ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'} p-6 rounded-xl`}>
                                    <div className={`w-10 h-10 rounded-full ${theme.numberBg} flex items-center justify-center font-bold mr-6 flex-shrink-0 text-xl`}>{idx + 1}</div>
                                    <div className="flex-1">
                                        <h4 className={`${fonts.lg} font-bold ${theme.text} mb-2`}>{point.title}</h4>
                                        <p className={`${theme.subText} ${fonts.base} leading-relaxed whitespace-pre-wrap`}>{point.desc}</p>
                                    </div>
                                </div>
                            ))}
                            {slide.actionItem && (
                                <div className={`${theme.codeBoxBorder} border p-8 rounded-2xl mt-4`}>
                                    <h4 className={`${theme.accent} ${fonts.lg} font-bold mb-4 flex items-center`}><Target className={`${fonts.icon} mr-3`} /> {slide.actionItem.title}</h4>
                                    <div className={`${theme.codeBg} p-6 rounded-xl font-mono ${fonts.code} mb-4 overflow-x-auto`}>
                                        {slide.actionItem.code}
                                    </div>
                                    <div className={`${theme.subText} ${fonts.base} whitespace-pre-wrap`}>
                                        {slide.actionItem.example}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "trend":
            case "deep-dive":
            case "advanced":
                return (
                    <div className="h-full flex flex-col p-8 md:p-12">
                        <div className={`${theme.accent} ${fonts.nav} font-semibold tracking-widest uppercase mb-4`}>{slide.module}</div>
                        <h2 className={`${fonts.title} font-bold ${theme.text} mb-4`}>{slide.title}</h2>
                        {slide.subtitle && <p className={`${fonts.xl} ${theme.subText} mb-10 font-light italic leading-relaxed`}>{slide.subtitle}</p>}
                        <div className="grid gap-8 overflow-y-auto no-scrollbar">
                            {slide.content.map((item, idx) => {
                                const ItemIcon = typeof item === 'object' && item.iconName ? IconMap[item.iconName] : null;

                                if (typeof item === 'string') {
                                    return (
                                        <div key={idx} className={`flex items-start space-x-6 ${theme.cardBg} p-6 rounded-2xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <div className={`w-3 h-3 ${theme.accentBg} rounded-full mt-3 flex-shrink-0`}></div>
                                            <span className={`${fonts.base} ${theme.text} leading-relaxed`}>{item}</span>
                                        </div>
                                    )
                                }
                                return (
                                    <div key={idx} className={`${theme.cardBg} p-8 rounded-2xl border-l-8 ${isDarkMode ? 'border-blue-500' : 'border-blue-600'} shadow-sm flex items-start space-x-6 transition hover:transform hover:-translate-y-1`}>
                                        <div className={`${theme.text} mt-1`}>
                                            {ItemIcon && <ItemIcon className="w-12 h-12" />}
                                        </div>
                                        <div>
                                            <h3 className={`${fonts.lg} font-bold ${theme.text} mb-3`}>{item.title}</h3>
                                            <p className={`${theme.subText} ${fonts.base} leading-relaxed`}>{item.desc}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                );

            case "checklist":
                return (
                    <div className="h-full flex flex-col p-8 md:p-12 items-center justify-center">
                        <div className="text-center mb-12">
                            <Award className={`w-24 h-24 ${theme.accent} mx-auto mb-6`} />
                            <h2 className={`${fonts.title} font-bold ${theme.text} mb-4`}>{slide.title}</h2>
                            <p className={`${theme.subText} ${fonts.xl}`}>{slide.quote}</p>
                        </div>
                        <div className={`w-full max-w-4xl ${theme.cardBg} rounded-3xl p-10 shadow-2xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                            <div className="space-y-6">
                                {slide.checklist.map((item, idx) => (
                                    <div key={idx} className="flex items-start space-x-6 group">
                                        <div className={`w-8 h-8 rounded-full border-2 ${theme.checkIconBg} transition-all flex items-center justify-center flex-shrink-0 mt-1`}>
                                            <CheckCircle className={`w-5 h-5 ${theme.checkIconColor} opacity-0 group-hover:opacity-100`} />
                                        </div>
                                        <span className={`${fonts.base} ${isDarkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-blue-800'} transition-colors leading-relaxed`}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case "resource":
                return (
                    <div className="h-full flex flex-col p-8 md:p-12 relative overflow-y-auto no-scrollbar">
                        {/* ADMIN LOGIN LOGO (Resource) - Bottom Right */}
                        <div onClick={onAdminClick} className="absolute bottom-6 right-6 p-3 opacity-30 hover:opacity-100 cursor-pointer transition-all hover:scale-110 z-50" title="CMS 後台">
                            <Settings className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                        </div>

                        <div className={`${theme.accent} ${fonts.nav} font-semibold tracking-widest uppercase mb-4`}>{slide.module}</div>
                        <h2 className={`${fonts.title} font-bold ${theme.text} mb-8`}>{slide.title}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 flex-grow">
                            {/* Left: Free Connection */}
                            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 flex flex-col items-center justify-between shadow-sm relative group h-full`}>
                                {/* Hashtags - Flex Layout for RWD */}
                                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">#CareerTips</span>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">#LinkedInGrowth</span>
                                </div>

                                <div className="flex-grow flex flex-col items-center justify-center mb-4">
                                    <img src={slide.qrCodeImage} alt="QR Code" className="w-56 h-56 object-contain mb-4 transform transition-transform group-hover:scale-105" />
                                    <h3 className={`mt-2 ${fonts.lg} font-bold ${theme.text}`}>Robin Hsu</h3>
                                    <p className={`${theme.subText} text-sm font-medium`}>電商總監 | 職涯教練</p>
                                    <div className="flex gap-2 mt-3">
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">#獵頭視角</span>
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">#職涯策略</span>
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">#個人品牌</span>
                                    </div>
                                </div>

                                <a href={slide.profileLink} target="_blank" rel="noreferrer" className={`w-full text-center py-3 ${theme.linkButton} rounded-xl font-bold shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 ${fonts.base}`}>
                                    <ExternalLink className="w-5 h-5" />
                                    Connect on LinkedIn
                                </a>
                            </div>

                            {/* Right: Premium Mentorship */}
                            <div className={`${theme.promoCardBg} rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group h-full`}>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Award className="w-32 h-32" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Premium</span>
                                        <span className={`${theme.subText} text-sm font-medium`}>DaDaFly 導師計畫</span>
                                    </div>
                                    <h3 className={`${fonts.lg} font-bold ${theme.text} mb-4`}>1-on-1 深度職涯諮詢</h3>
                                    <ul className={`space-y-3 ${theme.subText} ${fonts.base} mb-6`}>
                                        <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> 履歷健檢優化</li>
                                        <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> 模擬面試演練</li>
                                        <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> 薪資談判策略</li>
                                    </ul>
                                </div>

                                <div className="mt-auto">
                                    <div className="flex gap-2 flex-wrap mb-4">
                                        <span className="bg-white/60 text-gray-700 border border-gray-200 text-xs px-2 py-1 rounded-md">#轉職</span>
                                        <span className="bg-white/60 text-gray-700 border border-gray-200 text-xs px-2 py-1 rounded-md">#外商</span>
                                        <span className="bg-white/60 text-gray-700 border border-gray-200 text-xs px-2 py-1 rounded-md">#高階獵頭</span>
                                    </div>

                                    <a href={slide.mentorshipLink} target="_blank" rel="noreferrer" className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold py-3 rounded-xl text-center shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                                        <HeartHandshake className="w-5 h-5" />
                                        前往預約時段
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {slide.articles.map((article, idx) => (
                                <a key={idx} href={article.link} target="_blank" rel="noreferrer" className={`block group ${theme.cardBg} rounded-2xl overflow-hidden border ${theme.cardBorder} transition-all hover:-translate-y-2 h-full flex flex-col`}>
                                    <div className="h-32 bg-gray-200 overflow-hidden relative shrink-0">
                                        <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className={`${fonts.base} font-bold ${theme.text} mb-2 group-hover:${theme.accent} line-clamp-2`}>{article.title}</h3>
                                        <p className={`${theme.subText} text-sm line-clamp-2 mb-4 flex-grow`}>{article.subtitle}</p>
                                        <div className={`flex items-center ${theme.accent} text-sm font-semibold mt-auto`}>
                                            閱讀更多 <ArrowRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>

                        <div className="flex justify-center pb-8">
                            <a href="mailto:robin.lexus@gmail.com" className={`px-8 py-3 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} rounded-xl ${fonts.nav} shadow-md flex items-center gap-2 transition-transform hover:scale-105`}>
                                <Mail className="w-4 h-4" />
                                商務合作洽談
                            </a>
                        </div>
                    </div>
                );

            default:
                return <div>Unknown Slide Type</div>;
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>;

    return (
        <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans flex items-center justify-center p-2 md:p-6 transition-colors duration-500`}>
            <div className={`w-full max-w-[1400px] min-h-[100dvh] md:min-h-[800px] ${theme.containerBg} rounded-3xl shadow-2xl border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} overflow-hidden flex flex-col relative`}>
                {/* Top Right Controls */}
                <div className="absolute top-6 right-6 z-20 flex space-x-3">
                    {/* Offline mode indicator removed - using default data is normal behavior */}

                    {onDownloadPDF && (
                        <button onClick={onDownloadPDF} disabled={isGeneratingPDF} className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'} transition-all`} title="下載 PDF">
                            {isGeneratingPDF ? <div className="spinner w-6 h-6 border-b-2" /> : <FileDown className="w-6 h-6" />}
                        </button>
                    )}
                    <button onClick={toggleFontSize} className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'} transition-all`} title="調整字體大小">
                        <Type className="w-6 h-6" />
                    </button>
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'} transition-all`} title={isDarkMode ? "切換至淺色模式" : "切換至深色模式"}>
                        {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </button>
                </div>
                <div className={`w-full h-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} flex-shrink-0`}>
                    <div className={`h-full bg-gradient-to-r ${theme.progressBar} transition-all duration-500`} style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}></div>
                </div>
                <div className={`flex-grow relative overflow-hidden transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}>
                    {renderContent(slideData[currentSlide])}
                </div>
                <div className={`${theme.navBg} border-t ${theme.navBorder} p-6 flex justify-between items-center z-10 flex-shrink-0`}>
                    <div className={`flex items-center ${theme.navText} ${fonts.nav} space-x-6`}>
                        <a href="https://www.linkedin.com/in/robin-hsu-2b59a9a5/" target="_blank" rel="noreferrer" className={`font-bold ${theme.accent} hover:underline`}>ROBIN HSU</a>
                        <span className="hidden md:inline">|</span>
                        {isNavInputVisible ? (
                            <form onSubmit={handleNavSubmit} className="nav-input-enter flex items-center">
                                <div className="relative flex items-center">
                                    <Search className={`w-4 h-4 absolute left-3 ${theme.text}`} />
                                    <input
                                        ref={navInputRef}
                                        type="text"
                                        value={navInputValue}
                                        onChange={(e) => setNavInputValue(e.target.value)}
                                        onBlur={() => { if (!navInputValue) setIsNavInputVisible(false); }}
                                        placeholder="輸入頁碼..."
                                        className={`pl-9 pr-4 py-1 rounded-full border outline-none text-sm w-48 ${theme.inputBg}`}
                                    />
                                </div>
                            </form>
                        ) : (
                            <div
                                className={`cursor-pointer hover:${theme.accent} transition-colors flex items-center gap-2 whitespace-nowrap flex-nowrap`}
                                onClick={() => setIsNavInputVisible(true)}
                                title="點擊搜尋或跳轉頁面"
                            >
                                <span>{currentSlide + 1} / {totalSlides}</span>
                                <Search className={`w-4 h-4 ${theme.text} hover:${theme.accent}`} />
                            </div>
                        )}
                    </div>
                    <div className="flex space-x-4">
                        <button onClick={prevSlide} disabled={currentSlide === 0} className={`p-3 rounded-full ${currentSlide === 0 ? 'text-gray-600 cursor-not-allowed' : `${theme.text} hover:${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}`}>
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button onClick={nextSlide} disabled={currentSlide === totalSlides - 1} className={`p-3 rounded-full ${currentSlide === totalSlides - 1 ? 'text-gray-600 cursor-not-allowed' : `${theme.accent} hover:${isDarkMode ? 'bg-yellow-900/20' : 'bg-blue-50'}`}`}>
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlideDeck;
