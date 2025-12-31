import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase.config';
import Login from './components/Login';
import SlideDeck from './components/SlideDeck';
import PdfSlides from './components/PdfSlides';
import CMS from './components/CMS';
import DownloadSurveyModal from './components/DownloadSurveyModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useContent } from './hooks/useContent';
import { slideData as defaultSlides } from './data/slides';

// Wrapper for Main Site to handle "Admin Login" logic and PDF Download
function MainSite() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [showSurvey, setShowSurvey] = useState(false);
    const [pdfSettings, setPdfSettings] = useState({ pdfDownloadMode: 'login' });
    const pdfRef = useRef(null);
    const navigate = useNavigate();

    // Auto-Repair Data Hook
    const { slides } = useContent();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // AUTO-FIX: If user is admin and first slide is broken (type 'concept' instead of 'intro'), reset it.
    useEffect(() => {
        const autoFixContent = async () => {
            if (user) {
                // Detection: Slide 0 should be INTRO. If it is CONCEPT or Missing, user broke it.
                // We assume slides is loaded (not undefined). But useContent initializes with defaultSlides locally?
                // Wait, useContent loads from DB. If DB is empty, useContent state might be default.
                // But we are inside the component.
                // Let's rely on the fact that if it IS 'concept' OR empty, we fix it.
                // Note: useContent fallback logic might mask empty DB. But if 'slides' comes from DB and is empty...

                const needsRepair = !Array.isArray(slides) || slides.length === 0 ||
                    !slides[0]?.title || !slides[0]?.content ||
                    (slides[0]?.type === 'concept');

                if (needsRepair) {
                    console.log("⚠️ Detected corrupted content. Auto-repairing...");
                    try {
                        await setDoc(doc(db, "content", "main_slides"), { slides: defaultSlides });
                        console.log("✅ Auto-repair successful.");
                    } catch (e) {
                        console.error("Auto-repair failed", e);
                    }
                }
            }
        };
        autoFixContent();
    }, [user, slides]);


    // Fetch Global Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "settings", "global");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPdfSettings(docSnap.data());
                }
            } catch (e) {
                console.error("Error fetching settings:", e);
            }
        };
        fetchSettings();
    }, []);

    const handleDownloadPDF = async () => {
        const mode = pdfSettings.pdfDownloadMode || 'login';

        if (mode === 'closed') {
            alert("🔒 下載功能目前已關閉\n\nPDF Download is currently disabled by the administrator.");
            return;
        }

        // For 'open' and 'login' modes, we show the survey.
        // Difference is handled inside the modal via 'loginRequired' prop
        setShowSurvey(true);
    };

    const handleSurveySubmit = async (source) => {
        setShowSurvey(false);
        if (!pdfRef.current) return;

        setIsGeneratingPDF(true);

        try {
            // 1. Check Rate Limit (Only if user exists)
            if (user) {
                const oneDayAgo = new Date();
                oneDayAgo.setHours(oneDayAgo.getHours() - 24);

                const q = query(
                    collection(db, "downloads"),
                    where("uid", "==", user.uid),
                    where("timestamp", ">", Timestamp.fromDate(oneDayAgo))
                );

                try {
                    const snapshot = await getDocs(q);
                    if (!snapshot.empty) {
                        alert("⚠️ 下載限制\n\n為保護智慧財產權，每個帳號每日限下載一次 PDF。");
                        setIsGeneratingPDF(false);
                        return;
                    }
                } catch (e) { /* ignore read error if any */ }
            }

            // 2. Log the download (Try to log even if anonymous)
            try {
                await addDoc(collection(db, "downloads"), {
                    uid: user ? user.uid : "anonymous",
                    email: user ? user.email : "anonymous@guest",
                    timestamp: Timestamp.now(),
                    userAgent: navigator.userAgent,
                    source: source || "Unknown",
                    mode: pdfSettings.pdfDownloadMode
                });
            } catch (dbError) {
                console.warn("Database Logging Error:", dbError);
                // Non-blocking error for download
            }

            // 3. Generate PDF
            try {
                const pdf = new jsPDF({
                    orientation: 'l',
                    unit: 'mm',
                    format: 'a4',
                    compress: true
                });

                const container = pdfRef.current;
                const slides = Array.from(container.children);

                for (let i = 0; i < slides.length; i++) {
                    const slide = slides[i];
                    if (i > 0) pdf.addPage();

                    const canvas = await html2canvas(slide, {
                        scale: 1.5,
                        useCORS: true,
                        logging: false,
                        windowWidth: 1200,
                        windowHeight: 800,
                        allowTaint: true
                    });

                    const imgData = canvas.toDataURL('image/jpeg', 0.75);
                    const pdfWidth = 297;
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
                }

                pdf.save('linkedin-strategies-by-RobinHsu.PDF');
            } catch (pdfError) {
                console.error("PDF Gen Error:", pdfError);
                throw new Error("PDF 生成失敗: " + pdfError.message);
            }

        } catch (error) {
            console.error("Process Failed:", error);
            alert("系統忙碌中 (Process Failed)\n" + error.message);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleAdminClick = () => {
        if (user) {
            navigate('/cms');
        } else {
            navigate('/login?redirect=/cms');
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
                <div className="spinner"></div>
            </div>
        );
    }

    // Safety: If content is corrupted (first slide is concept) OR EMPTY OR NOT ARRAY OR INVALID SCHEMA, do NOT render SlideDeck (it crashes).
    // Instead, show recovery screen. The useEffect above will auto-fix it if Admin.
    const isCorrupted = !Array.isArray(slides) || slides.length === 0 ||
        !slides[0]?.title || !slides[0]?.content ||
        (slides[0]?.type === 'concept');

    if (isCorrupted) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 space-y-4 p-4 text-center">
                <div className="animate-spin text-4xl">🔄</div>
                <h2 className="text-2xl font-bold text-gray-800">System Recovering...</h2>
                <p className="text-gray-600">Verifying data schema & integrity.</p>
                {user ? (
                    <div className="text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg">Admin Active: Auto-repair in progress...</div>
                ) : (
                    <div className="text-orange-500 bg-orange-50 px-4 py-2 rounded-lg">System maintenance. Please reload in a few seconds.</div>
                )}
                {/* Debug Info for User - Remove later */}
                {/* <pre className="text-xs text-left bg-gray-200 p-2 rounded mt-4 max-w-lg overflow-auto">
                    {JSON.stringify(slides ? slides[0] : 'No Data', null, 2)}
                </pre> */}
            </div>
        );
    }

    return (
        <>
            <SlideDeck
                onDownloadPDF={handleDownloadPDF}
                isGeneratingPDF={isGeneratingPDF}
                onAdminClick={handleAdminClick}
            />

            <DownloadSurveyModal
                isOpen={showSurvey}
                onClose={() => setShowSurvey(false)}
                onSubmit={handleSurveySubmit}
                loginRequired={pdfSettings.pdfDownloadMode === 'login'}
                user={user}
            />

            {/* Hidden container for PDF generation */}
            <div style={{ position: 'fixed', top: -10000, left: -10000, overflow: 'hidden' }}>
                <PdfSlides ref={pdfRef} />
            </div>
        </>
    );
}

// Protected Route for CMS
const ProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <div className="p-10">Loading Admin...</div>;
    if (!user) return <Navigate to="/login?redirect=/cms" replace />;

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainSite />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/cms"
                    element={
                        <ProtectedRoute>
                            <CMS />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
