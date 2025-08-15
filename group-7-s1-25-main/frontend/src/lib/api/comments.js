import { PUBLIC_API_BASE_URL } from '$env/static/public';

export async function addComment(articleId, commentData) {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return await res.json();
}

export async function deleteComment(commentId) {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete comment');
}

export async function getComment(commentId) {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/comments/${commentId}`);
    if (!res.ok) throw new Error('Failed to retrieve comment');
    return await res.json();
}
