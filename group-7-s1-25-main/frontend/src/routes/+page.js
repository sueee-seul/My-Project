import { PUBLIC_API_BASE_URL } from "$env/static/public";

const MESSAGES_URL = `${PUBLIC_API_BASE_URL}/messages`;

/**
 * TODO Load your own data in the homepage here.
 *
 * You may need other *.js files with other load functions too.
 */
export function load() {
  return {
    messages: []
  };
}
