import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.config';
import { slideData as defaultSlides } from '../data/slides';

export const useContent = () => {
    const [slides, setSlides] = useState(defaultSlides);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        try {
            const unsub = onSnapshot(doc(db, "content", "main_slides"), (doc) => {
                if (doc.exists()) {
                    const data = doc.data().slides;
                    setSlides(Array.isArray(data) ? data : defaultSlides);
                    setIsOffline(false);
                } else {
                    console.warn("No content found in Firestore, using default.");
                    // Optionally seed here, but better to do it manually or via CMS
                    setIsOffline(true);
                }
                setLoading(false);
            }, (error) => {
                console.error("Firestore read error (using offline logic):", error);
                setIsOffline(true);
                setLoading(false);
            });

            return () => unsub();
        } catch (e) {
            console.error("Hook setup failed:", e);
            setIsOffline(true);
            setLoading(false);
        }
    }, []);

    return { slides, loading, isOffline };
};
