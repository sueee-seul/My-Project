import { PUBLIC_API_BASE_URL } from "$env/static/public";

export async function load({ fetch }) {
    const response = await fetch(PUBLIC_API_BASE_URL + "/articles");
    const articles = await response.json();
    return { articles };
}