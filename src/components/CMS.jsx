import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '../firebase.config';
import { slideData as defaultSlides } from '../data/slides';
import { Save, LogOut, FileText, Activity, Plus, Trash2, GripVertical, ChevronRight, ChevronDown, Wifi, RotateCcw, Settings } from 'lucide-react';
import { useContent } from '../hooks/useContent';

const CMS = () => {
    const { slides: currentSlides } = useContent();
    const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'logs' | 'settings'
    const [slides, setSlides] = useState(defaultSlides);
    const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
    const [logs, setLogs] = useState([]);
    const [appSettings, setAppSettings] = useState({ pdfDownloadMode: 'login' });
    const [saving, setSaving] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleStatusChange = () => {
            setIsOnline(navigator.onLine);
        };
        window.addEventListener('online', handleStatusChange);
        window.addEventListener('offline', handleStatusChange);
        return () => {
            window.removeEventListener('online', handleStatusChange);
            window.removeEventListener('offline', handleStatusChange);
        };
    }, []);

    // Sync initial content
    useEffect(() => {
        if (currentSlides && currentSlides.length > 0) {
            setSlides(currentSlides);
        }
    }, [currentSlides]);

    // Fetch Global Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "settings", "global");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAppSettings(docSnap.data());
                }
            } catch (e) {
                console.error("Error fetching settings:", e);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, "content", "main_slides"), { slides });
            alert("儲存成功！\nContent Saved Successfully.");
        } catch (e) {
            console.error(e);
            alert("儲存失敗：權限不足或網路錯誤。\nSave Failed: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, "settings", "global"), appSettings);
            alert("設定已更新！\nSettings Updated.");
        } catch (e) {
            console.error(e);
            alert("設定更新失敗: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (window.confirm("⚠️ 警告：確定要重置所有內容回到初始設定嗎？\n\n這將覆蓋您目前的所有修改，且無法復原！\n(Reset all content to default?)")) {
            setSaving(true);
            try {
                // Update local state first
                setSlides(defaultSlides);
                // Also save to DB immediately to fix the issue
                await setDoc(doc(db, "content", "main_slides"), { slides: defaultSlides });
                alert("已重置為預設內容！\nReset Successful.");
                setSelectedSlideIndex(0);
            } catch (e) {
                alert("重置失敗: " + e.message);
            } finally {
                setSaving(false);
            }
        }
    };

    const updateSlide = (index, field, value) => {
        const newSlides = [...slides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setSlides(newSlides);
    };

    // Helper to update nested array items (e.g. content array)
    const updateArrayItem = (slideIndex, arrayField, itemIndex, value) => {
        const newSlides = [...slides];
        const newArray = [...(newSlides[slideIndex][arrayField] || [])];
        newArray[itemIndex] = value;
        newSlides[slideIndex][arrayField] = newArray;
        setSlides(newSlides);
    };

    const addArrayItem = (slideIndex, arrayField, defaultValue = "") => {
        const newSlides = [...slides];
        const newArray = [...(newSlides[slideIndex][arrayField] || [])];
        newArray.push(defaultValue);
        newSlides[slideIndex][arrayField] = newArray;
        setSlides(newSlides);
    };

    const removeArrayItem = (slideIndex, arrayField, itemIndex) => {
        const newSlides = [...slides];
        const newArray = [...(newSlides[slideIndex][arrayField] || [])];
        newArray.splice(itemIndex, 1);
        newSlides[slideIndex][arrayField] = newArray;
        setSlides(newSlides);
    };

    // Helper for complex list items (objects) like points or articles
    const updateComplexArrayItem = (slideIndex, arrayField, itemIndex, field, value) => {
        const newSlides = [...slides];
        const newArray = [...(newSlides[slideIndex][arrayField] || [])];
        newArray[itemIndex] = { ...newArray[itemIndex], [field]: value };
        newSlides[slideIndex][arrayField] = newArray;
        setSlides(newSlides);
    };


    const fetchLogs = async () => {
        try {
            const q = query(
                collection(db, "downloads"),
                orderBy("timestamp", "desc"),
                limit(50)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setLogs(data);
        } catch (e) {
            console.error("Fetch logs failed:", e);
        }
    };

    useEffect(() => {
        if (activeTab === 'logs') {
            fetchLogs();
        }
    }, [activeTab]);

    const renderEditor = () => {
        const slide = slides[selectedSlideIndex];
        if (!slide) return <div className="p-8">Loading...</div>;

        return (
            <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">Slide {selectedSlideIndex + 1}: {slide.type.toUpperCase()}</h3>
                        <p className="text-sm text-gray-500">Edit content for this slide</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={slide.type}
                            onChange={(e) => updateSlide(selectedSlideIndex, 'type', e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2"
                        >
                            <option value="intro">Intro</option>
                            <option value="agenda">Agenda</option>
                            <option value="concept">Concept</option>
                            <option value="action">Action</option>
                            <option value="strategy">Strategy</option>
                            <option value="checklist">Checklist</option>
                            <option value="resource">Resource</option>
                            <option value="trend">Trend</option>
                            <option value="deep-dive">Deep Dive</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">標題 (Title)</label>
                            <input
                                type="text"
                                value={slide.title || ''}
                                onChange={(e) => updateSlide(selectedSlideIndex, 'title', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">副標題 (Subtitle)</label>
                            <input
                                type="text"
                                value={slide.subtitle || ''}
                                onChange={(e) => updateSlide(selectedSlideIndex, 'subtitle', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">模組名稱 (Module)</label>
                            <input
                                type="text"
                                value={slide.module || ''}
                                onChange={(e) => updateSlide(selectedSlideIndex, 'module', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. 課程導航, 策略佈局..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">圖示 (Icon Name)</label>
                            <input
                                type="text"
                                value={slide.iconName || ''}
                                onChange={(e) => updateSlide(selectedSlideIndex, 'iconName', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Target, Zap, Rocket..."
                            />
                            <p className="text-xs text-gray-400">Supported: Target, Zap, Video, Bot, Award, etc.</p>
                        </div>
                        {slide.type === 'intro' && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Emoji</label>
                                <input
                                    type="text"
                                    value={slide.emoji || ''}
                                    onChange={(e) => updateSlide(selectedSlideIndex, 'emoji', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. ✨, 🚀"
                                />
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-100 my-4"></div>

                    {/* Content Logic based on Type */}
                    {(['intro', 'trend'].includes(slide.type)) && (
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-gray-700 block">列表內容 (Content List)</label>
                            {slide.content && slide.content.map((item, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <span className="p-3 bg-gray-100 text-gray-500 rounded-lg select-none">{idx + 1}</span>
                                    <input
                                        type="text"
                                        value={typeof item === 'string' ? item : JSON.stringify(item)}
                                        onChange={(e) => updateArrayItem(selectedSlideIndex, 'content', idx, e.target.value)}
                                        className="flex-1 p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                                    />
                                    <button onClick={() => removeArrayItem(selectedSlideIndex, 'content', idx)} className="text-red-500 hover:bg-red-50 p-3 rounded-lg"><Trash2 size={18} /></button>
                                </div>
                            ))}
                            <button onClick={() => addArrayItem(selectedSlideIndex, 'content', "")} className="flex items-center text-blue-600 font-medium hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                                <Plus size={18} className="mr-2" /> 新增項目
                            </button>
                        </div>
                    )}
                    {/* ... other types ... (keeping simplified here but full code written to file) */}

                    {slide.type === 'agenda' && (
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-gray-700 block">議程項目 (Agenda Items)</label>
                            {slide.content && slide.content.map((item, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
                                    <div className="flex justify-between">
                                        <h4 className="font-bold text-gray-600">Item {idx + 1}</h4>
                                        <button onClick={() => removeArrayItem(selectedSlideIndex, 'content', idx)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input
                                            placeholder="ID"
                                            value={item.id || ''}
                                            onChange={(e) => updateComplexArrayItem(selectedSlideIndex, 'content', idx, 'id', e.target.value)}
                                            className="border p-2 rounded"
                                        />
                                        <input
                                            placeholder="Title"
                                            value={item.title || ''}
                                            onChange={(e) => updateComplexArrayItem(selectedSlideIndex, 'content', idx, 'title', e.target.value)}
                                            className="border p-2 rounded"
                                        />
                                        <input
                                            placeholder="Description"
                                            value={item.desc || ''}
                                            onChange={(e) => updateComplexArrayItem(selectedSlideIndex, 'content', idx, 'desc', e.target.value)}
                                            className="border p-2 rounded"
                                        />
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => addArrayItem(selectedSlideIndex, 'content', { id: "0X", title: "", desc: "" })} className="btn-add-item text-blue-600 flex items-center gap-2"><Plus size={16} /> Add Agenda Item</button>
                        </div>
                    )}

                    {/* 3. QA / POINTS (question, answer, points) */}
                    {['concept', 'strategy', 'action'].includes(slide.type) && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">問題 (Question)</label>
                                    <textarea
                                        rows={2}
                                        value={slide.question || ''}
                                        onChange={(e) => updateSlide(selectedSlideIndex, 'question', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">答案 (Answer)</label>
                                    <textarea
                                        rows={3}
                                        value={slide.answer || ''}
                                        onChange={(e) => updateSlide(selectedSlideIndex, 'answer', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-blue-50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-gray-700 block">重點列表 (Points)</label>
                                {slide.points && slide.points.map((point, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Point {idx + 1}</span>
                                            <button onClick={() => removeArrayItem(selectedSlideIndex, 'points', idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                                        </div>
                                        <input
                                            className="w-full mb-2 p-2 border border-gray-300 rounded text-sm font-bold"
                                            placeholder="Point Title"
                                            value={point.title || ''}
                                            onChange={(e) => updateComplexArrayItem(selectedSlideIndex, 'points', idx, 'title', e.target.value)}
                                        />
                                        <textarea
                                            className="w-full p-2 border border-gray-300 rounded text-sm"
                                            placeholder="Point Description"
                                            rows={2}
                                            value={point.desc || ''}
                                            onChange={(e) => updateComplexArrayItem(selectedSlideIndex, 'points', idx, 'desc', e.target.value)}
                                        />
                                    </div>
                                ))}
                                <button onClick={() => addArrayItem(selectedSlideIndex, 'points', { title: "", desc: "" })} className="text-sm text-blue-600 flex items-center gap-2 font-medium"><Plus size={16} /> Add Point</button>
                            </div>
                        </div>
                    )}
                    {slide.type === 'resource' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">QR Code URL</label>
                                    <input
                                        type="text"
                                        value={slide.qrCodeImage || ''}
                                        onChange={(e) => updateSlide(selectedSlideIndex, 'qrCodeImage', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Profile Link</label>
                                    <input
                                        type="text"
                                        value={slide.profileLink || ''}
                                        onChange={(e) => updateSlide(selectedSlideIndex, 'profileLink', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Mentorship Link</label>
                                    <input
                                        type="text"
                                        value={slide.mentorshipLink || ''}
                                        onChange={(e) => updateSlide(selectedSlideIndex, 'mentorshipLink', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-gray-700 block">推薦文章 (Articles)</label>
                                {slide.articles && slide.articles.map((article, idx) => (
                                    <div key={idx} className="border border-gray-200 p-4 rounded-xl bg-gray-50 relative">
                                        <button onClick={() => removeArrayItem(selectedSlideIndex, 'articles', idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                                        <div className="grid grid-cols-1 gap-3 pr-8">
                                            <input placeholder="Title" className="p-2 border rounded" value={article.title} onChange={(e) => updateComplexArrayItem(selectedSlideIndex, 'articles', idx, 'title', e.target.value)} />
                                            <input placeholder="Subtitle" className="p-2 border rounded" value={article.subtitle} onChange={(e) => updateComplexArrayItem(selectedSlideIndex, 'articles', idx, 'subtitle', e.target.value)} />
                                            <input placeholder="Image URL" className="p-2 border rounded" value={article.image} onChange={(e) => updateComplexArrayItem(selectedSlideIndex, 'articles', idx, 'image', e.target.value)} />
                                            <input placeholder="Link URL" className="p-2 border rounded" value={article.link} onChange={(e) => updateComplexArrayItem(selectedSlideIndex, 'articles', idx, 'link', e.target.value)} />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addArrayItem(selectedSlideIndex, 'articles', { title: "", subtitle: "", link: "", image: "" })} className="text-blue-600 flex items-center gap-2"><Plus size={16} /> Add Article</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderSettings = () => (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <Settings className="mr-2 text-gray-600" /> PDF Download Configuration
                </h3>

                <div className="space-y-6">
                    <div className="p-4 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer transition-all" onClick={() => setAppSettings({ ...appSettings, pdfDownloadMode: 'open' })}>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                name="pdfMode"
                                checked={appSettings.pdfDownloadMode === 'open'}
                                onChange={() => setAppSettings({ ...appSettings, pdfDownloadMode: 'open' })}
                                className="w-5 h-5 text-green-600 focus:ring-green-500"
                            />
                            <div className="ml-4">
                                <span className="block font-bold text-gray-900">開啟 PDF 下載 (Open)</span>
                                <span className="block text-sm text-gray-500">使用者可以直接下載 PDF，無需登入或驗證。</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer transition-all" onClick={() => setAppSettings({ ...appSettings, pdfDownloadMode: 'login' })}>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                name="pdfMode"
                                checked={appSettings.pdfDownloadMode === 'login'}
                                onChange={() => setAppSettings({ ...appSettings, pdfDownloadMode: 'login' })}
                                className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="ml-4">
                                <span className="block font-bold text-gray-900">需登入驗證 (Login Required)</span>
                                <span className="block text-sm text-gray-500">使用者需透過 Google 帳號登入後才能下載 (預設含問卷)。</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer transition-all" onClick={() => setAppSettings({ ...appSettings, pdfDownloadMode: 'closed' })}>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                name="pdfMode"
                                checked={appSettings.pdfDownloadMode === 'closed'}
                                onChange={() => setAppSettings({ ...appSettings, pdfDownloadMode: 'closed' })}
                                className="w-5 h-5 text-red-600 focus:ring-red-500"
                            />
                            <div className="ml-4">
                                <span className="block font-bold text-gray-900">關閉 PDF 下載 (Closed)</span>
                                <span className="block text-sm text-gray-500">隱藏或禁用下載按鈕，暫停下載功能。</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className={`
                            flex items-center px-6 py-2.5 rounded-lg text-white font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95
                            ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}
                        `}
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {saving ? "Saving..." : "Update Settings"}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen flex bg-gray-100 overflow-hidden font-sans">
            {/* Sidebar Navigation */}
            <div className="w-80 bg-gray-900 text-white flex flex-col border-r border-gray-800 shadow-2xl z-10">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
                        <Activity className="text-yellow-500" /> CMS Admin
                    </h1>
                    <div className="flex items-center gap-1 text-xs text-gray-500" title={isOnline ? "Connect to Firebase" : "Offline Mode"}>
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]' : 'bg-gray-500'}`}></div>
                        {isOnline ? 'Online' : 'Offline'}
                    </div>
                </div>

                <div className="flex p-2 bg-gray-800 m-4 rounded-lg">
                    <button
                        onClick={() => setActiveTab('editor')}
                        className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'editor' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Editor
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'logs' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Logs
                    </button>
                </div>

                {activeTab === 'editor' && (
                    <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar pb-20">
                        {slides.map((slide, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedSlideIndex(idx)}
                                className={`w-full text-left p-3 rounded-xl transition-all border-l-4 flex items-center justify-between group ${selectedSlideIndex === idx
                                    ? 'bg-blue-900/40 border-blue-500 text-white'
                                    : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <div className="truncate pr-2">
                                    <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-0.5">{idx + 1}. {slide.type}</div>
                                    <div className="text-sm font-medium truncate">{slide.title || 'Untitled Slide'}</div>
                                </div>
                                <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${selectedSlideIndex === idx ? 'opacity-100 text-blue-400' : ''}`} />
                            </button>
                        ))}
                        <button
                            className="w-full p-4 mt-4 border-2 border-dashed border-gray-700 rounded-xl text-gray-500 hover:text-white hover:border-gray-500 hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                            onClick={() => {
                                setSlides([...slides, { type: 'intro', title: 'New Slide', content: [] }]);
                                setSelectedSlideIndex(slides.length);
                            }}
                        >
                            <Plus size={20} /> New Slide
                        </button>
                    </div>
                )}

                <div className="p-4 border-t border-gray-800 mt-auto bg-gray-900">
                    <button
                        onClick={() => auth.signOut()}
                        className="w-full flex items-center justify-center p-3 rounded-lg bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-all"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-8 shadow-sm z-20">
                    <h2 className="text-xl font-bold text-gray-800">
                        {activeTab === 'editor' ? '網站內容編輯' : activeTab === 'settings' ? 'Global Configuration' : '下載紀錄監控'}
                    </h2>

                    {activeTab === 'editor' && (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleReset}
                                disabled={saving}
                                className={`
                                    flex items-center px-4 py-2.5 rounded-lg text-red-600 bg-red-50 border border-red-200 font-bold shadow-sm transition-all hover:bg-red-100
                                    ${saving ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`
                                    flex items-center px-6 py-2.5 rounded-lg text-white font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95
                                    ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}
                                `}
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {saving ? "Saving..." : "Publish Changes"}
                            </button>
                        </div>
                    )}
                </header>

                <main className="flex-1 overflow-auto bg-gray-100 p-8">
                    {activeTab === 'editor' ? (
                        <div className="max-w-5xl mx-auto h-full">
                            {renderEditor()}
                        </div>
                    ) : activeTab === 'settings' ? (
                        renderSettings()
                    ) : (
                        <div className="max-w-7xl mx-auto">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h3 className="font-bold text-gray-700 text-lg">最近下載紀錄</h3>
                                    <button onClick={fetchLogs} className="text-blue-600 hover:underline text-sm font-medium">Refresh Data</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Source</th>
                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User ID</th>
                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Device</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {logs.map(log => (
                                                <tr key={log.id} className="hover:bg-blue-50 transition-colors">
                                                    <td className="p-4 text-sm text-gray-600 font-mono whitespace-nowrap">
                                                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : new Date(log.timestamp).toLocaleString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${!log.source ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                                            log.source.includes('LinkedIn') ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                                log.source.includes('大大') ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                                    'bg-purple-100 text-purple-800 border-purple-200'
                                                            }`}>
                                                            {log.source || 'Unknown'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm font-medium text-gray-900">{log.email}</td>
                                                    <td className="p-4 text-xs text-gray-400 font-mono cursor-pointer hover:text-gray-600" title={log.uid}>{log.uid.substring(0, 8)}...</td>
                                                    <td className="p-4 text-xs text-gray-500 max-w-xs truncate" title={log.userAgent}>
                                                        {log.userAgent}
                                                    </td>
                                                </tr>
                                            ))}
                                            {logs.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="p-12 text-center text-gray-400">
                                                        暫無數據 (No downloads yet)
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CMS;
