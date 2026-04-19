'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MockIntent } from '@/lib/mock/intents';

export function useIntentDetail(id: string) {
    const router = useRouter();
    const { data: session } = useSession();

    const [intent, setIntent] = useState<MockIntent | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        setCurrentUserId(session?.user?.id || null);
    }, [session]);

    const fetchIntent = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/intents?id=${id}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            if (data.intents && data.intents.length > 0) {
                setIntent(data.intents[0]);
            }
        } catch (err) {
            console.error('Fetch intent error:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchIntent();
    }, [fetchIntent]);

    const isOwner = !!(currentUserId && intent && intent.user_id === currentUserId);
    const isCO = intent?.type === 'CO';
    const trustPercent = intent ? Math.round((intent.trust_score || 3) / 5 * 100) : 0;
    const heroImage = intent?.images?.[0]?.url ?? null;
    const allImages = intent?.images ?? [];

    const handleEditComplete = async () => {
        setIsEditing(false);
        await fetchIntent();
    };

    return {
        intent,
        loading,
        isOwner,
        isCO,
        trustPercent,
        heroImage,
        allImages,
        isEditing,
        setIsEditing,
        handleEditComplete,
        router,
    };
}
