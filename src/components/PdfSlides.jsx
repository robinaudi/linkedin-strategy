import React, { forwardRef } from 'react';
import {
    Target, ChevronLeft, ChevronRight, CheckCircle, ArrowRight, Zap, Video, Bot,
    HeartHandshake, Award, Sun, Moon, Type, ExternalLink, Search, Coffee, Briefcase, Mail
} from 'lucide-react';
import { useContent } from '../hooks/useContent';

const IconMap = {
    Target, ChevronLeft, ChevronRight, CheckCircle, ArrowRight, Zap, Video, Bot,
    HeartHandshake, Award, Sun, Moon, Type, ExternalLink, Search, Coffee, Briefcase, Mail
};

// Simplified theme for PDF (always light mode)
const theme = {
    bg: "bg-white",
    cardBg: "bg-white",
    cardBorder: "border-gray-200",
    text: "text-gray-900",
    subText: "text-gray-700",
    accent: "text-blue-700",
    accentBg: "bg-blue-700",
    buttonBg: "bg-blue-700",
    buttonText: "text-white",
    titleGradient: "from-blue-800 to-blue-600",
    numberBg: "bg-blue-100 text-blue-800",
    qCard: "bg-white border-blue-600 shadow-md",
    codeBg: "bg-gray-800 text-green-300",
    codeBoxBorder: "bg-blue-50 border-blue-200",
    checkIconBg: "border-gray-300",
    checkIconColor: "text-white",
    promoCardBg: "bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-600",
    linkButton: "bg-blue-700 text-white"
};

const fonts = { base: "text-xl", lg: "text-2xl", xl: "text-3xl", title: "text-5xl", code: "text-base", icon: "w-6 h-6", nav: "text-sm" };

const PdfSlides = forwardRef((props, ref) => {
    const { slides: slideData } = useContent();

    return (
        <div ref={ref} className="bg-white">
            {slideData.map((slide, index) => (
                // Each slide is a "page" container with fixed dimensions usually, but for html2canvas we just need a distinct block.
                // We'll set a fixed width/height to ensure aspect ratio matches typical screen/PDF.
                <div key={index} className="w-[1200px] h-[800px] border-b-8 border-gray-200 relative overflow-hidden flex flex-col p-12 mb-8 bg-white" id={`slide-${index}`}>
                    {/* Header */}
                    <div className="absolute top-0 right-0 p-4 text-gray-400 font-bold text-4xl opacity-20">{index + 1}</div>

                    <div className="flex-grow">
                        {/* Render Content Logic (Inline for simplicity or reuse) */}
                        <SlideContent slide={slide} />
                    </div>

                    {/* Footer Branding */}
                    <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-center text-gray-400 text-sm">
                        <span>2026 LinkedIn Strategy</span>
                        <span>Robin Hsu</span>
                    </div>
                </div>
            ))}
        </div>
    );
});

const SlideContent = ({ slide }) => {
    const SlideIcon = slide.iconName ? IconMap[slide.iconName] : null;

    switch (slide.type) {
        case "intro":
            return (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                    {SlideIcon && <SlideIcon className={`w-24 h-24 ${theme.accent}`} />}
                    <h1 className={`${fonts.title} font-bold text-blue-800`}>{slide.title}</h1>
                    <h2 className={`${fonts.xl} ${theme.subText} font-light`}>{slide.subtitle}</h2>
                    <div className="space-y-4 text-left mt-8">
                        {slide.content.map((item, idx) => (
                            <div key={idx} className="flex items-start space-x-4 text-2xl text-gray-700">
                                <CheckCircle className={`${theme.accent} w-8 h-8 flex-shrink-0`} />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case "agenda":
            return (
                <div className="h-full flex flex-col">
                    <h2 className={`${fonts.title} font-bold ${theme.text} mb-10`}>{slide.title}</h2>
                    <div className="grid grid-cols-2 gap-8">
                        {slide.content.map((item, idx) => (
                            <div key={idx} className="p-6 border rounded-2xl bg-gray-50">
                                <span className="text-4xl font-bold text-blue-200 block mb-2">{item.id}</span>
                                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case "resource":
            return (
                <div className="h-full flex flex-col items-center text-center">
                    <h2 className={`${fonts.title} font-bold text-gray-800 mb-8`}>{slide.title}</h2>
                    <h3 className={`${fonts.xl} text-gray-500 mb-12`}>{slide.subtitle}</h3>

                    <div className="flex-1 w-full max-w-4xl grid grid-cols-2 gap-12 items-start">
                        {/* Left: Profile & QR */}
                        <div className="bg-white p-8 rounded-3xl border-2 border-blue-100 shadow-sm flex flex-col items-center">
                            {slide.qrCodeImage ? (
                                <img
                                    src={slide.qrCodeImage}
                                    alt="QR Code"
                                    className="w-48 h-48 object-cover mb-6 border-4 border-white shadow-lg rounded-xl"
                                    crossOrigin="anonymous"
                                />
                            ) : (
                                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center mb-6 rounded-xl text-gray-400">No QR Code</div>
                            )}
                            <h4 className="text-2xl font-bold text-gray-900 mb-2">Robin Hsu</h4>
                            <p className="text-gray-500 mb-6">電商總監 & 職涯教練</p>

                            <div className="w-full space-y-3">
                                {slide.profileLink && (
                                    <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold truncate border border-blue-100">
                                        {slide.profileLink}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Articles */}
                        <div className="space-y-4 text-left">
                            <h4 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                <Search className="w-6 h-6 mr-2 text-blue-600" /> 精選文章
                            </h4>
                            {slide.articles && slide.articles.map((article, idx) => (
                                <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        {article.image ? (
                                            <img src={article.image} className="w-full h-full object-cover" crossOrigin="anonymous" alt="" />
                                        ) : (
                                            <Type className="text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-gray-900 truncate">{article.title}</h5>
                                        <p className="text-sm text-gray-500 truncate">{article.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        default:
            // Generic fallback for other types to ensure they render meaningfully
            return (
                <div className="h-full flex flex-col">
                    {slide.module && <div className="text-blue-600 font-bold uppercase tracking-widest mb-4">{slide.module}</div>}
                    <h2 className="text-5xl font-bold mb-8 text-gray-800">{slide.title}</h2>

                    {
                        slide.question && (
                            <div className="bg-blue-50 p-8 rounded-2xl border-l-8 border-blue-600 mb-8">
                                <h3 className="text-2xl font-bold text-blue-900 mb-4">{slide.question}</h3>
                                <p className="text-xl text-blue-700">{slide.answer}</p>
                            </div>
                        )
                    }

                    <div className="space-y-6">
                        {slide.points && slide.points.map((point, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold flex-shrink-0">{idx + 1}</div>
                                <div>
                                    <h4 className="text-xl font-bold">{point.title}</h4>
                                    <p className="text-gray-600">{point.desc}</p>
                                </div>
                            </div>
                        ))}
                        {slide.content && slide.content.map((item, idx) => {
                            if (typeof item === 'string') return <li key={idx} className="text-xl list-disc ml-6 mb-2">{item}</li>;
                            return (
                                <div key={idx} className="flex gap-4 items-start mb-4 bg-gray-50 p-4 rounded-xl">
                                    {item.iconName && React.createElement(IconMap[item.iconName], { className: "w-8 h-8 text-blue-600 flex-shrink-0" })}
                                    <div>
                                        <h4 className="text-xl font-bold">{item.title}</h4>
                                        <p className="text-gray-600">{item.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                        {slide.checklist && slide.checklist.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-xl">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <span>{item}</span>
                            </div>
                        ))}
                        {slide.actionItem && (
                            <div className="mt-8 bg-gray-900 text-white p-6 rounded-xl shadow-lg border border-gray-700">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Zap className="w-6 h-6 text-yellow-400" />
                                    {slide.actionItem.title}
                                </h3>
                                <div className="bg-gray-800 p-4 rounded-lg font-mono text-green-300 text-lg mb-4 border border-gray-700">
                                    {slide.actionItem.code}
                                </div>
                                <div className="whitespace-pre-line text-gray-300 font-mono text-sm leading-relaxed">
                                    {slide.actionItem.example}
                                </div>
                            </div>
                        )}
                    </div>
                </div >
            );
    }
}

export default PdfSlides;
