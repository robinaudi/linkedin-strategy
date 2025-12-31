import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { auth } from '../firebase.config';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';

const DownloadSurveyModal = ({ isOpen, onClose, onSubmit, loginRequired, user }) => {
    const [source, setSource] = useState('');
    const [otherText, setOtherText] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSource('');
            setOtherText('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!source) {
            setError('請選擇一個選項');
            return;
        }

        let finalSource = source;
        if (source === '其他') {
            if (!otherText.trim()) {
                setError('請輸入具體來源');
                return;
            }
            if (otherText.length > 50) {
                setError('輸入內容過長，請控制在 50 字以內');
                return;
            }
            finalSource = `其他 - ${otherText}`;
        }

        // If login is required and user is not logged in, trigger login FIRST
        if (loginRequired && !user) {
            setIsLoggingIn(true);
            try {
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                if (result.user) {
                    // Login success, proceed with submit
                    onSubmit(finalSource);
                }
            } catch (error) {
                console.error("Popup Login failed, trying redirect:", error);
                try {
                    const provider = new GoogleAuthProvider();
                    await signInWithRedirect(auth, provider);
                } catch (redirectError) {
                    setError("登入失敗，請確認網路或嘗試一般視窗 (Login Failed)");
                }
            } finally {
                setIsLoggingIn(false);
            }
        } else {
            // Already logged in or not required
            onSubmit(finalSource);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold mb-1">
                            感謝您的支持！
                        </h3>
                        <p className="text-blue-100 text-sm">
                            下載前，想請教您一個小問題 🙏
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body - Always Show Form */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-800 font-bold mb-4 text-lg">
                                請問您是在哪裡知道這份攻略的？
                            </label>

                            <div className="space-y-3">
                                {[
                                    { id: 'linkedin', label: 'LinkedIn 首頁 / 動態牆' },
                                    { id: 'meetup', label: '領英小聚 (活動)' },
                                    { id: 'dada', label: '大大帶我飛 (DaDaFly)' },
                                    { id: 'other', label: '其他 (請說明)' }
                                ].map((option) => (
                                    <div
                                        key={option.id}
                                        onClick={() => setSource(option.label === '其他 (請說明)' ? '其他' : option.label)}
                                        className={`
                                            p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center
                                            ${(source === option.label || (source === '其他' && option.id === 'other'))
                                                ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm'
                                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'}
                                        `}
                                    >
                                        <div className={`
                                            w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                                            ${(source === option.label || (source === '其他' && option.id === 'other'))
                                                ? 'border-blue-600'
                                                : 'border-gray-300'}
                                        `}>
                                            {(source === option.label || (source === '其他' && option.id === 'other')) && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                            )}
                                        </div>
                                        <span className="font-medium">{option.label}</span>
                                    </div>
                                ))}
                            </div>

                            {source === '其他' && (
                                <div className="mt-3 ml-1 animate-fadeIn">
                                    <input
                                        type="text"
                                        value={otherText}
                                        onChange={(e) => setOtherText(e.target.value)}
                                        placeholder="請簡單說明 (例如：朋友分享、Google 搜尋...)"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700"
                                        autoFocus
                                        maxLength={50}
                                    />
                                    <div className="flex justify-between mt-1 px-1">
                                        <span className="text-red-500 text-sm font-medium">{error}</span>
                                        <span className="text-gray-400 text-xs">{otherText.length}/50</span>
                                    </div>
                                </div>
                            )}

                            {source !== '其他' && error && (
                                <p className="text-red-500 text-sm mt-2 px-1 font-medium">{error}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className={`
                                w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center
                                ${isLoggingIn ? 'opacity-80 cursor-wait' : ''}
                            `}
                        >
                            {isLoggingIn ? '正在登入... (Signing in)' : (
                                (loginRequired && !user) ? '登入並下載 (Sign in & Download)' : '送出並下載 PDF'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full mt-3 text-gray-400 font-medium hover:text-gray-600 transition-colors text-sm hover:underline"
                        >
                            暫時不要 (Cancel)
                        </button>

                        {loginRequired && !user && !isLoggingIn && (
                            <p className="text-center text-xs text-gray-400 mt-2">
                                點擊按鈕後將彈出 Google 登入視窗
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DownloadSurveyModal;
