import { PUBLIC_API_BASE_URL } from '$env/static/public';

export async function getAllArticles() {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/articles`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    return await res.json();
}

export async function getArticle(id) {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${id}`);
    if (!res.ok) throw new Error('Failed to fetch article');
    return await res.json();
}

export async function createArticle(articleData) {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/articles`, {
        method: 'POST',
        body: articleData, 
    });
    if (!res.ok) throw new Error('Failed to create article');
    return await res.json();
}

export async function updateArticle(id, articleData) {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${id}`, {
        method: 'PUT',
        body: articleData, 
    });
    if (!res.ok) throw new Error('Failed to update article');
    return await res.json();
}

export async function deleteArticle(id) {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete article');
}
